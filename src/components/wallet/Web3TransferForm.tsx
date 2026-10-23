
'use client';

/**
 * @fileOverview Web3 On-Chain Transfer Node.
 * Handles MetaMask transfers via Web3Auth to the company hot wallet.
 */

import React, { useState } from 'react';
import { useWeb3 } from '@/app/lib/web3-context';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Wallet, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';
import { cn } from '@/app/lib/utils';

const COMPANY_HOT_WALLET = "0x892410b000000000000000000000000000000000"; // Institutional Liquidity Node

export default function Web3TransferForm() {
  const { address, balance, isConnected, login, sendTransaction } = useWeb3();
  const { user } = useUser();
  const db = useFirestore();

  const [amount, setAmount] = useState("0.1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      await login();
      return;
    }

    if (!user || !db) return;

    setIsProcessing(true);
    try {
      const hash = await sendTransaction(COMPANY_HOT_WALLET, amount);
      
      if (hash) {
        // Register transaction in institutional ledger
        const depositRef = `WEB3-DEP-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        await addDoc(collection(db, `users/${user.uid}/transactions`), {
          type: "Web3 Transfer",
          asset: "ETH (Sepolia)",
          amount: parseFloat(amount) * 3500, // Approximate USD value for accounting
          nativeAmount: parseFloat(amount),
          status: "Pending Verification",
          timestamp: serverTimestamp(),
          ref: depositRef,
          txHash: hash,
          sender: address,
          provider: "MetaMask / Web3Auth"
        });

        setDialog({
          status: 'success',
          title: 'Broadcast Successful',
          message: `Transaction ${hash.slice(0, 10)}... has been broadcast to the network. Your balance will be provisioned upon 12 network confirmations.`
        });
      } else {
        throw new Error("Transaction rejected or failed at the node level.");
      }
    } catch (error: any) {
      setDialog({
        status: 'error',
        title: 'Transmission Failed',
        message: error.message || 'The blockchain handshake was interrupted.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm space-y-6">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      <div className="flex items-center justify-between border-b border-[#F7F7F5] pb-4">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-[#0055FF]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Decentralized Transfer</h3>
        </div>
        {!isConnected ? (
          <button 
            onClick={login}
            className="px-4 py-1.5 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-all"
          >
            Connect MetaMask
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#16835B]/10 border border-[#16835B] rounded-none">
            <div className="w-1.5 h-1.5 rounded-full bg-[#16835B] animate-pulse"></div>
            <span className="text-[9px] font-bold text-[#16835B] uppercase tracking-widest">Active Link</span>
          </div>
        )}
      </div>

      {isConnected ? (
        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block">Transfer Value (ETH)</label>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:border-[#0055FF] outline-none"
                required
              />
              <span className="text-[9px] text-[#6B7280] font-mono block">Available: {parseFloat(balance || "0").toFixed(4)} ETH</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block">Linked Wallet</label>
              <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0A0A0A] truncate max-w-[180px]">{address}</span>
                <ShieldCheck className="w-4 h-4 text-[#16835B]" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
            <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase font-bold">
              Funds are transferred to the Varban Markets Institutional Hot Wallet. Payouts and account credits are synchronized automatically after blockchain confirmation.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full btn-institutional-primary py-4 flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting to Node...</span>
              </>
            ) : (
              <>
                <span>Execute On-Chain Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center mx-auto">
            <Wallet className="w-8 h-8 text-[#6B7280] opacity-20" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">Wallet Not Connected</h4>
            <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest mt-1">Establish a link with MetaMask to perform on-chain transfers.</p>
          </div>
          <button 
            onClick={login}
            className="btn-institutional-primary px-10"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </Card>
  );
}
