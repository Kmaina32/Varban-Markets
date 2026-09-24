import Link from "next/link";

export default function TermsPage() {
  const navTabs = [
    { label: "Terms of Service", href: "/terms", active: true },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
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
            Legal Suite &mdash; Page 1 of 8
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Terms of Service
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl font-mono uppercase">
            Operated by Varban Markets Ltd. Registered and governed by the laws of Saint Lucia.
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
          
          <section className="border-l-4 border-[#C43D3D] pl-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C43D3D]">
              1. Important Risk Warning
            </h2>
            <p className="font-bold text-[#0A0A0A] uppercase leading-relaxed">
              Trading financial markets involves significant risk. You may lose some or all of the money you commit to trading. Varban Markets does not guarantee profits or uninterrupted access to market data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              2. Our Services
            </h2>
            <p>
              Varban Markets provides an electronic trading platform for institutional and retail users. "Platform" refers to our website, trading terminal, and all related money transfer tools. These services are governed by the laws of Saint Lucia.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              3. Who Can Trade
            </h2>
            <p>
              You must be at least 18 years old to open an account. We do not provide services to residents of certain countries, including the United States, North Korea, and other high-risk regions as defined by international regulators.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              4. Electronic Agreements
            </h2>
            <p>
              By creating an account, you agree to these terms electronically. According to Saint Lucia law, this electronic agreement is as legally binding as a physical contract.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              5. Account Security
            </h2>
            <p>
              You are responsible for keeping your login details safe. Any trade placed through your account is considered authorized by you. We require two-factor authentication (2FA) for withdrawals over $1,000.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
              6. Responsibility for Losses
            </h2>
            <p>
              Varban Markets is not responsible for any money lost due to your trading decisions, internet failures, or market price changes. Our liability is limited to the maximum extent allowed by law.
            </p>
          </section>

          <div className="pt-10 border-t border-[#E4E4E4] flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#0A0A0A] block">Governing Law</span>
              <span className="text-[9px] text-[#6B7280] uppercase tracking-widest">Saint Lucia Jurisdiction</span>
            </div>
            <Link href="/terms/privacy" className="px-8 py-3 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors border border-[#0055FF]">
              Next: Privacy Policy
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
