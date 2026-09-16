
"use client";

import { useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Check, CreditCard } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePaystackPayment } from 'react-paystack';

const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];

export default function DepositPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [amount, setAmount] = useState("5000");
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency || "USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const config = {
    reference: `DEP-${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`,
    email: user?.email || "trader@varbanmarkets.com",
    amount: parseFloat(amount) * 100,
    publicKey: 'pk_test_56134b2f2939c05c08882585250325438864720',
    currency: selectedCurrency,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    if (!user || !db) return;
    setIsProcessing(true);

    const amountNum = parseFloat(amount);
    
    addDoc(collection(db, `users/${user.uid}/transactions`), {
      type: "Vault Deposit",
      asset: selectedCurrency,
      amount: amountNum,
      status: "Confirmed",
      timestamp: serverTimestamp(),
      ref: reference.reference,
      provider: "Paystack",
      currency: selectedCurrency
    }).then(() => {
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
      
      setToken(reference.reference);
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

  const onClose = () => {
    setIsProcessing(false);
  };

  const handleDepositClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsProcessing(true);
    initializePayment({onSuccess, onClose});
  };

  return (
    <AuthedLayout 
      title="Vault Deposit" 
      subtitle="Funding account capital domains through Paystack secure matching conduits"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {token && (
          <div className="bg-[#16835B]/10 border border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]">
            <Check className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold uppercase block mb-1">Transmission Registered</span>
              <p className="font-mono text-[11px] text-[#6B7280]">Paystack Ref: {token}. Internal ledger synchronized successfully.</p>
            </div>
          </div>
        )}

        <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
          <form onSubmit={handleDepositClick} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Stake Amount</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A]"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Currency (Paystack)</label>
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

            <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 flex items-start space-x-3">
              <CreditCard className="w-5 h-5 text-[#0055FF] shrink-0" />
              <div className="text-[10px] text-[#6B7280] leading-relaxed">
                <span className="font-bold text-[#0A0A0A] block uppercase mb-1">Paystack Gateway</span>
                All capital movements are processed under deterministic infrastructure handshakes via Paystack. Supported currencies: NGN, GHS, ZAR, KES, USD.
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full btn-institutional-primary flex items-center justify-center space-x-2"
            >
              {isProcessing ? "Awaiting Handshake..." : `Initiate Paystack Deposit (${selectedCurrency})`}
            </button>
          </form>
        </Card>

        <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#16835B] shrink-0" />
          <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tighter">
            Verified institutional conduit. PCI-DSS Level 1 compliant via Paystack integration.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}
