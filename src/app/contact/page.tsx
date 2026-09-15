"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ShieldCheck, MapPin, Phone, Send, Check } from "lucide-react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { useUser } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";

export default function ContactPage() {
  const { user, loading } = useUser();
  const { t } = useTranslation();

  function ContactForm({ isAuthed }: { isAuthed: boolean }) {
    const [submitted, setSubmitted] = useState(false);
    const [status, setStatus] = useState("idle");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("loading");
      setTimeout(() => {
        setStatus("idle");
        setSubmitted(true);
      }, 1000);
    };

    if (submitted) {
      return (
        <div className="bg-white border border-[#E4E4E4] p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-[#16835B]/10 border border-[#16835B] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-[#16835B]" />
          </div>
          <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Message Sent</h3>
          <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm mx-auto">
            We received your message and will get back to you soon.
          </p>
          <button 
            onClick={() => setSubmitted(false)} 
            className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest underline mt-4"
          >
            Send Another Message
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white border border-[#E4E4E4] p-8 shadow-sm">
        <div className="border-b border-[#E4E4E4] pb-6 mb-8">
          <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            {isAuthed ? "Support Desk" : "Send a Message"}
          </h2>
          <p className="text-[11px] text-[#6B7280] mt-2 uppercase tracking-wider font-bold">
            Tell us how we can help you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Your Name</label>
              <input required type="text" className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Your Email</label>
              <input required type="email" className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Topic</label>
            <select className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5] appearance-none cursor-pointer">
              <option>General Question</option>
              <option>Account Issue</option>
              <option>Payment Issue</option>
              <option>Technical Problem</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Message</label>
            <textarea required rows={5} className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" placeholder="Type your message here..."></textarea>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full btn-institutional-primary flex items-center justify-center space-x-2 py-4"
          >
            {status === 'loading' ? "Sending..." : (
              <>
                <span>Send Now</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="w-5 h-5 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <AuthedLayout 
        title={t('nav.contact')} 
        subtitle={t('pages.contactSubtitle')}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContactForm isAuthed={true} />
          </div>
          <div className="space-y-6">
            <div className="bg-[#0A0A0A] text-white p-6 border-b-4 border-[#C9A227]">
              <ShieldCheck className="w-8 h-8 text-[#C9A227] mb-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Priority Support</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Logged in users get faster support responses.
              </p>
            </div>
          </div>
        </div>
      </AuthedLayout>
    );
  }

  return (
    <div className="bg-[#F7F7F5] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-12">
            <div>
              <span className="text-[10px] font-bold text-[#C9A227] uppercase tracking-[0.2em] block mb-4">{t('nav.contact')}</span>
              <h1 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display leading-tight">
                Get in Touch.
              </h1>
              <p className="text-sm text-[#6B7280] mt-6 leading-relaxed">
                Our team is ready to help you with any questions about trading or your account.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: Mail, title: "Email", detail: "support@varbanmarkets.com" },
                { icon: Phone, title: "Phone", detail: "+44 (0) 20 7946 0000" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <item.icon className="w-5 h-5 text-[#C9A227] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">{item.title}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <ContactForm isAuthed={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
