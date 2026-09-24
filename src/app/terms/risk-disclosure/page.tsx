import Link from "next/link";
import { AlertTriangle, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";

export default function RiskDisclosurePage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: false },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
    { label: "Risk Disclosure", href: "/terms/risk-disclosure", active: true },
    { label: "AML & KYC Policy", href: "/terms/aml-kyc", active: false },
    { label: "Order Execution", href: "/terms/order-execution", active: false },
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-12 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E4E4E4] pb-8 mb-8">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#C43D3D] uppercase tracking-widest mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Legal Suite &mdash; 3 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            Risk Disclosure & Financial Warnings
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            Trading financial derivatives, synthetic instruments, and binary options involves a significant risk of capital loss. Read this warning thoroughly prior to committing capital.
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
          
          <div className="p-4 bg-[#C43D3D]/10 border-l-4 border-[#C43D3D] space-y-1">
            <span className="font-bold text-[#C43D3D] block uppercase text-[10px]">High Risk Investment Notice</span>
            <p className="text-[#0A0A0A]">
              Synthetic option trading carries a high level of risk and may not be suitable for all investors. You should never trade with capital you cannot afford to lose entirely.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C43D3D] text-white flex items-center justify-center text-[10px]">1</span>
              Fixed Outcome Mechanics & Total Loss Exposure
            </h2>
            <p>
              Binary option contracts offer fixed returns upon successful expiration. However, if the market moves against your vector prediction, 100% of the committed stake for that individual option ticket will be lost upon settlement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C43D3D] text-white flex items-center justify-center text-[10px]">2</span>
              Market Volatility & Slippage
            </h2>
            <p>
              Under extreme market volatility (such as macroeconomic news events or liquidity gaps in crypto/forex markets), pricing feeds may fluctuate rapidly. While option entry prices are locked at submission, contract expiry is subject to exact timestamp settlement feeds.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C43D3D] text-white flex items-center justify-center text-[10px]">3</span>
              No Financial Advice Provided
            </h2>
            <p>
              All educational content, technical indicators, commentary, or market analysis displayed on Varban Markets are provided for informational and analytical purposes only and do not constitute financial advice or investment recommendations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C43D3D] text-white flex items-center justify-center text-[10px]">4</span>
              Technology & Network Risks
            </h2>
            <p>
              Clients acknowledge that electronic trading platforms rely on Internet connectivity, hardware availability, and data streams. Varban Markets implements redundancy protocols but cannot be responsible for local ISP latency, device failures, or user connection drops.
            </p>
          </section>

        </div>

        {/* Footer Navigation Switcher */}
        <div className="mt-8 flex justify-between items-center text-xs">
          <Link href="/terms/privacy" className="font-bold text-[#6B7280] hover:text-[#0A0A0A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Prev: Privacy Policy</span>
          </Link>
          <span className="text-[#6B7280]">Legal Page 3 of 5</span>
          <Link href="/terms/aml-kyc" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
            <span>Next: AML & KYC Policy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
