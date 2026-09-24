"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Share2, Users, Trophy, DollarSign, ArrowLeft, Gift } from "lucide-react";
import Link from "next/link";

export default function ReferralDocPage() {
  return (
    <AuthedLayout title="Referral Documentation" subtitle="Growth & Partner Reward Framework">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/help" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Help Center
        </Link>

        <section className="space-y-4">
          <div className="flex items-center space-x-3 text-[#0055FF]">
            <Share2 className="w-6 h-6" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Institutional Growth</h2>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            The Varban Markets Referral Program is designed for sophisticated traders and institutional partners looking to expand our professional community. By sharing your unique conduit, you contribute to platform growth and unlock tiered performance rewards.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-[#E4E4E4] space-y-3">
            <Users className="w-5 h-5 text-[#0055FF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Network Monitoring</h3>
            <p className="text-[10px] text-[#6B7280] leading-relaxed">
              Track your direct enrollments in real-time. View registration dates and activity status of every member in your domain.
            </p>
          </Card>
          <Card className="p-6 bg-white border-[#E4E4E4] space-y-3">
            <DollarSign className="w-5 h-5 text-[#16835B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Reward Settlement</h3>
            <p className="text-[10px] text-[#6B7280] leading-relaxed">
              Incentives are calculated monthly based on the active trading volume within your network. Payouts credit to your Real balance.
            </p>
          </Card>
          <Card className="p-6 bg-white border-[#E4E4E4] space-y-3">
            <Trophy className="w-5 h-5 text-[#C9A227]" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Partner Tiers</h3>
            <p className="text-[10px] text-[#6B7280] leading-relaxed">
              Advance from Standard to Premium and Institutional tiers as your network scales, unlocking higher commission percentages.
            </p>
          </Card>
        </div>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">The Referral Conduit</h3>
          <div className="space-y-4">
            <div className="p-5 bg-[#F7F7F5] border border-[#E4E4E4] flex gap-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">01</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-[#0A0A0A] mb-1">Generate Your Token</h4>
                <p className="text-[10px] text-[#6B7280]">Every account features a unique 6-character referral code (e.g. VRB-A1B2C3). Access this in the Referral Portal.</p>
              </div>
            </div>
            <div className="p-5 bg-[#F7F7F5] border border-[#E4E4E4] flex gap-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">02</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-[#0A0A0A] mb-1">Share the Invitation Link</h4>
                <p className="text-[10px] text-[#6B7280]">Distribute your unique <strong>varbanmarkets.com</strong> invitation link. New traders who use this link are automatically mapped to your domain.</p>
              </div>
            </div>
            <div className="p-5 bg-[#F7F7F5] border border-[#E4E4E4] flex gap-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">03</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-[#0A0A0A] mb-1">Monitor Enrollment</h4>
                <p className="text-[10px] text-[#6B7280]">As your network members complete identity verification and initiate trading activity, your partner metrics will update instantly.</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="p-8 bg-[#0A0A0A] text-white space-y-4 rounded-none shadow-xl">
          <div className="flex items-center space-x-2 text-[#0055FF]">
            <Gift className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Policy Compliance</h4>
          </div>
          <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
            Referral rewards are subject to strict anti-abuse monitoring. Self-referral, circular networks, or fraudulent registration patterns will result in the immediate forfeiture of rewards and account termination. Partners are encouraged to build high-quality networks of sophisticated active traders.
          </p>
        </Card>
      </div>
    </AuthedLayout>
  );
}
