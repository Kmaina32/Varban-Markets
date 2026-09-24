import Link from "next/link";
import { Lock, Shield, Eye, Database, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: true },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC Policy", href: "/terms/aml-kyc", active: false },
    { label: "Order Execution", href: "/terms/order-execution", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <Lock className="w-4 h-4" />
            <span>Legal Suite &mdash; 2 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Privacy & Data Protection Policy
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This Privacy Policy details how Varban Markets collects, encrypts, processes, and protects your personal data in full compliance with GDPR, NDPR, and global data privacy standards. Last updated: 2026.
          </p>
        </div>

        {/* Legal Suite Sub-Navigation */}
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

        {/* Content Body */}
        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-10 shadow-sm text-xs leading-relaxed text-[#333333]">
          
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">1</span>
              Information We Collect
            </h2>
            <p>
              When registering or maintaining an account on Varban Markets, we gather essential information required to deliver trading services, fulfill regulatory compliance, and prevent financial fraud:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                <span className="font-bold text-[#0A0A0A] block uppercase text-[10px] mb-1">Personal Identification</span>
                <p className="text-[#6B7280]">Full legal name, email address, phone number, residential address, country of tax residence, and government ID document copies.</p>
              </div>
              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                <span className="font-bold text-[#0A0A0A] block uppercase text-[10px] mb-1">Telemetry & Financial Data</span>
                <p className="text-[#6B7280]">IP address, browser user-agent, session activity timestamps, wallet addresses, deposit history, and trade execution logs.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">2</span>
              How We Use Your Data
            </h2>
            <p>Your personal data is strictly processed for the following lawful reasons:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7280]">
              <li>Executing trading contracts and updating user balance ledgers.</li>
              <li>Performing Anti-Money Laundering (AML) and Identity Verification (KYC) checks.</li>
              <li>Sending account security alerts, 2FA notifications, and transaction receipts.</li>
              <li>Mitigating platform fraud, unauthorized intrusions, and system abuse.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">3</span>
              Encryption & Storage Infrastructure
            </h2>
            <p>
              All sensitive customer identification documents are encrypted at rest using AES-256 bit encryption algorithms and stored in secure Firebase Cloud Storage environments. Transmission is protected via TLS 1.3 encryption protocols.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">4</span>
              Your GDPR & Data Rights
            </h2>
            <p>Under GDPR and international data protection laws, you possess the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7280]">
              <li>Request a full export copy of all personal data held on your profile.</li>
              <li>Rectify incorrect or outdated personal contact information.</li>
              <li>Request account closure and data anonymization (subject to statutory financial audit retention periods of 5 years).</li>
            </ul>
          </section>

        </div>

        {/* Footer Navigation Switcher */}
        <div className="mt-8 flex justify-between items-center text-xs">
          <Link href="/terms" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: General Terms</span>
          </Link>
          <span className="text-[#6B7280]">Legal Page 2 of 5</span>
          <Link href="/terms/risk-disclosure" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
            <span>Next: Risk Disclosure Statement</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
