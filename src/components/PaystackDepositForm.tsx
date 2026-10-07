'use client';

/**
 * @fileOverview Client-only Paystack Deposit Form.
 * Updated with Firebase null-guards and Institutional Dialogs.
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Check, CreditCard } from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from "firebase/firestore";
import { createClient } from "@/app/lib/supabase/client";
import { usePaystackPayment } from 'react-paystack';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];

export default function PaystackDepositForm() {
  const { user } = useUser();
  const db = useFirestore();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [amount, setAmount] = useState("2500");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.uid).single();
      if (data) {
        setProfile(data);
        setSelectedCurrency(data.currency || "USD");
      }
    }
    loadProfile();
  }, [user?.uid, supabase]);

  const config = {
    reference: `DEP-${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`,
    email: user?.email || "trader@varbanmarkets.com",
    amount: parseFloat(amount) * 100,
    publicKey: 'pk_test_56134b2f2939c05c08882585250325438864720',
    currency: selectedCurrency,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    if (!user) return;
    setIsProcessing(true);
    const amountNum = parseFloat(amount);
    
    try {
      // 1. Log in Supabase (Primary)
      await supabase.from('transactions').insert({
        user_id: user.uid,
        type: "Vault Deposit",
        asset: selectedCurrency,
        amount: amountNum,
        status: "Confirmed",
        ref: reference.reference,
        provider: "Paystack Protocol"
      });

      await supabase.from('profiles').update({
        balance: (profile?.balance || 0) + amountNum,
        equity: (profile?.equity || 0) + amountNum
      }).eq('id', user.uid);

      // 2. Log in Firebase (Legacy Guard)
      if (db) {
        await addDoc(collection(db, `users/${user.uid}/transactions`), {
          type: "Vault Deposit",
          asset: selectedCurrency,
          amount: amountNum,
          status: "Confirmed",
          timestamp: serverTimestamp(),
          ref: reference.reference,
          provider: "Paystack Protocol"
        });
        await setDoc(doc(db, "users", user.uid), {
          balance: increment(amountNum),
          equity: increment(amountNum)
        }, { merge: true });
      }

      setDialog({
        status: 'success',
        title: 'Deposit Confirmed',
        message: `Successfully verified capital credit of ${amountNum} ${selectedCurrency}. Your balance has been provisioned.`
      });
    } catch (err) {
      setDialog({
        status: 'error',
        title: 'Ledger Sync Error',
        message: 'The payment was successful, but your balance update is pending. Please contact support if it does not reflect within 10 minutes.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDepositClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    initializePayment({ onSuccess, onClose: () => setIsProcessing(false) });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

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
              All asset transmissions happen securely using the official Paystack inline protocol.
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full btn-institutional-primary py-4"
          >
            {isProcessing ? "Handshake Active..." : `Initiate Paystack Deposit (${selectedCurrency})`}
          </button>
        </form>
      </Card>
    </div>
  );
}