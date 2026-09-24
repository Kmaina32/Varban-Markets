import Link from "next/link";
import { ShieldCheck, FileCheck, Search, ArrowRight, ArrowLeft } from "lucide-react";

export default function AmlKycPolicyPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC Policy", href: "/terms/aml-kyc", active: true },
    { label: "Order Execution", href: "/terms/order-execution", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#16835B] uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal Suite &mdash; 4 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Anti-Money Laundering & KYC Policy
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Varban Markets maintains strict Anti-Money Laundering (AML) and Know Your Customer (KYC) frameworks to combat financial crimes, terrorist financing, and illicit fund flows across international markets.
          </p>
        </div>

        {/* Legal Suite Sub-Navigation */}
        <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-[#E4E4E4] pb-4 mb-10">
          {navTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                tab.active
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                  : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5] hover:text-[#0A0A0A]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Content Body */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-10 shadow-sm text-xs leading-relaxed text-[#333333]">
          
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16835B] text-white flex items-center justify-center text-[10px]">1</span>
              Customer Due Diligence (CDD) Tiers
            </h2>
            <p>
              Verification is enforced across multi-stage customer verification levels based on account transaction volume:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                <span className="font-bold text-[#0A0A0A] block uppercase text-[10px] mb-1">Tier 1: Basic</span>
                <p className="text-[#6B7280]">Email & phone number verification. Trading limit up to $2,000 USD total deposits.</p>
              </div>
              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                <span className="font-bold text-[#0055FF] block uppercase text-[10px] mb-1">Tier 2: Verified</span>
                <p className="text-[#6B7280]">Government ID scan (Passport/National ID) + Selfie verification. Unlocks standard withdrawals.</p>
              </div>
              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                <span className="font-bold text-[#16835B] block uppercase text-[10px] mb-1">Tier 3: Institutional</span>
                <p className="text-[#6B7280]">Proof of Address (utility bill/bank statement) + Source of Wealth disclosure. Unlimited volume.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16835B] text-white flex items-center justify-center text-[10px]">2</span>
              Sanction Screening & PEP Monitoring
            </h2>
            <p>
              All Client accounts are automatically cross-checked against global sanction lists including OFAC, EU Sanctions, UN Security Council, and FATF high-risk jurisdiction registries. Accounts belonging to Politically Exposed Persons (PEPs) undergo Enhanced Due Diligence (EDD).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16835B] text-white flex items-center justify-center text-[10px]">3</span>
              Transaction Monitoring & SAR Filings
            </h2>
            <p>
              Automated heuristics monitor for suspicious deposit and withdrawal behavior (such as rapid multi-wallet cycling, third-party payments, or structural layering). Unexplained high-frequency fund transfers will result in account freeze and Suspicious Activity Report (SAR) filings with regulatory authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16835B] text-white flex items-center justify-center text-[10px]">4</span>
              Strict No Third-Party Funding Rule
            </h2>
            <p>
              Varban Markets strictly prohibits third-party deposits or withdrawals. Deposits must originate from a bank account or crypto wallet registered under the exact name of the account holder.
            </p>
          </section>

        </div>

        {/* Footer Navigation Switcher */}
        <div className="mt-8 flex justify-between items-center text-xs">
          <Link href="/terms/risk-disclosure" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: Risk Disclosure</span>
          </Link>
          <span className="text-[#6B7280]">Legal Page 4 of 5</span>
          <Link href="/terms/order-execution" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
            <span>Next: Order Execution & Bonus Policy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
