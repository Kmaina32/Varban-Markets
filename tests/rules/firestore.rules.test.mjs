/**
 * Firestore security rules tests.
 * Run locally (needs Java + the Firebase CLI, which downloads the emulator):
 *   npm run test:rules
 * NOTE: written alongside the rules but not executed in the authoring sandbox
 * (the emulator download is blocked there). Run it before deploying the rules.
 */
import { test, before, after, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, addDoc, collection, deleteDoc } from "firebase/firestore";

let env;
const ADMIN_EMAIL = "gmaina4242@gmail.com";

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "rules-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
after(async () => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users/alice"), { balance: 0, equity: 0, profile: { firstName: "A" }, status: { role: "Trader", verificationStatus: "Not Verified" } });
    await setDoc(doc(db, "users/bob"), { balance: 0, equity: 0, status: { role: "Trader", verificationStatus: "Not Verified" } });
    await setDoc(doc(db, "users/rootadmin"), { status: { role: "Admin", verificationStatus: "Verified" } });
    await setDoc(doc(db, "users/legacy"), { balance: 0, profile: { firstName: "L" } }); // no status map
    await setDoc(doc(db, "certificates/pub"), { visible: true, title: "p" });
    await setDoc(doc(db, "certificates/draft"), { visible: false, title: "d" });
  });
});

const as = (uid, claims = {}) => env.authenticatedContext(uid, claims).firestore();
const anon = () => env.unauthenticatedContext().firestore();

test("owner can edit own profile data", async () => {
  await assertSucceeds(updateDoc(doc(as("alice"), "users/alice"), { "profile.phone": "+44 7000000000", investor: { employmentStatus: "Employed" } }));
});

test("owner cannot verify themselves", async () => {
  await assertFails(updateDoc(doc(as("alice"), "users/alice"), { "status.verificationStatus": "Verified" }));
});

test("owner cannot make themselves Admin (status.role or role)", async () => {
  await assertFails(updateDoc(doc(as("alice"), "users/alice"), { "status.role": "Admin" }));
  await assertFails(updateDoc(doc(as("alice"), "users/alice"), { role: "Admin" }));
});

test("owner can move to Pending only (KYC submit), including with kycSubmittedAt", async () => {
  await assertSucceeds(updateDoc(doc(as("alice"), "users/alice"), { "status.verificationStatus": "Pending", "status.kycSubmittedAt": "2026-10-25T00:00:00Z" }));
});

test("owner cannot jump from Pending to Verified/Rejected or touch other status keys while submitting", async () => {
  await assertSucceeds(updateDoc(doc(as("alice"), "users/alice"), { "status.verificationStatus": "Pending" }));
  await assertFails(updateDoc(doc(as("alice"), "users/alice"), { "status.verificationStatus": "Verified" }));
  await assertFails(updateDoc(doc(as("bob"), "users/bob"), { "status.verificationStatus": "Pending", "status.role": "Admin" }));
});

test("legacy user doc without a status map can submit KYC", async () => {
  await assertSucceeds(updateDoc(doc(as("legacy"), "users/legacy"), { "status.verificationStatus": "Pending" }));
});

test("sign-up must start as unverified Trader with zero balance", async () => {
  const db = as("carol");
  await assertSucceeds(setDoc(doc(db, "users/carol"), { balance: 0, equity: 0, status: { role: "Trader", verificationStatus: "Not Verified" } }));
  await assertFails(setDoc(doc(as("dave"), "users/dave"), { balance: 0, equity: 0, status: { role: "Admin", verificationStatus: "Not Verified" } }));
  await assertFails(setDoc(doc(as("erin"), "users/erin"), { balance: 0, equity: 0, status: { role: "Trader", verificationStatus: "Verified" } }));
  await assertFails(setDoc(doc(as("frank"), "users/frank"), { balance: 5000, equity: 0, status: { role: "Trader", verificationStatus: "Not Verified" } }));
});

test("users cannot read or write other users", async () => {
  await assertFails(getDoc(doc(as("alice"), "users/bob")));
  await assertFails(updateDoc(doc(as("alice"), "users/bob"), { "profile.firstName": "x" }));
  await assertFails(getDoc(doc(anon(), "users/alice")));
});

test("admin (role) and verified admin email can verify; unverified admin email cannot", async () => {
  await assertSucceeds(updateDoc(doc(as("rootadmin"), "users/alice"), { "status.verificationStatus": "Verified" }));
  await assertSucceeds(updateDoc(doc(as("someone", { email: ADMIN_EMAIL, email_verified: true }), "users/alice"), { "status.verificationStatus": "Verified" }));
  await assertFails(updateDoc(doc(as("imposter", { email: ADMIN_EMAIL, email_verified: false }), "users/alice"), { "status.verificationStatus": "Verified" }));
});

test("kyc submissions: owner may add Pending in own kyc folder only; cannot self-approve or edit", async () => {
  const db = as("alice");
  const col = collection(db, "users/alice/kyc_submissions");
  await assertSucceeds(addDoc(col, { type: "IDENTITY_DOCUMENT", status: "Pending", storageKey: "users/alice/kyc/1_id.jpg" }));
  await assertFails(addDoc(col, { type: "IDENTITY_DOCUMENT", status: "Approved", storageKey: "users/alice/kyc/1_id.jpg" }));
  await assertFails(addDoc(col, { type: "IDENTITY_DOCUMENT", status: "Pending", storageKey: "users/bob/kyc/1_id.jpg" }));
  await env.withSecurityRulesDisabled(async (ctx) => { await setDoc(doc(ctx.firestore(), "users/alice/kyc_submissions/s1"), { status: "Pending", storageKey: "users/alice/kyc/2.jpg" }); });
  await assertFails(updateDoc(doc(db, "users/alice/kyc_submissions/s1"), { status: "Approved" }));
  await assertFails(deleteDoc(doc(db, "users/alice/kyc_submissions/s1")));
  await assertSucceeds(updateDoc(doc(as("rootadmin"), "users/alice/kyc_submissions/s1"), { status: "Approved" }));
  await assertFails(getDoc(doc(as("bob"), "users/alice/kyc_submissions/s1")));
});

test("other subcollections keep owner access; unknown subcollections are closed", async () => {
  await assertSucceeds(addDoc(collection(as("alice"), "users/alice/watchlist"), { symbol: "BTC_USD" }));
  await assertFails(addDoc(collection(as("alice"), "users/alice/whatever"), { x: 1 }));
});

test("certificates: public sees published only; only admins write", async () => {
  await assertSucceeds(getDoc(doc(anon(), "certificates/pub")));
  await assertFails(getDoc(doc(anon(), "certificates/draft")));
  await assertSucceeds(getDoc(doc(as("rootadmin"), "certificates/draft")));
  await assertFails(setDoc(doc(as("alice"), "certificates/new"), { visible: true }));
});
