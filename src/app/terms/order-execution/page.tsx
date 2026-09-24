import Link from "next/link";
import { Sliders, Zap, Award, ArrowLeft } from "lucide-react";

export default function OrderExecutionPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC Policy", href: "/terms/aml-kyc", active: false },
    { label: "Order Execution", href: "/terms/order-execution", active: true },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <Sliders className="w-4 h-4" />
            <span>Legal Suite &mdash; 5 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Order Execution & Bonus Terms
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This policy outlines Varban Markets' execution standards, pricing latency benchmarks, payout calculations, early option cashout terms, and promotional bonus turnover rules.
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
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">1</span>
              Best Execution & Latency Standards
            </h2>
            <p>
              Varban Markets executes option contracts at the exact tick price received from our liquidity aggregator at the millisecond timestamp of receipt. Average order transmission latency is under 45ms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">2</span>
              Early Option Cashout Conditions
            </h2>
            <p>
              Clients may elect to cash out an active option contract prior to its expiration timestamp. Early cashout returns a standardized partial payout of 35% of the initial stake, forfeiting remaining prospective profit in exchange for early capital liberation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">3</span>
              Promotional Bonus & Credit Turnover Rules
            </h2>
            <p>
              Deposit match bonuses or promotional credits provided by Varban Markets are subject to a minimum trading turnover volume requirement of 30x the bonus amount before bonus funds become eligible for withdrawal.
            </p>
            <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-[10px]">
              <span className="text-[#0A0A0A] font-bold block mb-1">Turnover Formula Example:</span>
              <p className="text-[#6B7280]">$100 Bonus Received &times; 30 = $3,000 Total Execution Stake Required.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">4</span>
              System Maintenance & Trade Cancellation
            </h2>
            <p>
              In the event of severe feed corruption, hardware outage, or market pricing errors, Varban Markets reserves the right to void impacted contracts and refund 100% of affected Client stakes.
            </p>
          </section>

        </div>

        {/* Footer Navigation Switcher */}
        <div className="mt-8 flex justify-between items-center text-xs">
          <Link href="/terms/aml-kyc" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: AML & KYC Policy</span>
          </Link>
          <span className="text-[#6B7280]">Legal Suite Completed (5/5)</span>
          <Link href="/terms" className="font-bold text-[#0055FF] hover:underline">
            Back to General Terms &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
