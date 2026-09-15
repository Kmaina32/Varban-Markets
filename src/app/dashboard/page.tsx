'use client';

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, DollarSign, Activity, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useUser, useDoc, useCollection, useFirestore } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { useState, useEffect } from "react";

export default function UserDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();

  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  // High-performance account mode state allocation
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

  const tradesQuery = user ? query(
    collection(db!, `users/${user.uid}/positions`),
    orderBy("timestamp", "desc"),
    limit(5)
  ) : null;
  const { data: recentTrades, loading: tradesLoading } = useCollection<any>(tradesQuery);

  const watchlistQuery = user ? collection(db!, `users/${user.uid}/watchlist`) : null;
  const { data: watchlist, loading: watchlistLoading } = useCollection<any>(watchlistQuery);

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;
  const activeEquity = accountMode === 'REAL' ? (profile?.equity || profile?.balance || 0) : demoBalance;

  const metrics = [
    { title: accountMode === 'REAL' ? t('dashboard.balance') : 'Demo Balance', value: activeBalance, icon: DollarSign, color: accountMode === 'REAL' ? "text-[#16835B]" : "text-[#C9A227]" },
    { title: accountMode === 'REAL' ? t('dashboard.equity') : 'Demo Equity', value: activeEquity, icon: TrendingUp, color: "text-[#0A0A0A]" },
    { title: t('dashboard.openRisk'), value: accountMode === 'REAL' ? (profile?.openRisk || 0) : 0, icon: Shield, color: "text-[#C43D3D]" },
    { title: t('dashboard.dailyPL'), value: accountMode === 'REAL' ? (profile?.dailyPL || 0) : 0, icon: Activity, color: "text-[#16835B]" }
  ];

  return (
    <AuthedLayout title={t('nav.dashboard')}>
      <div className="space-y-8">
        {/* Account Mode Notice Bar */}
        {accountMode === 'DEMO' && (
          <div className="bg-[#C9A227]/10 border border-[#C9A227] p-3 text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
            Demo Practice Environment active. Open positions show simulated statistics.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <Card key={idx} className="bg-white border-[#E4E4E4] p-4 flex flex-col justify-between shadow-sm">
              <div className="flex flex-row items-center justify-between mb-2">
                <span className="text-[9px] text-[#6B7280] uppercase tracking-widest font-bold">{m.title}</span>
                <m.icon className="w-3.5 h-3.5 text-[#6B7280]" />
              </div>
              <div>
                <span className={`text-xl font-mono font-bold ${m.color}`}>
                  {profileLoading ? "..." : `$${formatNumber(m.value || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider">{t('dashboard.recentTrades')}</h3>
              <Link href="/history" className="text-[10px] font-bold text-[#C9A227] uppercase tracking-widest flex items-center">
                {t('dashboard.viewHistory')} <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </div>
            <Card className="bg-white border-[#E4E4E4]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                      <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase">{t('tables.reference')}</th>
                      <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase">{t('tables.asset')}</th>
                      <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase">{t('tables.type')}</th>
                      <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase text-right">{t('tables.stake')}</th>
                      <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase text-right">{t('tables.outcome')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E4] text-xs font-mono">
                    {accountMode === 'DEMO' ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-[#6B7280]">
                          Demo history is stored locally in your browser. Switch to Real Account for live ledger database logging.
                        </td>
                      </tr>
                    ) : tradesLoading ? (
                      <tr><td colSpan={5} className="p-4 text-center text-[#6B7280]">{t('common.loading')}</td></tr>
                    ) : recentTrades?.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-[#6B7280]">{t('trading.noPositions')}</td></tr>
                    ) : recentTrades?.map((trade: any) => (
                      <tr key={trade.id} className="hover:bg-[#F7F7F5]">
                        <td className="p-3 text-[#6B7280]">{trade.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-3 font-bold">{trade.instrument}</td>
                        <td className="p-3">
                          <span className={`px-1 py-0.5 border text-[9px] font-bold ${trade.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#C43D3D] text-[#C43D3D]'}`}>
                            {trade.vector}
                          </span>
                        </td>
                        <td className="p-3 text-right">${formatNumber(trade.stake || 0, { minimumFractionDigits: 2 })}</td>
                        <td className={`p-3 text-right font-bold ${trade.profit >= 0 ? 'text-[#16835B]' : 'text-[#C43D3D]'}`}>
                          {trade.profit >= 0 ? '+' : ''}${formatNumber(trade.profit || 0, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider">{t('dashboard.watchlist')}</h3>
              <Link href="/watchlist" className="text-[10px] font-bold text-[#C9A227] uppercase tracking-widest flex items-center">
                {t('dashboard.manageWatchlist')} <Star className="ml-1 w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {watchlistLoading ? (
                <p className="text-xs text-[#6B7280] text-center p-4">{t('common.loading')}</p>
              ) : watchlist?.length === 0 ? (
                <p className="text-xs text-[#6B7280] text-center p-4 border border-dashed border-[#E4E4E4]">{t('dashboard.emptyWatchlist')}</p>
              ) : watchlist?.map((item: any) => (
                <Link href={`/terminal?symbol=${item.symbol}`} key={item.symbol} className="bg-white border border-[#E4E4E4] p-3 flex justify-between items-center shadow-sm hover:border-[#C9A227] transition-colors cursor-pointer">
                  <div>
                    <span className="text-[10px] font-mono font-bold block">{item.symbol}</span>
                    <span className="text-[9px] text-[#6B7280] uppercase">{t('tables.asset')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold block">{t('dashboard.live')}</span>
                    <span className="text-[9px] font-mono text-[#16835B]">{t('dashboard.viewTerminal')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
