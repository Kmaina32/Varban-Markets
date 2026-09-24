import Link from "next/link";

export default function RiskDisclosurePage() {
  const navTabs = [
    { label: "Terms of Service", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Warning", href: "/terms/risk-disclosure", active: true },
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
          <div className="text-[10px] font-bold text-[#C43D3D] uppercase tracking-widest mb-2">
            Legal Suite &mdash; Page 3 of 8
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Risk Warning
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            PLEASE READ CAREFULLY: Trading derivatives and synthetic contracts is high-risk. You can lose all of your money very quickly.
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
          
          <section className="border-l-4 border-[#0A0A0A] pl-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C43D3D]">
              Possibility of Total Loss
            </h2>
            <p className="text-xs leading-relaxed uppercase font-bold text-[#0A0A0A]">
              By using Varban Markets, you acknowledge that you could lose 100% of the money you put into any single trade. We do not guarantee that you will make a profit.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Market Swings</h3>
              <p className="text-[#6B7280]">Prices can change instantly and move against you without warning. High volatility can cause your entire trade amount to be lost in seconds.</p>
            </section>
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Technical Delays</h3>
              <p className="text-[#6B7280]">The price you see when you click "Trade" might be slightly different from the execution price due to internet speed or market gaps.</p>
            </section>
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">System Reliability</h3>
              <p className="text-[#6B7280]">Trading depends on servers and networks. Outages or software errors may affect your ability to trade or access your account.</p>
            </section>
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Our Role</h3>
              <p className="text-[#6B7280]">Trades are processed directly through our internal system. Your success depends on our system's operational integrity.</p>
            </section>
          </div>

          <section className="pt-6 border-t border-[#E4E4E4] text-[#0A0A0A]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">No Financial Advice</h3>
            <p className="text-[#6B7280] leading-relaxed">
              We do not give personal investment or legal advice. All charts and indicators on the platform are for information only. You are responsible for every trade you place.
            </p>
          </section>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/privacy" className="font-bold text-[#6B7280] hover:text-[#0A0A0A]">
              Back: Privacy Policy
            </Link>
            <Link href="/terms/aml-kyc" className="px-6 py-2 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors">
              Next: Identity Rules
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
