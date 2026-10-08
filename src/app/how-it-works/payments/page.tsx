
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Clock, Globe, ShieldCheck, Zap } from "lucide-react";

/**
 * @fileOverview Funding & Settlement Overview Page.
 * Detailed method grid for deposits and withdrawals.
 */

export default function PaymentsPage() {
  return (
    <div className="bg-[#F7F7F5] min-h-screen py-20 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-12 mb-12">
          <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.3em] block mb-4">Funding & Settlement</span>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Deposits & Withdrawals</h1>
          <p className="text-sm text-[#6B7280] mt-6 max-w-3xl leading-relaxed">
            Experience seamless capital movement. We prioritize instant clearing and automated risk reviews to ensure your funds are always exactly where you need them.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* DEPOSITS */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="w-6 h-6 text-[#16835B]" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Deposit Methods</h2>
            </div>
            <div className="space-y-4">
              {[
                { method: "Bank Cards (Visa/Mastercard)", speed: "Instant", fee: "0%", min: "$10" },
                { method: "Cryptocurrency (USDT/BTC/SOL)", speed: "1-5 Mins", fee: "0%", min: "$10" },
                { method: "Mobile Money (MPesa/MoMo)", speed: "Instant", fee: "0%", min: "$5" },
                { method: "Bank Wire Transfer", speed: "1-3 Days", fee: "0%", min: "$100" }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E4E4E4] p-5 flex justify-between items-center shadow-sm hover:border-[#0055FF] transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-[#0A0A0A] block uppercase">{item.method}</span>
                    <span className="text-[9px] text-[#16835B] font-bold uppercase flex items-center gap-1 mt-1">
                      <Zap className="w-2.5 h-2.5" /> {item.speed} clearing
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-[#6B7280] uppercase block">Fee: {item.fee}</span>
                    <span className="text-[10px] font-bold text-[#0A0A0A] block">Min: {item.min}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WITHDRAWALS */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-6 h-6 text-[#0055FF]" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Withdrawal Methods</h2>
            </div>
            <div className="space-y-4">
              {[
                { method: "Original Card Source", speed: "1-2 Hours", fee: "0%", limit: "$10,000" },
                { method: "Crypto Wallet (Any)", speed: "Under 1 Hour", fee: "Net", limit: "Unlimited" },
                { method: "Mobile Money", speed: "Instant", fee: "0%", limit: "$2,000" },
                { method: "Domestic Bank Transfer", speed: "24 Hours", fee: "1.5%", limit: "Unlimited" }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E4E4E4] p-5 flex justify-between items-center shadow-sm hover:border-[#0055FF] transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-[#0A0A0A] block uppercase">{item.method}</span>
                    <span className="text-[9px] text-[#0055FF] font-bold uppercase flex items-center gap-1 mt-1">
                      <Clock className="w-2.5 h-2.5" /> {item.speed} average
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-[#6B7280] uppercase block">Fee: {item.fee}</span>
                    <span className="text-[10px] font-bold text-[#0A0A0A] block">Limit: {item.limit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] text-white p-12 md:p-20 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl">
          <div className="space-y-4 text-center md:text-left">
            <ShieldCheck className="w-10 h-10 text-[#0055FF]" />
            <h3 className="text-xl font-bold uppercase tracking-tight">PCI-DSS Level 1 Secure</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-md uppercase tracking-tight font-bold">
              All financial transmissions are protected by high-precision encryption and subject to rigorous international compliance auditing.
            </p>
          </div>
          <Link href="/register" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] text-white px-12 py-5 whitespace-nowrap">Fund Your Account</Link>
        </div>

      </div>
    </div>
  );
}
