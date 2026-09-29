
"use client";

import { useMemo, useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";

export default function OrderManagementPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber, formatDate } = useTranslation();

  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);

    const handleModeChange = () => {
      const mode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
      if (mode) setAccountMode(mode);
    };
    window.addEventListener('varban_account_mode_changed', handleModeChange);
    return () => window.removeEventListener('varban_account_mode_changed', handleModeChange);
  }, []);
  
  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      where("status", "==", "Open"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: allOrders, loading } = useCollection<any>(ordersQuery);

  const orders = useMemo(() => {
    return allOrders?.filter((o: any) => (o.isDemo || false) === (accountMode === 'DEMO')) || [];
  }, [allOrders, accountMode]);

  return (
    <AuthedLayout title={t('pages.ordersTitle')} subtitle={`${accountMode === 'DEMO' ? 'Practice' : 'Real'} Pending Contracts`}>
      <div className="flex space-x-2 mb-6">
        <button className="px-4 py-2 border text-[10px] font-bold uppercase tracking-widest bg-[#0A0A0A] text-white border-[#0A0A0A]">
          {t('common.all')}
        </button>
      </div>

      <Card className="bg-white border-[#E4E4E4] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.reference')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('wallet.status')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.instrument')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.vector')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('tables.stake')}</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">Target</th>
              <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('wallet.date')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E4] text-xs font-mono">
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center text-[#6B7280]">{t('common.loading')}</td></tr>
            ) : orders?.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-[#6B7280]">{t('trading.noPositions')}</td></tr>
            ) : orders?.map((order: any) => (
              <tr key={order.id} className="hover:bg-[#F7F7F5]">
                <td className="p-4 text-[#6B7280]">{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-4">
                  <span className="flex items-center space-x-1.5 text-[9px] font-bold uppercase text-[#C9A227]">
                    <Clock className="w-3 h-3" />
                    <span>{order.status}</span>
                  </span>
                </td>
                <td className="p-4 font-bold">{order.instrument}</td>
                <td className="p-4">
                  <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${order.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#C43D3D] text-[#C43D3D]'}`}>
                    {order.vector}
                  </span>
                </td>
                <td className="p-4 text-right font-bold">${formatNumber(order.stake || 0, { minimumFractionDigits: 2 })}</td>
                <td className="p-4 text-right text-[#6B7280]">Market</td>
                <td className="p-4 text-right text-[#6B7280]">
                   {order.timestamp?.toDate ? formatDate(order.timestamp.toDate()) : '...'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AuthedLayout>
  );
}
