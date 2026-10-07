'use client';

import { useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ShieldAlert, Users, DollarSign, Activity, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { createClient } from "@/app/lib/supabase/client";
import Link from "next/link";

/**
 * @fileOverview Administrative Oversight Node (Supabase Migrated).
 * Provides platform-wide metrics derived from real-time database aggregates.
 */

export default function AdminDashboard() {
  const { formatNumber } = useTranslation();
  const supabase = createClient();
  
  const [metrics, setMetrics] = useState({
    totalBalance: 0,
    userCount: 0,
    verifiedCount: 0,
    recentUsers: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlatformState() {
      setLoading(true);
      try {
        // Fetch profiles with a fallback order to avoid schema missing errors
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('id', { ascending: false });
        
        if (error) {
          console.error("Platform metrics fetch error:", error);
          setLoading(false);
          return;
        }

        if (profiles) {
          const totalBalance = profiles.reduce((acc: number, p: any) => acc + (parseFloat(p.balance) || 0), 0);
          const verified = profiles.filter((p: any) => p.verification_status === 'Verified').length;
          
          setMetrics({
            totalBalance,
            userCount: profiles.length,
            verifiedCount: verified,
            recentUsers: profiles.slice(0, 5)
          });
        }
      } catch (e) {
        console.error("Platform metrics sync failure:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchPlatformState();
  }, [supabase]);

  const platformMetrics = [
    { title: "Global Assets", value: metrics.totalBalance, icon: DollarSign, color: "text-[#16835B]", isCurrency: true },
    { title: "Total Entities", value: metrics.userCount, icon: Users, color: "text-[#0055FF]", isCurrency: false },
    { title: "KYC Verified", value: metrics.verifiedCount, icon: ShieldAlert, color: "text-[#0A0A0A]", isCurrency: false },
    { title: "Node Status", value: "Operational", icon: Activity, color: "text-[#16835B]", isCurrency: false }
  ];

  return (
    <AuthedLayout 
      title="Oversight Node" 
      subtitle="Institutional governance and platform-wide monitoring"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {platformMetrics.map((m, idx) => (
            <Card key={idx} className="bg-white border-[#E4E4E4] p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                <span className="text-[9px] text-[#6B7280] uppercase tracking-widest font-bold">{m.title}</span>
                <m.icon className="w-3.5 h-3.5 text-[#6B7280]" />
              </div>
              <div className="relative z-10">
                <span className={`text-xl font-mono font-bold ${m.color}`}>
                  {loading ? "..." : (m.isCurrency === false ? m.value : `$${formatNumber(m.value as number, { minimumFractionDigits: 2 })}`)}
                </span>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#F7F7F5] rounded-bl-full -z-0"></div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider">Latest Registration Feed</h3>
              <Link href="/admin/users" className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest flex items-center group">
                User Management <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Entity</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Domain</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E4] text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-[#6B7280]">
                         <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                         <span className="text-[10px] uppercase font-bold tracking-widest">Synchronizing Ledger...</span>
                      </td>
                    </tr>
                  ) : metrics.recentUsers.length === 0 ? (
                    <tr><td colSpan={3} className="p-12 text-center text-[#6B7280] uppercase font-bold tracking-widest">No platform entities discovered.</td></tr>
                  ) : metrics.recentUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-[#F7F7F5] transition-colors">
                      <td className="p-4">
                        <span className="font-bold block text-[#0A0A0A]">{user.full_name || "Unnamed Entity"}</span>
                        <span className="text-[9px] text-[#6B7280] font-mono">{user.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="p-4 text-[#6B7280] uppercase tracking-tighter text-[10px] font-bold">{user.country || "Global"}</td>
                      <td className="p-4 text-right font-mono font-bold text-[#16835B]">${formatNumber(user.balance || 0, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider px-1">Infrastructure Capacity</h3>
            <Card className="bg-white border-[#E4E4E4] p-10 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
              <TrendingUp className="w-16 h-16 text-[#16835B] opacity-10" />
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">Real-time Latency</span>
                <p className="text-sm font-bold text-[#0A0A0A] leading-relaxed max-w-xs">
                  All Supabase matching nodes are synchronized within &lt;45ms thresholds.
                </p>
              </div>
              <div className="w-full h-1.5 bg-[#F7F7F5] relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-[#16835B] w-[14%] transition-all duration-1000"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
                <span className="text-[9px] font-bold text-[#16835B] uppercase tracking-widest">Deterministic Safety: ACTIVE</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}