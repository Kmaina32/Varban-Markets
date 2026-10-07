'use client';

/**
 * @fileOverview Client Crypto Deposit Gateway.
 * Updated with Firebase null-guards and Institutional Dialogs.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  Copy, 
  Check, 
  QrCode, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  CheckCircle2
} from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/app/lib/utils";
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  minDeposit: string;
  confirmations: number;
  rate: number;
  iconColor: string;
  qrUrl: string;
}

const CRYPTO_NETWORKS: CryptoOption[] = [
  {
    id: "usdt-trc20",
    name: "Tether USD",
    symbol: "USDT",
    network: "TRC-20 (Tron)",
    address: "TYD7v32h5JbX9qM4pL1kR8wN0sE6zF2aVc",
    minDeposit: "10 USDT",
    confirmations: 1,
    rate: 1.00,
    iconColor: "text-[#26A17B]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TYD7v32h5JbX9qM4pL1kR8wN0sE6zF2aVc"
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Mainnet",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    minDeposit: "0.0005 BTC",
    confirmations: 2,
    rate: 64250.00,
    iconColor: "text-[#F7931A]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
  }
];

export default function CryptoDepositForm() {
  const { user } = useUser();
  const db = useFirestore();
  const supabase = createClient();

  const [selectedAsset, setSelectedAsset] = useState<CryptoOption>(CRYPTO_NETWORKS[0]);
  const [copied, setCopied] = useState(false);
  const [usdAmount, setUsdAmount] = useState<string>("500");
  const [txHash, setTxHash] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedAsset.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const calculatedCryptoAmount = (parseFloat(usdAmount || "0") / selectedAsset.rate).toFixed(6);

  const handleSubmitTxHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !txHash.trim()) return;

    setIsSubmitting(true);
    const depositRef = `CRYPTO-DEP-${Math.random().toString(36).substring(7).toUpperCase()}`;

    try {
      // 1. Supabase (Primary)
      await supabase.from('transactions').insert({
        user_id: user.uid,
        type: "Crypto Deposit",
        asset: `${selectedAsset.symbol} (${selectedAsset.network})`,
        amount: parseFloat(usdAmount),
        status: "Pending Verification",
        ref: depositRef,
        meta_data: { txHash: txHash.trim() }
      });

      // 2. Firebase (Guard)
      if (db) {
        await addDoc(collection(db, `users/${user.uid}/transactions`), {
          type: "Crypto Deposit",
          asset: `${selectedAsset.symbol} (${selectedAsset.network})`,
          amount: parseFloat(usdAmount),
          status: "Pending Verification",
          timestamp: serverTimestamp(),
          ref: depositRef,
          txHash: txHash.trim()
        });
      }

      setDialog({
        status: 'success',
        title: 'Transmission Logged',
        message: `Your deposit reference ${depositRef} has been registered. Our node monitors will verify the TxHash on the blockchain.`
      });
      setTxHash("");
    } catch (err: any) {
      setDialog({
        status: 'error',
        title: 'Sync Error',
        message: 'Could not synchronize verification token. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
          Select Cryptocurrency Asset & Network
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CRYPTO_NETWORKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedAsset(item)}
              className={cn(
                "p-3 border text-left flex flex-col justify-between transition-all",
                selectedAsset.id === item.id 
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" 
                  : "bg-white text-[#0A0A0A] border-[#E4E4E4] hover:bg-[#F7F7F5]"
              )}
            >
              <span className={cn("font-bold text-xs font-mono", selectedAsset.id === item.id ? "text-white" : item.iconColor)}>
                {item.symbol}
              </span>
              <span className="text-[8px] uppercase tracking-wider block truncate">{item.network}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white border-[#E4E4E4] p-6 md:p-8 rounded-none shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center justify-center p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
            <div className="w-32 h-32 bg-white p-2 border border-[#E4E4E4] flex items-center justify-center">
              <img src={selectedAsset.qrUrl} alt="QR" className="w-full h-full object-contain" />
            </div>
            <span className="text-[8px] font-bold text-[#6B7280] uppercase mt-2">Scan QR Code</span>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                {selectedAsset.symbol} Deposit Address ({selectedAsset.network})
              </span>
              <div className="flex items-center space-x-2">
                <input readOnly value={selectedAsset.address} className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 font-mono text-xs font-bold" />
                <button onClick={copyAddress} className="px-4 py-3 bg-[#0A0A0A] text-white text-xs font-bold uppercase">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitTxHash} className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Step 2: Submit Verification Hash</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="number" 
              value={usdAmount} 
              onChange={(e) => setUsdAmount(e.target.value)} 
              placeholder="USD Amount"
              className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-bold"
              required 
            />
            <input 
              type="text" 
              placeholder="Paste TxHash / Transaction ID" 
              value={txHash} 
              onChange={(e) => setTxHash(e.target.value)} 
              className="w-full bg-white border border-[#E4E4E4] p-3 text-xs font-mono"
              required 
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn-institutional-primary py-4">
            {isSubmitting ? "Broadcasting..." : "Verify & Log Crypto Deposit"}
          </button>
        </form>
      </Card>
    </div>
  );
}