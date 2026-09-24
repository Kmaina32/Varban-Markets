import Link from "next/link";

export default function PrivacyPolicyPage() {
  const navTabs = [
    { label: "Terms of Service", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: true },
    { label: "Risk Warning", href: "/terms/risk-disclosure", active: false },
    { label: "Identity Rules", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: false },
    { label: "Complaints", href: "/terms/complaints", active: false },
    { label: "Market Data", href: "/terms/market-data", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            Legal Suite &mdash; Page 2 of 8
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This policy explains how we collect and protect your personal data. We follow global data privacy standards to ensure your information stays safe.
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

        <div className="bg-white border border-[#E4E4E4] p-8 md:p-12 space-y-10 shadow-sm text-xs leading-relaxed text-[#333333]">
          
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              1. Information We Collect
            </h2>
            <p>
              To provide trading services and follow the law, we collect the following details:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-2">
                <span className="font-bold text-[#0A0A0A] block uppercase text-[10px]">Personal Details</span>
                <p className="text-[#6B7280]">Your name, email, phone number, address, and copies of your ID documents.</p>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-[#0A0A0A] block uppercase text-[10px]">Trading & Device Data</span>
                <p className="text-[#6B7280]">Your IP address, browser type, login times, deposit history, and trade records.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              2. How We Use Your Data
            </h2>
            <p>We use your information for these specific reasons:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7280]">
              <li>To open your trades and update your account balance.</li>
              <li>To verify your identity and prevent fraud.</li>
              <li>To send you security alerts and receipt notifications.</li>
              <li>To protect our system from unauthorized access.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              3. Data Security
            </h2>
            <p>
              We use advanced encryption to store your ID documents and personal data. Your information is protected during transmission using secure internet protocols (TLS 1.3).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              4. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7280]">
              <li>Ask for a copy of all the data we have about you.</li>
              <li>Correct any wrong information on your profile.</li>
              <li>Request to close your account and delete your data (though we must keep financial records for 5 years by law).</li>
            </ul>
          </section>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms" className="font-bold text-[#6B7280] hover:text-[#0A0A0A]">
              Back: Terms of Service
            </Link>
            <Link href="/terms/risk-disclosure" className="px-6 py-2 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors">
              Next: Risk Warning
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
