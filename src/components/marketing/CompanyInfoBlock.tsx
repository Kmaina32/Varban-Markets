'use client';

import Link from "next/link";
import { useCompanyProfile } from "@/app/lib/use-company";

/**
 * @fileOverview Institutional Company Information Block.
 * Defensive implementation to prevent runtime errors during profile synchronization.
 * Strictly Seychelles-based jurisdiction.
 */
export function CompanyInfoBlock({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const c = useCompanyProfile();
  const H = headingLevel === 2 ? "h2" : "h3";

  return (
    <section className="bg-white border border-[#E4E4E4] p-8 md:p-10 space-y-4 text-[#0A0A0A]" aria-labelledby="company-info-heading">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-1 text-[#0055FF]">Company</span>
        <H id="company-info-heading" className="text-xl md:text-2xl font-bold uppercase tracking-tight">Company information</H>
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Legal name</dt>
          <dd className="mt-1">{c.legalName || "Varban Markets Ltd"}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Registered in</dt>
          <dd className="mt-1">{c.registeredOffice?.country || "Seychelles"}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{c.registeredOffice?.label || "Registered Office"}</dt>
          <dd className="mt-1">{c.registeredOffice?.address || "Victoria, Mahé, Republic of Seychelles"}</dd>
        </div>
        {c.registrationNumber && (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Registration number</dt>
            <dd className="mt-1">{c.registrationNumber}</dd>
          </div>
        )}
        {c.regulator && (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Regulator</dt>
            <dd className="mt-1">{c.regulator}{c.licenseNumber ? `, licence ${c.licenseNumber}` : ""}</dd>
          </div>
        )}
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Support</dt>
          <dd className="mt-1">
            <a href={`mailto:${c.supportEmail || "support@varbanmarkets.com"}`} className="text-[#0055FF] font-bold hover:underline">
              {c.supportEmail || "support@varbanmarkets.com"}
            </a>
          </dd>
        </div>
      </dl>
      <p className="text-[11px] text-[#6B7280]">
        More: <Link href="/about" className="text-[#0055FF] font-bold hover:underline">About</Link>,{" "}
        <Link href="/about/licenses" className="text-[#0055FF] font-bold hover:underline">Registration &amp; Security</Link>,{" "}
        <Link href="/contact" className="text-[#0055FF] font-bold hover:underline">Contact</Link>.
      </p>
    </section>
  );
}
