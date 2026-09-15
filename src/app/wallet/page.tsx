'use client';

import { useState, useMemo, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useUser, useDoc, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

export default function WalletPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber, formatDate } = useTranslation();

  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  // High-performance account mode allocation
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

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

  const txQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy("timestamp", "desc"),
      limit(5)
    );
  }, [db, user]);

  const { data: recentTxs, loading: txLoading } = useCollection<any>(txQuery);

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;
  const activeEquity = accountMode === 'REAL' ? (profile?.equity || profile?.balance || 0) : demoBalance;

  return (
    <AuthedLayout 
      title={t('nav.wallet')} 
      subtitle="Capital allocation and historical balance accounting"
    >
      <div className="max-w-5xl mx-auto space-y-8 text-[#0A0A0A]">
        {accountMode === 'DEMO' && (
          <div className="bg-[#C9A227]/10 border border-[#C9A227] p-3 text-[10px] font-bold uppercase tracking-wider text-[#C9A227] flex justify-between items-center">
            <span>Demo Mode Simulator has zero capital risk thresholds.</span>
            <button 
              onClick={() => {
                setDemoBalance(10000);
                localStorage.setItem('varban_demo_balance', '10000');
                window.dispatchEvent(new Event('varban_account_mode_changed'));
              }}
              className="underline text-xs"
            >
              Reset Demo Balance
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm md:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">
                  {accountMode === 'REAL' ? t('wallet.available') : 'Demo Practice Balance'}
                </span>
                <h2 className={cn("text-3xl font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#C9A227]")}>
                  {profileLoading ? "..." : `$${formatNumber(activeBalance, { minimumFractionDigits: 2 })}`}
                </h2>
              </div>
              <Wallet className="w-6 h-6 text-[#C9A227]" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/deposit" className="flex items-center justify-center space-x-2 p-4 border border-[#E4E4E4] bg-[#F7F7F5] hover:bg-white transition-colors">
                <ArrowDownCircle className="w-4 h-4 text-[#16835B]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('wallet.depositBtn')}</span>
              </Link>
              <Link href="/withdraw" className="flex items-center justify-center space-x-2 p-4 border border-[#E4E4E4] bg-[#F7F7F5] hover:bg-white transition-colors">
                <ArrowUpCircle className="w-4 h-4 text-[#C43D3D]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('wallet.withdrawBtn')}</span>
              </Link>
            </div>
          </Card>

          <Card className="bg-[#0A0A0A] text-white p-6 shadow-sm border border-[#0A0A0A]">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-4">
              {t('wallet.metrics')}
            </span>
            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-[#6B7280] uppercase block">{t('wallet.equity')}</span>
                <span className="text-lg font-mono font-bold">${formatNumber(activeEquity, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#6B7280] uppercase block">{t('wallet.risk')}</span>
                <span className="text-lg font-mono font-bold">${formatNumber(accountMode === 'REAL' ? (profile?.openRisk || 0) : 0, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider">{t('wallet.recentTx')}</h3>
            <Link href="/transactions" className="text-[9px] font-bold text-[#C9A227] uppercase tracking-widest">
              {t('wallet.viewAll')}
            </Link>
          </div>
          <Card className="bg-white border-[#E4E4E4] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase">{t('wallet.type')}</th>
                  <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase">{t('wallet.status')}</th>
                  <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase text-right">{t('wallet.amount')}</th>
                  <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase text-right">{t('wallet.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs font-mono">
                {accountMode === 'DEMO' ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-[#6B7280]">
                      Transaction logs are preserved for the Real Account space.
                    </td>
                  </tr>
                ) : txLoading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-[#6B7280]">Loading...</td></tr>
                ) : recentTxs?.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-[#6B7280]">{t('wallet.noTx')}</td></tr>
                ) : recentTxs?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#F7F7F5]">
                    <td className="p-3 font-bold">{tx.type}</td>
                    <td className="p-3 uppercase text-[9px]">{tx.status}</td>
                    <td className="p-3 text-right">${formatNumber(tx.amount, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right text-[#6B7280]">
                      {tx.timestamp?.toDate ? formatDate(tx.timestamp.toDate()) : "..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </AuthedLayout>
  );
}
