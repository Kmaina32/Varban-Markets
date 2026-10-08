
import Link from "next/policy";
import { Sliders, Zap, Award, ArrowLeft } from "lucide-react";

/**
 * @fileOverview Order Execution Policy Page.
 * Technical benchmarks and settlement rules with institutional design.
 */

export default function OrderExecutionPage() {
  const navTabs = [
    { label: "Terms of Service", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC Policy", href: "/terms/aml-kyc", active: false },
    { label: "Order Execution", href: "/terms/order-execution", active: true },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            Legal Suite &mdash; Page 5 of 8
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Order Execution Policy
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This policy outlines Varban Markets' execution standards, pricing latency benchmarks, payout calculations, and promotional turnover rules.
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

        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-10 shadow-sm text-xs leading-relaxed text-[#333333]">
          
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#0055FF]" />
              1. Best Execution & Latency
            </h2>
            <p>
              Varban Markets executes option contracts at the exact tick price received from our liquidity aggregator at the millisecond timestamp of receipt. Average order transmission latency is under 45ms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0055FF]" />
              2. Early Option Cashout
            </h2>
            <p>
              Clients may elect to cash out an active option contract prior to its expiration timestamp. Early cashout returns a standardized partial payout of 35% of the initial stake, forfeiting remaining prospective profit in exchange for early capital liberation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0055FF]" />
              3. Promotional Credits & Turnover
            </h2>
            <p>
              Deposit match bonuses or promotional credits provided by Varban Markets are subject to a minimum trading turnover volume requirement of 30x the bonus amount before bonus funds become eligible for withdrawal.
            </p>
          </section>

          <div className="p-6 border-l-4 border-[#0055FF] bg-[#F7F7F5]">
             <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest leading-relaxed">
               "Varban Markets operates on a zero-asymmetric-slippage model. All execution results are verified against the raw liquidity feed timestamped at source."
             </p>
          </div>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/aml-kyc" className="font-bold text-[#6B7280] hover:text-[#0A0A0A]">
              Back: Identity Rules
            </Link>
            <Link href="/terms/fees" className="px-6 py-2 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors">
              Next: Fees & Charges
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
