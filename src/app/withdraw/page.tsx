'use client';

/**
 * @fileOverview Capital Remittance gateway for Varban Markets.
 * Supports both Cryptocurrency Payouts and Fiat Paystack Transfers infrastructure.
 */

import { useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import CryptoWithdrawForm from "@/components/CryptoWithdrawForm";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, Check, Banknote, Bitcoin, Building2, CheckCircle2 } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];

export default function WithdrawPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [activeTab, setActiveTab] = useState<'CRYPTO' | 'FIAT'>('CRYPTO');
  const [amount, setAmount] = useState("500");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    const amountNum = parseFloat(amount);
    if (amountNum > (profile?.balance || 0)) {
      alert("Deficit Account Status: Requested amount exceeds available balance domains.");
      return;
    }

    setIsProcessing(true);
    const refKey = `WTH-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // 1. Deduct Balance Domain
    updateDoc(doc(db, "users", user.uid), {
      balance: increment(-amountNum),
      equity: increment(-amountNum)
    }).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}`,
        operation: 'update',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    // 2. Log Transaction Record
    addDoc(collection(db, `users/${user.uid}/transactions`), {
      type: "Remittance Withdrawal",
      asset: selectedCurrency,
      amount: amountNum,
      status: "Pending Verification",
      timestamp: serverTimestamp(),
      ref: refKey,
      currency: selectedCurrency,
      bankDetails: {
        bankName,
        accountNumber
      },
      provider: "Paystack Transfers Network"
    }).catch(() => {});

    // 3. Create Systematic Notification Log
    addDoc(collection(db, `users/${user.uid}/notifications`), {
      title: "Remittance Initiated",
      body: `Withdrawal request of ${amountNum} ${selectedCurrency} has been scheduled for bank destination ${accountNumber} (${bankName}).`,
      type: "Funds",
      isUnread: true,
      timestamp: serverTimestamp()
    }).catch(() => {});

    setToken(refKey);
    setIsProcessing(false);
  };

  return (
    <AuthedLayout 
      title="Capital Remittance" 
      subtitle="Withdrawal of realized trading gains via Crypto networks or Paystack Transfers"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Payout Gateway Tabs */}
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
            <span>Crypto Wallet Payout</span>
            <span className="text-[8px] bg-[#16835B] text-white px-1.5 py-0.5 rounded font-mono">Fastest</span>
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
            <Building2 className="w-4 h-4 text-[#0055FF]" />
            <span>Bank Remittance (Paystack)</span>
          </button>
        </div>

        {activeTab === 'CRYPTO' ? (
          <CryptoWithdrawForm />
        ) : (
          <div className="space-y-6">
            {token && (
              <div className="bg-[#0A0A0A] border border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold uppercase block mb-1">Remittance Instruction Logged</span>
                  <p className="font-mono text-[11px] text-[#6B7280]">Request Token ID: {token}. Internal clearing network is verifying banking routing credentials.</p>
                </div>
              </div>
            )}

            <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm rounded-none">
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Remittance Amount</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Currency Realm</label>
                    <select 
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-sm font-mono font-bold focus:outline-none focus:border-[#0A0A0A] cursor-pointer"
                    >
                      {PAYSTACK_CURRENCIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-[#6B7280]">Liquid Account Domain Equity:</span>
                  <span className="text-[#16835B]">
                    ${formatNumber(profile?.balance || 0, { minimumFractionDigits: 2 })} {profile?.currency || "USD"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Recipient Bank Institution</label>
                    <input 
                      type="text"
                      placeholder="e.g. Zenith Bank / Access Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full border border-[#E4E4E4] p-3 text-xs uppercase tracking-widest bg-white focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Institutional Account Number</label>
                    <input 
                      type="text"
                      placeholder="10 Digits Vector"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full border border-[#E4E4E4] p-3 text-xs font-mono bg-white focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A]"
                      required
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 flex items-start space-x-3">
                  <Banknote className="w-5 h-5 text-[#0055FF] shrink-0" />
                  <div className="text-[10px] text-[#6B7280] leading-relaxed">
                    <span className="font-bold text-[#0A0A0A] block uppercase mb-1">Paystack Transfer Specifications</span>
                    Gains settlement is executed via standard over-the-counter automated clearing routines using verified personal destination maps.
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full btn-institutional-primary flex items-center justify-center space-x-2"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>{isProcessing ? "Authorizing Accounting Matrix..." : `Execute Paystack Withdrawal Request`}</span>
                </button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AuthedLayout>
  );
}
