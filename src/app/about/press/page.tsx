import Link from "next/link";
import { Newspaper, Download, Calendar, ArrowRight, ArrowLeft } from "lucide-react";

export default function AboutPressPage() {
  const navTabs = [
    { label: "Company Overview", href: "/about", active: false },
    { label: "Licenses & Security", href: "/about/licenses", active: false },
    { label: "Careers & Culture", href: "/about/careers", active: false },
    { label: "Press & News", href: "/about/press", active: true },
    { label: "Contact & Support", href: "/about/contact", active: false },
  ];

  const pressReleases = [
    { date: "September 15, 2026", title: "Varban Markets Surpasses $1.4 Billion Monthly Synthetic Option Execution Volume", summary: "Global trading platform announces record quarterly milestone driven by expanded multi-asset crypto and forex derivative adoption across EMEA and APAC regions." },
    { date: "June 22, 2026", title: "Varban Markets Launches Ultra-Low Latency Binance WebSocket Feed Integration", summary: "Engine Upgrade v4.2 delivers real-time tick price matching under 45 milliseconds for major cryptocurrency pairs." },
    { date: "March 10, 2026", title: "Varban Markets Expands Regulatory Footprint with VASP Registration Approval", status: "Regulatory Announcement", summary: "Clearance granted for virtual asset wallet custody, enhancing platform compliance for institutional digital asset traders." },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <Newspaper className="w-4 h-4" />
            <span>About Suite &mdash; 4 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Press Releases & Media Room
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Official announcements, corporate news, executive commentary, and downloadable media brand assets for journalists and industry analysts.
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

        {/* Media Kit Download Banner */}
        <div className="bg-[#0A0A0A] text-white p-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
          <div>
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest block mb-1">Official Brand Kit</span>
            <h2 className="text-lg font-bold uppercase tracking-tight">Download Press Assets</h2>
            <p className="text-xs text-[#6B7280] mt-1 max-w-xl">Includes high-resolution logos, brand guidelines, executive headshots, and product screenshot vectors.</p>
          </div>
          <a
            href="/assets/logo2.png"
            download
            className="px-5 py-3 bg-[#0055FF] hover:bg-[#0044cc] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download Media Kit (.ZIP)</span>
          </a>
        </div>

        {/* Press Releases Feed */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-8 mb-12 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest block mb-1">Corporate Newsroom</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Latest Press Announcements</h2>
          </div>

          <div className="space-y-6 divide-y divide-[#E4E4E4]">
            {pressReleases.map((item, idx) => (
              <div key={idx} className={idx === 0 ? "space-y-2" : "pt-6 space-y-2"}>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-[#6B7280]">
                  <Calendar className="w-3 h-3 text-[#0055FF]" />
                  <span>{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-[#0A0A0A] hover:text-[#0055FF] transition-colors cursor-pointer">{item.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Switcher */}
        <div className="flex justify-between items-center text-xs">
          <Link href="/about/careers" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: Careers & Culture</span>
          </Link>
          <span className="text-[#6B7280]">About Page 4 of 5</span>
          <Link href="/about/contact" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
            <span>Next: Contact & Global Offices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
