import Link from "next/link";
import { Scale, Shield, Lock, FileText, AlertTriangle, ArrowRight, Gavel } from "lucide-react";

export default function TermsPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: true },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: false },
    { label: "Complaints", href: "/terms/complaints", active: false },
    { label: "Market Data", href: "/terms/market-data", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <Scale className="w-4 h-4" />
            <span>Legal Suite &mdash; 1 of 8</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Master Client Agreement
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl font-mono">
            OPERATED BY VARBAN MARKETS LTD. REGISTERED IN SAINT LUCIA. GOVERNED BY THE LAWS OF SAINT LUCIA. EFFECTIVE AS OF JANUARY 2026.
          </p>
        </div>

        {/* Legal Suite Sub-Navigation */}
        <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-[#E4E4E4] pb-4 mb-10 sticky top-0 bg-[#F7F7F5] z-10">
          {navTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
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
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-12 shadow-sm text-[11px] leading-relaxed text-[#333333]">
          
          <section className="bg-[#C43D3D]/5 border-l-4 border-[#C43D3D] p-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C43D3D] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Section 1: Important Capital Warning
            </h2>
            <p className="font-bold text-[#0A0A0A]">
              TRADING FINANCIAL DERIVATIVES INVOLVES SUBSTANTIAL RISK. YOU MAY LOSE SOME OR ALL OF THE FUNDS YOU COMMIT TO TRADING. VARBAN MARKETS DOES NOT GUARANTEE PROFITS, RETURNS, OR UNINTERRUPTED ACCESS TO MARKET DATA.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              Section 2: Definitions & Scope
            </h2>
            <p>
              In this Agreement, "Platform" refers to the Varban Markets electronic trading terminal, APIs, and associated funding conduits. "Applicable Law" refers to the laws and regulations of Saint Lucia, including the Electronic Transactions Act and the Consumer Protection Act.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              Section 3: Eligibility & Jurisdictions
            </h2>
            <p>
              Access is restricted to individuals who are at least 18 years of age and possess full legal capacity. Varban Markets may restrict access to residents of particular jurisdictions including the United States, Iran, North Korea, and other FATF high-risk territories.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              Section 4: Electronic Acceptance (Saint Lucia)
            </h2>
            <p>
              Pursuant to the Saint Lucia Electronic Transactions Act, electronic acceptance of these Terms constitutes a binding agreement. A contract must not be denied legal effect solely because it is entered into through electronic communications.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              Section 5: Account Security & Authority
            </h2>
            <p>
              Users are solely responsible for maintaining the confidentiality of credentials. Any order transmitted using valid credentials shall be deemed authorized and non-reversible. Mandatory 2FA is required for withdrawals exceeding $1,000 USD equivalent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              Section 6: Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by Saint Lucia law, Varban Markets shall not be liable for indirect, incidental, or consequential losses including loss of opportunity or losses caused by internet disruptions or market data latency.
            </p>
          </section>

          <div className="pt-10 border-t border-[#E4E4E4] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Gavel className="w-5 h-5 text-[#0055FF]" />
              <div>
                <span className="text-[10px] font-bold uppercase text-[#0A0A0A] block">Governing Law</span>
                <span className="text-[9px] text-[#6B7280] uppercase tracking-widest">Saint Lucia Jurisdiction</span>
              </div>
            </div>
            <Link href="/terms/privacy" className="btn-institutional-primary px-8 py-3 bg-[#0055FF] border-[#0055FF] hover:bg-[#0A0A0A]">
              Next Policy &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
