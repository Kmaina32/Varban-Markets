"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  TrendingUp, 
  DollarSign, 
  Trophy,
  ArrowRight,
  Gift
} from "lucide-react";
import { useUser, useDoc, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

/**
 * @fileOverview Referral Management Portal.
 * Allows users to monitor their growth network and copy unique invitation links.
 */

export default function ReferralPortal() {
  const { user } = userUser();
  const db = useFirestore();
  const { t, formatNumber, formatDate } = useTranslation();
  const [copied, setCopied] = useState(false);

  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const referralsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users"),
      where("referredBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: referredUsers, loading: referralsLoading } = useCollection<any>(referralsQuery);

  const referralCode = profile?.referralCode || "---";
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${referralCode}` 
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = [
    { label: "Total Network", value: referredUsers?.length || 0, icon: Users, color: "text-[#0055FF]" },
    { label: "Active Traders", value: referredUsers?.filter(u => (u.balance || 0) > 1000).length || 0, icon: TrendingUp, color: "text-[#16835B]" },
    { label: "Pending Payout", value: "$0.00", icon: DollarSign, color: "text-[#6B7280]" },
    { label: "Partner Level", value: "Standard", icon: Trophy, color: "text-[#C9A227]" }
  ];

  function userUser() {
    return useUser();
  }

  return (
    <AuthedLayout 
      title="Referral Program" 
      subtitle="Expand your network and earn institutional rewards"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Banner Section */}
        <Card className="bg-[#0A0A0A] text-white p-8 md:p-12 relative overflow-hidden border-[#0A0A0A]">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-[#0055FF] mb-4">
              <Gift className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Growth</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Build Your Trading Community.
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
              Invite other sophisticated traders to the Varban Markets ecosystem. Every successful onboarding through your unique conduit contributes to your network growth metrics and upcoming partner rewards.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto flex-grow bg-white/5 border border-white/10 p-3 flex items-center justify-between group">
                <code className="text-xs font-mono text-white/70 truncate mr-4">{referralLink}</code>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-white/10 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-[#16835B]" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
                </button>
              </div>
              <button 
                onClick={copyToClipboard}
                className="w-full sm:w-auto btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-white hover:text-[#0055FF]"
              >
                {copied ? "Link Copied" : "Copy Invitation Link"}
              </button>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#0055FF]/10 to-transparent pointer-events-none"></div>
          <Share2 className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12 pointer-events-none" />
        </Card>

        {/* Stats Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <Card key={idx} className="bg-white border-[#E4E4E4] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{m.label}</span>
                <m.icon className={cn("w-3.5 h-3.5", m.color)} />
              </div>
              <div className="text-xl font-mono font-bold text-[#0A0A0A]">
                {referralsLoading ? "..." : m.value}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Referral Ledger */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider px-1">Network Enrollment Ledger</h3>
            <Card className="bg-white border-[#E4E4E4] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                      <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Entity Profile</th>
                      <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Enrollment Date</th>
                      <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-right">Activity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E4] text-xs">
                    {referralsLoading ? (
                      <tr><td colSpan={3} className="p-8 text-center text-[#6B7280] font-mono italic">Synchronizing Network Data...</td></tr>
                    ) : referredUsers?.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-12 text-center">
                          <Users className="w-8 h-8 text-[#E4E4E4] mx-auto mb-3" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">No network members discovered.</p>
                          <p className="text-[9px] text-[#6B7280] mt-1">Start by sharing your unique referral link.</p>
                        </td>
                      </tr>
                    ) : referredUsers?.map((ref: any) => (
                      <tr key={ref.id} className="hover:bg-[#F7F7F5]">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center font-bold text-[10px] text-[#0055FF]">
                              {ref.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <span className="font-bold block text-[#0A0A0A]">{ref.fullName || "Unnamed Entity"}</span>
                              <span className="text-[9px] text-[#6B7280] font-mono">{ref.id.slice(0, 10).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[#6B7280] font-mono">
                          {ref.createdAt ? formatDate(new Date(ref.createdAt)) : "---"}
                        </td>
                        <td className="p-4 text-right">
                          <span className={cn(
                            "px-2 py-0.5 border text-[9px] font-bold uppercase",
                            ref.verificationStatus === 'Verified' ? "border-[#16835B] text-[#16835B]" : "border-[#C9A227] text-[#C9A227]"
                          )}>
                            {ref.verificationStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Program Overview */}
          <div className="space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 mb-4">
                How it Works
              </h3>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Share Your Link", text: "Distribute your unique invitation token to your professional network." },
                  { step: "02", title: "Network Enrollment", text: "New traders register using your conduit and enter our secure ecosystem." },
                  { step: "03", title: "Scale Rewards", text: "Monitor your network growth and unlock advanced institutional partner tiers." }
                ].map((s, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="text-xs font-mono font-bold text-[#0055FF]">{s.step}</span>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-[#0A0A0A] mb-1">{s.title}</h4>
                      <p className="text-[10px] text-[#6B7280] leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#F7F7F5] border-[#E4E4E4] p-6 text-center">
              <Gift className="w-8 h-8 text-[#0055FF] mx-auto mb-3 opacity-20" />
              <h4 className="text-xs font-bold uppercase text-[#0A0A0A] mb-2">Rewards Active</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Platform partner rewards are calculated based on monthly active volume within your direct network domain.
              </p>
              <Link href="/help" className="inline-flex items-center text-[9px] font-bold text-[#0055FF] uppercase tracking-widest mt-4 hover:underline">
                View Policy Details <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
