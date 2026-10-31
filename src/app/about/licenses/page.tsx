import Link from "next/link";
import { CompanyInfoBlock } from "@/components/marketing/CompanyInfoBlock";
import { CertificatesSection } from "@/components/marketing/CertificatesSection";
import { ShieldCheck, Lock, Database, FileCheck, CheckCircle2, ArrowRight, ArrowLeft, Award, Landmark, FileText } from "lucide-react";

export default function AboutLicensesPage() {
  const navTabs = [
    { label: "Company Overview", href: "/about", active: false },
    { label: "Registration & Security", href: "/about/licenses", active: true },
    { label: "Careers & Culture", href: "/about/careers", active: false },
    { label: "Press & News", href: "/about/press", active: false },
    { label: "Contact & Support", href: "/about/contact", active: false },
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
            Company Registration & Security
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Varban Markets Ltd is registered in Seychelles and operates under the strict oversight of the Seychelles Financial Services Authority (FSA). This page lists our company details, regulatory documents, and our commitment to capital protection.
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

        {/* Active Licenses Icons Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-white border border-[#E4E4E4] p-6 flex items-center gap-4 shadow-sm">
              <Award className="w-8 h-8 text-[#0055FF]" />
              <div>
                 <span className="text-[9px] font-bold uppercase text-[#6B7280] block">Regulatory Body</span>
                 <span className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-tight">Seychelles FSA</span>
              </div>
           </div>
           <div className="bg-white border border-[#E4E4E4] p-6 flex items-center gap-4 shadow-sm">
              <Landmark className="w-8 h-8 text-[#16835B]" />
              <div>
                 <span className="text-[9px] font-bold uppercase text-[#6B7280] block">VASP Registration</span>
                 <span className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-tight">VASP/2026/089</span>
              </div>
           </div>
           <div className="bg-white border border-[#E4E4E4] p-6 flex items-center gap-4 shadow-sm">
              <FileText className="w-8 h-8 text-[#0055FF]" />
              <div>
                 <span className="text-[9px] font-bold uppercase text-[#6B7280] block">Data Protection</span>
                 <span className="text-[11px] font-bold text-[#16835B] uppercase tracking-tight">DP-SC-842</span>
              </div>
           </div>
        </div>

        {/* Company registration and published certificates */}
        <div className="space-y-8 mb-12">
          <CompanyInfoBlock />
          <CertificatesSection />
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
                98% of digital assets are stored in offline multi-signature hardware security modules (HSMs) requiring multiple authorized signers.
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
