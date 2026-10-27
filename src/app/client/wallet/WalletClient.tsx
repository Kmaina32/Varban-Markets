"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Activity, 
  Bitcoin, 
  Building2, 
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Check,
  Shield
} from "lucide-react";
import { useUser, useDoc, useCollection, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";
import CryptoDepositForm from "@/components/CryptoDepositForm";
import CryptoWithdrawForm from "@/components/CryptoWithdrawForm";
import dynamic from "next/dynamic";
import { TransactionReceipt } from "@/components/wallet/TransactionReceipt";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { collection, query, orderBy, limit } from "firebase/firestore";

const PaystackDepositForm = dynamic(() => import("@/components/PaystackDepositForm"), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto p-12 text-center">
      <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">Synchronizing payment node...</p>
    </div>
  )
});

type FundTab = 'overview' | 'deposit' | 'withdraw' | 'activity';
const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];

export default function WalletClient() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatNumber, formatDate } = useTranslation();

  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const txQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, `users/${user.uid}/transactions`), orderBy("timestamp", "desc"), limit(50));
  }, [db, user]);

  const { data: transactions, loading: txLoading } = useCollection<any>(txQuery);
  
  const [activeTab, setActiveTab] = useState<FundTab>('overview');
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  const [activeReceiptTx, setActiveReceiptTx] = useState<any>(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as FundTab;
    if (tabParam && ['overview', 'deposit', 'withdraw', 'activity'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: FundTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/client/wallet?${params.toString()}`);
  };

  const handleDownloadReceipt = async (tx: any) => {
    setActiveReceiptTx(tx);
    setIsDownloadingReceipt(true);
    setTimeout(async () => {
      const element = document.getElementById('institutional-receipt-render');
      if (element) {
        try {
          const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#FFFFFF", logging: false });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, (canvas.height * 80) / canvas.width] });
          pdf.addImage(imgData, 'PNG', 0, 0, 80, (canvas.height * 80) / canvas.width);
          pdf.save(`varban_receipt_${tx.id}.pdf`);
        } catch (err) { console.error("Receipt generation failure:", err); }
        finally { setIsDownloadingReceipt(false); setActiveReceiptTx(null); }
      }
    }, 100);
  };

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;
  const activeEquity = accountMode === 'REAL' ? (profile?.equity || profile?.balance || 0) : demoBalance;

  return (
    <AuthedLayout title={t('nav.wallet')} subtitle="Unified financial administration and ledger workspace">
      <PageTutorial steps={[{ selector: "#tour-fund-nav", title: "Consolidated Cashier", description: "Manage your entire capital lifecycle from this single workspace." }]} storageKey="varban_consolidated_funds_tutorial" />
      
      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
        {activeReceiptTx && <TransactionReceipt id="institutional-receipt-render" transaction={activeReceiptTx} profile={{ ...profile, id: user?.uid }} />}
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <div id="tour-fund-nav" className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'deposit', label: t('wallet.deposit'), icon: ArrowDownCircle },
            { id: 'withdraw', label: t('wallet.withdraw'), icon: ArrowUpCircle },
            { id: 'activity', label: t('nav.transactions'), icon: Activity },
          ].map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id as FundTab)} className={cn("flex-1 min-w-[120px] py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center justify-center space-x-2 transition-all border-b-2", activeTab === tab.id ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]")}>
              <tab.icon className="w-3.5 h-3.5" /> <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div id="tour-fund-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm md:col-span-2 relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">{accountMode === 'REAL' ? t('wallet.liquidBalance') : t('wallet.practiceAllocation')}</span>
                      <h2 className={cn("text-4xl font-mono font-bold tracking-tight", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>{profileLoading ? "..." : `$${formatNumber(activeBalance, { minimumFractionDigits: 2 })}`}</h2>
                      <div className="mt-6 flex gap-4">
                        <button onClick={() => handleTabChange('deposit')} className="px-5 py-2.5 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center gap-2 rounded-xl"><ArrowDownLeft className="w-3 h-3 text-[#16835B]" /> {t('wallet.deposit')}</button>
                        <button onClick={() => handleTabChange('withdraw')} className="px-5 py-2.5 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-all flex items-center gap-2 rounded-xl"><ArrowUpRight className="w-3 h-3 text-[#0055FF]" /> {t('wallet.withdraw')}</button>
                      </div>
                    </div>
                    <Wallet className="w-12 h-12 text-[#E4E4E4]" />
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055FF]/5 rounded-bl-full -z-0"></div>
                </Card>
                <Card className="bg-white text-[#0A0A0A] border-[#E4E4E4] p-8 shadow-sm border-l-4 border-l-[#0055FF]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-6">{t('wallet.accountMetrics')}</span>
                  <div className="space-y-6">
                    <div><span className="text-[9px] text-[#6B7280] uppercase block mb-1">{t('wallet.totalEquity')}</span><span className="text-xl font-mono font-bold text-[#0A0A0A]">${formatNumber(activeEquity, { minimumFractionDigits: 2 })}</span></div>
                    <div><span className="text-[9px] text-[#6B7280] uppercase block mb-1">{t('wallet.marketRisk')}</span><span className="text-xl font-mono font-bold text-[#C43D3D]">${formatNumber(0, { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          {activeTab === 'deposit' && (
            <div className="space-y-6">
              <CryptoDepositForm />
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
                        <tr><td colSpan={6} className="p-12 text-center">{t('common.loading')}</td></tr>
                      ) : transactions.length === 0 ? (
                        <tr><td colSpan={6} className="p-12 text-center uppercase tracking-widest font-bold opacity-30">No activity detected.</td></tr>
                      ) : transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-[#F7F7F5] transition-colors group">
                          <td className="p-4">{tx.timestamp?.toDate ? formatDate(tx.timestamp.toDate()) : '---'}</td>
                          <td className="p-4 uppercase">{tx.ref || tx.id.slice(0, 10)}</td>
                          <td className="p-4">{tx.type}</td>
                          <td className="p-4 text-right">${formatNumber(tx.amount || 0, { minimumFractionDigits: 2 })}</td>
                          <td className="p-4 text-center">
                             <span className={cn("px-2 py-0.5 border text-[9px] font-bold uppercase rounded-lg", tx.status === 'Confirmed' ? "border-[#16835B] text-[#16835B]" : "border-[#C9A227] text-[#C9A227]")}>
                               {tx.status}
                             </span>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleDownloadReceipt(tx)} disabled={isDownloadingReceipt} className="p-1.5 border border-[#E4E4E4] bg-white opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                              <Download className="w-3.5 h-3.5" />
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
        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3 rounded-2xl"><Shield className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" /><p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">{t('wallet.transparencyNotice')}</p></div>
      </div>
    </AuthedLayout>
  );
}