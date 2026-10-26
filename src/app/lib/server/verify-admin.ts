import { NextRequest } from "next/server";
import { firebaseConfig } from "@/firebase/config";

/**
 * @fileOverview Server-side admin verification for API routes.
 *
 * The caller sends its Firebase ID token as `Authorization: Bearer <token>`.
 * The token is validated by Google's Identity Toolkit (signature + expiry),
 * then admin authority is confirmed the same way firestore.rules does:
 * a super-admin email, or `users/{uid}.status.role == "Admin"` (read with the
 * caller's own token, so Firestore rules still apply).
 * No client-supplied field is ever trusted.
 */

const SUPER_ADMIN_EMAILS = ["macos8388@gmail.com", "gmaina4242@gmail.com"];

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface VerifiedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  idToken: string;
  isAdmin: boolean;
}

/** Validate the caller's Firebase ID token (any signed-in user). */
export async function verifyUser(req: NextRequest): Promise<VerifiedUser> {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new AuthError("Authentication required.", 401);
  const idToken = match[1];

  let lookup: Response;
  try {
    lookup = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    );
  } catch {
    throw new AuthError("Could not verify your session right now. Please try again.", 503);
  }
  if (!lookup.ok) throw new AuthError("Invalid or expired session.", 401);
  const payload = await lookup.json();
  const account = payload?.users?.[0];
  if (!account?.localId) throw new AuthError("Invalid or expired session.", 401);

  return {
    uid: account.localId,
    email: String(account.email || "").toLowerCase(),
    emailVerified: !!account.emailVerified,
    idToken,
    isAdmin: false,
  };
}

/** Validate the token AND confirm administrator authority. */
export async function verifyAdmin(req: NextRequest): Promise<VerifiedUser> {
  const user = await verifyUser(req);

  let isAdmin = user.emailVerified && SUPER_ADMIN_EMAILS.includes(user.email);
  if (!isAdmin) {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${user.uid}`,
      { headers: { Authorization: `Bearer ${user.idToken}` }, cache: "no-store" }
    ).catch(() => null);
    if (res && res.ok) {
      const doc = await res.json();
      isAdmin = doc?.fields?.status?.mapValue?.fields?.role?.stringValue === "Admin";
    }
  }

  if (!isAdmin) throw new AuthError("Administrator access required.", 403);
  return { ...user, isAdmin: true };
}
