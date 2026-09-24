
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
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
      title: "Trading Guide", 
      color: "border-[#0055FF]",
      slug: "terminal",
      desc: "Learn how to use the trading system. Understand market directions, amounts, and how to check your trade details."
    },
    { 
      title: "Add & Withdraw Money", 
      color: "border-[#16835B]",
      slug: "vaults",
      desc: "Manage your funds. Learn about using bank cards or crypto wallets to move money in and out of your account."
    },
    { 
      title: "Identity Verification", 
      color: "border-[#C9A227]",
      slug: "kyc",
      desc: "Getting your account verified. Learn about the documents needed and how long the review process takes."
    },
    { 
      title: "Account Security", 
      color: "border-[#C43D3D]",
      slug: "security",
      desc: "Keep your account safe. Set up two-factor login, check your active sessions, and protect your data."
    },
    { 
      title: "Market List", 
      color: "border-[#0A0A0A]",
      slug: "markets",
      desc: "Explore what you can trade. Information on our market indices, currency pairs, and how pricing works."
    },
    { 
      title: "Invite Friends", 
      color: "border-[#0055FF]",
      slug: "referral",
      desc: "Our referral program. How to share your link and earn rewards for bringing new traders to the platform."
    }
  ];

  const TRADER_FAQS = [
    {
      q: "How are my trades settled?",
      a: "All trades finish automatically at the end of the time you selected. If your market prediction was correct, your profit is added to your balance instantly."
    },
    {
      q: "How much profit can I make?",
      a: "We usually offer an 85% return on successful trades. For example, if you trade $100, you will get $185 back if you win."
    },
    {
      q: "Can I stop a trade once it starts?",
      a: "Most trades cannot be stopped once they are placed. However, we have an 'Early Close' feature that lets you get some of your money back before the time is up."
    },
    {
      q: "Why is my deposit taking so long?",
      a: "Card payments are usually instant. If you are using crypto, we have to wait for the blockchain to confirm the transaction, which can take a few minutes."
    },
    {
      q: "What ID do I need to provide?",
      a: "You will need to upload a clear photo of your Passport, National ID, or Driver's License, along with a quick selfie."
    }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16 px-4 md:py-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#E4E4E4] pb-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em] block mb-2">
              {user ? "User Help" : "Public Help Center"}
            </span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] leading-tight">
              How can we help you?
            </h1>
            <p className="text-xs text-[#6B7280] mt-3 leading-relaxed">
              Find answers about trading, adding money, and keeping your account secure. Use the sections below to find the guides you need.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search help guides..."
              className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-[#E4E4E4] text-[#0A0A0A] shadow-sm focus:outline-none focus:border-[#0055FF] rounded-none"
            />
          </div>
        </div>

        {/* Dynamic Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKSPACE_GUIDES.map((guide, idx) => (
            <Link key={idx} href={`/help/${guide.slug}`}>
              <Card className={cn("bg-white border-[#E4E4E4] p-6 shadow-sm hover:border-[#0055FF] transition-all group cursor-pointer h-full border-t-4", guide.color)}>
                <h4 className="text-xs font-bold uppercase text-[#0A0A0A] tracking-wider mb-3">{guide.title}</h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  {guide.desc}
                </p>
                <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-widest text-[#0055FF]">
                  <span>Read the guide</span>
                  <ArrowRight className="ml-1.5 w-3 h-3" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white border border-[#E4E4E4] shadow-sm">
          <div className="p-6 border-b border-[#E4E4E4] bg-[#F7F7F5]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
              Frequently Asked Questions
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

        {/* Specialized Authority Section */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Still need help?</h3>
            <p className="text-xs text-[#6B7280] max-w-md">
              If you have a problem with a specific trade or withdrawal, please send a message to our support team.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/contact" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-[#0A0A0A] hover:text-white">
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
