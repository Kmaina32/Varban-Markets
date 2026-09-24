import Link from "next/link";
import { DollarSign, ArrowLeft, ArrowRight, Wallet, Percent, CreditCard } from "lucide-react";

export default function FeesPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: true },
    { label: "Complaints", href: "/terms/complaints", active: false },
    { label: "Market Data", href: "/terms/market-data", active: false },
  ];

  const feeItems = [
    { title: "Trading Commission", value: "0.00%", desc: "Varban Markets does not charge direct commissions on option contracts." },
    { title: "Standard Payout", value: "85% - 92%", desc: "Net profit realized on successful vector prediction contracts." },
    { title: "Withdrawal Fee (Crypto)", value: "$1 - $8", desc: "Network-dependent mining and processing fees applied at payout." },
    { title: "Withdrawal Fee (Fiat)", value: "1.5%", desc: "Processing fee for bank remittance via Paystack Transfers." },
    { title: "Inactive Account", value: "$0.00", desc: "No maintenance fees are charged for dormant account profiles." },
    { title: "Min. Withdrawal", value: "$20.00", desc: "Minimum liquid domain equity required for remittance instructions." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#16835B] uppercase tracking-widest mb-2">
            <DollarSign className="w-4 h-4" />
            <span>Legal Suite &mdash; 6 of 8</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Fees & Charges Schedule
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This document outlines the cost structure for trading, currency conversion, and capital remittance on the Varban Markets platform.
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

        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-12 shadow-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feeItems.map((item, idx) => (
              <div key={idx} className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] block">{item.title}</span>
                <span className="text-xl font-mono font-bold text-[#0A0A0A] block">{item.value}</span>
                <p className="text-[10px] text-[#6B7280] leading-relaxed pt-2 border-t border-[#E4E4E4]">{item.desc}</p>
              </div>
            ))}
          </div>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0055FF]" /> Currency Conversion
            </h2>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              If you deposit or withdraw funds in a currency different from your Account Base Currency, a conversion fee of up to 1.5% may be applied based on the mid-market rate provided by our liquidity partners at the time of execution.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#0055FF]" /> Bonus Turnover Rules
            </h2>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Promotional credits or deposit match bonuses are subject to a minimum trading turnover requirement of 30x the bonus amount before bonus funds become eligible for withdrawal instruction.
            </p>
          </section>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/trading-rules" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev: Trading Rules</span>
            </Link>
            <Link href="/terms/complaints" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
              <span>Next: Complaints Handling</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
