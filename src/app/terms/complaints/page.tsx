import Link from "next/link";
import { MessageSquare, ArrowLeft, ArrowRight, Mail, ShieldCheck, HelpCircle } from "lucide-react";

export default function ComplaintsPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: false },
    { label: "AML & KYC", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: false },
    { label: "Complaints", href: "/terms/complaints", active: true },
    { label: "Market Data", href: "/terms/market-data", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Legal Suite &mdash; 7 of 8</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Complaints Handling Procedure
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Varban Markets is committed to transparency. This procedure outlines how to file a formal complaint regarding account activity, execution, or capital movements.
          </p>
        </div>

        <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-[#E4E4E4] pb-4 mb-10 sticky top-0 bg-[#F7F7F5] z-10">
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

        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-12 shadow-sm text-[11px] leading-relaxed text-[#333333]">
          
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              1. Formal Complaint Submission
            </h2>
            <p>
              If you believe a transaction error, pricing anomaly, or administrative oversight has occurred, you must submit a formal complaint to the Complaints Department via email: <strong className="text-[#0055FF]">complaints@varbanmarkets.com</strong>.
            </p>
            <div className="p-6 bg-[#F7F7F5] border border-[#E4E4E4] space-y-2">
              <span className="text-[10px] font-bold uppercase block text-[#0A0A0A]">Required Information:</span>
              <ul className="list-disc pl-4 space-y-1 text-[#6B7280]">
                <li>Full Account Legal Name & ID</li>
                <li>Transaction Reference Token (e.g. VRB-123456)</li>
                <li>Timestamp of relevant event (Server UTC)</li>
                <li>Detailed description of the discrepancy</li>
                <li>Requested outcome or resolution</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              2. Resolution Timeline
            </h2>
            <p>
              Varban Markets aims to acknowledge receipt of all complaints within 24 business hours. A comprehensive review by the Compliance and Risk desk will be conducted, with a final determination provided within 14 business days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              3. Internal Dispute Escalation
            </h2>
            <p>
              If the initial resolution is unsatisfactory, the Client may request an escalation to the Root Administrative Authority. The Authority's decision is final within the platform's internal operational context, subject to mandatory statutory rights under Saint Lucia law.
            </p>
          </section>

          <div className="bg-[#0055FF]/5 border border-[#0055FF]/20 p-6 flex items-start gap-4">
            <ShieldCheck className="w-5 h-5 text-[#0055FF] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#6B7280]">
              Varban Markets maintains detailed audit logs of all matching engine executions and price feeds for a period of 5 years to ensure objective resolution of all platform disputes.
            </p>
          </div>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/fees" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev: Fees & Charges</span>
            </Link>
            <Link href="/terms/market-data" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
              <span>Next: Market Data Terms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
