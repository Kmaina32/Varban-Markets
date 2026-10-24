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
  isAdmin: boolean;
}

export async function verifyAdmin(req: NextRequest): Promise<VerifiedUser> {
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

  const uid: string = account.localId;
  const email: string = String(account.email || "").toLowerCase();

  let isAdmin = !!account.emailVerified && SUPER_ADMIN_EMAILS.includes(email);
  if (!isAdmin) {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`,
      { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" }
    );
    if (res.ok) {
      const doc = await res.json();
      isAdmin = doc?.fields?.status?.mapValue?.fields?.role?.stringValue === "Admin";
    }
  }

  if (!isAdmin) throw new AuthError("Administrator access required.", 403);
  return { uid, email, isAdmin };
}
