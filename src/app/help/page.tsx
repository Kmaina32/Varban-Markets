"use client";

import React from "react";
import Link from "next/link";
import { Layers, CreditCard, ShieldCheck, Search, HelpCircle, ArrowRight } from "lucide-react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { useUser } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";

export default function HelpPage() {
  const { user, loading } = useUser();
  const { t } = useTranslation();

  const FAQS = [
    { q: "How to start?", a: "Create an account, verify your ID, and add money to start trading." },
    { q: "What are synthetic indices?", a: "These are markets that copy real asset prices 24/7 using math models." },
    { q: "How do I get paid?", a: "When your trade finishes and you win, profit is added to your balance instantly." },
    { q: "Is my money safe?", a: "Yes, you can never lose more than you put into a single trade." }
  ];

  function HelpContent() {
    return (
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Need Help?</h1>
          <div className="mt-4 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                disabled
                placeholder={t('common.search')}
                className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-[#E4E4E4] text-[#6B7280] shadow-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Layers, title: "Trading", desc: "How to open and close trades." },
            { icon: CreditCard, title: "Payments", desc: "Adding and taking out money." },
            { icon: ShieldCheck, title: "Security", desc: "Keeping your account safe." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E4E4E4] p-6 shadow-sm hover:border-[#0055FF] transition-colors group cursor-pointer">
              <item.icon className="w-5 h-5 text-[#0055FF] mb-3" />
              <h4 className="text-xs font-bold uppercase text-[#0A0A0A] tracking-wider">{item.title}</h4>
              <p className="text-[11px] text-[#6B7280] mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E4E4E4] p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-4 mb-6">
            Common Questions
          </h3>
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[11px] font-bold text-[#0A0A0A] block uppercase">Q: {faq.q}</span>
                <p className="text-xs text-[#6B7280] leading-relaxed pl-4 border-l-2 border-[#F7F7F5]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-6">
          <p className="text-xs text-[#6B7280] mb-4">Still need help?</p>
          <Link href="/contact" className="btn-institutional-primary inline-flex items-center space-x-2">
            <span>{t('nav.contact')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="w-5 h-5 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <AuthedLayout 
        title={t('nav.help')} 
        subtitle={t('pages.helpSubtitle')}
      >
        <div className="max-w-4xl mx-auto">
          <HelpContent />
        </div>
      </AuthedLayout>
    );
  }

  return (
    <div className="bg-[#F7F7F5] py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 mb-8 text-[#0055FF]">
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Public Help</span>
        </div>
        <HelpContent />
      </div>
    </div>
  );
}
