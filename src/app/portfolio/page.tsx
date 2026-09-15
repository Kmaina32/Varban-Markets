"use client";

import { useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Briefcase, TrendingUp, PieChart, Activity } from "lucide-react";
import { useUser, useDoc, useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";

export default function PortfolioPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();

  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const positionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, `users/${user.uid}/positions`), where("status", "==", "Open"));
  }, [db, user]);

  const { data: positions, loading: positionsLoading } = useCollection<any>(positionsQuery);

  const openRisk = useMemo(() => {
    if (!positions) return 0;
    return positions.reduce((acc: number, pos: any) => acc + (pos.stake || 0), 0);
  }, [positions]);

  const stats = [
    { label: t('wallet.equity'), value: profile?.equity || profile?.balance, icon: Briefcase, prefix: "$" },
    { label: t('pages.totalStake'), value: openRisk, icon: TrendingUp, prefix: "$" },
    { label: t('nav.positions'), value: positions?.length || 0, icon: PieChart, prefix: "" },
    { label: t('pages.riskLimit'), value: openRisk > 0 ? t('common.active') : t('common.stable'), icon: Activity, prefix: "" }
  ];

  return (
    <AuthedLayout title={t('pages.portfolioTitle')}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white border-[#E4E4E4] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{stat.label}</span>
              <stat.icon className="w-3.5 h-3.5 text-[#0055FF]" />
            </div>
            <div className="text-xl font-mono font-bold">
              {profileLoading || positionsLoading ? "..." : typeof stat.value === 'number' ? `${stat.prefix}${formatNumber(stat.value, { minimumFractionDigits: 2 })}` : stat.value}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-4 mb-4">{t('pages.assetAllocation')}</h3>
          <div className="h-64 flex flex-col items-center justify-center bg-[#F7F7F5] border border-dashed border-[#E4E4E4] text-center p-6">
            <PieChart className="w-8 h-8 text-[#E4E4E4] mb-3" />
            <p className="text-[10px] text-[#6B7280] uppercase tracking-widest leading-relaxed">
              {positions?.length ? t('common.active') : t('trading.noPositions')}
            </p>
          </div>
        </Card>

        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-4 mb-4">{t('pages.performanceCurve')}</h3>
          <div className="h-64 flex flex-col items-center justify-center bg-[#F7F7F5] border border-dashed border-[#E4E4E4] text-center p-6">
            <TrendingUp className="w-8 h-8 text-[#E4E4E4] mb-3" />
            <p className="text-[10px] text-[#6B7280] uppercase tracking-widest leading-relaxed">
              {t('common.stable')}
            </p>
          </div>
        </Card>
      </div>
    </AuthedLayout>
  );
}
