"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Monitor, 
  Wallet, 
  UserCheck, 
  Globe,
  Lock,
  Share2,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { useUser } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { Card } from "@/components/ui/card";
import { cn } from "@/app/lib/utils";

export default function HelpPage() {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const [activeFaq, setActiveActiveFaq] = useState<number | null>(null);

  const WORKSPACE_GUIDES = [
    { 
      title: "Trading Terminal", 
      icon: Monitor, 
      color: "text-[#0055FF]",
      slug: "terminal",
      desc: "Master the execution engine. Learn about CALL/PUT vectors, stake commitment, and the risk pre-verification handshake."
    },
    { 
      title: "Capital & Vaults", 
      icon: Wallet, 
      color: "text-[#16835B]",
      slug: "vaults",
      desc: "Manage your monetary domains. Understand the differences between Paystack Fiat processing and Blockchain Network nodes."
    },
    { 
      title: "Identity (KYC)", 
      icon: UserCheck, 
      color: "text-[#C9A227]",
      slug: "kyc",
      desc: "Verification protocols. Learn about the 24-48 hour document audit window and how to unlock institutional withdrawal limits."
    },
    { 
      title: "Security & Access", 
      icon: Lock, 
      color: "text-[#C43D3D]",
      slug: "security",
      desc: "Protect your workspace. Configure mandatory 2FA, monitor active IP sessions, and manage your account encryption keys."
    },
    { 
      title: "Global Markets", 
      icon: Globe, 
      color: "text-[#0A0A0A]",
      slug: "markets",
      desc: "Explore the registry. Insights into synthetic indices, high-volatility pairs, and deterministic pricing feeds."
    },
    { 
      title: "Referral Network", 
      icon: Share2, 
      color: "text-[#0055FF]",
      slug: "referral",
      desc: "Institutional growth. How to share your unique conduit and monitor your network enrollment metrics in the portal."
    }
  ];

  const TRADER_FAQS = [
    {
      q: "How are trade outcomes settled?",
      a: "All contracts are settled automatically at the millisecond of expiration. If the market price at expiration satisfies your chosen vector (CALL or PUT), the payout is credited to your balance instantly."
    },
    {
      q: "What is the standard payout percentage?",
      a: "Varban Markets typically offers an 85% return on successful contracts. This means a $100 stake would result in a $185 total settlement upon a winning outcome."
    },
    {
      q: "Can I cancel an active position?",
      a: "Standard positions cannot be cancelled once transmitted to the matching engine. However, the Terminal offers an 'Early Cashout' feature for a partial return of the committed stake before expiration."
    },
    {
      q: "Why is my deposit still 'Pending'?",
      a: "Fiat deposits via Paystack are usually instant. Cryptocurrency deposits require a specific number of block confirmations (e.g., 1 for SOL/TRC20, 2 for BTC) before our nodes credit your balance."
    },
    {
      q: "What documents are needed for KYC Tier 2?",
      a: "You must provide a high-resolution scan of a Government ID (Passport, National ID, or Driver's License) and a real-time selfie for biometric matching."
    }
  ];

  function AuthedHelpContent() {
    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#E4E4E4] pb-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em] block mb-2">Workspace Documentation</span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A]">How can we assist you today?</h1>
            <p className="text-xs text-[#6B7280] mt-3 leading-relaxed">
              Access technical specifications for the terminal, funding protocols, and regulatory compliance requirements. Use the modules below to navigate the institutional knowledge base.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search internal protocols..."
              className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-[#E4E4E4] text-[#0A0A0A] shadow-sm focus:outline-none focus:border-[#0055FF] rounded-none"
            />
          </div>
        </div>

        {/* Knowledge Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKSPACE_GUIDES.map((guide, idx) => (
            <Link key={idx} href={`/help/${guide.slug}`}>
              <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm hover:border-[#0055FF] transition-all group cursor-pointer h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#F7F7F5] border border-[#E4E4E4] group-hover:border-[#0055FF] transition-colors">
                    <guide.icon className={cn("w-5 h-5", guide.color)} />
                  </div>
                  <h4 className="text-xs font-bold uppercase text-[#0A0A0A] tracking-wider">{guide.title}</h4>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  {guide.desc}
                </p>
                <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-widest text-[#0055FF] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Documentation</span>
                  <ArrowRight className="ml-1.5 w-3 h-3" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Detailed FAQ Section */}
        <div className="bg-white border border-[#E4E4E4] shadow-sm">
          <div className="p-6 border-b border-[#E4E4E4] bg-[#F7F7F5]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
              Operational Frequently Asked Questions
            </h3>
          </div>
          <div className="divide-y divide-[#E4E4E4]">
            {TRADER_FAQS.map((faq, idx) => (
              <div key={idx} className="group">
                <button 
                  onClick={() => setActiveActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-[#F7F7F5] transition-colors"
                >
                  <span className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wide">
                    {faq.q}
                  </span>
                  {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-1 duration-200">
                    <p className="text-xs text-[#6B7280] leading-relaxed max-w-3xl border-l-2 border-[#0055FF] pl-4">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-[#0A0A0A] text-white p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-bold uppercase tracking-tight">Requires Specialized Authority?</h3>
            <p className="text-xs text-[#6B7280] max-w-md">
              If your inquiry involves a specific transaction reference or security lock, please transmit a priority support ticket.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/contact" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-white hover:text-[#0055FF]">
              <span>Contact Desk</span>
              <MessageSquare className="ml-2 w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function PublicHelpContent() {
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
            { icon: Monitor, title: "Trading", desc: "How to open and close trades." },
            { icon: Wallet, title: "Payments", desc: "Adding and taking out money." },
            { icon: Lock, title: "Security", desc: "Keeping your account safe." }
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
            {[
              { q: "How to start?", a: "Create an account, verify your ID, and add money to start trading." },
              { q: "What are synthetic indices?", a: "These are markets that copy real asset prices 24/7 using math models." },
              { q: "How do I get paid?", a: "When your trade finishes and you win, profit is added to your balance instantly." },
              { q: "Is my money safe?", a: "Yes, you can never lose more than you put into a single trade." }
            ].map((faq, idx) => (
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
        <div className="max-w-5xl mx-auto py-6">
          <AuthedHelpContent />
        </div>
      </AuthedLayout>
    );
  }

  return (
    <div className="bg-[#F7F7F5] py-20 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 mb-8 text-[#0055FF]">
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Public Documentation</span>
        </div>
        <PublicHelpContent />
      </div>
    </div>
  );
}
