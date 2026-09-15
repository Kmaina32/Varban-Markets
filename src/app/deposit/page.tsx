"use client";

import { useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ShieldCheck, Check } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function DepositPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [amount, setAmount] = useState("500");
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setIsProcessing(true);
    const amountNum = parseFloat(amount);
    const refKey = `DEP-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Record the transaction conduit
    addDoc(collection(db, `users/${user.uid}/transactions`), {
      type: "Vault Deposit",
      asset: "USD",
      amount: amountNum,
      status: "Confirmed",
      timestamp: serverTimestamp(),
      ref: refKey
    }).then(() => {
      // Optimistically update the balance domains
      updateDoc(doc(db, "users", user.uid), {
        balance: increment(amountNum),
        equity: increment(amountNum)
      }).catch(async (err) => {
         const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'update',
          requestResourceData: { balance: amountNum },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      
      setToken(refKey);
      setIsProcessing(false);
    }).catch(async (err) => {
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
      title="Vault Deposit" 
      subtitle="Funding account capital domains through secure matching conduits"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {token && (
          <div className="bg-[#16835B]/10 border border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]">
            <Check className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold uppercase block mb-1">Transmission Registered</span>
              <p className="font-mono text-[11px] text-[#6B7280]">Record ID: {token}. Internal ledger synchronized successfully.</p>
            </div>
          </div>
        )}

        <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Allocation Stake (USD)</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A]"
                required
              />
              <span className="text-[9px] text-[#6B7280] mt-2 block uppercase font-bold tracking-widest">Min: $10.00 / Max: $500,000.00</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Settlement Channel</label>
              <select className="w-full border border-[#E4E4E4] p-3 text-xs font-bold uppercase tracking-widest bg-white">
                <option>Institutional Bank Wire (SWIFT)</option>
                <option>Euro-Zone SEPA Handshake</option>
                <option>Digital Asset Vault (USDT/BTC)</option>
              </select>
            </div>

            <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#0055FF] shrink-0" />
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                All capital movements are processed under deterministic infrastructure handshakes. Verification logs are immutable and auditable.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full btn-institutional-primary"
            >
              {isProcessing ? "Transmitting Fields..." : "Confirm & Commit Deposit"}
            </button>
          </form>
        </Card>
      </div>
    </AuthedLayout>
  );
}
