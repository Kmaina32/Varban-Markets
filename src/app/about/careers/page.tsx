import Link from "next/link";
import { Users, Briefcase, Zap, Heart, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function AboutCareersPage() {
  const navTabs = [
    { label: "Company Overview", href: "/about", active: false },
    { label: "Licenses & Security", href: "/about/licenses", active: false },
    { label: "Careers & Culture", href: "/about/careers", active: true },
    { label: "Press & News", href: "/about/press", active: false },
    { label: "Contact & Support", href: "/about/contact", active: false },
  ];

  const positions = [
    { title: "Senior Low-Latency Rust / C++ Engineer", department: "Core Execution Engine", location: "London / Remote", type: "Full-Time" },
    { title: "Lead Full-Stack Next.js Developer", department: "Trading Systems Frontend", location: "New York / Remote", type: "Full-Time" },
    { title: "Quantitative Risk & Pricing Analyst", department: "Derivatives Analytics", location: "Singapore / Remote", type: "Full-Time" },
    { title: "Global Compliance & AML Officer", department: "Legal & Regulatory", location: "Nairobi / Hybrid", type: "Full-Time" },
    { title: "24/7 Technical Support Specialist", department: "Client Operations", location: "Remote Global", type: "Full-Time" },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <Users className="w-4 h-4" />
            <span>About Suite &mdash; 3 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Careers at Varban Markets
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            We are building the world's most reliable, transparent, and high-performance financial market engine. Join our global team of engineers, quant analysts, product leaders, and compliance experts.
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

        {/* Culture & Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-[#E4E4E4] p-6 space-y-3">
            <Zap className="w-5 h-5 text-[#0055FF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Remote-First Flexibility</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">Work from anywhere in the world with competitive global compensation packages and flexible working hours.</p>
          </div>
          <div className="bg-white border border-[#E4E4E4] p-6 space-y-3">
            <Heart className="w-5 h-5 text-[#16835B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Comprehensive Benefits</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">100% employer-covered health insurance, hardware budget, learning stipend, and annual global team retreats.</p>
          </div>
          <div className="bg-white border border-[#E4E4E4] p-6 space-y-3">
            <Briefcase className="w-5 h-5 text-[#0A0A0A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">High Impact & Growth</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">Direct ownership of production systems supporting billions of dollars in real-time global trade execution.</p>
          </div>
        </div>

        {/* Open Positions List */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-6 mb-12 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#E4E4E4] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest block mb-1">Current Opportunities</span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Open Positions ({positions.length})</h2>
            </div>
          </div>

          <div className="divide-y divide-[#E4E4E4]">
            {positions.map((job, idx) => (
              <div key={idx} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] hover:text-[#0055FF] transition-colors cursor-pointer">{job.title}</h3>
                  <div className="flex items-center space-x-3 text-[10px] text-[#6B7280] mt-1 font-mono">
                    <span>{job.department}</span>
                    <span>&bull;</span>
                    <span>{job.location}</span>
                    <span>&bull;</span>
                    <span className="font-bold text-[#16835B]">{job.type}</span>
                  </div>
                </div>
                <a 
                  href="mailto:careers@varbanmarkets.com"
                  className="px-4 py-2 bg-[#0A0A0A] text-white hover:bg-[#0055FF] transition-colors text-[10px] font-bold uppercase tracking-widest text-center whitespace-nowrap"
                >
                  Apply Now &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Switcher */}
        <div className="flex justify-between items-center text-xs">
          <Link href="/about/licenses" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: Licenses & Security</span>
          </Link>
          <span className="text-[#6B7280]">About Page 3 of 5</span>
          <Link href="/about/press" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
            <span>Next: Press & Media News</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
