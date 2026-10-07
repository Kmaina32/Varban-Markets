"use client";

/**
 * @fileOverview Trade History Workspace.
 * Hardened against null database references.
 */

import { useMemo, useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, Filter, Download, AlertCircle } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
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
            <input type="text" placeholder="Search archive..." className="w-full pl-9 pr-4 py-2 border border-[#E4E4E4] text-[10px] focus:outline-none" />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-[#E4E4E4] bg-white text-[10px] font-bold uppercase hover:bg-[#F7F7F5]">
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7F5] border-b text-[9px] font-bold uppercase text-[#6B7280]">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Instrument</th>
                  <th className="p-4">Vector</th>
                  <th className="p-4 text-right">Stake</th>
                  <th className="p-4 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] font-mono">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center text-[#6B7280]">Synchronizing Ledger...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-[#6B7280]">No execution records in this domain.</td></tr>
                ) : history.map(h => (
                  <tr key={h.id} className="hover:bg-[#F7F7F5]">
                    <td className="p-4 text-[#6B7280]">{h.id.slice(0, 8)}</td>
                    <td className="p-4 font-bold">{h.instrument}</td>
                    <td className="p-4 font-bold uppercase">{h.vector}</td>
                    <td className="p-4 text-right">${formatNumber(h.stake || 0, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-bold text-[#16835B]">${formatNumber(h.profit || 0, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {!db && (
          <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center space-x-3 text-[#6B7280]">
            <AlertCircle className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Historical ledger synchronization is currently processing. All trades remain registered in the core database.
            </p>
          </div>
        )}
      </div>
    </AuthedLayout>
  );
}