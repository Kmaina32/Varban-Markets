import Link from "next/link";
import { BarChart3, ArrowLeft, ArrowRight, Database, ShieldAlert, Globe } from "lucide-react";

export default function MarketDataTermsPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: false },
    { label: "Complaints", href: "/terms/complaints", active: false },
    { label: "Market Data", href: "/terms/market-data", active: true },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <BarChart3 className="w-4 h-4" />
            <span>Legal Suite &mdash; 8 of 8</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Market Data Disclaimer & Terms
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Policies governing the sourcing, redistribution, and accuracy of real-time financial market feeds on the Varban platform.
          </p>
        </div>

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

        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-12 shadow-sm text-[11px] leading-relaxed text-[#333333]">
          
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0055FF]" /> Data Sourcing
            </h2>
            <p>
              Market Data provided through the Platform is obtained from third-party liquidity aggregators, exchanges, and independent data vendors. While we aim for millisecond precision, Varban Markets does not guarantee that Market Data is uninterrupted, complete, or accurate at every moment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C43D3D]" /> Indicative Nature of Quotes
            </h2>
            <p>
              Quotes displayed on the terminal may be indicative rather than tradeable at the exact microsecond of observation. Market Data may be delayed, corrected, or unavailable due to exchange-specific rules or provider outages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0055FF]" /> Redistribution Prohibited
            </h2>
            <p>
              Market Data is provided solely for the User's operational use within the platform. Redistribution, scraping, or automated harvesting of Market Data for external commercial use is strictly prohibited and constitutes a breach of the Master Client Agreement.
            </p>
          </section>

          <div className="p-6 bg-[#F7F7F5] border-l-4 border-[#0055FF]">
            <p className="text-[10px] text-[#6B7280] font-bold uppercase italic">
              "Market Data is provided 'as is' and 'as available' without warranties of any kind."
            </p>
          </div>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/complaints" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev: Complaints Procedure</span>
            </Link>
            <Link href="/terms" className="font-bold text-[#0055FF] hover:underline">
              Back to General Terms &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
