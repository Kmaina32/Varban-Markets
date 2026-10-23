'use client';

/**
 * @fileOverview Airtel Money Deposit Form Component.
 * Initiates USSD Push and listens for real-time Firestore updates.
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Loader2, Phone, CheckCircle2, AlertTriangle, Check } from 'lucide-react';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

const AIRTEL_LOGO = "https://upload.wikimedia.org/wikipedia/commons/3/3c/Airtel_logo.svg";

export default function AirtelDepositForm() {
  const { user } = useUser();
  const db = useFirestore();
  
  const [phone, setPhone] = useState('7');
  const [amountKes, setAmountKes] = useState('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    if (!isWaiting || !activeRef || !user || !db) return;

    const txRef = collection(db, `users/${user.uid}/transactions`);
    const q = query(txRef, where("ref", "==", activeRef));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const txData = snapshot.docs[0].data();
        if (txData.status === 'Confirmed') {
          setIsConfirmed(true);
          setIsWaiting(false);
          setDialog({
            status: 'success',
            title: 'Deposit Verified',
            message: 'Your Airtel Money payment has been confirmed and balance updated.'
          });
        } else if (txData.status === 'Failed') {
          setIsWaiting(false);
          setDialog({
            status: 'error',
            title: 'Payment Failed',
            message: txData.error || 'The USSD transaction failed or was timed out.'
          });
        }
      }
    });

    return () => unsubscribe();
  }, [isWaiting, activeRef, user, db]);

  const handleAirtelDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Format check: ensure we handle prefixes correctly for the API
    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.substring(1);
    if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) cleanPhone = '254' + cleanPhone;
    
    if (!cleanPhone.startsWith('254') || cleanPhone.length !== 12) {
      setDialog({
        status: 'error',
        title: 'Invalid Number',
        message: 'Format should be 07XXXXXXXX or 254XXXXXXXXX.'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/airtel/ussd-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          amount: parseFloat(amountKes),
          userId: user.uid
        })
      });

      const data = await res.json();

      if (res.ok) {
        setActiveRef(data.ref);
        setIsWaiting(true);
      } else {
        throw new Error(data.error || "Airtel Handshake Failed");
      }
    } catch (err: any) {
      setDialog({
        status: 'error',
        title: 'Initiation Failed',
        message: err.message || 'Could not reach the Airtel Money gateway.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedUsd = (parseFloat(amountKes || "0") / 130).toFixed(2);

  return (
    <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#F7F7F5]">
        <div className="w-16 h-12 bg-white flex items-center justify-center border border-[#E4E4E4] overflow-hidden p-2">
           <img src={AIRTEL_LOGO} alt="Airtel" className="w-full h-full object-contain" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Airtel Money</h3>
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-tight">Direct USSD Push Deposit</p>
        </div>
      </div>

      {isConfirmed ? (
        <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-500">
           <div className="w-16 h-16 bg-[#16835B]/10 border border-[#16835B] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-[#16835B]" />
           </div>
           <h4 className="text-sm font-bold uppercase text-[#0A0A0A]">Settlement Verified</h4>
           <button onClick={() => setIsConfirmed(false)} className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest underline underline-offset-4">Add More Funds</button>
        </div>
      ) : isWaiting ? (
        <div className="text-center py-10 space-y-6 animate-in fade-in duration-500">
           <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-[#FF0000] animate-spin" />
           </div>
           <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase text-[#0A0A0A]">Authorize on Handset</h4>
              <p className="text-[11px] text-[#6B7280] max-w-xs mx-auto leading-relaxed font-bold uppercase">
                A USSD prompt has been sent to your device. Please enter your Airtel Money PIN to confirm.
              </p>
           </div>
           <button 
            onClick={() => setIsWaiting(false)}
            className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline"
           >
             Cancel & Reset
           </button>
        </div>
      ) : (
        <form onSubmit={handleAirtelDeposit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Airtel Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 pl-10 text-sm font-mono font-bold focus:border-[#FF0000] outline-none"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Amount (KES)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amountKes}
                  onChange={(e) => setAmountKes(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-sm font-mono font-bold focus:border-[#FF0000] outline-none"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                   <span className="text-[10px] font-bold text-[#6B7280] uppercase">≈ ${estimatedUsd} USD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
             <AlertTriangle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
             <p className="text-[9px] text-[#6B7280] leading-relaxed font-bold uppercase">
               The USSD Push protocol requires an active Airtel Money subscription. Ensure your SIM card is registered and has sufficient funds.
             </p>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full btn-institutional-primary bg-[#FF0000] border-[#FF0000] hover:bg-[#0A0A0A] hover:border-[#0A0A0A] py-5 flex items-center justify-center gap-3"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isProcessing ? "Initiating Push..." : "Deposit via Airtel Money"}</span>
          </button>
        </form>
      )}
    </Card>
  );
}
