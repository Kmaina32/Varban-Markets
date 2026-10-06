
import Link from "next/link";
import { Award, Zap, BarChart3, Database } from "lucide-react";

export default function ProfessionalAccountsPage() {
  return (
    <div className="bg-white min-h-screen py-20 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20 space-y-6">
          <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.3em] block">Institutional Series</span>
          <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-tight">Professional Accounts</h1>
          <p className="text-sm md:text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Engineered for high-volume traders and quantitative entities. Experience our tightest spreads and raw institutional liquidity.
          </p>
          <div className="pt-6">
            <Link href="/register" className="btn-institutional-primary bg-[#0A0A0A] text-white px-16 py-5 rounded-none shadow-xl">Get Started</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: Zap, title: "Raw Spread", text: "Direct exchange liquidity with spreads from 0.0 pips on majors." },
            { icon: BarChart3, title: "Zero Requotes", text: "100% automated matching engine execution with no human intervention." },
            { icon: Database, title: "API Trading", text: "Connect your algorithms directly via FIX or REST protocol nodes." }
          ].map((item, i) => (
            <div key={i} className="p-10 border border-[#E4E4E4] bg-[#F7F7F5] space-y-4 hover:border-[#0055FF] transition-all">
              <item.icon className="w-8 h-8 text-[#0055FF]" />
              <h3 className="text-sm font-bold uppercase tracking-widest">{item.title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0A0A0A] text-white p-12 md:p-24 space-y-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-8">Raw Institutional Pricing.</h2>
            <div className="space-y-10">
              <div className="border-l-4 border-[#0055FF] pl-8 space-y-2">
                <h4 className="text-sm font-bold uppercase">Dynamic Margin Control</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">Automated margin requirements that adapt to your trade size and market volatility in real-time.</p>
              </div>
              <div className="border-l-4 border-[#16835B] pl-8 space-y-2">
                <h4 className="text-sm font-bold uppercase">Priority Settlement</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">High-volume orders are prioritized on our core matching nodes for ultra-fast fills.</p>
              </div>
            </div>
            <div className="mt-16">
               <Link href="/contact" className="text-xs font-bold uppercase tracking-widest text-[#0055FF] hover:underline">Speak with an Account Executive &rarr;</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
