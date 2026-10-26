'use client';

import React, { useState, useEffect, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import KycReviewPanel from "@/components/admin/KycReviewPanel";
import { getProfileGaps } from "@/app/lib/profile-completion";
import { cn } from "@/app/lib/utils";

const toMillis = (ts: any): number => {
  try {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch { return 0; }
};

export default function AdminKycApprovalsPage() {
  const db = useFirestore();
  const { user: adminUser } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectUser, setInspectUser] = useState<any | null>(null);
  
  const loadEntities = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const rows = snap.docs.map(d => {
        const x: any = d.data() || {};
        return {
          id: d.id,
          full_name: x.profile?.fullName || [x.profile?.firstName, x.profile?.lastName].filter(Boolean).join(" ") || "",
          email: x.profile?.email || "",
          country: x.profile?.country || "",
          verification_status: x.status?.verificationStatus || "Not Verified",
          created: toMillis(x.profile?.createdAt) || toMillis(x.status?.createdAt),
          incomplete: getProfileGaps(x).length,
          data: x,
        };
      }).sort((a, b) => b.created - a.created);
      setUsers(rows);
    } catch (error) {
      console.error("KYC load error:", error);
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEntities();
  }, [db]);

  // The review panel saves the decision itself (status, reason, notification, audit log).
  // Here we only refresh the row so the list reflects it.
  const onDecided = (uid: string, status: "Verified" | "Rejected") => {
    setUsers(prev => prev.map(u => (u.id === uid ? { ...u, verification_status: status, data: { ...u.data, status: { ...(u.data?.status || {}), verificationStatus: status } } } : u)));
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const status = u.verification_status || "Not Verified";
      if (activeFilter !== "All" && activeFilter !== status) return false;
      const q = searchQuery.toLowerCase();
      return (u.full_name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
    });
  }, [users, activeFilter, searchQuery]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Pending": return "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5";
      case "Verified": return "border-[#16835B] text-[#16835B] bg-[#16835B]/5";
      case "Rejected": return "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5";
      default: return "border-[#6B7280] text-[#6B7280] bg-[#F7F7F5]";
    }
  };

  return (
    <AuthedLayout title="KYC Approvals" subtitle="Institutional Identity Verification Desk">
      <div className={cn("grid gap-6 items-start", inspectUser ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]" : "grid-cols-1")}>
      <div className="space-y-6 min-w-0">
        <Card className="p-4 bg-white border-[#E4E4E4] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-2 w-full md:w-auto">
            {['All', 'Pending', 'Verified', 'Rejected'].map(f => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f)} 
                className={cn(
                  "flex-1 md:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all", 
                  activeFilter === f ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Filter entities..." 
              className="w-full pl-10 pr-4 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0A0A0A]" 
            />
          </div>
        </Card>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#F7F7F5] border-b border-[#E4E4E4] text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">
                <tr>
                  <th className="p-4">Entity Profile</th>
                  <th className="p-4">Contact Domain</th>
                  <th className="p-4 text-center">Audit Status</th>
                  <th className="p-4 text-center">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-bold uppercase text-[#6B7280]">Syncing Document Registry...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} className="p-16 text-center text-[#6B7280] uppercase font-bold tracking-widest">No pending audits in current sector.</td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4">
                      <span className="font-bold block text-[#0A0A0A]">{u.full_name || "Unnamed Entity"}</span>
                      {u.incomplete > 0 && <span className="text-[9px] font-bold uppercase text-[#C43D3D]">Profile incomplete</span>}
                      <span className="text-[9px] text-[#6B7280] font-mono">{u.id.slice(0, 12).toUpperCase()}</span>
                    </td>
                    <td className="p-4 font-mono text-[#6B7280] lowercase">{u.email}</td>
                    <td className="p-4 text-center">
                      <span className={cn("px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider", getStatusBadge(u.verification_status))}>
                        {u.verification_status || "Not Verified"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setInspectUser(u)} 
                        className="text-[9px] font-bold uppercase tracking-widest text-[#0055FF] underline decoration-2 underline-offset-4"
                      >
                        Review Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {inspectUser && (
        <KycReviewPanel
          key={inspectUser.id}
          db={db}
          admin={adminUser}
          target={{ id: inspectUser.id, data: inspectUser.data }}
          onClose={() => setInspectUser(null)}
          onDecided={onDecided}
        />
      )}
      </div>
    </AuthedLayout>
  );
}