/**
 * @fileOverview What "a complete profile" means. Single source of truth for
 * the account form, the completion gate in the workspace layout, and the admin
 * KYC review. Add or remove a field here and everything follows.
 */

export const MIN_AGE_YEARS = 18;

export interface ProfileGap {
  key: string;
  label: string;
}

const text = (v: any) => (typeof v === "string" ? v.trim() : "");

export function ageFromDate(iso: string, now = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

/** Phone numbers are stored as "<dial code> <number>". Require 7-14 digits after the dial code. */
export function isValidPhone(stored: string): boolean {
  const parts = text(stored).split(/\s+/);
  const number = parts.length > 1 ? parts.slice(1).join("") : parts[0] || "";
  const digits = number.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 14 && /^[\d\s\-().]+$/.test(number);
}

/** Returns the list of things still missing; empty means complete. */
export function getProfileGaps(userDoc: any): ProfileGap[] {
  const p = userDoc?.profile ?? {};
  const status = userDoc?.status ?? {};
  const inv = userDoc?.investor ?? {};
  const gaps: ProfileGap[] = [];
  const need = (ok: boolean, key: string, label: string) => { if (!ok) gaps.push({ key, label }); };

  need(!!text(p.firstName), "firstName", "First name");
  need(!!text(p.lastName), "lastName", "Last name");
  const age = ageFromDate(text(p.dateOfBirth));
  need(age !== null && age >= MIN_AGE_YEARS, "dateOfBirth", `Date of birth (you must be ${MIN_AGE_YEARS}+)`);
  need(isValidPhone(text(p.phone)), "phone", "Phone number");
  need(!!status.phoneVerified, "phoneVerified", "Phone number confirmed by text message");
  need(!!text(p.country), "country", "Country of residence");
  need(!!text(p.addressLine1), "addressLine1", "Street address");
  need(!!text(p.city), "city", "City");
  need(!!text(p.zipCode), "zipCode", "Postal / ZIP code");
  need(!!text(inv.accountPurpose), "accountPurpose", "Account purpose");
  need(!!text(inv.employmentStatus), "employmentStatus", "Employment status");
  need(!!text(inv.sourceWealth), "sourceWealth", "Source of wealth");
  need(!!text(inv.annualIncome), "annualIncome", "Annual income");
  need(!!text(inv.netWorth), "netWorth", "Net worth");
  need(!!text(inv.originFunds), "originFunds", "Country the funds come from");
  return gaps;
}

export const isProfileComplete = (userDoc: any) => getProfileGaps(userDoc).length === 0;
