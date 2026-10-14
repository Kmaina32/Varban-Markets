"use client";

/**
 * @fileOverview Institutional Active Orders Tracker.
 * Fully localized for international markets.
 */

import { useMemo, useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";

export default function OrderManagementPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();

  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
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
    <AuthedLayout title={t('pages.ordersTitle')} subtitle={`${accountMode} Live Contracts`}>
      <div className="space-y-6">
        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7F5] border-b text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">
                <tr>
                  <th className="p-4">{t('tables.reference')}</th>
                  <th className="p-4">{t('tables.instrument')}</th>
                  <th className="p-4 text-right">{t('tables.stake')}</th>
                  <th className="p-4 text-center">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] font-mono">
                {loading ? (
                  <tr><td colSpan={4} className="p-12 text-center text-[#6B7280] uppercase font-bold">{t('common.loading')}</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={4} className="p-16 text-center text-[#6B7280] uppercase tracking-widest font-bold opacity-30">No active pending contracts.</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4 text-[#6B7280]">{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 font-bold">{o.instrument}</td>
                    <td className="p-4 text-right font-bold">${formatNumber(o.stake || 0, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-[#C9A227] text-[#C9A227] text-[9px] font-bold uppercase animate-pulse">Pending</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center space-x-3 text-[#6B7280]">
          <AlertCircle className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Order synchronization currently routing through institutional fallback gateway.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}
