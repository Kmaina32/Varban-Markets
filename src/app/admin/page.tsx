'use client';

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ShieldAlert, Users, DollarSign, Activity, TrendingUp, ArrowRight } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function AdminDashboard() {
  const { t, formatNumber } = useTranslation();
  const db = useFirestore();

  // Platform-wide metrics allocation
  const { data: users, loading: usersLoading } = useCollection<any>(
    db ? query(collection(db, "users"), limit(50)) : null
  );

  const totalBalance = users?.reduce((acc: number, u: any) => acc + (u.balance || 0), 0) || 0;
  const verifiedCount = users?.filter((u: any) => u.verificationStatus === 'Verified').length || 0;

  const platformMetrics = [
    { title: "Total User Assets", value: totalBalance, icon: DollarSign, color: "text-[#16835B]" },
    { title: "Total Registered", value: users?.length || 0, icon: Users, color: "text-[#0055FF]", isCurrency: false },
    { title: "Verified Entities", value: verifiedCount, icon: ShieldAlert, color: "text-[#0A0A0A]", isCurrency: false },
    { title: "Network Status", value: "Operational", icon: Activity, color: "text-[#16835B]", isCurrency: false }
  ];

  return (
    <AuthedLayout 
      title={t('nav.admin')} 
      subtitle={t('pages.adminSubtitle')}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {platformMetrics.map((m, idx) => (
            <Card key={idx} className="bg-white border-[#E4E4E4] p-4 flex flex-col justify-between shadow-sm">
              <div className="flex flex-row items-center justify-between mb-2">
                <span className="text-[9px] text-[#6B7280] uppercase tracking-widest font-bold">{m.title}</span>
                <m.icon className="w-3.5 h-3.5 text-[#6B7280]" />
              </div>
              <div>
                <span className={`text-xl font-mono font-bold ${m.color}`}>
                  {usersLoading ? "..." : (m.isCurrency === false ? m.value : `$${formatNumber(m.value as number, { minimumFractionDigits: 2 })}`)}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider">Recent User Registrations</h3>
              <Link href="/admin/users" className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest flex items-center">
                Manage Users <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </div>
            <Card className="bg-white border-[#E4E4E4] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                    <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase">Entity</th>
                    <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase">Location</th>
                    <th className="p-3 text-[9px] font-bold text-[#6B7280] uppercase text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E4] text-xs">
                  {usersLoading ? (
                    <tr><td colSpan={3} className="p-4 text-center text-[#6B7280]">Synchronizing Ledger...</td></tr>
                  ) : users?.slice(0, 5).map((user: any) => (
                    <tr key={user.id} className="hover:bg-[#F7F7F5]">
                      <td className="p-3">
                        <span className="font-bold block">{user.fullName || user.email}</span>
                        <span className="text-[9px] text-[#6B7280] font-mono">{user.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="p-3 text-[#6B7280] uppercase tracking-tighter text-[10px]">{user.country || "---"}</td>
                      <td className="p-3 text-right font-mono font-bold">${formatNumber(user.balance || 0, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider px-1">Market Infrastructure Load</h3>
            <Card className="bg-white border-[#E4E4E4] p-8 flex flex-col items-center justify-center text-center space-y-4">
              <TrendingUp className="w-12 h-12 text-[#16835B] opacity-20" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">Operational Capacity</span>
                <p className="text-xs text-[#0A0A0A] leading-relaxed max-w-xs">
                  The Varban matching engine is currently processing market ticks within deterministic boundaries.
                </p>
              </div>
              <div className="w-full h-1 bg-[#F7F7F5] relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-[#16835B] w-[14%]"></div>
              </div>
              <span className="text-[9px] font-bold text-[#16835B] uppercase">Low Latency Detected</span>
            </Card>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
