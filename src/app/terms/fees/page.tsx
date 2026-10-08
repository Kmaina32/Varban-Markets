
import Link from "next/link";
import { DollarSign, ShieldCheck } from "lucide-react";

/**
 * @fileOverview Fees & Charges Policy Page.
 * Transparent cost ledger with institutional design.
 */

export default function FeesPage() {
  const navTabs = [
    { label: "Terms of Service", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Warning", href: "/terms/risk-disclosure", active: false },
    { label: "Identity Rules", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: true },
    { label: "Complaints", href: "/terms/complaints", active: false },
    { label: "Market Data", href: "/terms/market-data", active: false },
  ];

  const feeItems = [
    { title: "Trading Fees", value: "0.00%", desc: "We do not charge commissions on trades." },
    { title: "Standard Profit", value: "85% - 92%", desc: "The amount you earn on a successful trade." },
    { title: "Withdrawal (Crypto)", value: "$1 - $8", desc: "Network fees applied when you withdraw crypto." },
    { title: "Withdrawal (Bank)", value: "1.5%", desc: "Processing fee for bank transfers." },
    { title: "Monthly Fee", value: "$0.00", desc: "No fees for keeping your account open." },
    { title: "Min. Withdrawal", value: "$20.00", desc: "Minimum amount you can take out." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            Legal Suite &mdash; Page 6 of 8
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Fees & Charges
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This page lists all costs for trading and moving money on the Varban platform. We prioritize total cost transparency for all traders.
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

        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-12 shadow-sm text-xs leading-relaxed text-[#333333]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {feeItems.map((item, idx) => (
              <div key={idx} className="border-t border-[#E4E4E4] pt-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] block">{item.title}</span>
                <span className="text-lg font-mono font-bold text-[#0A0A0A] block">{item.value}</span>
                <p className="text-[10px] text-[#6B7280] uppercase font-bold">{item.desc}</p>
              </div>
            ))}
          </div>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              Currency Conversion
            </h2>
            <p>
              If you deposit money in a currency different from your account's base currency, a conversion fee of up to 1.5% will be applied based on current market rates at the time of clearing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              Promotion & Bonus Turnover
            </h2>
            <p>
              Promotional credits or deposit match bonuses provided by Varban Markets are subject to a minimum trading turnover volume requirement of 30x the bonus amount before bonus funds become eligible for withdrawal.
            </p>
          </section>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/trading-rules" className="font-bold text-[#6B7280] hover:text-[#0A0A0A]">
              Back: Trading Rules
            </Link>
            <Link href="/terms/complaints" className="px-6 py-2 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors">
              Next: Complaints
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
