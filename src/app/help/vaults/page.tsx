
"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VaultsDocPage() {
  return (
    <AuthedLayout title="Vault & Capital Documentation" subtitle="Funding and Settlement Infrastructure">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/help" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Help Center
        </Link>

        <section className="space-y-4">
          <div className="border-b-2 border-[#16835B] pb-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">Capital Domains</h2>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Varban Markets utilizes segregated account architecture to protect client capital. We support two primary funding pathways: Fiat Remittance via Paystack and Decentralized Settlement via Blockchain Networks.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0055FF] border-b border-[#E4E4E4] pb-2">Paystack Gateway (Fiat)</h3>
            <div className="space-y-4 text-[11px] text-[#6B7280] leading-relaxed">
              <p>Fiat deposits are processed through the PCI-DSS compliant Paystack protocol. Supported currencies include USD, NGN, GHS, ZAR, and KES.</p>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Clearance:</strong> Instant upon gateway confirmation.</li>
                <li><strong>Verification:</strong> Required for deposits exceeding $2,000 USD cumulative.</li>
                <li><strong>Withdrawals:</strong> Processed back to the original source bank account within 24 business hours.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#C9A227] border-b border-[#E4E4E4] pb-2">Blockchain Networks (Crypto)</h3>
            <div className="space-y-4 text-[11px] text-[#6B7280] leading-relaxed">
              <p>Cryptocurrency settlements occur directly on-chain via our dedicated monitoring nodes. We support Tether (USDT), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL).</p>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>USDT TRC-20:</strong> Recommended for low fees and 1-block confirmation (~2 mins).</li>
                <li><strong>BTC/ETH:</strong> Higher network security; requires 2-12 confirmations depending on congestion.</li>
                <li><strong>Withdrawals:</strong> Automated risk review before dispatching to destination wallet.</li>
              </ul>
            </div>
          </div>
        </div>

        <Card className="p-6 border-l-4 border-l-[#C43D3D] bg-white space-y-3 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C43D3D]">Strict No Third-Party Policy</span>
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            All deposits and withdrawals must originate from and return to accounts registered in the <strong>exact same name</strong> as your Varban Markets profile. Attempts to use third-party bank accounts or wallets will result in automated account freezes and compliance audits.
          </p>
        </Card>

        <section className="bg-[#F7F7F5] border border-[#E4E4E4] p-8">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#16835B] mb-6 border-b border-[#E4E4E4] pb-2">Institutional Security Standards</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-[9px] font-bold uppercase text-[#0A0A0A] block mb-1">Segregation</span>
              <p className="text-[10px] text-[#6B7280]">Client funds are held in Tier-1 bank accounts separate from company capital.</p>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase text-[#0A0A0A] block mb-1">Cold Storage</span>
              <p className="text-[10px] text-[#6B7280]">98% of digital assets are stored in multi-sig offline hardware vaults.</p>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase text-[#0A0A0A] block mb-1">Auditability</span>
              <p className="text-[10px] text-[#6B7280]">Every transaction is logged in our immutable internal ledger for 5 years.</p>
            </div>
          </div>
        </section>
      </div>
    </AuthedLayout>
  );
}
