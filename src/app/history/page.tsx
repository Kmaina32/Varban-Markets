"use client";

/**
 * @fileOverview Institutional Execution History archive.
 * Fully localized for international markets.
 */

import { useMemo, useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, Download, AlertCircle } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";

export default function TradeHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber, formatDate } = useTranslation();

  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
  }, []);

  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      where("status", "==", "Closed"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: allHistory, loading } = useCollection<any>(historyQuery);

  const history = useMemo(() => {
    return allHistory?.filter((h: any) => (h.isDemo || false) === (accountMode === 'DEMO')) || [];
  }, [allHistory, accountMode]);

  return (
    <AuthedLayout title={t('pages.historyTitle')} subtitle={`${accountMode} Execution Archive`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-grow max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder={t('common.search')} 
              className="w-full pl-9 pr-4 py-2 border border-[#E4E4E4] text-[10px] focus:outline-none focus:border-[#0055FF] bg-white shadow-sm" 
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-2 border border-[#E4E4E4] bg-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] shadow-sm transition-all">
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7F5] border-b text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">
                <tr>
                  <th className="p-4">{t('tables.reference')}</th>
                  <th className="p-4">{t('tables.instrument')}</th>
                  <th className="p-4">{t('tables.type')}</th>
                  <th className="p-4 text-right">{t('tables.stake')}</th>
                  <th className="p-4 text-right">{t('tables.outcome')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] font-mono text-[10px]">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center text-[#6B7280] uppercase font-bold">{t('common.loading')}</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-[#6B7280] uppercase tracking-widest font-bold opacity-30">No execution records in this domain.</td></tr>
                ) : history.map(h => (
                  <tr key={h.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4 text-[#6B7280]">{h.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 font-bold text-[#0A0A0A]">{h.instrument}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-1.5 py-0.5 border text-[9px] font-bold",
                        h.vector === 'CALL' ? "border-[#16835B] text-[#16835B]" : "border-[#C43D3D] text-[#C43D3D]"
                      )}>
                        {h.vector}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#0A0A0A]">${formatNumber(h.stake || 0, { minimumFractionDigits: 2 })}</td>
                    <td className={cn(
                      "p-4 text-right font-bold",
                      (h.profit || 0) >= 0 ? 'text-[#16835B]' : 'text-[#C43D3D]'
                    )}>
                      {(h.profit || 0) >= 0 ? '+' : ''}${formatNumber(h.profit || 0, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center space-x-3 text-[#6B7280]">
          <AlertCircle className="w-4 h-4 text-[#0055FF]" />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Historical ledger synchronization is currently processing. All trades remain registered in the immutable core database.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}