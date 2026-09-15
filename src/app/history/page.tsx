"use client";

import { useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, Filter, Download } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";

export default function TradeHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber, formatDate } = useTranslation();

  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      where("status", "==", "Closed"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: history, loading } = useCollection<any>(historyQuery);

  return (
    <AuthedLayout title={t('pages.historyTitle')}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
          <input 
            type="text" 
            placeholder={t('common.search')} 
            className="w-full bg-white border border-[#E4E4E4] text-[10px] pl-9 pr-4 py-2 focus:outline-none focus:border-[#0A0A0A]"
          />
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-wider hover:bg-[#F7F7F5] transition-colors">
            <Filter className="w-3 h-3" />
            <span>{t('common.filter')}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-wider hover:bg-[#F7F7F5] transition-colors">
            <Download className="w-3 h-3" />
            <span>{t('common.export')}</span>
          </button>
        </div>
      </div>

      <Card className="bg-white border-[#E4E4E4] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.date')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.reference')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.instrument')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.type')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('tables.stake')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('tables.netPL')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E4] text-xs font-mono">
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center text-[#6B7280]">{t('common.loading')}</td></tr>
            ) : history?.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-[#6B7280]">{t('trading.noPositions')}</td></tr>
            ) : history?.map((h) => (
              <tr key={h.id} className="hover:bg-[#F7F7F5]">
                <td className="p-4 text-[#6B7280]">
                  {h.timestamp?.toDate ? formatDate(h.timestamp.toDate()) : 'N/A'}
                </td>
                <td className="p-4">{h.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-4 font-bold">{h.instrument}</td>
                <td className="p-4">
                  <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${h.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#C43D3D] text-[#C43D3D]'}`}>
                    {h.vector}
                  </span>
                </td>
                <td className="p-4 text-right">${formatNumber(h.stake || 0, { minimumFractionDigits: 2 })}</td>
                <td className={`p-4 text-right font-bold ${h.profit >= 0 ? 'text-[#16835B]' : 'text-[#C43D3D]'}`}>
                  {h.profit >= 0 ? '+' : ''}${formatNumber(h.profit || 0, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AuthedLayout>
  );
}
