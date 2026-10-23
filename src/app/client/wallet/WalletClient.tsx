"use client";

/**
 * @fileOverview Unified Financial Workspace (Wallet).
 * Handles deposits (M-Pesa, Web3, Crypto), withdrawals, and transaction history.
 * Hardened: Optimized imports to resolve ChunkLoadErrors.
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Activity, 
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Globe,
  Smartphone,
  Check,
  Loader2
} from "lucide-react";
import { useUser, useDoc, useCollection, useFirestore } from "@/firebase";
import { useWeb3 } from "@/app/lib/web3-context";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import PageTutorial from "@/components/shared/PageTutorial";
import CryptoDepositForm from "@/components/CryptoDepositForm";
import CryptoWithdrawForm from "@/components/CryptoWithdrawForm";
import Web3TransferForm from "@/components/wallet/Web3TransferForm";
import MpesaDepositForm from "@/components/wallet/MpesaDepositForm";
import { TransactionReceipt } from "@/components/wallet/TransactionReceipt";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

// Heavy libraries imported dynamically or handled carefully to avoid ChunkLoadErrors
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type FundTab = 'overview' | 'deposit' | 'withdraw' | 'activity';
type DepositMethod = 'web3' | 'crypto' | 'mpesa';

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

export default function WalletClient() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatNumber, formatDate } = useTranslation();
  const { isConnected, address, login, logout } = useWeb3();

  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const txQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, `users/${user.uid}/transactions`), orderBy("timestamp", "desc"), limit(50));
  }, [db, user]);

  const positionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, `users/${user.uid}/positions`), where("status", "==", "Open"));
  }, [db, user]);

  const { data: transactions, loading: txLoading } = useCollection<any>(txQuery);
  const { data: positions, loading: positionsLoading } = useCollection<any>(positionsQuery);
  
  const [activeTab, setActiveTab] = useState<FundTab>('overview');
  const [depositMethod, setDepositMethod] = useState<DepositMethod>('mpesa');
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  const [activeReceiptTx, setActiveReceiptTx] = useState<any>(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  const openRisk = useMemo(() => {
    if (!positions) return 0;
    return positions.reduce((acc: number, pos: any) => acc + (pos.stake || 0), 0);
  }, [positions]);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as FundTab;
    if (tabParam && ['overview', 'deposit', 'withdraw', 'activity'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
  }, []);

  const handleTabChange = (tab: FundTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/client/wallet?${params.toString()}`);
  };

  const handleDownloadReceipt = async (tx: any) => {
    setActiveReceiptTx(tx);
    setIsDownloadingReceipt(true);
    
    // We use a small delay to ensure the receipt component is rendered in the hidden DOM
    setTimeout(async () => {
      const element = document.getElementById('institutional-receipt-render');
      if (element) {
        try {
          const canvas = await html2canvas(element, { 
            scale: 2, 
            backgroundColor: "#FFFFFF", 
            logging: false,
            useCORS: true 
          });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ 
            orientation: 'portrait', 
            unit: 'mm', 
            format: [80, (canvas.height * 80) / canvas.width] 
          });
          pdf.addImage(imgData, 'PNG', 0, 0, 80, (canvas.height * 80) / canvas.width);
          pdf.save(`varban_receipt_${tx.id}.pdf`);
        } catch (err) { 
          console.error("Receipt generation failure:", err); 
        } finally { 
          setIsDownloadingReceipt(false); 
          setActiveReceiptTx(null); 
        }
      }
    }, 200);
  };

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;
  const activeEquity = accountMode === 'REAL' ? (profile?.equity || profile?.balance || 0) : demoBalance;

  return (
    <AuthedLayout title={t('nav.wallet')} subtitle="Unified financial administration and ledger workspace">
      <PageTutorial 
        steps={[
          { 
            selector: "#tour-fund-nav", 
            title: "Consolidated Cashier", 
            description: "Manage your entire capital lifecycle from this single workspace." 
          }
        ]} 
        storageKey="varban_consolidated_funds_tutorial" 
      />
      
      {/* Hidden container for PDF rendering */}
      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
        {activeReceiptTx && (
          <TransactionReceipt 
            id="institutional-receipt-render" 
            transaction={activeReceiptTx} 
            profile={{ ...profile, id: user?.uid }} 
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div id="tour-fund-nav" className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'deposit', label: t('wallet.deposit'), icon: ArrowDownCircle },
            { id: 'withdraw', label: t('wallet.withdraw'), icon: ArrowUpCircle },
            { id: 'activity', label: t('nav.transactions'), icon: Activity },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => handleTabChange(tab.id as FundTab)} 
              className={cn(
                "flex-1 min-w-[120px] py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center justify-center space-x-2 transition-all border-b-2", 
                activeTab === tab.id 
                  ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" 
                  : "border-transparent text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" /> 
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm md:col-span-2 relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">
                        {accountMode === 'REAL' ? t('wallet.liquidBalance') : t('wallet.practiceAllocation')}
                      </span>
                      <h2 className={cn("text-4xl font-mono font-bold tracking-tight", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
                        {profileLoading ? <Skeleton className="h-10 w-48" /> : `$${formatNumber(activeBalance, { minimumFractionDigits: 2 })}`}
                      </h2>
                      <div className="mt-6 flex gap-4">
                        <button 
                          onClick={() => handleTabChange('deposit')} 
                          className="px-5 py-2.5 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center gap-2 shadow-sm"
                        >
                          <ArrowDownLeft className="w-3 h-3 text-[#16835B]" /> {t('wallet.deposit')}
                        </button>
                        <button 
                          onClick={() => handleTabChange('withdraw')} 
                          className="px-5 py-2.5 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-all flex items-center gap-2 shadow-sm"
                        >
                          <ArrowUpRight className="w-3 h-3 text-[#0055FF]" /> {t('wallet.withdraw')}
                        </button>
                      </div>
                    </div>
                    <Wallet className="w-12 h-12 text-[#E4E4E4]" />
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055FF]/5 rounded-bl-full -z-0"></div>
                </Card>
                
                <Card className="bg-white text-[#0A0A0A] border-[#E4E4E4] p-8 shadow-sm border-l-4 border-l-[#0055FF]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-6">{t('wallet.accountMetrics')}</span>
                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] text-[#6B7280] uppercase block mb-1">{t('wallet.totalEquity')}</span>
                      <span className="text-xl font-mono font-bold text-[#0A0A0A]">
                        {profileLoading ? <Skeleton className="h-6 w-32" /> : `$${formatNumber(activeEquity, { minimumFractionDigits: 2 })}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#6B7280] uppercase block mb-1">{t('wallet.marketRisk')}</span>
                      <span className="text-xl font-mono font-bold text-[#C43D3D]">
                        {positionsLoading ? <Skeleton className="h-6 w-32" /> : `$${formatNumber(openRisk, { minimumFractionDigits: 2 })}`}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Web3 / MetaMask Connection Section */}
              <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center shadow-inner">
                    <MetaMaskIcon className={cn("w-7 h-7", isConnected ? "" : "grayscale opacity-20")} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Decentralized Link</h4>
                    <p className="text-[10px] text-[#6B7280] font-mono mt-1 font-bold uppercase">
                      {isConnected ? `ACTIVE: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'METAMASK NODE OFFLINE'}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <button onClick={logout} className="px-6 py-2 border border-[#C43D3D] text-[#C43D3D] text-[9px] font-bold uppercase tracking-widest hover:bg-[#C43D3D] hover:text-white transition-all">
                    Sever Connection
                  </button>
                ) : (
                  <button onClick={login} className="btn-institutional-primary px-8 flex items-center gap-2">
                    <MetaMaskIcon className="w-3.5 h-3.5" />
                    Link MetaMask
                  </button>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-12">
              {/* Method Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setDepositMethod('mpesa')}
                  className={cn(
                    "p-6 border flex items-center gap-4 transition-all rounded-none",
                    depositMethod === 'mpesa' ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" : "bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
                  )}
                >
                  <Smartphone className={cn("w-6 h-6", depositMethod === 'mpesa' ? "text-[#16835B]" : "text-[#6B7280]")} />
                  <div className="text-left">
                    <span className="text-xs font-bold uppercase block tracking-wider">M-Pesa Express</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-60">Mobile Money (KES)</span>
                  </div>
                </button>
                <button 
                  onClick={() => setDepositMethod('web3')}
                  className={cn(
                    "p-6 border flex items-center gap-4 transition-all rounded-none",
                    depositMethod === 'web3' ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" : "bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
                  )}
                >
                  <MetaMaskIcon className={cn("w-6 h-6", depositMethod === 'web3' ? "" : "grayscale")} />
                  <div className="text-left">
                    <span className="text-xs font-bold uppercase block tracking-wider">MetaMask Web3</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-60">Smart Contract (ETH)</span>
                  </div>
                </button>
                <button 
                  onClick={() => setDepositMethod('crypto')}
                  className={cn(
                    "p-6 border flex items-center gap-4 transition-all rounded-none",
                    depositMethod === 'crypto' ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" : "bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
                  )}
                >
                  <Globe className={cn("w-6 h-6", depositMethod === 'crypto' ? "text-[#0055FF]" : "text-[#6B7280]")} />
                  <div className="text-left">
                    <span className="text-xs font-bold uppercase block tracking-wider">Manual Crypto</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-60">Any Wallet (BTC/USDT)</span>
                  </div>
                </button>
              </div>

              {/* Dynamic Form Render */}
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {depositMethod === 'mpesa' && <MpesaDepositForm />}
                {depositMethod === 'web3' && <Web3TransferForm />}
                {depositMethod === 'crypto' && <CryptoDepositForm />}
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="space-y-6">
              <CryptoWithdrawForm />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4] text-[#6B7280] text-[9px] font-bold uppercase tracking-widest">
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">{t('tables.reference')}</th>
                        <th className="p-4">Operation</th>
                        <th className="p-4 text-right">Value</th>
                        <th className="p-4 text-center">{t('common.status')}</th>
                        <th className="p-4 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E4] text-[10px] font-mono">
                      {txLoading ? (
                        <tr><td colSpan={6} className="p-12 text-center">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#0055FF]" />
                        </td></tr>
                      ) : transactions.length === 0 ? (
                        <tr><td colSpan={6} className="p-12 text-center uppercase tracking-widest font-bold opacity-30">No activity detected.</td></tr>
                      ) : transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-[#F7F7F5] transition-colors group">
                          <td className="p-4">{tx.timestamp?.toDate ? formatDate(tx.timestamp.toDate()) : '---'}</td>
                          <td className="p-4 uppercase">{tx.ref || tx.id.slice(0, 10)}</td>
                          <td className="p-4">{tx.type}</td>
                          <td className="p-4 text-right">${formatNumber(tx.amount || 0, { minimumFractionDigits: 2 })}</td>
                          <td className="p-4 text-center">
                             <span className={cn(
                               "px-2 py-0.5 border text-[9px] font-bold uppercase", 
                               tx.status === 'Confirmed' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : 
                               tx.status === 'Pending' ? "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5" :
                               "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5"
                             )}>
                               {tx.status}
                             </span>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => handleDownloadReceipt(tx)} 
                              disabled={isDownloadingReceipt} 
                              className="p-1.5 border border-[#E4E4E4] bg-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#0055FF] hover:text-white disabled:opacity-30"
                              title="Download Receipt"
                            >
                              {isDownloadingReceipt && activeReceiptTx?.id === tx.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
          <Shield className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            {t('wallet.transparencyNotice')}: All financial activity is logged in our immutable ledger. Payout speeds depend on the destination network or banking clearing cycle.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}
