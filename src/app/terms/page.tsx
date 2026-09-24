import Link from "next/link";
import { Shield, FileText, Lock, AlertTriangle, Scale, CheckCircle, ArrowRight } from "lucide-react";

export default function TermsPage() {
  const navTabs = [
    { label: "General Terms", href: "/terms", active: true },
    { label: "Privacy Policy", href: "/terms/privacy", active: false },
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
            <Scale className="w-4 h-4" />
            <span>Legal Suite &mdash; 1 of 5</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A]">
            General Terms of Service
          </h1>
          <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl">
            This Master Client Agreement governs your access to and use of Varban Markets financial trading platform, synthetic contract engine, mobile interfaces, and API services. Effective Date: January 1, 2026.
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
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">1</span>
              Acceptance & Eligibility
            </h2>
            <p>
              By opening an account, accessing, or transmitting binary option contracts on Varban Markets ("the Platform"), you ("the Client") acknowledge having read, understood, and agreed to be legally bound by these Terms.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7280]">
              <li>You must be at least 18 years of age or the legal age of majority in your jurisdiction.</li>
              <li>You must not reside in a prohibited jurisdiction (including United States, North Korea, Iran, or sanctions-listed countries).</li>
              <li>You agree that all funds deposited originate from legitimate sources and belong solely to you.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">2</span>
              Account Operations & Security
            </h2>
            <p>
              Clients are responsible for maintaining the confidentiality of credentials, API keys, and 2FA tokens. Any order transmitted using valid Client credentials shall be deemed authorized and non-reversible.
            </p>
            <div className="p-4 bg-[#F7F7F5] border-l-4 border-[#0055FF] space-y-1">
              <span className="font-bold text-[#0A0A0A] block uppercase text-[10px]">Security Requirement</span>
              <p className="text-[#6B7280]">
                Varban Markets enforces mandatory Two-Factor Authentication (2FA) for withdrawal requests exceeding $1,000 USD equivalent.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">3</span>
              Option Contract Mechanics & Settlement
            </h2>
            <p>
              Varban Markets provides fixed-outcome derivative contracts (CALL/PUT vectors). Outcome calculations use real-time market data feeds. 
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                <span className="font-bold text-[#16835B] block uppercase text-[10px] mb-1">Winning Contract Outcome</span>
                <p className="text-[#6B7280]">
                  If the settlement price satisfies the contract condition at expiry, the Client receives the full stake plus the designated payout percentage (typically 85%).
                </p>
              </div>
              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                <span className="font-bold text-[#C43D3D] block uppercase text-[10px] mb-1">Expired / Loss Outcome</span>
                <p className="text-[#6B7280]">
                  If the contract condition is unfulfilled at expiration, the Client forfeits the initial committed stake. Maximum deficit risk is capped at 100% of committed stake.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">4</span>
              Deposits, Withdrawals & Fees
            </h2>
            <p>
              Deposits may be made via Cryptocurrencies (BTC, ETH, USDT-TRC20, SOL) or fiat bank transfers. Withdrawals are processed back to the original funding source where possible.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#6B7280]">
              <li>Minimum deposit threshold: $10.00 USD.</li>
              <li>Minimum withdrawal threshold: $20.00 USD.</li>
              <li>Varban Markets charges 0% commission on standard option execution. Blockchain network fees apply to crypto transactions.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-[10px]">5</span>
              Limitation of Liability & Indemnity
            </h2>
            <p>
              Varban Markets shall not be held liable for losses resulting from market latency, Internet network disruptions, force majeure events, or unauthorized account compromise due to client negligence.
            </p>
          </section>

        </div>

        {/* Footer Navigation Switcher */}
        <div className="mt-8 flex justify-between items-center text-xs">
          <span className="text-[#6B7280]">Legal Page 1 of 5</span>
          <Link href="/terms/privacy" className="font-bold text-[#0055FF] hover:underline flex items-center gap-1">
            <span>Next: Privacy & Data Protection Policy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
