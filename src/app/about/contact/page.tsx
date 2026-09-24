'use client';

import Link from "next/link";
import { Mail, Phone, MapPin, MessageSquare, Clock, ArrowLeft } from "lucide-react";

export default function AboutContactPage() {
  const navTabs = [
    { label: "Company Overview", href: "/about", active: false },
    { label: "Licenses & Security", href: "/about/licenses", active: false },
    { label: "Careers & Culture", href: "/about/careers", active: false },
    { label: "Press & News", href: "/about/press", active: false },
    { label: "Contact & Support", href: "/about/contact", active: true },
  ];

  const offices = [
    { city: "Saint Lucia (Global HQ)", address: "Rodney Bayside Building, Rodney Bay, Gros Islet, Saint Lucia", phone: "+1 758 452 9122", email: "support@varbanmarkets.com" },
    { city: "London", address: "25 Bank Street, Canary Wharf, London E14 5JP, United Kingdom", phone: "+44 (0) 20 7946 0912", email: "support@varbanmarkets.com" },
    { city: "Singapore", address: "8 Marina View, #22-01 Asia Square Tower 1, Singapore 018960", phone: "+65 6789 0123", email: "support@varbanmarkets.com" },
    { city: "Nairobi", address: "Delta Corner Towers, Ring Road Westlands, Nairobi, Kenya", phone: "+254 700 000 000", email: "support@varbanmarkets.com" },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <Mail className="w-4 h-4" />
            <span>About Suite &mdash; 5 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Contact & Support Desk
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Our global desk offers 24/7 technical, account verification, and institutional support. Contact us via live support, email, or visit one of our international offices.
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

        {/* Global Offices Grid */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-8 mb-12 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest block mb-1">International Network</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Global Office Locations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offices.map((office, idx) => (
              <div key={idx} className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#0055FF]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">{office.city}</h3>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">{office.address}</p>
                <div className="pt-2 border-t border-[#E4E4E4] space-y-1 font-mono text-[10px] text-[#0A0A0A]">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 text-[#6B7280]" />
                    <span>{office.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3 text-[#6B7280]" />
                    <span>{office.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Ticket Form */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-6 mb-12 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[#16835B] uppercase tracking-widest block mb-1">Direct Support Ticket</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Submit an Inquiry</h2>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("Support Ticket Transmitted successfully. Ticket Ref: #TK-" + Math.floor(Math.random()*900000 + 100000)); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#6B7280] block mb-1">Full Name</label>
                <input required type="text" placeholder="John Doe" className="w-full p-3 bg-white border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF]" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#6B7280] block mb-1">Email Address</label>
                <input required type="email" placeholder="john@example.com" className="w-full p-3 bg-white border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF]" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#6B7280] block mb-1">Inquiry Category</label>
              <select className="w-full p-3 bg-white border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF]">
                <option>General Platform Inquiry</option>
                <option>Account Verification & KYC</option>
                <option>Deposit & Withdrawal Assistance</option>
                <option>Institutional & Liquidity Partnership</option>
                <option>Technical Bug / API Telemetry</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#6B7280] block mb-1">Message Details</label>
              <textarea required rows={4} placeholder="Describe your inquiry..." className="w-full p-3 bg-white border border-[#E4E4E4] text-xs outline-none focus:border-[#0055FF]"></textarea>
            </div>

            <button type="submit" className="px-6 py-3 bg-[#0A0A0A] hover:bg-[#0055FF] text-white text-xs font-bold uppercase tracking-widest transition-colors shadow">
              Transmit Support Ticket &rarr;
            </button>
          </form>
        </div>

        {/* Footer Navigation Switcher */}
        <div className="flex justify-between items-center text-xs">
          <Link href="/about/press" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: Press & News</span>
          </Link>
          <span className="text-[#6B7280]">About Suite Completed (5/5)</span>
          <Link href="/about" className="font-bold text-[#0055FF] hover:underline">
            Back to Company Overview &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
