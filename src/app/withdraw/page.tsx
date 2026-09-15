"use client";

import { useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, AlertTriangle, Check } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from "@/app/lib/i18n-context";

export default function WithdrawPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [amount, setAmount] = useState("250");
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
      asset: "USD",
      amount: amountNum,
      status: "Pending",
      timestamp: serverTimestamp(),
      ref: refKey
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
      subtitle="Withdrawal of realized gains and capital allocations"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {token && (
          <div className="bg-[#0A0A0A] border-2 border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]">
            <Check className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold uppercase block mb-1">Withdrawal Instruction Logged</span>
              <p className="font-mono text-[11px] text-[#6B7280]">Request ID: {token}. Remittance cycle initiated. Funds will be released upon core vault verification.</p>
            </div>
          </div>
        )}

        <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Remittance Amount (USD)</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A]"
                required
              />
              <div className="flex justify-between mt-2 text-[9px] font-bold uppercase tracking-widest">
                <span className="text-[#6B7280]">Available for withdrawal:</span>
                <span className="text-[#16835B]">${formatNumber(profile?.balance || 0, { minimumFractionDigits: 2 })} USD</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Destination Vector</label>
              <select className="w-full border border-[#E4E4E4] p-3 text-xs font-bold uppercase tracking-widest bg-white">
                <option>Verified Personal Banking Coordinate</option>
                <option>External Digital Asset Wallet</option>
              </select>
            </div>

            <div className="bg-[#C43D3D]/5 border border-[#C43D3D]/20 p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-[#C43D3D] shrink-0" />
              <div className="text-[10px] text-[#6B7280] leading-relaxed">
                <span className="font-bold text-[#C43D3D] block mb-1 uppercase">Regulatory Notice</span>
                Withdrawal parameters are restricted to verified KYC profiles only. Unverified balance domains may encounter processing holds.
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full btn-institutional-primary"
            >
              {isProcessing ? "Authenticating Instruction..." : "Initiate Remittance Request"}
            </button>
          </form>
        </Card>
      </div>
    </AuthedLayout>
  );
}
