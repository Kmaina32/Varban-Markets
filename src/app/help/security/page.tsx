
"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SecurityDocPage() {
  return (
    <AuthedLayout title="Security Documentation" subtitle="Protecting your Trading Workspace">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/help" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Help Center
        </Link>

        <section className="space-y-4">
          <div className="border-b-2 border-[#C43D3D] pb-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">Security Infrastructure</h2>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Varban Markets employs institutional-grade security protocols to protect your capital and personal data. Every account is isolated using state-of-the-art encryption and monitored for unauthorized access.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-[#E4E4E4] space-y-3 border-t-4 border-t-[#16835B]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Two-Factor Auth</h3>
            <p className="text-[10px] text-[#6B7280] leading-relaxed">
              Mandatory for all withdrawals exceeding $1,000 USD. We recommend using Google Authenticator or Authy for maximum protection.
            </p>
          </Card>
          <Card className="p-6 bg-white border-[#E4E4E4] space-y-3 border-t-4 border-t-[#C9A227]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Session Control</h3>
            <p className="text-[10px] text-[#6B7280] leading-relaxed">
              Monitor active IP addresses and devices in real-time. Use "Log Out Everywhere Else" if you suspect unauthorized activity.
            </p>
          </Card>
          <Card className="p-6 bg-white border-[#E4E4E4] space-y-3 border-t-4 border-t-[#0055FF]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Audit Logs</h3>
            <p className="text-[10px] text-[#6B7280] leading-relaxed">
              Every sensitive action (password change, 2FA toggle, vault move) is recorded in an immutable log for your review.
            </p>
          </Card>
        </div>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Account Protection Steps</h3>
          <div className="space-y-4">
            <div className="p-5 bg-[#F7F7F5] border border-[#E4E4E4] flex gap-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">01</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-[#0A0A0A] mb-1">Strong Cryptographic Passwords</h4>
                <p className="text-[10px] text-[#6B7280]">Use at least 12 characters, including special symbols. Avoid repeating passwords from other platforms.</p>
              </div>
            </div>
            <div className="p-5 bg-[#F7F7F5] border border-[#E4E4E4] flex gap-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">02</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-[#0A0A0A] mb-1">Authorized Domains Only</h4>
                <p className="text-[10px] text-[#6B7280]">Always ensure you are logged into <strong>varbanmarkets.com</strong>. We will never ask for your password via email or chat.</p>
              </div>
            </div>
            <div className="p-5 bg-[#F7F7F5] border border-[#E4E4E4] flex gap-4">
              <span className="text-xs font-mono font-bold text-[#0055FF]">03</span>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-[#0A0A0A] mb-1">2FA Enforcement</h4>
                <p className="text-[10px] text-[#6B7280]">Enable 2FA immediately upon account creation to prevent unauthorized withdrawals even if your credentials are compromised.</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="p-8 bg-[#F7F7F5] border border-[#16835B] space-y-4 shadow-sm border-l-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Immutable Ledger Locking</h4>
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            All transactional metadata is protected by cryptographic hashing. Once a settlement is confirmed, the record is locked and cannot be altered by any user or administrator. This ensures a 100% auditable history for your financial records.
          </p>
        </Card>
      </div>
    </AuthedLayout>
  );
}
