'use client';

/**
 * @fileOverview Vault Deposit Gateway for Varban Markets.
 * Supports both Fiat (Paystack) and Crypto Currency (Multi-chain Blockchain Nodes) deposit methods.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import AuthedLayout from "@/components/layout/AuthedLayout";
import CryptoDepositForm from "@/components/CryptoDepositForm";
import { CreditCard, Bitcoin, ShieldCheck } from "lucide-react";
import { cn } from "@/app/lib/utils";

const PaystackDepositForm = dynamic(() => import("@/components/PaystackDepositForm"), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto p-12 text-center">
      <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">Initializing Paystack Vault Conduit...</p>
    </div>
  )
});

export default function DepositPage() {
  const [activeTab, setActiveTab] = useState<'CRYPTO' | 'FIAT'>('CRYPTO');

  return (
    <AuthedLayout 
      title="Vault Deposit" 
      subtitle="Fund your trading account using Cryptocurrency or Fiat Paystack gateways"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Deposit Gateway Tabs */}
        <div className="flex border-b border-[#E4E4E4] bg-white p-1">
          <button
            onClick={() => setActiveTab('CRYPTO')}
            className={cn(
              "flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border-b-2",
              activeTab === 'CRYPTO' 
                ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" 
                : "border-transparent text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]"
            )}
          >
            <Bitcoin className="w-4 h-4 text-[#F59E0B]" />
            <span>Cryptocurrency Gateway</span>
            <span className="text-[8px] bg-[#16835B] text-white px-1.5 py-0.5 rounded font-mono">Instant</span>
          </button>

          <button
            onClick={() => setActiveTab('FIAT')}
            className={cn(
              "flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border-b-2",
              activeTab === 'FIAT' 
                ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" 
                : "border-transparent text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]"
            )}
          >
            <CreditCard className="w-4 h-4 text-[#0055FF]" />
            <span>Fiat & Card (Paystack)</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'CRYPTO' ? (
          <CryptoDepositForm />
        ) : (
          <PaystackDepositForm />
        )}
      </div>
    </AuthedLayout>
  );
}
