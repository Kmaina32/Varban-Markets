
'use client';

/**
 * @fileOverview Client-only Paystack Deposit Form.
 * Handles secure payment handshakes, ledger synchronization, and automated notification alerts.
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Check, CreditCard, Bell } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { usePaystackPayment } from 'react-paystack';

const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];

export default function PaystackDepositForm() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [amount, setAmount] = useState("2500");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.currency) {
      setSelectedCurrency(profile.currency);
    }
  }, [profile?.currency]);

  const config = {
    reference: `DEP-${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`,
    email: user?.email || "trader@varbanmarkets.com",
    amount: parseFloat(amount) * 100, // Amount in cents/kobo
    publicKey: 'pk_test_56134b2f2939c05c08882585250325438864720',
    currency: selectedCurrency,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    if (!user || !db) return;
    setIsProcessing(true);
    const amountNum = parseFloat(amount);
    
    // 1. Log Transaction
    const txRef = collection(db, `users/${user.uid}/transactions`);
    addDoc(txRef, {
      type: "Vault Deposit",
      asset: selectedCurrency,
      amount: amountNum,
      status: "Confirmed",
      timestamp: serverTimestamp(),
      ref: reference.reference,
      provider: "Paystack Protocol",
      currency: selectedCurrency
    }).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}/transactions`,
        operation: 'create',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    // 2. Atomically Adjust Balance using setDoc merge to ensure doc existence
    setDoc(doc(db, "users", user.uid), {
      balance: increment(amountNum),
      equity: increment(amountNum)
    }, { merge: true }).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}`,
        operation: 'update',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    // 3. Emit Core System Notification
    addDoc(collection(db, `users/${user.uid}/notifications`), {
      title: "Vault Deposit Confirmed",
      body: `Successfully verified capital credit of ${amountNum} ${selectedCurrency} via Paystack gateway token ${reference.reference.slice(0,8)}.`,
      type: "Funds",
      isUnread: true,
      timestamp: serverTimestamp()
    }).catch(() => {});
      
    setToken(reference.reference);
    setIsProcessing(false);
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
    <div className="max-w-2xl mx-auto space-y-6">
      {token && (
        <div className="bg-[#16835B]/10 border border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]">
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold uppercase block mb-1">Transmission Registered Successfully</span>
            <p className="font-mono text-[11px] text-[#6B7280]">Paystack Token Reference: {token}. Wallet balance has been provisioned.</p>
          </div>
        </div>
      )}

      <Card className="bg-white border-[#E4E4E4] p-8 rounded-none shadow-sm">
        <form onSubmit={handleDepositClick} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Stake / Allocation Capital</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A]"
                required
                min="10"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Gateway Domain Currency</label>
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

          <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 flex items-start space-x-3">
            <CreditCard className="w-5 h-5 text-[#0055FF] shrink-0" />
            <div className="text-[10px] text-[#6B7280] leading-relaxed">
              <span className="font-bold text-[#0A0A0A] block uppercase mb-1">PCI-DSS Secure Verification</span>
              All asset transmissions happen securely using the official Paystack inline transaction protocol. Funds credit instantly to your base currency balance.
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full btn-institutional-primary flex items-center justify-center space-x-2 py-4"
          >
            {isProcessing ? "Awaiting Secured Handshake..." : `Initiate Paystack Deposit (${selectedCurrency})`}
          </button>
        </form>
      </Card>

      <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-[#16835B] shrink-0" />
        <p className="text-[9px] text-[#6B7280] uppercase tracking-widest font-bold">
          Verified Sandbox Electronic Trading Node Access
        </p>
      </div>
    </div>
  );
}
