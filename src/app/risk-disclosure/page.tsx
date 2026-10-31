import Link from "next/link";
import { Metadata } from 'next';

/**
 * @fileOverview Regulatory Risk Notice and Compliance Disclosure.
 * SEO Metadata for high-authority compliance searches.
 * Updated: Seychelles exclusive jurisdiction with expanded clauses.
 */

export const metadata: Metadata = {
  title: "Risk Disclosure | Regulatory Notice",
  description: "Critical risk warning for Varban Markets traders. Read the key risks of leveraged derivative and synthetic market trading with Varban Markets, a company registered in Seychelles.",
  alternates: {
    canonical: '/risk-disclosure',
  },
};

export default function PublicRiskDisclosurePage() {
  const disclosurePoints = [
    { title: "Possibility of Total Loss", text: "Trading derivatives is risky. You can lose all of the money you commit to any single trade. Leveraged contracts amplify both potential returns and potential losses." },
    { title: "Internal Settlement & Counterparty Risk", text: "All trades are settled directly through our internal matching engine. There is no outside clearing house involved. Varban Markets acts as the direct counterparty to every execution." },
    { title: "Leverage and Gearing Risk", text: "Leveraged trading allows you to control large positions with a small initial stake. While this can increase gains, it equally accelerates losses. Small market movements can result in the immediate closure of positions." },
    { title: "Slippage and Market Gaps", text: "During periods of high volatility, price 'gaps' may occur where the price jumps between ticks. This can result in execution prices that are significantly different from your requested price." },
    { title: "Digital Asset Custody Risk", text: "Assets held in digital wallets are subject to cybersecurity risks. While Varban utilizes segregated cold storage, the nature of blockchain technology means transactions are irreversible." },
    { title: "Automated Trading Systems", text: "Traders using bots or automated scripts acknowledge that software errors, latency, or connection failures can lead to unintended execution results for which the platform bears no liability." },
    { title: "Internet Speed & Connectivity", text: "Network speed can change without warning. This can affect the price you get when you open or close a trade. We are not liable for losses resulting from user-side connectivity gaps." },
    { title: "Algorithmic Neutrality", text: "Our synthetic indices are generated via a proprietary deterministic random-walk protocol. Market conditions are simulated without human intervention to ensure unbiased volatility profiles." },
    { title: "Liquidity Gaps & Gapping", text: "During periods of extreme volatility or low liquidity, price gaps may occur. This may result in immediate contract termination at the last verified tick." },
    { title: "Jurisdictional Boundaries", text: "Varban Markets operates exclusively under the financial framework of Seychelles. It is the user's responsibility to ensure compliance with local laws in their region." },
    { title: "Platform Integrity", text: "By using this platform, you confirm that you understand how algorithmic trading works and accept the inherent risks of digital market participation." }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-[#E4E4E4] p-8 md:p-12 shadow-sm">
        
        <div className="border-b border-[#E4E4E4] pb-6 mb-8">
          <div className="text-[10px] font-bold text-[#C43D3D] uppercase tracking-widest mb-2">
            Regulatory Notice
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A]">Risk Warning</h1>
          <p className="text-xs text-[#6B7280] mt-2 font-mono uppercase">
            Effective: January 1, 2026. Seychelles Jurisdiction.
          </p>
        </div>

        <div className="space-y-8 text-xs text-[#6B7280] leading-relaxed">
          <div className="bg-[#F7F7F5] border-l-4 border-[#C43D3D] p-8">
            <span className="font-bold text-[#C43D3D] uppercase block mb-3 text-[10px] tracking-[0.2em]">Mandatory Warning</span>
            <p className="font-bold uppercase leading-relaxed text-[11px] text-[#0A0A0A]">
              IMPORTANT: DO NOT TRADE WITH MONEY YOU CANNOT AFFORD TO LOSE. DERIVATIVE TRADING CARRIES A HIGH CHANCE OF LOSING ALL YOUR CAPITAL.
            </p>
          </div>

          <div className="space-y-6">
            {disclosurePoints.map((point, index) => (
              <div key={index} className="space-y-2 border-l-2 border-[#0055FF] pl-4">
                <h3 className="font-bold text-[#0A0A0A] uppercase tracking-wide text-[11px]">{point.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[#E4E4E4] space-y-4">
            <p className="text-[10px] uppercase font-bold text-[#0A0A0A]">
              Electronic Acceptance Notice
            </p>
            <p className="text-[11px] leading-relaxed">
              By opening an account on varbanmarkets.com, you confirm that you have read and agreed to this Risk Warning. This notice is provided according to the laws of Seychelles for electronic financial transactions.
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between gap-4">
            <Link href="/register" className="flex-1 px-8 py-3 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors border border-[#0055FF] text-center">
              Confirm & Continue
            </Link>
            <Link href="/" className="flex-1 px-8 py-3 border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-colors text-center">
              Exit Website
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
