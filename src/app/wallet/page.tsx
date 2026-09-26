'use client';

/**
 * @fileOverview Master Capital Management Hub.
 * Consolidates Wallet Overview, Deposit, Withdraw, and Transaction Activity into one unified workspace.
 */

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Activity, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock,
  Bitcoin,
  Building2,
  CreditCard,
  History,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react";
import { useUser, useDoc, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, where, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";
import CryptoDepositForm from "@/components/CryptoDepositForm";
import CryptoWithdrawForm from "@/components/CryptoWithdrawForm";
import dynamic from "next/dynamic";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

export default function WalletPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatNumber, formatDate } = useTranslation();

  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [activeTab, setActiveTab] = useState<FundTab>('overview');
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  // Sync state with URL params
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
    router.replace(`/wallet?${params.toString()}`);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    const savedDemo = localStorage.getItem('varban_demo_balance');
    if (savedDemo) setDemoBalance(parseFloat(savedDemo));
  }, []);

  useEffect(() => {
    const handleGlobalChange = () => {
      const mode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
      if (mode) setAccountMode(mode);
      const savedDemo = localStorage.getItem('varban_demo_balance');
      if (savedDemo) setDemoBalance(parseFloat(savedDemo));
    };
    window.addEventListener('varban_account_mode_changed', handleGlobalChange);
    return () => window.removeEventListener('varban_account_mode_changed', handleGlobalChange);
  }, []);

  // Transaction Ledger Logic
  const [filterType, setFilterType] = useState<string>("All");
  const transactionsQuery = useMemo(() => {
    if (!db || !user || activeTab !== 'activity') return null;
    let q = query(collection(db, `users/${user.uid}/transactions`), orderBy("timestamp", "desc"), limit(50));
    if (filterType === "Trades") {
      q = query(q, where("type", "==", "Trade Settlement"));
    } else if (filterType === "Cashier") {
      q = query(q, where("type", "in", ["Vault Deposit", "Withdrawal", "Crypto Deposit", "Crypto Withdrawal"]));
    }
    return q;
  }, [db, user, filterType, activeTab]);

  const { data: transactions, loading: transactionsLoading } = useCollection<any>(transactionsQuery);

  // Fiat Withdraw Logic
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
    if (!user || !db) return;

    const amountNum = parseFloat(withdrawAmount);
    if (amountNum > (profile?.balance || 0)) {
      alert("Insufficient Balance: Request exceeds available capital.");
      return;
    }

    setIsProcessing(true);
    const refKey = `WTH-${Math.random().toString(36).substring(7).toUpperCase()}`;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        balance: increment(-amountNum),
        equity: increment(-amountNum)
      });

      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        type: "Withdrawal",
        asset: selectedCurrency,
        amount: amountNum,
        status: "Pending Verification",
        timestamp: serverTimestamp(),
        ref: refKey,
        currency: selectedCurrency,
        bankDetails: { bankName, accountNumber }
      });

      setPayoutToken(refKey);
    } catch (err) {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}`,
        operation: 'update',
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsProcessing(false);
    }
  };

  const tutorialSteps: TutorialStep[] = [
    {
      selector: "#tour-fund-nav",
      title: "Consolidated Cashier",
      description: "Manage your entire capital lifecycle from this single workspace. Switch between Overview, Deposits, and Withdrawals instantly."
    },
    {
      selector: "#tour-fund-stats",
      title: "Real-time Auditing",
      description: "Monitor your available balance, equity, and open risk across Real and Practice account modes."
    },
    {
      selector: "#tour-fund-activity",
      title: "Immutable Ledger",
      description: "Review every deposit, withdrawal, and trade settlement in the chronological activity log."
    }
  ];

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;
  const activeEquity = accountMode === 'REAL' ? (profile?.equity || profile?.balance || 0) : demoBalance;

  return (
    <AuthedLayout 
      title="Capital Hub" 
      subtitle="Unified financial administration and ledger workspace"
    >
      <PageTutorial steps={tutorialSteps} storageKey="varban_consolidated_funds_tutorial" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Master Tab Navigation */}
        <div id="tour-fund-nav" className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'deposit', label: 'Add Money', icon: ArrowDownCircle },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowUpCircle },
            { id: 'activity', label: 'Activity Log', icon: Activity },
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

        {/* Dynamic Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div id="tour-fund-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm md:col-span-2 relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">
                        {accountMode === 'REAL' ? 'Liquid Balance' : 'Practice Allocation'}
                      </span>
                      <h2 className={cn("text-4xl font-mono font-bold tracking-tight", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
                        {profileLoading ? "..." : `$${formatNumber(activeBalance, { minimumFractionDigits: 2 })}`}
                      </h2>
                      <div className="mt-6 flex gap-4">
                        <button onClick={() => handleTabChange('deposit')} className="px-5 py-2.5 bg-[#0A0A0A] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center gap-2">
                          <ArrowDownLeft className="w-3 h-3 text-[#16835B]" /> Add Funds
                        </button>
                        <button onClick={() => handleTabChange('withdraw')} className="px-5 py-2.5 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[9px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-all flex items-center gap-2">
                          <ArrowUpRight className="w-3 h-3 text-[#0055FF]" /> Withdraw
                        </button>
                      </div>
                    </div>
                    <Wallet className="w-12 h-12 text-[#E4E4E4]" />
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055FF]/5 rounded-bl-full -z-0"></div>
                </Card>

                <Card className="bg-white text-[#0A0A0A] border-[#E4E4E4] p-8 shadow-sm border-l-4 border-l-[#0055FF]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-6">Account Metrics</span>
                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] text-[#6B7280] uppercase block mb-1">Total Equity</span>
                      <span className="text-xl font-mono font-bold text-[#0A0A0A]">${formatNumber(activeEquity, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#6B7280] uppercase block mb-1">Market Risk</span>
                      <span className="text-xl font-mono font-bold text-[#C43D3D]">${formatNumber(accountMode === 'REAL' ? (profile?.openRisk || 0) : 0, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-4 border-t border-[#F7F7F5]">
                      <span className="text-[8px] font-bold uppercase text-[#6B7280]">Currency: <span className="text-[#0A0A0A] ml-1">{profile?.currency || 'USD'}</span></span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-[#F7F7F5] pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Network Integrity</h3>
                  <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-[#16835B]/10 text-[#16835B] border border-[#16835B]">Operational</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#0055FF]">Encryption</span>
                    <p className="text-[10px] text-[#6B7280] leading-relaxed">Transactions are protected by TLS 1.3 and military-grade AES-256 protocols.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#0055FF]">Auditing</span>
                    <p className="text-[10px] text-[#6B7280] leading-relaxed">Every capital move is logged with a unique millisecond hash for total auditability.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#0055FF]">Custody</span>
                    <p className="text-[10px] text-[#6B7280] leading-relaxed">Client funds are strictly segregated in Tier-1 institutional banking nodes.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: DEPOSIT */}
          {activeTab === 'deposit' && (
            <div className="space-y-6">
              <div className="flex border-b border-[#E4E4E4] bg-white p-1">
                <button onClick={() => setDepositGateway('CRYPTO')} className={cn("flex-1 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2", depositGateway === 'CRYPTO' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]")}>
                  <Bitcoin className="w-3.5 h-3.5" /> Blockchain Network
                </button>
                <button onClick={() => setDepositGateway('FIAT')} className={cn("flex-1 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2", depositGateway === 'FIAT' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]")}>
                  <CreditCard className="w-3.5 h-3.5" /> Card / Bank Transfer
                </button>
              </div>
              {depositGateway === 'CRYPTO' ? <CryptoDepositForm /> : <PaystackDepositForm />}
            </div>
          )}

          {/* TAB: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <div className="space-y-6">
              <div className="flex border-b border-[#E4E4E4] bg-white p-1">
                <button onClick={() => setWithdrawGateway('CRYPTO')} className={cn("flex-1 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2", withdrawGateway === 'CRYPTO' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]")}>
                  <Bitcoin className="w-3.5 h-3.5" /> Crypto Wallet
                </button>
                <button onClick={() => setWithdrawGateway('FIAT')} className={cn("flex-1 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2", withdrawGateway === 'FIAT' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]")}>
                  <Building2 className="w-3.5 h-3.5" /> Bank Account
                </button>
              </div>

              {withdrawGateway === 'CRYPTO' ? (
                <CryptoWithdrawForm />
              ) : (
                <div className="space-y-6">
                  {payoutToken && (
                    <div className="bg-[#16835B]/10 border border-[#16835B] p-4 flex items-start space-x-3 text-[#16835B]">
                      <Check className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase block mb-1">Remittance Initiated</span>
                        <p className="font-mono text-[11px] text-[#6B7280]">Request Ref: {payoutToken}. Expected clearance: 24-48 hours.</p>
                      </div>
                    </div>
                  )}
                  <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
                    <form onSubmit={handleFiatWithdraw} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1.5">Amount to Withdraw</label>
                          <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-xl font-mono font-bold focus:outline-none focus:border-[#0A0A0A]" required />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#6B7280] uppercase block mb-1.5">Currency</label>
                          <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-sm font-bold appearance-none cursor-pointer focus:outline-none">
                            {PAYSTACK_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="p-3 border border-[#E4E4E4] text-xs uppercase font-bold focus:outline-none focus:border-[#0055FF]" required />
                        <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="p-3 border border-[#E4E4E4] text-xs font-mono focus:outline-none focus:border-[#0055FF]" required maxLength={12} />
                      </div>
                      <button type="submit" disabled={isProcessing} className="w-full btn-institutional-primary py-4">
                        {isProcessing ? "Authorizing..." : "Authorize Bank Remittance"}
                      </button>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB: ACTIVITY */}
          {activeTab === 'activity' && (
            <div id="tour-fund-activity" className="space-y-6">
              <Card className="bg-white border-[#E4E4E4] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex space-x-2">
                  {["All", "Trades", "Cashier"].map((type) => (
                    <button key={type} onClick={() => setFilterType(type)} className={cn("text-[9px] font-bold uppercase px-4 py-2 border transition-all", filterType === type ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]')}>
                      {type} Scope
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                  <input type="text" placeholder="Search reference hash..." className="w-full text-[10px] pl-9 pr-3 py-2 bg-[#F7F7F5] border border-[#E4E4E4] focus:outline-none" />
                </div>
              </Card>

              <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4] text-[#6B7280] text-[9px] font-bold uppercase tracking-widest">
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Reference</th>
                        <th className="p-4">Operation</th>
                        <th className="p-4">Asset Domain</th>
                        <th className="p-4 text-right">Value</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E4] text-[10px] font-mono">
                      {transactionsLoading ? (
                        <tr><td colSpan={6} className="p-12 text-center text-[#6B7280]">Accessing platform ledger...</td></tr>
                      ) : transactions?.length === 0 ? (
                        <tr><td colSpan={6} className="p-12 text-center text-[#6B7280]">No activities recorded in this scope.</td></tr>
                      ) : transactions?.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-[#F7F7F5] transition-colors">
                          <td className="p-4 text-[#6B7280]">{tx.timestamp?.toDate ? formatDate(tx.timestamp.toDate()) : '---'}</td>
                          <td className="p-4 font-bold">{tx.ref || tx.id.slice(0, 10).toUpperCase()}</td>
                          <td className="p-4 text-[#0A0A0A]">{tx.type}</td>
                          <td className="p-4 text-[#6B7280] uppercase tracking-tighter">{tx.asset || 'USD'}</td>
                          <td className="p-4 text-right font-bold">${formatNumber(tx.amount || 0, { minimumFractionDigits: 2 })}</td>
                          <td className="p-4 text-center">
                            <span className={cn("px-2 py-0.5 border text-[8px] font-bold uppercase", tx.status === 'Confirmed' || tx.status === 'Settled' ? "border-[#16835B] text-[#16835B]" : "border-[#0055FF] text-[#0055FF]")}>
                              {tx.status}
                            </span>
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

        {/* Global Footer Notice */}
        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
          <Shield className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            Varban Markets operates with total transparency. All financial activities are subject to deterministic auditing protocols. Ensure identity verification is complete to unlock maximum withdrawal thresholds.
          </p>
        </div>

      </div>
    </AuthedLayout>
  );
}
