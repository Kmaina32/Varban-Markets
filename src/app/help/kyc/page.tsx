"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KycDocPage() {
  return (
    <AuthedLayout title="Identity & KYC Documentation" subtitle="Regulatory Verification Standards">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/help" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Help Center
        </Link>

        <section className="space-y-4">
          <div className="border-b-2 border-[#C9A227] pb-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">Identity Verification</h2>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            To maintain compliance with international Anti-Money Laundering (AML) regulations, Varban Markets requires all traders to undergo identity verification. This process unlocks advanced account features and ensures the security of our trading ecosystem.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border-[#E4E4E4] space-y-4 border-t-4 border-t-[#6B7280]">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Tier 1: Basic</h3>
              <span className="px-2 py-0.5 bg-[#F7F7F5] border border-[#E4E4E4] text-[8px] font-bold uppercase">Standard</span>
            </div>
            <div className="space-y-2 text-[10px] text-[#6B7280] font-bold uppercase">
              <div className="flex items-center space-x-2">
                <span>&bull; Email Address Validation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>&bull; Phone Number Verification</span>
              </div>
            </div>
            <p className="text-[10px] text-[#6B7280] pt-2 italic">Limits: Up to $2,000 USD cumulative deposits.</p>
          </Card>

          <Card className="p-6 bg-white border-[#E4E4E4] space-y-4 border-t-4 border-t-[#0055FF]">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0055FF]">Tier 2: Verified</h3>
              <span className="px-2 py-0.5 bg-[#0055FF]/10 border border-[#0055FF] text-[8px] font-bold uppercase text-[#0055FF]">Required</span>
            </div>
            <div className="space-y-2 text-[10px] text-[#6B7280] font-bold uppercase">
              <div className="flex items-center space-x-2">
                <span>&bull; Government ID (Passport/National ID)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>&bull; Biometric Selfie Verification</span>
              </div>
            </div>
            <p className="text-[10px] text-[#6B7280] pt-2 italic">Limits: Unlocks standard withdrawals up to $50k/day.</p>
          </Card>
        </div>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Acceptable Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
              <span className="text-[10px] font-bold uppercase block text-[#0A0A0A]">Passport</span>
              <p className="text-[9px] text-[#6B7280]">Must be currently valid. Scan the entire biographical page clearly.</p>
            </div>
            <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
              <span className="text-[10px] font-bold uppercase block text-[#0A0A0A]">National ID</span>
              <p className="text-[9px] text-[#6B7280]">High-resolution photos of both front and back sides are required.</p>
            </div>
            <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
              <span className="text-[10px] font-bold uppercase block text-[#0A0A0A]">Driver's License</span>
              <p className="text-[9px] text-[#6B7280]">Accepted in most jurisdictions if government-issued and includes a photo.</p>
            </div>
          </div>
        </section>

        <Card className="p-6 bg-[#F7F7F5] border border-[#C9A227] space-y-4 shadow-sm border-l-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">The Audit Window</h4>
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            Our compliance team audits submitted documents within <strong>24 to 48 business hours</strong>. During this window, your verification status will show as "Pending". You may still deposit and trade (within Tier 1 limits), but withdrawals will be restricted until the audit is successfully concluded.
          </p>
        </Card>
      </div>
    </AuthedLayout>
  );
}
