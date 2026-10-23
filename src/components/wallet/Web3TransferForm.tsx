
'use client';

/**
 * @fileOverview Web3 On-Chain Transfer Node.
 * Features multi-currency selection (ETH, USDT, USDC) and official MetaMask iconography.
 * Handles MetaMask transfers via Web3Auth to the institutional vault.
 */

import React, { useState } from 'react';
import { useWeb3 } from '@/app/lib/web3-context';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Wallet, ArrowRight, Loader2, CheckCircle2, AlertTriangle, ChevronDown, Check } from 'lucide-react';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';
import { cn } from '@/app/lib/utils';

const COMPANY_HOT_WALLET = "0x892410b000000000000000000000000000000000";

interface Web3Asset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  iconColor: string;
}

const WEB3_ASSETS: Web3Asset[] = [
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', network: 'Sepolia Network', iconColor: 'text-[#627EEA]' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether USD', network: 'ERC-20', iconColor: 'text-[#26A17B]' },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', network: 'ERC-20', iconColor: 'text-[#2775CA]' },
];

const MetaMaskIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 318.6 318.6" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="#E2761B" d="M286.6 10.7L180 56.6l-13.6 31.8 3.6 160.3 116.6-238z"/>
    <path fill="#E4761B" d="M32 10.7l106.6 45.9 13.6 31.8-3.6 160.3L32 10.7z"/>
    <path fill="#D7C1B3" d="M257.3 255.4l-31.8-51.4H93.1l-31.8 51.4 93.6 44.5 93.6-44.5z"/>
    <path fill="#233447" d="M225.5 204l-23.2-31.8h-86l-23.2 31.8 66.2 12.7 66.2-12.7z"/>
    <path fill="#CD7932" d="M56.3 151.7l13.6-63.3 68.7 51.4-82.3 11.9z"/>
    <path fill="#CD7932" d="M262.3 151.7l-13.6-63.3-68.7 51.4 82.3 11.9z"/>
    <path fill="#E4751F" d="M110.9 234.1l-25.5-25.5 31.8-13.6-6.3 39.1z"/>
    <path fill="#E4751F" d="M207.7 234.1l25.5-25.5-31.8-13.6 6.3 39.1z"/>
    <path fill="#F6851B" d="M110.9 234.1l6.3-39.1-31.8 13.6 25.5 25.5z"/>
    <path fill="#F6851B" d="M207.7 234.1l-6.3-39.1 31.8 13.6-25.5 25.5z"/>
    <path fill="#C0AD9E" d="M159.3 268.2l-39.1-39.1 6.3 39.1 32.8 0z"/>
    <path fill="#C0AD9E" d="M159.3 268.2l39.1-39.1-6.3 39.1-32.8 0z"/>
    <path fill="#161616" d="M123.6 151.7l-13.6 39.1 20.4-6.3-6.8-32.8z"/>
    <path fill="#161616" d="M195 151.7l13.6 39.1-20.4-6.3 6.8-32.8z"/>
    <path fill="#763D16" d="M257.3 255.4l-25.5-51.4-66.2 12.7 91.7 38.7z"/>
    <path fill="#763D16" d="M61.3 255.4l25.5-51.4 66.2 12.7-91.7 38.7z"/>
    <path fill="#F6851B" d="M312.2 143.5l-49.9 8.2 13.6 63.3 36.3-71.5z"/>
    <path fill="#F6851B" d="M6.4 143.5l49.9 8.2-13.6 63.3-36.3-71.5z"/>
    <path fill="#F6851B" d="M159.3 118.1l-68.7-51.4 13.6 31.8h110.2l13.6-31.8-68.7 51.4z"/>
  </svg>
);

export default function Web3TransferForm() {
  const { address, balance, isConnected, login, sendTransaction } = useWeb3();
  const { user } = useUser();
  const db = useFirestore();

  const [selectedAsset, setSelectedAsset] = useState<Web3Asset>(WEB3_ASSETS[0]);
  const [amount, setAmount] = useState("0.05");
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
        const depositRef = `WEB3-DEP-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        await addDoc(collection(db, `users/${user.uid}/transactions`), {
          type: "Web3 Transfer",
          asset: `${selectedAsset.symbol} (${selectedAsset.network})`,
          amount: parseFloat(amount) * (selectedAsset.id === 'eth' ? 3500 : 1), // Simplified conversion
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
          message: `Transaction ${hash.slice(0, 10)}... has been broadcast. Your balance will be provisioned upon 12 network confirmations.`
        });
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
    <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm space-y-8">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#F7F7F5] pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center rounded-none shadow-inner">
            <MetaMaskIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Decentralized Transfer</h3>
            <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-tight">Direct MetaMask Protocol</p>
          </div>
        </div>
        {!isConnected ? (
          <button 
            onClick={login}
            className="px-8 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center gap-2 shadow-lg"
          >
            <MetaMaskIcon className="w-4 h-4" />
            Connect MetaMask
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#16835B]/10 border border-[#16835B] rounded-none">
            <div className="w-1.5 h-1.5 rounded-full bg-[#16835B] animate-pulse"></div>
            <span className="text-[10px] font-bold text-[#16835B] uppercase tracking-widest">Node Linked</span>
          </div>
        )}
      </div>

      {isConnected ? (
        <form onSubmit={handleTransfer} className="space-y-8 animate-in fade-in duration-300">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              Select Asset Domain
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {WEB3_ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    "p-4 border text-left flex flex-col justify-between transition-all relative group",
                    selectedAsset.id === asset.id 
                      ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" 
                      : "bg-white text-[#0A0A0A] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn("font-bold text-xs font-mono", selectedAsset.id === asset.id ? "text-white" : asset.iconColor)}>
                      {asset.symbol}
                    </span>
                    {selectedAsset.id === asset.id && <Check className="w-3.5 h-3.5 text-[#16835B]" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold block truncate uppercase">{asset.name}</span>
                    <span className={cn("text-[8px] uppercase tracking-widest block truncate", selectedAsset.id === asset.id ? "text-white/40" : "text-[#6B7280]")}>
                      {asset.network}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block">Transfer Quantity ({selectedAsset.symbol})</label>
              <input 
                type="number" 
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-2xl font-mono font-bold focus:border-[#0055FF] outline-none text-[#0A0A0A]"
                required
              />
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] text-[#6B7280] font-bold uppercase">Estimated Value: ${formatNumber(parseFloat(amount) * (selectedAsset.id === 'eth' ? 3500 : 1), { maximumFractionDigits: 2 })} USD</span>
                <span className="text-[9px] text-[#6B7280] font-mono">Available: {parseFloat(balance || "0").toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block">Recipient Domain</label>
              <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">Institutional Hot Wallet</span>
                  <span className="text-xs font-mono font-bold text-[#0A0A0A] truncate max-w-[180px] block">{COMPANY_HOT_WALLET}</span>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#16835B]" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-[#0055FF] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
              On-chain transfers are non-reversible. Once broadcast to the network, capital is routed to the Varban Markets Institutional Vault. Payouts are synchronized automatically after blockchain confirmation thresholds are satisfied.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full btn-institutional-primary py-5 flex items-center justify-center gap-3 shadow-xl transform active:scale-[0.99] transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting to Decentralized Node...</span>
              </>
            ) : (
              <>
                <MetaMaskIcon className="w-4 h-4" />
                <span>Execute {selectedAsset.symbol} On-Chain Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center mx-auto shadow-inner">
            <MetaMaskIcon className="w-12 h-12 grayscale opacity-20" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">MetaMask Node Offline</h4>
            <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">
              Establish a secure decentralized link to perform automated on-chain capital transfers.
            </p>
          </div>
          <button 
            onClick={login}
            className="btn-institutional-primary px-12 py-4 shadow-xl flex items-center gap-2 mx-auto"
          >
            <MetaMaskIcon className="w-4 h-4" />
            Connect MetaMask
          </button>
        </div>
      )}
    </Card>
  );
}

function formatNumber(val: number, options: any) {
  return new Intl.NumberFormat('en-US', options).format(val);
}
