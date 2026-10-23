
'use client';

/**
 * @fileOverview Client Crypto Deposit Gateway.
 * Expanded with high-fidelity logo integration and institutional assets.
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
import { cn } from "@/app/lib/utils";
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';
import { MarketIcon } from "@/components/MarketIcon";

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
    id: "usdt-erc20",
    name: "Tether USD",
    symbol: "USDT",
    network: "ERC-20 (Ethereum)",
    address: "0x892410b000000000000000000000000000000000",
    minDeposit: "50 USDT",
    confirmations: 12,
    rate: 1.00,
    iconColor: "text-[#26A17B]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0x892410b000000000000000000000000000000000"
  },
  {
    id: "usdc-erc20",
    name: "USD Coin",
    symbol: "USDC",
    network: "ERC-20",
    address: "0x892410b000000000000000000000000000000001",
    minDeposit: "50 USDC",
    confirmations: 12,
    rate: 1.00,
    iconColor: "text-[#2775CA]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0x892410b0000000000000000000000001"
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
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum Mainnet",
    address: "0x892410b000000000000000000000000000000002",
    minDeposit: "0.01 ETH",
    confirmations: 12,
    rate: 3450.00,
    iconColor: "text-[#627EEA]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0x892410b0000000000000000000000002"
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    network: "Solana Mainnet",
    address: "6xY8jQZ9P1sK... (Placeholder)",
    minDeposit: "0.1 SOL",
    confirmations: 32,
    rate: 145.00,
    iconColor: "text-[#14F195]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=6xY8jQZ9P1"
  },
  {
    id: "ltc",
    name: "Litecoin",
    symbol: "LTC",
    network: "Litecoin Mainnet",
    address: "L... (Placeholder)",
    minDeposit: "0.1 LTC",
    confirmations: 6,
    rate: 85.00,
    iconColor: "text-[#345D9D]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=L"
  },
  {
    id: "xrp",
    name: "Ripple",
    symbol: "XRP",
    network: "Ripple Net",
    address: "r... (Placeholder)",
    minDeposit: "20 XRP",
    confirmations: 1,
    rate: 0.60,
    iconColor: "text-[#23292F]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=r"
  }
];

export default function CryptoDepositForm() {
  const { user } = useUser();
  const db = useFirestore();

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

  const handleSubmitTxHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !txHash.trim()) return;

    setIsSubmitting(true);
    const depositRef = `CRYPTO-DEP-${Math.random().toString(36).substring(7).toUpperCase()}`;

    try {
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {CRYPTO_NETWORKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedAsset(item)}
              className={cn(
                "p-4 border text-left flex flex-col items-center justify-center gap-3 transition-all rounded-none",
                selectedAsset.id === item.id 
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" 
                  : "bg-white text-[#0A0A0A] border-[#E4E4E4] hover:bg-[#F7F7F5]"
              )}
            >
              <MarketIcon symbol={item.symbol} size="md" />
              <div className="text-center">
                <span className={cn("font-bold text-[11px] font-mono block", selectedAsset.id === item.id ? "text-white" : "text-[#0A0A0A]")}>
                  {item.symbol}
                </span>
                <span className={cn("text-[7px] uppercase tracking-wider block truncate", selectedAsset.id === item.id ? "text-white/40" : "text-[#6B7280]")}>{item.network}</span>
              </div>
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
            <div className="p-3 bg-[#16835B]/5 border border-[#16835B]/20 flex items-center gap-2">
               <Clock className="w-3 h-3 text-[#16835B]" />
               <span className="text-[8px] font-bold text-[#16835B] uppercase tracking-widest">Est. Confirmation: {selectedAsset.confirmations} blocks (~2-10 mins)</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitTxHash} className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Step 2: Submit Verification Hash</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold uppercase text-[#6B7280] mb-1 block">Expected Amount (USD)</label>
              <input 
                type="number" 
                value={usdAmount} 
                onChange={(e) => setUsdAmount(e.target.value)} 
                placeholder="USD Amount"
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-bold"
                required 
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-[#6B7280] mb-1 block">Transaction Hash (TxID)</label>
              <input 
                type="text" 
                placeholder="Paste TxHash / Transaction ID" 
                value={txHash} 
                onChange={(e) => setTxHash(e.target.value)} 
                className="w-full bg-white border border-[#E4E4E4] p-3 text-xs font-mono"
                required 
              />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn-institutional-primary py-4">
            {isSubmitting ? "Broadcasting..." : "Verify & Log Crypto Deposit"}
          </button>
        </form>
      </Card>
    </div>
  );
}
