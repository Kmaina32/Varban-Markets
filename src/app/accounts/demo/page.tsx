
import Link from "next/link";
import { Shield, RefreshCw, Smartphone, TrendingUp } from "lucide-react";

export default function DemoAccountPage() {
  return (
    <div className="bg-[#F7F7F5] min-h-screen py-20 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8 text-center lg:text-left">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.3em] block">Risk-Free Environment</span>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">Practice Trading.</h1>
            <p className="text-sm md:text-base text-[#6B7280] leading-relaxed max-w-xl">
              Master your strategies with $10,000 in virtual funds. Experience real market conditions without risking a single dollar of capital.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="btn-institutional-primary px-12">Start Practicing</Link>
              <Link href="/login" className="btn-institutional-secondary px-12">Trader Sign In</Link>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-video bg-white border border-[#E4E4E4] p-4 shadow-2xl">
             <div className="w-full h-full bg-[#0A0A0A] flex flex-col items-center justify-center text-center space-y-4">
                <TrendingUp className="w-16 h-16 text-[#0055FF]" />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] block">Practice Sandbox</span>
                  <span className="text-3xl font-mono font-bold text-[#0055FF]">$10,000.00</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: RefreshCw, title: "Instant Reset", text: "Exhausted your balance? Reset your practice funds back to $10,000 with a single click." },
            { icon: Smartphone, title: "Full Terminal Access", text: "Practice with the same tools, indicators, and charts used by live traders." },
            { icon: Shield, title: "Unlimited Time", text: "Your demo account stays active as long as you need it to refine your edge." }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#E4E4E4] p-10 space-y-4 text-center shadow-sm">
              <item.icon className="w-8 h-8 text-[#0055FF] mx-auto" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{item.title}</h3>
              <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">{item.text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
