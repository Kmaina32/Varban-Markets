
import Link from "next/link";
import { Check, ShieldCheck, Zap, Globe } from "lucide-react";

/**
 * @fileOverview Standard Account Specification Page.
 * Professional retail account details with institutional design.
 */

export default function StandardAccountsPage() {
  const features = [
    { title: "Minimum Deposit", value: "$10 USD", desc: "Start trading with accessible capital." },
    { title: "Spreads", value: "From 0.3 pips", desc: "Competitive institutional-grade pricing." },
    { title: "Commissions", value: "Zero", desc: "No hidden fees on any trade volume." },
    { title: "Execution", value: "Market", desc: "Ultra-low latency deterministic settlement." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-20 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-12 mb-12 text-center md:text-left">
          <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.3em] block mb-4">Trading Accounts</span>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight leading-tight">Standard Account</h1>
          <p className="text-sm md:text-base text-[#6B7280] mt-6 max-w-2xl leading-relaxed">
            Designed for all types of traders, our Standard account offers a stable, balanced environment with zero commission and competitive spreads across all asset domains.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/register" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] text-white px-12">Open Account</Link>
            <Link href="/accounts/demo" className="btn-institutional-secondary px-12">Try Demo</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((f, i) => (
            <div key={i} className="bg-white border border-[#E4E4E4] p-8 space-y-2 shadow-sm">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">{f.title}</span>
              <span className="text-2xl font-bold text-[#0A0A0A] block">{f.value}</span>
              <p className="text-[10px] text-[#6B7280] uppercase font-bold">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E4E4E4] p-12 md:p-20 space-y-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight">The Retail Standard</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Our Standard account is our most popular choice, providing access to our entire registry of 150+ instruments including Forex, Crypto, and Commodities with zero asymmetric slippage.
              </p>
              <ul className="space-y-4">
                {[
                  "Access to 24/7 synthetic indices",
                  "Instant deposit and withdrawal clearing",
                  "Negative balance protection enabled",
                  "Professional TradingView charting suite"
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                    <Check className="w-4 h-4 text-[#16835B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#F7F7F5] p-10 border border-[#E4E4E4] flex flex-col items-center text-center space-y-6">
              <ShieldCheck className="w-12 h-12 text-[#0055FF]" />
              <h3 className="text-lg font-bold uppercase">Ready to trade?</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">Join over 450,000 active traders using the Varban standard for reliable execution.</p>
              <Link href="/register" className="w-full btn-institutional-primary py-4">Register Now</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
