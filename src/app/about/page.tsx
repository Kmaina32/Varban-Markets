import Link from "next/link";
import { Shield, Cpu, Database, Zap, Globe, Users, Target, Award, ArrowRight } from "lucide-react";

export default function AboutOverviewPage() {
  const navTabs = [
    { label: "Company Overview", href: "/about", active: true },
    { label: "Licenses & Security", href: "/about/licenses", active: false },
    { label: "Careers & Culture", href: "/about/careers", active: false },
    { label: "Press & News", href: "/about/press", active: false },
    { label: "Contact & Support", href: "/about/contact", active: false },
  ];

  const executiveTeam = [
    { name: "Victor Varban", role: "Chief Executive Officer & Founder", bio: "Former Quantitative Risk Strategist with 15+ years experience building high-frequency execution infrastructure across London and New York financial hubs." },
    { name: "Elena Rostova", role: "Chief Technology Officer", bio: "Ex-Lead Architect at Tier-1 Investment Bank. Specialized in low-latency WebSocket data streaming and server-side settlement validation." },
    { name: "Marcus Chen", role: "Head of Global Compliance", bio: "Certified Anti-Money Laundering Specialist (CAMS) with background overseeing international regulatory frameworks and cross-border licensing." },
    { name: "Sophia Al-Mansoor", role: "Head of Product & Design", bio: "Pioneer in user-centric financial UX, focused on transparent risk presentation and high-performance electronic trading interfaces." },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <Globe className="w-4 h-4" />
            <span>About Suite &mdash; 1 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            About Varban Markets
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Varban Markets is a global financial technology provider delivering high-speed, deterministic option execution and synthetic market infrastructure for retail and institutional traders worldwide.
          </p>
        </div>

        {/* About Suite Sub-Navigation */}
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

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-[#E4E4E4] p-6 space-y-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-[#0055FF]">$1.4B+</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] block">Monthly Volume Processed</span>
            <p className="text-[11px] text-[#6B7280]">Executed across crypto, forex, commodities, and index synthetic contracts.</p>
          </div>
          <div className="bg-white border border-[#E4E4E4] p-6 space-y-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-[#16835B]">140+</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] block">Countries Supported</span>
            <p className="text-[11px] text-[#6B7280]">Serving over 450,000 active traders with 99.98% system uptime.</p>
          </div>
          <div className="bg-white border border-[#E4E4E4] p-6 space-y-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-[#0A0A0A]">&lt;45ms</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] block">Average Execution Speed</span>
            <p className="text-[11px] text-[#6B7280]">Powered by ultra-low-latency price aggregator infrastructure.</p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-8 mb-12 shadow-sm">
          <div className="border-b border-[#E4E4E4] pb-6">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest block mb-1">Our Core Purpose</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Democratizing High-Speed Derivatives Trading</h2>
            <p className="text-xs text-[#6B7280] mt-3 leading-relaxed">
              Founded in 2024, Varban Markets was created to bridge the gap between complex institutional derivative markets and retail accessibility. We believe traders deserve absolute transparency in contract outcomes, zero hidden slippage, and instant execution.
            </p>
          </div>

          {/* Executive Leadership Grid */}
          <div>
            <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest block mb-4">Executive Leadership</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {executiveTeam.map((member, idx) => (
                <div key={idx} className="p-5 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">{member.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-[#0055FF] block">{member.role}</span>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation Switcher */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#6B7280]">About Page 1 of 5</span>
          <Link href="/about/licenses" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
            <span>Next: Regulatory Licenses & Security</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
