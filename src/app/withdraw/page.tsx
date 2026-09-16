
"use client";

import { useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, AlertTriangle, Check, Banknote } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from "@/app/lib/i18n-context";

const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];

export default function WithdrawPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [amount, setAmount] = useState("250");
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency || "USD");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    const amountNum = parseFloat(amount);
    if (amountNum > (profile?.balance || 0)) {
      alert("Insufficient capital domains for this remittance.");
      return;
    }

    setIsProcessing(true);
    const refKey = `WTH-${Math.random().toString(36).substring(7).toUpperCase()}`;

    addDoc(collection(db, `users/${user.uid}/transactions`), {
      type: "Remittance Withdrawal",
      asset: selectedCurrency,
      amount: amountNum,
      status: "Pending",
      timestamp: serverTimestamp(),
      ref: refKey,
      currency: selectedCurrency,
      bankDetails: {
        bankName,
        accountNumber
      },
      provider: "Paystack Transfers"
    }).then(() => {
      updateDoc(doc(db, "users", user.uid), {
        balance: increment(-amountNum),
        equity: increment(-amountNum)
      }).catch(() => {});
      
      setToken(refKey);
      setIsProcessing(false);
    }).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}/transactions`,
        operation: 'create',
      });
      errorEmitter.emit('permission-error', permissionError);
      setIsProcessing(false);
    });
  };

  return (
    <AuthedLayout 
      title="Capital Remittance" 
      subtitle="Withdrawal of realized gains via Paystack Transfers infrastructure"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {token && (
          <div className="bg-[#0A0A0A] border-2 border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]">
            <Check className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold uppercase block mb-1">Withdrawal Instruction Logged</span>
              <p className="font-mono text-[11px] text-[#6B7280]">Request ID: {token}. Remittance cycle initiated via Paystack. Funds will be released upon core vault verification.</p>
            </div>
          </div>
        )}

        <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Remittance Amount</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A]"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Currency</label>
                <select 
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold appearance-none focus:outline-none focus:border-[#0A0A0A]"
                >
                  {PAYSTACK_CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest px-1">
              <span className="text-[#6B7280]">Available for withdrawal:</span>
              <span className="text-[#16835B]">{formatNumber(profile?.balance || 0, { minimumFractionDigits: 2 })} {profile?.currency || "USD"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Bank Name</label>
                <input 
                  type="text"
                  placeholder="e.g. GTBank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full border border-[#E4E4E4] p-3 text-xs uppercase tracking-widest bg-white focus:outline-none focus:border-[#0A0A0A]"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Account Number</label>
                <input 
                  type="text"
                  placeholder="10 Digits"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full border border-[#E4E4E4] p-3 text-xs font-mono bg-white focus:outline-none focus:border-[#0A0A0A]"
                  required
                  maxLength={10}
                />
              </div>
            </div>

            <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 flex items-start space-x-3">
              <Banknote className="w-5 h-5 text-[#0055FF] shrink-0" />
              <div className="text-[10px] text-[#6B7280] leading-relaxed">
                <span className="font-bold text-[#0A0A0A] block uppercase mb-1">Paystack Payout Protocol</span>
                Remittances are processed to verified personal banking coordinates using the Paystack Transfers API for supported currencies.
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full btn-institutional-primary flex items-center justify-center space-x-2"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>{isProcessing ? "Authenticating Instruction..." : `Confirm Paystack Withdrawal (${selectedCurrency})`}</span>
            </button>
          </form>
        </Card>
      </div>
    </AuthedLayout>
  );
}
