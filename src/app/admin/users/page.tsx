'use client';

import { useMemo, useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, Mail, Globe, ShieldAlert, Plus, ShieldCheck, X } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

export default function UserManagement() {
  const { formatNumber } = useTranslation();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: users, loading } = useCollection<any>(usersQuery);

  const handleVerify = (userId: string, currentStatus: string) => {
    if (!db) return;
    const nextStatus = currentStatus === 'Verified' ? 'Not Verified' : 'Verified';
    updateDoc(doc(db, "users", userId), { "status.verificationStatus": nextStatus }).catch(() => {});
  };

  const handleToggleRole = (userId: string, currentRole: string) => {
    if (!db) return;
    const nextRole = currentRole === 'Admin' ? 'Trader' : 'Admin';
    if (!window.confirm(`Modify authority to ${nextRole}?`)) return;
    updateDoc(doc(db, "users", userId), { "status.role": nextRole }).catch(() => {});
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const q = searchQuery.toLowerCase();
    return users.filter(u => {
      const name = (u.profile?.fullName || "").toLowerCase();
      const email = (u.profile?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, searchQuery]);

  return (
    <AuthedLayout title="User Directory" subtitle="Regulatory oversight workspace">
      <div className="space-y-6">
        <Card className="p-4 bg-white shadow-sm flex items-center gap-4">
          <Search className="w-4 h-4 text-[#6B7280]" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="flex-grow text-xs outline-none" />
        </Card>
        <Card className="bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F7F7F5] border-b text-[9px] font-bold uppercase text-[#6B7280]">
              <tr>
                <th className="p-4">Entity Profile</th>
                <th className="p-4">Contact Domain</th>
                <th className="p-4 text-center">KYC Status</th>
                <th className="p-4 text-center">Authority</th>
                <th className="p-4 text-right">Balance</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {loading ? <tr><td colSpan={6} className="p-12 text-center text-[#6B7280] font-mono">Syncing...</td></tr> : filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-[#F7F7F5]">
                  <td className="p-4 font-bold">{u.profile?.fullName || "Unnamed"}</td>
                  <td className="p-4 font-mono text-[#6B7280]">{u.profile?.email}</td>
                  <td className="p-4 text-center"><span className={cn("px-2 py-0.5 border text-[9px] font-bold uppercase", u.status?.verificationStatus === 'Verified' ? "border-[#16835B] text-[#16835B]" : "border-[#C9A227] text-[#C9A227]")}>{u.status?.verificationStatus}</span></td>
                  <td className="p-4 text-center"><button onClick={() => handleToggleRole(u.id, u.status?.role)} className={cn("px-2 py-0.5 border text-[9px] font-bold uppercase", u.status?.role === 'Admin' ? "bg-[#0055FF] text-white" : "text-[#6B7280]")}>{u.status?.role}</button></td>
                  <td className="p-4 text-right font-mono font-bold">${formatNumber(u.balance || 0, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-center"><button onClick={() => handleVerify(u.id, u.status?.verificationStatus)} className="text-[9px] font-bold uppercase underline">Toggle KYC</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AuthedLayout>
  );
}
