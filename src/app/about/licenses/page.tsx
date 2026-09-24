import Link from "next/link";
import { ShieldCheck, Lock, Database, FileCheck, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function AboutLicensesPage() {
  const navTabs = [
    { label: "Company Overview", href: "/about", active: false },
    { label: "Licenses & Security", href: "/about/licenses", active: true },
    { label: "Careers & Culture", href: "/about/careers", active: false },
    { label: "Press & News", href: "/about/press", active: false },
    { label: "Contact & Support", href: "/about/contact", active: false },
  ];

  const licenses = [
    { jurisdiction: "Financial Services Authority (FSA)", refNo: "FSA-REG-892410-VM", status: "Active Licensed Entity", details: "Authorized for multi-asset synthetic derivative settlement and digital asset brokerage services." },
    { jurisdiction: "International Financial Services Commission (IFSC)", refNo: "IFSC/60/491/TS/26", status: "Active License", details: "Authorized international financial broker specializing in algorithmic execution and risk management." },
    { jurisdiction: "Crypto Asset Regulatory Authority (CARA)", refNo: "CARA-VASP-2025-04", status: "Registered VASP", details: "Virtual Asset Service Provider clearance for digital asset wallet custody and cross-border crypto settlement." },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#16835B] uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>About Suite &mdash; 2 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Regulatory Licenses & Security
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Varban Markets operates under rigorous regulatory oversight, maintaining segregated tier-1 bank custody accounts, cold wallet storage architecture, and continuous auditing.
          </p>
        </div>

        {/* About Suite Sub-Navigation */}
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

        {/* Regulatory Licenses */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-8 mb-12 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest block mb-1">Authorization & Oversight</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Global Regulatory Framework</h2>
          </div>

          <div className="space-y-4">
            {licenses.map((lic, idx) => (
              <div key={idx} className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">{lic.jurisdiction}</h3>
                  <span className="px-2 py-0.5 bg-[#16835B]/10 text-[#16835B] border border-[#16835B] text-[9px] font-bold uppercase">
                    {lic.status}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#6B7280] block">License Reference: {lic.refNo}</span>
                <p className="text-xs text-[#6B7280] leading-relaxed pt-1">{lic.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Infrastructure Pillars */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-8 mb-12 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[#16835B] uppercase tracking-widest block mb-1">Capital Protection</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Institutional Security Standards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] space-y-3">
              <Lock className="w-5 h-5 text-[#0055FF]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Segregated Bank Accounts</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                All client fiat deposits are strictly held in segregated accounts at Tier-1 international banking institutions, completely independent from company operational funds.
              </p>
            </div>

            <div className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] space-y-3">
              <Database className="w-5 h-5 text-[#16835B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Cold Wallet Multi-Sig Vaults</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                98% of digital assets are stored in offline multi-signature hardware security modules (HSMs) requiring multiple authorized signers for key generation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Switcher */}
        <div className="flex justify-between items-center text-xs">
          <Link href="/about" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: Company Overview</span>
          </Link>
          <span className="text-[#6B7280]">About Page 2 of 5</span>
          <Link href="/about/careers" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
            <span>Next: Careers & Culture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
