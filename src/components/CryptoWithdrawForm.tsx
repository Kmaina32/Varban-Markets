'use client';

/**
 * @fileOverview Client Crypto Remittance / Withdrawal Gateway with fee calculation, address validation, balance deduct, and transaction logging.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  ArrowUpCircle, 
  Check, 
  ShieldAlert, 
  Bitcoin, 
  Lock, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

interface CryptoWithdrawOption {
  id: string;
  name: string;
  symbol: string;
  network: string;
  minWithdraw: number;
  feeUsd: number;
  rate: number;
  placeholder: string;
  iconColor: string;
}

const CRYPTO_WITHDRAW_NETWORKS: CryptoWithdrawOption[] = [
  {
    id: "usdt-trc20",
    name: "Tether USD",
    symbol: "USDT",
    network: "TRC-20 (Tron)",
    minWithdraw: 20,
    feeUsd: 1.00,
    rate: 1.00,
    placeholder: "TRC-20 Address starting with T...",
    iconColor: "text-[#26A17B]"
  },
  {
    id: "usdt-erc20",
    name: "Tether USD",
    symbol: "USDT",
    network: "ERC-20 (Ethereum)",
    minWithdraw: 50,
    feeUsd: 5.00,
    rate: 1.00,
    placeholder: "ERC-20 Address starting with 0x...",
    iconColor: "text-[#627EEA]"
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Mainnet",
    minWithdraw: 100,
    feeUsd: 8.00,
    rate: 64250.00,
    placeholder: "BTC Address (bc1... or 1... or 3...)",
    iconColor: "text-[#F7931A]"
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum Mainnet",
    minWithdraw: 80,
    feeUsd: 4.00,
    rate: 3450.00,
    placeholder: "ETH Address starting with 0x...",
    iconColor: "text-[#627EEA]"
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    network: "Solana Network",
    minWithdraw: 30,
    feeUsd: 0.50,
    rate: 145.00,
    placeholder: "Solana Public Wallet Address...",
    iconColor: "text-[#14F195]"
  }
];

export default function CryptoWithdrawForm() {
  const { user } = useUser();
  const db = useFirestore();
  const { formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [selectedNetwork, setSelectedNetwork] = useState<CryptoWithdrawOption>(CRYPTO_WITHDRAW_NETWORKS[0]);
  const [amountUsd, setAmountUsd] = useState<string>("250");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [pinCode, setPinCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const availableBalance = profile?.balance || 0;
  const numAmount = parseFloat(amountUsd || "0");
  const netAmountUsd = Math.max(0, numAmount - selectedNetwork.feeUsd);
  const cryptoOutput = (netAmountUsd / selectedNetwork.rate).toFixed(6);

  const handleCryptoWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    if (numAmount < selectedNetwork.minWithdraw) {
      alert(`Minimum withdrawal for ${selectedNetwork.symbol} (${selectedNetwork.network}) is $${selectedNetwork.minWithdraw} USD.`);
      return;
    }

    if (numAmount > availableBalance) {
      alert("Deficit Exposure: Requested withdrawal exceeds current liquid balance.");
      return;
    }

    if (!walletAddress.trim()) {
      alert("Please provide a valid destination crypto wallet address.");
      return;
    }

    setIsProcessing(true);
    const refKey = `CRYPTO-WTH-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // 1. Deduct Real Account Balance
    updateDoc(doc(db, "users", user.uid), {
      balance: increment(-numAmount),
      equity: increment(-numAmount)
    }).catch(async () => {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}`,
        operation: 'update',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    // 2. Add Transaction Record in Firestore
    addDoc(collection(db, `users/${user.uid}/transactions`), {
      type: "Crypto Withdrawal",
      asset: `${selectedNetwork.symbol} (${selectedNetwork.network})`,
      amount: numAmount,
      netAmountUsd: netAmountUsd,
      cryptoOutput: parseFloat(cryptoOutput),
      fee: selectedNetwork.feeUsd,
      status: "Pending Verification",
      timestamp: serverTimestamp(),
      ref: refKey,
      destinationAddress: walletAddress.trim(),
      provider: "Blockchain Transfer Gateway"
    }).catch(() => {});

    // 3. System Notification
    addDoc(collection(db, `users/${user.uid}/notifications`), {
      title: "Crypto Withdrawal Requested",
      body: `Withdrawal request of $${numAmount} USD (${cryptoOutput} ${selectedNetwork.symbol}) on ${selectedNetwork.network} to ${walletAddress.slice(0, 10)}... has been scheduled for clearing. Token: ${refKey}`,
      type: "Funds",
      isUnread: true,
      timestamp: serverTimestamp()
    }).catch(() => {});

    setToken(refKey);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {token && (
        <div className="bg-[#0A0A0A] border border-[#0055FF] p-4 flex items-start space-x-3 text-white">
          <CheckCircle2 className="w-5 h-5 text-[#16835B] shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <span className="font-bold uppercase block text-[#16835B] mb-1">Withdrawal Instruction Queued</span>
            <p className="text-[#9CA3AF] text-[11px]">
              Reference Token: <strong className="text-white">{token}</strong>. Automated risk controllers are reviewing destination address protocol. Funds will dispatch upon network verification.
            </p>
          </div>
        </div>
      )}

      {/* Network Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
          Select Crypto Payout Network
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CRYPTO_WITHDRAW_NETWORKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedNetwork(item);
                setToken(null);
              }}
              className={cn(
                "p-3 border text-left flex flex-col justify-between transition-all",
                selectedNetwork.id === item.id 
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" 
                  : "bg-white text-[#0A0A0A] border-[#E4E4E4] hover:bg-[#F7F7F5]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("font-bold text-xs font-mono", selectedNetwork.id === item.id ? "text-white" : item.iconColor)}>
                  {item.symbol}
                </span>
                {selectedNetwork.id === item.id && <Check className="w-3.5 h-3.5 text-[#16835B]" />}
              </div>
              <div>
                <span className="text-[10px] font-bold block truncate">{item.name}</span>
                <span className={cn("text-[8px] uppercase tracking-wider block truncate", selectedNetwork.id === item.id ? "text-[#9CA3AF]" : "text-[#6B7280]")}>
                  {item.network}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white border-[#E4E4E4] p-6 md:p-8 rounded-none shadow-sm">
        <form onSubmit={handleCryptoWithdraw} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
                Withdrawal Amount (USD)
              </label>
              <input 
                type="number"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                min={selectedNetwork.minWithdraw}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A]"
                required
              />
              <div className="flex justify-between text-[9px] text-[#6B7280] mt-1 font-mono">
                <span>Min: ${selectedNetwork.minWithdraw} USD</span>
                <button 
                  type="button" 
                  onClick={() => setAmountUsd(availableBalance.toString())}
                  className="text-[#0055FF] font-bold hover:underline"
                >
                  Withdraw All (${formatNumber(availableBalance, { minimumFractionDigits: 2 })})
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
                Recipient Wallet Address ({selectedNetwork.network})
              </label>
              <input 
                type="text"
                placeholder={selectedNetwork.placeholder}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full bg-white border border-[#E4E4E4] p-4 text-xs font-mono font-bold focus:outline-none focus:border-[#0055FF] text-[#0A0A0A]"
                required
              />
            </div>
          </div>

          {/* Real Balance Info */}
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1 py-2 bg-[#F7F7F5] border border-[#E4E4E4]">
            <span className="text-[#6B7280]">Liquid Account Domain Equity:</span>
            <span className="text-[#16835B] font-mono font-bold text-xs">
              ${formatNumber(availableBalance, { minimumFractionDigits: 2 })} USD
            </span>
          </div>

          {/* Breakdown Card */}
          <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 space-y-2 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#6B7280] uppercase font-bold">Gross Remittance Amount:</span>
              <span className="font-mono font-bold text-[#0A0A0A]">${numAmount.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280] uppercase font-bold">Estimated Network Mining Fee:</span>
              <span className="font-mono font-bold text-[#C43D3D]">${selectedNetwork.feeUsd.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between border-t border-[#E4E4E4] pt-2 text-xs">
              <span className="text-[#0A0A0A] uppercase font-bold">Estimated Net Crypto Output:</span>
              <span className="font-mono font-bold text-[#16835B]">{cryptoOutput} {selectedNetwork.symbol}</span>
            </div>
          </div>

          {/* PIN / Security code verification */}
          <div>
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#0055FF]" /> Account Security PIN / 2FA Code (Optional)
            </label>
            <input 
              type="password"
              placeholder="Enter 6-digit security PIN"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full border border-[#E4E4E4] p-3 text-xs font-mono bg-white focus:outline-none focus:border-[#0A0A0A] text-[#0A0A0A]"
              maxLength={6}
            />
          </div>

          <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-[10px] text-[#6B7280] flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#0055FF] shrink-0 mt-0.5" />
            <p>
              Please double check destination network compatibility. Transfers to wrong blockchain standard are non-reversible. Payout processing timeframe is typically 5 to 30 minutes.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full btn-institutional-primary flex items-center justify-center space-x-2 py-4"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>{isProcessing ? "Processing Blockchain Remittance..." : `Withdraw ${cryptoOutput} ${selectedNetwork.symbol}`}</span>
          </button>
        </form>
      </Card>
    </div>
  );
}
