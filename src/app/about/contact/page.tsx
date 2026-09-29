
'use client';

/**
 * @fileOverview Institutional Support Desk.
 * Handles inquiry transmission to Firestore and provides professional success confirmation via in-house modal.
 */

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageSquare, Clock, ArrowLeft, CheckCircle2, X, Send, ShieldCheck } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { Card } from "@/components/ui/card";
import { cn } from "@/app/lib/utils";

export default function AboutContactPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState<{ show: boolean; ref: string }>({ show: false, ref: "" });
  const [formData, setFormData] = useState({
    fullName: user?.displayName || "",
    email: user?.email || "",
    topic: "General Platform Inquiry",
    message: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || isSubmitting) return;

    setIsSubmitting(true);
    const ticketRef = "TK-" + Math.floor(Math.random() * 900000 + 100000);

    try {
      await addDoc(collection(db, "contact_messages"), {
        ...formData,
        status: "New",
        timestamp: serverTimestamp(),
        userId: user?.uid || "anonymous",
        ref: ticketRef
      });

      setSuccessModal({ show: true, ref: ticketRef });
      setFormData({ ...formData, message: "" });
    } catch (err) {
      alert("Transmission Failure: Could not establish a secure handshake with the support node.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A] relative">
      {/* Institutional Success Modal Overlay */}
      {successModal.show && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="bg-white border-[#E4E4E4] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-[#16835B]/10 border border-[#16835B] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#16835B]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Transmission Verified</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Your support ticket has been registered in the institutional ledger. Our global desk will review and respond via email within 24 business hours.
                </p>
              </div>
              <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] font-mono">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">Ticket Reference</span>
                <span className="text-sm font-bold text-[#0A0A0A] uppercase">#{successModal.ref}</span>
              </div>
              <button 
                onClick={() => setSuccessModal({ show: false, ref: "" })}
                className="w-full btn-institutional-primary py-4"
              >
                Return to Support Desk
              </button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-4">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>About Suite &mdash; 5 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Support Desk
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Institutional inquiry management and technical assistance. Our global desk monitors all transmissions 24/7.
          </p>
        </div>
        
        {/* Sub-Navigation */}
        <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-[#E4E4E4] pb-4 mb-2">
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

        {/* Global Offices Grid */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-8 mb-4 shadow-sm">
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
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-6 mb-4 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[#16835B] uppercase tracking-widest block mb-1">Direct Support Ticket</span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Submit an Inquiry</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#6B7280] block mb-1">Full Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Doe" 
                  className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF]" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#6B7280] block mb-1">Email Address</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="trader@domain.com" 
                  className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF]" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#6B7280] block mb-1">Inquiry Category</label>
              <select 
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF] appearance-none"
              >
                <option>General Platform Inquiry</option>
                <option>Account Verification & KYC</option>
                <option>Deposit & Withdrawal Assistance</option>
                <option>Institutional & Liquidity Partnership</option>
                <option>Technical Bug / API Telemetry</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[#6B7280] block mb-1">Message Details</label>
              <textarea 
                required 
                rows={4} 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your inquiry with as much detail as possible..." 
                className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs outline-none focus:border-[#0055FF]"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[#0A0A0A] hover:bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Support Ticket &rarr;</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
          <Clock className="w-4 h-4 text-[#0055FF] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            All institutional inquiries are logged in our immutable support ledger. For urgent trade settlement issues, please include the specific order reference token in your message payload.
          </p>
        </div>

        {/* Footer Navigation Switcher */}
        <div className="flex justify-between items-center text-xs pt-4">
          <Link href="/about/press" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: Press & Media</span>
          </Link>
          <span className="text-[#6B7280]">About Page 5 of 5</span>
          <Link href="/" className="font-bold text-[#0055FF] hover:underline">
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
