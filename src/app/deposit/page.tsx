
"use client";

/**
 * @fileOverview Vault Deposit Gateway for Varban Markets.
 * Uses dynamic importing to avoid server-side 'window' errors from the Paystack library.
 */

import dynamic from "next/dynamic";
import AuthedLayout from "@/components/layout/AuthedLayout";

// Defer Paystack library loading to client-side only to prevent 'window is not defined' errors
const PaystackDepositForm = dynamic(() => import("@/components/PaystackDepositForm"), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto p-12 text-center">
      <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">Initializing Vault Conduit...</p>
    </div>
  )
});

export default function DepositPage() {
  return (
    <AuthedLayout 
      title="Vault Deposit" 
      subtitle="Funding account capital domains through Paystack secure matching conduits"
    >
      <PaystackDepositForm />
    </AuthedLayout>
  );
}
