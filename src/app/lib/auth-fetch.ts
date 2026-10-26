/**
 * Authenticated fetch for our own API routes: attaches the signed-in user's
 * Firebase ID token as a Bearer token. The server verifies it; nothing the
 * client puts in the body is trusted for identity.
 */
export async function authFetch(user: { getIdToken: () => Promise<string> } | null | undefined, url: string, init: RequestInit = {}) {
  if (!user) throw new Error("You must be signed in.");
  const token = await user.getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(url, { ...init, headers });
}
