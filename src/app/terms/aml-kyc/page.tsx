
import Link from "next/link";

export default function AmlKycPolicyPage() {
  const navTabs = [
    { label: "Terms of Service", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Warning", href: "/terms/risk-disclosure", active: false },
    { label: "Identity Rules", href: "/terms/aml-kyc", active: true },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: false },
    { label: "Complaints", href: "/terms/complaints", active: false },
    { label: "Market Data", href: "/terms/market-data", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="text-[10px] font-bold text-[#16835B] uppercase tracking-widest mb-2">
            Legal Suite &mdash; Page 4 of 8
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Identity & Security Rules
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            To keep our platform safe and follow international rules, we verify the identity of every trader and monitor for suspicious activity.
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
          
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              1. Account Verification Levels
            </h2>
            <p>Verification is divided into three levels based on how much you trade:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="border-t-2 border-[#E4E4E4] pt-4">
                <span className="font-bold text-[#0A0A0A] block uppercase text-[10px] mb-1">Level 1: Basic</span>
                <p className="text-[#6B7280]">Email and phone verification only. Total deposits limited to $2,000.</p>
              </div>
              <div className="border-t-2 border-[#0055FF] pt-4">
                <span className="font-bold text-[#0055FF] block uppercase text-[10px] mb-1">Level 2: Verified</span>
                <p className="text-[#6B7280]">ID scan and selfie required. Unlocks standard withdrawals and higher limits.</p>
              </div>
              <div className="border-t-2 border-[#16835B] pt-4">
                <span className="font-bold text-[#16835B] block uppercase text-[10px] mb-1">Level 3: Full</span>
                <p className="text-[#6B7280]">Proof of address and source of wealth required. No trading volume limits.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              2. Security Checks
            </h2>
            <p>
              We automatically check all accounts against global security lists. If an account is flagged for suspicious activity or belongs to a restricted region, we may request more information or close the account immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              3. Activity Monitoring
            </h2>
            <p>
              Our system looks for suspicious behavior, such as using multiple wallets or rapid fund transfers. If we see unexplained activity, we will freeze the account to protect the platform and report the activity to the authorities if necessary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              4. No Third-Party Payments
            </h2>
            <p>
              You can only deposit or withdraw money using a bank account or wallet in your own name. We do not accept payments from friends or family members.
            </p>
          </section>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/risk-disclosure" className="font-bold text-[#6B7280] hover:text-[#0A0A0A]">
              Back: Risk Warning
            </Link>
            <Link href="/terms/trading-rules" className="px-6 py-2 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors">
              Next: Trading Rules
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
