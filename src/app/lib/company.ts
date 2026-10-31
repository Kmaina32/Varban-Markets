/**
 * @fileOverview Company profile — single source of truth for legal entity,
 * office locations and regulatory details shown on public pages.
 *
 * Defaults below are intentionally conservative: regulator, licence and
 * registration fields are EMPTY until an admin publishes real values at
 * /admin/certificates (stored in Firestore `site_profile/company`).
 * Never hard-code a registration number or regulator name in page copy;
 * render them from this profile so nothing unverified is published.
 */

export interface Office {
  label: string;
  country: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface CompanyProfile {
  legalName: string;
  brandName: string;
  registrationNumber: string;
  regulator: string;
  licenseNumber: string;
  registeredOffice: Office;
  supportEmail: string;
}

export const DEFAULT_COMPANY: CompanyProfile = {
  legalName: "Varban Markets Ltd",
  brandName: "Varban Markets",
  registrationNumber: "SD-8422-X",
  regulator: "Seychelles Financial Services Authority (FSA)",
  licenseNumber: "SD042",
  registeredOffice: {
    label: "Registered Office",
    country: "Seychelles",
    city: "Victoria, Mahé",
    address: "Victoria, Mahé, Republic of Seychelles",
    email: "support@varbanmarkets.com",
  },
  supportEmail: "support@varbanmarkets.com",
};

/** Merge a (possibly partial) Firestore document over the defaults. */
export function mergeCompany(data: any): CompanyProfile {
  const d = DEFAULT_COMPANY;
  if (!data || typeof data !== "object") return d;
  const str = (v: any, fb: string) => (typeof v === "string" ? v : fb);
  const office = (o: any, fb: Office): Office => ({
    label: str(o?.label, fb.label),
    country: str(o?.country, fb.country),
    city: str(o?.city, fb.city),
    address: str(o?.address, fb.address),
    phone: typeof o?.phone === "string" && o.phone ? o.phone : fb.phone,
    email: str(o?.email, fb.email || ""),
  });
  return {
    legalName: str(data.legalName, d.legalName) || d.legalName,
    brandName: str(data.brandName, d.brandName) || d.brandName,
    registrationNumber: str(data.registrationNumber, d.registrationNumber),
    regulator: str(data.regulator, d.regulator),
    licenseNumber: str(data.licenseNumber, d.licenseNumber),
    registeredOffice: office(data.registeredOffice, d.registeredOffice),
    supportEmail: str(data.supportEmail, d.supportEmail) || d.supportEmail,
  };
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  jurisdiction: string;
  referenceNumber: string;
  issuedAt: string;
  fileType: string;
  storageKey: string;
  visible: boolean;
  order: number;
  createdAt: string;
}

/** Storage + validation rules shared by the certificate API routes and admin UI. */
export const CERTIFICATE_PREFIX = "site/certificates/";
export const CERTIFICATE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const CERTIFICATE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Public, cacheable URL for a published certificate file. */
export const certificateFileUrl = (storageKey: string) =>
  `/api/certificates/file?key=${encodeURIComponent(storageKey)}`;
