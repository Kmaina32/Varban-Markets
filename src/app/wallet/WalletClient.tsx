"use client";

/**
 * @fileOverview Consolidated Wallet Hub Client Component.
 * Migrated to Supabase for ledger and capital management.
 */

import { useState, useEffect } from "react";
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
import { useUser } from "@/firebase";
import { createClient } from "@/app/lib/supabase/client";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";
import CryptoDepositForm from "@/components/CryptoDepositForm";
import CryptoWithdrawForm from "@/components/CryptoWithdrawForm";
import dynamic from "next/dynamic";
import { TransactionReceipt } from "@/components/wallet/TransactionReceipt";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatNumber, formatDate } = useTranslation();

  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

    async function loadData() {
      if (!user?.uid) return;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.uid)
          .single();
        if (profileData) setProfile(profileData);

        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false })
          .limit(50);
        if (txData) setTransactions(txData);
      } catch (e) {
        console.error("Wallet Load Error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid, searchParams, supabase]);

  const handleTabChange = (tab: FundTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/wallet?${params.toString()}`);
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

  const [withdrawAmount, setWithdrawAmount] = useState("500");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutToken, setPayoutToken] = useState<string | null>(null);
  const [withdrawGateway, setWithdrawGateway] = useState<'CRYPTO' | 'FIAT'>('CRYPTO');
  const [depositGateway, setDepositGateway] = useState<'CRYPTO' | 'FIAT'>('CRYPTO');

  const handleFiatWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isProcessing) return;
    const amountNum = parseFloat(withdrawAmount);
    if (amountNum > (profile?.balance || 0)) { alert("Insufficient Balance"); return; }
    setIsProcessing(true);
    try {
      // Logic for withdrawal initiation goes here
      setPayoutToken(`WTH-${Math.random().toString(36).substring(7).toUpperCase()}`);
    } catch (err) { alert("Remittance Handshake Error."); }
    finally { setIsProcessing(false); }
  };

  const tutorialSteps: TutorialStep[] = [
    { selector: "#tour-fund-nav", title: "Consolidated Cashier", description: "Manage your entire capital lifecycle from this single workspace." },
    { selector: "#tour-fund-stats", title: "Real-time Auditing", description: "Monitor your available balance, equity, and open risk." }
  ];

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;
  const activeEquity = accountMode === 'REAL' ? (profile?.equity || profile?.balance || 0) : demoBalance;

  return (
    <AuthedLayout title="Capital Hub" subtitle="Unified financial administration and ledger workspace">
      <PageTutorial steps={tutorialSteps} storageKey="varban_consolidated_funds_tutorial" />
      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
        {activeReceiptTx && <TransactionReceipt id="institutional-receipt-render" transaction={activeReceiptTx} profile={{ ...profile, id: user?.uid }} />}
      </div>
      <div className="max-w-6xl mx-auto space-y-6">
        <div id="tour-fund-nav" className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'deposit', label: 'Add Money', icon: ArrowDownCircle },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowUpCircle },
            { id: 'activity', label: 'Activity Log', icon: Activity },
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
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">{accountMode === 'REAL' ? 'Liquid Balance' : 'Practice Allocation'}</span>
                      <h2 className={cn("text-4xl font-mono font-bold tracking-tight", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>{loading ? "..." : `$${formatNumber(activeBalance, { minimumFractionDigits: 2 })}`}</h2>
                      <div className="mt-6 flex gap-4">
                        <button onClick={() => handleTabChange('deposit')} className="px-5 py-2.5 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center gap-2"><ArrowDownLeft className="w-3 h-3 text-[#16835B]" /> Add Funds</button>
                        <button onClick={() => handleTabChange('withdraw')} className="px-5 py-2.5 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-all flex items-center gap-2"><ArrowUpRight className="w-3 h-3 text-[#0055FF]" /> Withdraw</button>
                      </div>
                    </div>
                    <Wallet className="w-12 h-12 text-[#E4E4E4]" />
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055FF]/5 rounded-bl-full -z-0"></div>
                </Card>
                <Card className="bg-white text-[#0A0A0A] border-[#E4E4E4] p-8 shadow-sm border-l-4 border-l-[#0055FF]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-6">Account Metrics</span>
                  <div className="space-y-6">
                    <div><span className="text-[9px] text-[#6B7280] uppercase block mb-1">Total Equity</span><span className="text-xl font-mono font-bold text-[#0A0A0A]">${formatNumber(activeEquity, { minimumFractionDigits: 2 })}</span></div>
                    <div><span className="text-[9px] text-[#6B7280] uppercase block mb-1">Market Risk</span><span className="text-xl font-mono font-bold text-[#C43D3D]">${formatNumber(0, { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          {activeTab === 'deposit' && (
            <div className="space-y-6">
              <div className="flex border-b border-[#E4E4E4] bg-white p-1">
                <button onClick={() => setDepositGateway('CRYPTO')} className={cn("flex-1 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2", depositGateway === 'CRYPTO' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]")}><Bitcoin className="w-3.5 h-3.5" /> Blockchain Network</button>
                <button onClick={() => setDepositGateway('FIAT')} className={cn("flex-1 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2", depositGateway === 'FIAT' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]")}><CreditCard className="w-3.5 h-3.5" /> Card / Bank Transfer</button>
              </div>
              {depositGateway === 'CRYPTO' ? <CryptoDepositForm /> : <PaystackDepositForm />}
            </div>
          )}
          {activeTab === 'withdraw' && (
            <div className="space-y-6">
              <div className="flex border-b border-[#E4E4E4] bg-white p-1">
                <button onClick={() => setWithdrawGateway('CRYPTO')} className={cn("flex-1 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2", withdrawGateway === 'CRYPTO' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]")}><Bitcoin className="w-3.5 h-3.5" /> Crypto Wallet</button>
                <button onClick={() => setWithdrawGateway('FIAT')} className={cn("flex-1 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2", withdrawGateway === 'FIAT' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]")}><Building2 className="w-3.5 h-3.5" /> Bank Account</button>
              </div>
              {withdrawGateway === 'CRYPTO' ? <CryptoWithdrawForm /> : (
                <div className="space-y-6">
                  {payoutToken && <div className="bg-[#16835B]/10 border border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]"><Check className="w-5 h-5 shrink-0 mt-0.5" /><div><span className="text-[10px] font-bold uppercase block mb-1">Remittance Initiated</span><p className="font-mono text-[11px] text-[#6B7280]">Request Ref: {payoutToken}</p></div></div>}
                  <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm"><form onSubmit={handleFiatWithdraw} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1.5">Amount to Withdraw</label><input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A]" required /></div><div><label className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1.5">Currency</label><select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-sm font-bold appearance-none cursor-pointer focus:outline-none">{PAYSTACK_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="p-3 border border-[#E4E4E4] text-xs uppercase font-bold focus:outline-none focus:border-[#0055FF]" required /><input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="p-3 border border-[#E4E4E4] text-xs font-mono focus:outline-none focus:border-[#0055FF]" required maxLength={12} /></div><button type="submit" disabled={isProcessing} className="w-full btn-institutional-primary py-4">{isProcessing ? "Authorizing..." : "Authorize Bank Remittance"}</button></form></Card>
                </div>
              )}
            </div>
          )}
          {activeTab === 'activity' && (
            <div id="tour-fund-activity" className="space-y-6">
              <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left border-collapse min-w-[1000px]"><thead><tr className="bg-[#F7F7F5] border-b border-[#E4E4E4] text-[#6B7280] text-[9px] font-bold uppercase tracking-widest"><th className="p-4">Timestamp</th><th className="p-4">Reference</th><th className="p-4">Operation</th><th className="p-4 text-right">Value</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Receipt</th></tr></thead><tbody className="divide-y divide-[#E4E4E4] text-[10px] font-mono">{loading ? <tr><td colSpan={6} className="p-12 text-center">Loading...</td></tr> : transactions.length === 0 ? <tr><td colSpan={6} className="p-12 text-center uppercase tracking-widest font-bold opacity-30">No activity detected.</td></tr> : transactions.map((tx: any) => (<tr key={tx.id} className="hover:bg-[#F7F7F5] transition-colors group"><td className="p-4">{new Date(tx.created_at).toLocaleString()}</td><td className="p-4">{tx.id.slice(0, 10).toUpperCase()}</td><td className="p-4">{tx.type}</td><td className="p-4 text-right">${formatNumber(tx.amount || 0, { minimumFractionDigits: 2 })}</td><td className="p-4 text-center">{tx.status}</td><td className="p-4 text-center"><button onClick={() => handleDownloadReceipt(tx)} disabled={isDownloadingReceipt} className="p-1.5 border border-[#E4E4E4] bg-white opacity-0 group-hover:opacity-100 transition-all"><Download className="w-3.5 h-3.5" /></button></td></tr>))}</tbody></table></div></Card>
            </div>
          )}
        </div>
        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3"><Shield className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" /><p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">Varban Markets operates with total transparency.</p></div>
      </div>
    </AuthedLayout>
  );
}
