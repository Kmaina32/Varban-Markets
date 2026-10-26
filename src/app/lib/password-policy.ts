/**
 * @fileOverview Password policy for email/password sign-up.
 *
 * This mirrors the policy configured in Firebase Console ->
 * Authentication -> Settings -> Password policy. Firebase is the authority
 * (it enforces the policy on its servers); this file gives users instant
 * feedback and must be kept in step with the console. Change the values here
 * and in the console together.
 */

export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumeric: true,
  requireSpecial: true,
} as const;

/** The exact characters Firebase counts as "special" (anything else does not satisfy the rule). */
export const FIREBASE_SPECIAL_CHARACTERS = "^$*.[]{}()?-\"!@#%&/\\,><':;|_~`+=";

export interface PasswordCheck {
  id: "length" | "uppercase" | "lowercase" | "numeric" | "special";
  label: string;
  met: boolean;
}

export function evaluatePassword(password: string): { checks: PasswordCheck[]; valid: boolean } {
  const p = PASSWORD_POLICY;
  const checks: PasswordCheck[] = [
    {
      id: "length",
      label: `At least ${p.minLength} characters`,
      met: password.length >= p.minLength && password.length <= p.maxLength,
    },
  ];
  if (p.requireUppercase) checks.push({ id: "uppercase", label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) });
  if (p.requireLowercase) checks.push({ id: "lowercase", label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) });
  if (p.requireNumeric) checks.push({ id: "numeric", label: "One number (0-9)", met: /[0-9]/.test(password) });
  if (p.requireSpecial) {
    checks.push({
      id: "special",
      label: "One special character (e.g. ! @ # $ %)",
      met: [...password].some((c) => FIREBASE_SPECIAL_CHARACTERS.includes(c)),
    });
  }
  return { checks, valid: checks.every((c) => c.met) };
}

/**
 * Ask Firebase whether the password satisfies the policy configured in the
 * console. Best effort: if the check cannot run (offline, policy not set up)
 * it returns ok so the local rules and Firebase's own sign-up enforcement
 * remain the safety net.
 */
export async function checkWithFirebase(auth: any, password: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const { validatePassword } = await import("firebase/auth");
    const status = await validatePassword(auth, password);
    if (status.isValid) return { ok: true };
    const missing: string[] = [];
    if (status.meetsMinPasswordLength === false) missing.push("the minimum length");
    if (status.meetsMaxPasswordLength === false) missing.push("the maximum length");
    if (status.containsLowercaseLetter === false) missing.push("a lowercase letter");
    if (status.containsUppercaseLetter === false) missing.push("an uppercase letter");
    if (status.containsNumericCharacter === false) missing.push("a number");
    if (status.containsNonAlphanumericCharacter === false) missing.push("a special character");
    return { ok: false, message: `Your password is missing ${missing.join(", ") || "a required element"}.` };
  } catch {
    return { ok: true };
  }
}

export const PASSWORD_POLICY_ERROR_CODE = "auth/password-does-not-meet-requirements";

export function isPasswordPolicyError(err: any): boolean {
  const text = `${err?.code || ""} ${err?.message || ""}`;
  return text.includes(PASSWORD_POLICY_ERROR_CODE);
}
