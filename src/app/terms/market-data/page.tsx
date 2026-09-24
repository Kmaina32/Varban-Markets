import Link from "next/link";

export default function MarketDataTermsPage() {
  const navTabs = [
    { label: "Terms of Service", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Warning", href: "/terms/risk-disclosure", active: false },
    { label: "Identity Rules", href: "/terms/aml-kyc", active: false },
    { label: "Trading Rules", href: "/terms/trading-rules", active: false },
    { label: "Fees & Charges", href: "/terms/fees", active: false },
    { label: "Complaints", href: "/terms/complaints", active: false },
    { label: "Market Data", href: "/terms/market-data", active: true },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest mb-2">
            Legal Suite &mdash; Page 8 of 8
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Market Data
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This page explains where our pricing comes from and the rules for using that information.
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
              1. Where the Prices Come From
            </h2>
            <p>
              Our market prices come from global providers and exchanges. While we aim for perfect accuracy, we cannot guarantee that the data is always complete or correct at every moment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              2. Prices May Change Instantly
            </h2>
            <p>
              The prices you see on the screen can change in a fraction of a second. Data may be delayed or corrected by the providers at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              3. No Scraping or Copying
            </h2>
            <p>
              The price information is only for your personal use while trading on our platform. You are not allowed to copy, scrape, or share this data with other companies or websites.
            </p>
          </section>

          <div className="p-6 border-l-4 border-[#0055FF] bg-[#F7F7F5]">
            <p className="text-[10px] text-[#6B7280] font-bold uppercase">
              "Market data is provided as-is and as-available."
            </p>
          </div>

          <div className="pt-8 border-t border-[#E4E4E4] flex justify-between items-center text-xs">
            <Link href="/terms/complaints" className="font-bold text-[#6B7280] hover:text-[#0A0A0A]">
              Back: Complaints
            </Link>
            <Link href="/terms" className="font-bold text-[#0055FF] hover:underline">
              Return to General Terms
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
