import Link from "next/link";
import { AlertTriangle, ShieldAlert, ArrowRight, ArrowLeft, TrendingDown } from "lucide-react";

export default function RiskDisclosurePage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: true },
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
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#C43D3D] uppercase tracking-widest mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Legal Suite &mdash; 3 of 8</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Risk Disclosure Statement
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            CRITICAL WARNING: TRADING FINANCIAL DERIVATIVES AND SYNTHETIC CONTRACTS CARRIES A HIGH PROBABILITY OF RAPID CAPITAL LOSS.
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
          
          <section className="bg-[#0A0A0A] p-8 text-white space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C43D3D] flex items-center gap-2">
              <TrendingDown className="w-5 h-5" /> 100% Risk Threshold
            </h2>
            <p className="text-xs leading-relaxed opacity-80 uppercase font-bold">
              By utilizing Varban Markets, you explicitly acknowledge that you may lose the entire amount of capital committed to any individual trade order. There is no guarantee of profit or return on investment.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Market Volatility</h3>
              <p className="text-[#6B7280]">Market prices can change rapidly and move against your vector prediction without warning. High volatility can lead to rapid stake liquidation.</p>
            </section>
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Execution Latency</h3>
              <p className="text-[#6B7280]">Price quotes at the moment of submission may differ from the price at execution due to network latency or market gaps.</p>
            </section>
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Technology Risk</h3>
              <p className="text-[#6B7280]">Trading depends on servers, networks, and software. System outages, internet failures, or cyber incidents may impact account access.</p>
            </section>
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Counterparty Risk</h3>
              <p className="text-[#6B7280]">Contracts are over-the-counter and depend on the operational integrity of the Varban Markets matching engine architecture.</p>
            </section>
          </div>

          <section className="p-6 bg-[#F7F7F5] border-t-2 border-[#C43D3D] text-[#0A0A0A]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">No Investment Advice</h3>
            <p className="opacity-80 leading-relaxed">
              All information, technical indicators, and charts provided on the platform are for operational and educational purposes only. Varban Markets does not provide personalized investment, tax, or legal advice. Every trading decision remains the sole responsibility of the User.
            </p>
          </section>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/privacy" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev: Privacy Policy</span>
            </Link>
            <Link href="/terms/aml-kyc" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
              <span>Next: AML & KYC Policy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
