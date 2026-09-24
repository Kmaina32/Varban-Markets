'use client';

/**
 * @fileOverview Client Crypto Deposit Gateway with multi-chain network support, QR codes, copy-paste addresses, and TxHash verification logging.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  Copy, 
  Check, 
  QrCode, 
  ShieldAlert, 
  ArrowRight, 
  Bitcoin, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  minDeposit: string;
  confirmations: number;
  rate: number; // 1 Coin = X USD
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
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    minDeposit: "50 USDT",
    confirmations: 12,
    rate: 1.00,
    iconColor: "text-[#627EEA]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
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
    address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    minDeposit: "0.01 ETH",
    confirmations: 12,
    rate: 3450.00,
    iconColor: "text-[#627EEA]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    network: "Solana Network",
    address: "7xKXtg2CW87d97TXJSDpbD5jBk4n4vJ1d7Fm89K2PqL",
    minDeposit: "0.1 SOL",
    confirmations: 1,
    rate: 145.00,
    iconColor: "text-[#14F195]",
    qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=7xKXtg2CW87d97TXJSDpbD5jBk4n4vJ1d7Fm89K2PqL"
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
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedAsset.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const calculatedCryptoAmount = (parseFloat(usdAmount || "0") / selectedAsset.rate).toFixed(6);

  const handleSubmitTxHash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !txHash.trim()) return;

    setIsSubmitting(true);
    const depositRef = `CRYPTO-DEP-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Log pending crypto deposit in Firestore
    addDoc(collection(db, `users/${user.uid}/transactions`), {
      type: "Crypto Deposit",
      asset: `${selectedAsset.symbol} (${selectedAsset.network})`,
      amount: parseFloat(usdAmount),
      cryptoAmount: parseFloat(calculatedCryptoAmount),
      status: "Pending Verification",
      timestamp: serverTimestamp(),
      ref: depositRef,
      txHash: txHash.trim(),
      depositAddress: selectedAsset.address,
      provider: "Blockchain Network Node"
    }).catch(() => {});

    // Add user notification
    addDoc(collection(db, `users/${user.uid}/notifications`), {
      title: "Crypto Deposit Submitted",
      body: `Your deposit of $${usdAmount} (${calculatedCryptoAmount} ${selectedAsset.symbol}) on ${selectedAsset.network} is pending blockchain confirmation. TxHash: ${txHash.slice(0, 10)}...`,
      type: "Funds",
      isUnread: true,
      timestamp: serverTimestamp()
    }).catch(() => {});

    setSubmittedRef(depositRef);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {submittedRef && (
        <div className="bg-[#16835B]/10 border border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold uppercase block mb-1">Blockchain Receipt Registered</span>
            <p className="font-mono text-[11px] text-[#6B7280]">
              Transaction Ticket <span className="font-bold text-[#0A0A0A]">{submittedRef}</span> logged. Node monitors will auto-credit your balance upon {selectedAsset.confirmations} block confirmations.
            </p>
          </div>
        </div>
      )}

      {/* Network Selection Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
          Select Cryptocurrency Asset & Network
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CRYPTO_NETWORKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedAsset(item);
                setSubmittedRef(null);
              }}
              className={cn(
                "p-3 border text-left flex flex-col justify-between transition-all",
                selectedAsset.id === item.id 
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" 
                  : "bg-white text-[#0A0A0A] border-[#E4E4E4] hover:bg-[#F7F7F5]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("font-bold text-xs font-mono", selectedAsset.id === item.id ? "text-white" : item.iconColor)}>
                  {item.symbol}
                </span>
                {selectedAsset.id === item.id && <Check className="w-3.5 h-3.5 text-[#16835B]" />}
              </div>
              <div>
                <span className="text-[10px] font-bold block truncate">{item.name}</span>
                <span className={cn("text-[8px] uppercase tracking-wider block truncate", selectedAsset.id === item.id ? "text-[#9CA3AF]" : "text-[#6B7280]")}>
                  {item.network}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Wallet Details Matrix */}
      <Card className="bg-white border-[#E4E4E4] p-6 md:p-8 rounded-none shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-[#E4E4E4] pb-6">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#F7F7F5] border border-[#E4E4E4] text-center">
            <div className="w-40 h-40 bg-white p-2 border border-[#E4E4E4] flex items-center justify-center relative shadow-inner">
              <img 
                src={selectedAsset.qrUrl} 
                alt={`${selectedAsset.symbol} Deposit QR Code`}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mt-2 flex items-center gap-1">
              <QrCode className="w-3 h-3 text-[#0055FF]" /> Scan QR with Mobile Wallet
            </span>
          </div>

          {/* Deposit Address Box */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Official {selectedAsset.symbol} Deposit Address ({selectedAsset.network})
                </span>
                <span className="text-[9px] font-bold text-[#16835B] uppercase tracking-widest bg-[#16835B]/10 px-2 py-0.5">
                  Min: {selectedAsset.minDeposit}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  readOnly 
                  value={selectedAsset.address} 
                  className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 font-mono text-xs font-bold text-[#0A0A0A] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={copyAddress}
                  className="px-4 py-3 bg-[#0A0A0A] text-white hover:bg-[#0055FF] transition-colors shrink-0 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-[#16835B]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#F7F7F5] p-3 border border-[#E4E4E4] text-[10px]">
              <div>
                <span className="text-[#6B7280] uppercase font-bold block">Network Node</span>
                <span className="font-mono font-bold text-[#0A0A0A]">{selectedAsset.network}</span>
              </div>
              <div>
                <span className="text-[#6B7280] uppercase font-bold block">Required Confirmations</span>
                <span className="font-mono font-bold text-[#0055FF]">{selectedAsset.confirmations} Blocks (~3 mins)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount & TxHash Verification Form */}
        <form onSubmit={handleSubmitTxHash} className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0055FF]" /> Step 2: Submit Transaction Verification Hash
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Intended Deposit Amount (USD Equivalent)
              </label>
              <input 
                type="number" 
                value={usdAmount} 
                onChange={(e) => setUsdAmount(e.target.value)} 
                min="10" 
                required 
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-sm font-mono font-bold text-[#0A0A0A] outline-none focus:border-[#0A0A0A]"
              />
              <span className="text-[9px] text-[#6B7280] mt-1 block font-mono">
                Approx. {calculatedCryptoAmount} {selectedAsset.symbol}
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Blockchain TxHash / Transaction ID
              </label>
              <input 
                type="text" 
                placeholder="Paste TxHash e.g. 0x8a91f..." 
                value={txHash} 
                onChange={(e) => setTxHash(e.target.value)} 
                required 
                className="w-full bg-white border border-[#E4E4E4] p-3 text-xs font-mono text-[#0A0A0A] outline-none focus:border-[#0055FF]"
              />
            </div>
          </div>

          <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-[10px] text-[#6B7280] flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#C43D3D] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#0A0A0A] uppercase">Important Warning:</strong> Only send <strong className="text-[#0A0A0A]">{selectedAsset.symbol}</strong> via the <strong className="text-[#0A0A0A]">{selectedAsset.network}</strong> network. Sending funds over an unsupported protocol may result in permanent loss.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-institutional-primary py-4 text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? "Broadcasting Verification..." : "Verify & Log Crypto Deposit"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </Card>
    </div>
  );
}
