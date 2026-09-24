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
      title: "Trading Terminal", 
      color: "border-[#0055FF]",
      slug: "terminal",
      desc: "Master the execution engine. Learn about CALL/PUT vectors, stake commitment, and the risk pre-verification handshake."
    },
    { 
      title: "Capital & Vaults", 
      color: "border-[#16835B]",
      slug: "vaults",
      desc: "Manage your monetary domains. Understand the differences between Paystack Fiat processing and Blockchain Network nodes."
    },
    { 
      title: "Identity (KYC)", 
      color: "border-[#C9A227]",
      slug: "kyc",
      desc: "Verification protocols. Learn about the 24-48 hour document audit window and how to unlock institutional withdrawal limits."
    },
    { 
      title: "Security & Access", 
      color: "border-[#C43D3D]",
      slug: "security",
      desc: "Protect your workspace. Configure mandatory 2FA, monitor active IP sessions, and manage your account encryption keys."
    },
    { 
      title: "Global Markets", 
      color: "border-[#0A0A0A]",
      slug: "markets",
      desc: "Explore the registry. Insights into synthetic indices, high-volatility pairs, and deterministic pricing feeds."
    },
    { 
      title: "Referral Network", 
      color: "border-[#0055FF]",
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
      a: "Fiat deposits via Paystack are usually instant. Cryptocurrency deposits require a specific number of block confirmations before our nodes credit your balance."
    },
    {
      q: "What documents are needed for KYC Tier 2?",
      a: "You must provide a high-resolution scan of a Government ID (Passport, National ID, or Driver's License) and a real-time selfie for biometric matching."
    }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16 px-4 md:py-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#E4E4E4] pb-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em] block mb-2">
              {user ? "Workspace Documentation" : "Public Support"}
            </span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] leading-tight">
              How can we assist you today?
            </h1>
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
                  <span>View Documentation</span>
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

        {/* Specialized Authority Section */}
        <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Requires Specialized Authority?</h3>
            <p className="text-xs text-[#6B7280] max-w-md">
              If your inquiry involves a specific transaction reference or security lock, please transmit a priority support ticket.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/contact" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-[#0A0A0A] hover:text-white">
              <span>Contact Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
