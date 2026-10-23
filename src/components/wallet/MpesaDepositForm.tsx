
'use client';

/**
 * @fileOverview M-Pesa Deposit Form Component.
 * Initiates STK Push via internal API.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { cn } from '@/app/lib/utils';
import { Loader2, Phone, DollarSign, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

export default function MpesaDepositForm() {
  const { user } = useUser();
  const [phone, setPhone] = useState('2547');
  const [amountKes, setAmountKes] = useState('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const handleMpesaDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic Validation
    const cleanPhone = phone.replace('+', '').trim();
    if (!cleanPhone.startsWith('254') || cleanPhone.length !== 12) {
      setDialog({
        status: 'error',
        title: 'Invalid Format',
        message: 'Please provide phone number in format 254XXXXXXXXX.'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/mpesa/stk-push', {
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
        setIsWaiting(true);
      } else {
        throw new Error(data.error || "M-Pesa Handshake Failed");
      }
    } catch (err: any) {
      setDialog({
        status: 'error',
        title: 'Initiation Failed',
        message: err.message || 'Could not reach the M-Pesa gateway.'
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
        <div className="w-12 h-12 bg-[#F7F7F5] flex items-center justify-center border border-[#E4E4E4]">
           <Smartphone className="w-6 h-6 text-[#16835B]" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">M-Pesa Express</h3>
          <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-tight">Direct STK Push Deposit</p>
        </div>
      </div>

      {isWaiting ? (
        <div className="text-center py-10 space-y-6 animate-in fade-in duration-500">
           <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-[#16835B] animate-spin" />
           </div>
           <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase text-[#0A0A0A]">Checking your handset...</h4>
              <p className="text-[11px] text-[#6B7280] max-w-xs mx-auto leading-relaxed font-bold uppercase">
                A request has been sent to <span className="text-[#0A0A0A]">{phone}</span>. Please enter your M-Pesa PIN on your phone to authorize.
              </p>
           </div>
           <button 
            onClick={() => setIsWaiting(false)}
            className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline"
           >
             Cancel & Try Again
           </button>
        </div>
      ) : (
        <form onSubmit={handleMpesaDeposit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Phone Number (254...)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="254700000000"
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 pl-10 text-sm font-mono font-bold focus:border-[#16835B] outline-none"
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
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-sm font-mono font-bold focus:border-[#16835B] outline-none"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <span className="text-[10px] font-bold text-[#6B7280] uppercase">≈ ${estimatedUsd} USD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
             <AlertTriangle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
             <p className="text-[9px] text-[#6B7280] leading-relaxed font-bold uppercase">
               Ensure your handset is nearby and unlocked. You will receive a system prompt on your SIM toolkit to complete the transaction.
             </p>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full btn-institutional-primary bg-[#16835B] border-[#16835B] hover:bg-[#0A0A0A] hover:border-[#0A0A0A] py-5 flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isProcessing ? "Initiating Push..." : "Deposit via M-Pesa Express"}</span>
          </button>
        </form>
      )}
    </Card>
  );
}
