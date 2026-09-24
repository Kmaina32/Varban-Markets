import Link from "next/link";

export default function ComplaintsPage() {
  const navTabs = [
    { label: "Terms of Service", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Warning", href: "/terms/risk-disclosure", active: false },
    { label: "Identity Rules", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: false },
    { label: "Complaints", href: "/terms/complaints", active: true },
    { label: "Market Data", href: "/terms/market-data", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            Legal Suite &mdash; Page 7 of 8
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Complaints Procedure
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            We value your feedback and transparency. This page explains how to report a problem with your account or a trade.
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

        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-12 shadow-sm text-xs leading-relaxed text-[#333333]">
          
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              1. How to Send a Complaint
            </h2>
            <p>
              If you think there was a system error or a pricing mistake, you must email us at <strong className="text-[#0055FF]">complaints@varbanmarkets.com</strong>.
            </p>
            <div className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
              <span className="text-[10px] font-bold uppercase block text-[#0A0A0A]">What to include:</span>
              <ul className="list-disc pl-4 space-y-1 text-[#6B7280]">
                <li>Your full name and account ID.</li>
                <li>The order or transaction ID (e.g., VRB-123456).</li>
                <li>The time and date of the issue.</li>
                <li>A clear description of what happened.</li>
                <li>How you would like us to fix the problem.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              2. Our Response Time
            </h2>
            <p>
              We aim to confirm we received your email within 24 hours. Our compliance team will review your case and provide a final answer within 14 business days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              3. Final Decision
            </h2>
            <p>
              If you are not happy with our first answer, you can ask for your case to be reviewed by a senior manager. Their decision is final within our platform, according to Saint Lucia law.
            </p>
          </section>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/fees" className="font-bold text-[#6B7280] hover:text-[#0A0A0A]">
              Back: Fees & Charges
            </Link>
            <Link href="/terms/market-data" className="px-6 py-2 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors">
              Next: Market Data
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
