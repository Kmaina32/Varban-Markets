import Link from "next/link";
import { Sliders, ArrowLeft, ArrowRight, Zap, Target, Clock, ShieldCheck } from "lucide-react";

export default function TradingRulesPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: true },
    { label: "Fees & Charges", href: "/terms/fees", active: false },
    { label: "Complaints", href: "/terms/complaints", active: false },
    { label: "Market Data", href: "/terms/market-data", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <Sliders className="w-4 h-4" />
            <span>Legal Suite &mdash; 5 of 8</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Trading Rules & Execution Policy
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This document outlines the standards for order execution, pricing methodology, and deterministic settlement on the Varban matching engine.
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
              <Zap className="w-4 h-4 text-[#0055FF]" /> 1. Execution Standard
            </h2>
            <p>
              Varban Markets executes option contracts at the exact tick price received from our liquidity aggregator at the millisecond of receipt. Average order transmission latency is benchmarked at under 45ms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#0055FF]" /> 2. Settlement Methodology
            </h2>
            <p>
              Settlement outcomes are determined by the matching engine at the contract's designated expiry second. For CALL vectors, profit is realized if Expiry Price &gt; Entry Price. For PUT vectors, profit is realized if Expiry Price &lt; Entry Price.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0055FF]" /> 3. Early Cashout Protocols
            </h2>
            <p>
              Users may elect to cash out an active option contract prior to its natural expiration. Early cashout returns a standardized partial payout of 35% of the initial stake, forfeiting prospective profit in exchange for immediate capital liberation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0055FF]" /> 4. Pricing Errors & Voiding
            </h2>
            <p>
              In the event of severe feed corruption, market pricing errors, or extreme hardware outage, Varban Markets reserves the right to void impacted contracts and refund 100% of affected Client stakes to ensure platform integrity.
            </p>
          </section>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/aml-kyc" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev: AML & KYC</span>
            </Link>
            <Link href="/terms/fees" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
              <span>Next: Fees & Charges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
