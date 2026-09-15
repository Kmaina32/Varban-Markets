"use client";

import { useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Target, Activity, ShieldAlert, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";

export default function ActivePositionsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();

  const positionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      where("status", "==", "Open"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: positions, loading } = useCollection<any>(positionsQuery);

  const totalStake = useMemo(() => {
    if (!positions) return 0;
    return positions.reduce((acc: number, pos: any) => acc + (pos.stake || 0), 0);
  }, [positions]);

  return (
    <AuthedLayout title={t('pages.positionsTitle')}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('pages.totalStake')}</span>
            <Target className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="text-xl font-mono font-bold">${formatNumber(totalStake, { minimumFractionDigits: 2 })} USD</div>
        </Card>
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('nav.positions')}</span>
            <Activity className="w-4 h-4 text-[#16835B]" />
          </div>
          <div className="text-xl font-mono font-bold">{positions?.length || 0}</div>
        </Card>
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('pages.riskLimit')}</span>
            <ShieldAlert className="w-4 h-4 text-[#6B7280]" />
          </div>
          <div className="text-xl font-mono font-bold">{t('pages.definedRisk')}</div>
        </Card>
      </div>

      <Card className="bg-white border-[#E4E4E4] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">ID</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.instrument')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.type')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('trading.entryLive')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('tables.stake')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('trading.duration')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E4] text-xs font-mono">
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center text-[#6B7280]">{t('common.loading')}</td></tr>
            ) : positions?.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-[#6B7280]">{t('trading.noPositions')}</td></tr>
            ) : positions?.map((pos: any) => (
              <tr key={pos.id} className="hover:bg-[#F7F7F5]">
                <td className="p-4 text-[#6B7280]">{pos.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-4 font-bold">{pos.instrument}</td>
                <td className="p-4">
                  <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${pos.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#C43D3D] text-[#C43D3D]'}`}>
                    {pos.vector}
                  </span>
                </td>
                <td className="p-4 text-right">{formatNumber(pos.entryPrice, { minimumFractionDigits: 2 })}</td>
                <td className="p-4 text-right">${formatNumber(pos.stake, { minimumFractionDigits: 2 })}</td>
                <td className="p-4 text-right text-[#C9A227]">{pos.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 text-center">
        <Link href="/terminal" className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] inline-flex items-center">
          {t('dashboard.viewTerminal')} <ArrowUpRight className="ml-1.5 w-3 h-3" />
        </Link>
      </div>
    </AuthedLayout>
  );
}
