import Link from "next/link";
import { Shield, Cpu, Database, Zap } from "lucide-react";

export default function AboutPage() {
  const principles = [
    {
      title: "Our Approach",
      text: "We provide trading infrastructure focused on transparent risk management and deterministic execution. Traders can review their exact exposure before confirming any contract.",
      icon: Shield
    },
    {
      title: "Market Infrastructure",
      text: "Varban Markets uses proprietary pricing feeds to ensure market availability and consistent data distribution across all asset classes.",
      icon: Database
    },
    {
      title: "Technology",
      text: "Our core engine handles trade validation and settlement on the server side, ensuring that all payout calculations remain accurate and auditable.",
      icon: Cpu
    },
    {
      title: "Risk Framework",
      text: "By using fixed contract outcomes, we eliminate unexpected losses beyond the initial stake, providing a controlled environment for market analysis.",
      icon: Zap
    }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-12">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">About Us</span>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Varban Markets</h1>
          <p className="text-sm text-[#6B7280] mt-4 leading-relaxed max-w-2xl">
            Varban Markets provides professional trading infrastructure for synthetic and derivative markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {principles.map((p, idx) => (
            <div key={idx} className="bg-white border border-[#E4E4E4] p-8 space-y-4">
              <p.icon className="w-6 h-6 text-[#C9A227]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
                {p.title}
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {p.text}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white text-[#0A0A0A] p-8 border border-[#E4E4E4]">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-[#C9A227]">Operational Integrity</h2>
          <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
            We operate a matching protocol where every trade execution is logged with a unique reference key. This ensures that the platform state remains consistent and auditable at all times.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/technology" className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#C9A227] pb-1 hover:text-[#C9A227] transition-colors">
              Technology Architecture &rarr;
            </Link>
            <Link href="/risk-disclosure" className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#C9A227] pb-1 hover:text-[#C9A227] transition-colors">
              Risk Disclosure &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}