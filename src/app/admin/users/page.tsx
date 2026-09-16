'use client';

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, ShieldCheck, Mail, Globe, MoreVertical } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

export default function UserManagement() {
  const { t, formatNumber } = useTranslation();
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, loading } = useCollection<any>(
    db ? collection(db, "users") : null
  );

  const handleVerify = (userId: string, currentStatus: string) => {
    if (!db) return;
    const nextStatus = currentStatus === 'Verified' ? 'Not Verified' : 'Verified';
    updateDoc(doc(db, "users", userId), {
      verificationStatus: nextStatus
    }).catch(() => {});
  };

  const filteredUsers = users?.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthedLayout 
      title={t('nav.adminUsers')} 
      subtitle="Regulatory oversight and KYC verification workspace"
    >
      <div className="space-y-6">
        <Card className="p-4 border-[#E4E4E4] bg-white shadow-sm flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search by name, email or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Total Entities:</span>
            <span className="text-xs font-mono font-bold text-[#0A0A0A]">{users?.length || 0}</span>
          </div>
        </Card>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Entity Profile</th>
                <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Contact Domain</th>
                <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">KYC Status</th>
                <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-right">Account Equity</th>
                <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E4] text-xs">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-[#6B7280] font-mono">Synchronizing Platform Records...</td></tr>
              ) : filteredUsers?.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-[#6B7280]">No entities found in the current scope.</td></tr>
              ) : filteredUsers?.map((user: any) => (
                <tr key={user.id} className="hover:bg-[#F7F7F5]">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center font-bold text-[10px] text-[#0055FF]">
                        {user.fullName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <span className="font-bold block text-[#0A0A0A]">{user.fullName || "Unnamed Entity"}</span>
                        <span className="text-[9px] text-[#6B7280] font-mono uppercase">{user.id.slice(0, 10)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <Mail className="w-3 h-3 text-[#6B7280]" />
                        <span className="text-[#6B7280]">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <Globe className="w-3 h-3 text-[#6B7280]" />
                        <span className="uppercase text-[#6B7280]">{user.country || "Global"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 border text-[9px] font-bold uppercase",
                      user.verificationStatus === 'Verified' ? "border-[#16835B] text-[#16835B]" : "border-[#C9A227] text-[#C9A227]"
                    )}>
                      {user.verificationStatus || "Not Verified"}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold">
                    ${formatNumber(user.balance || 0, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleVerify(user.id, user.verificationStatus)}
                      className="text-[9px] font-bold uppercase px-3 py-1.5 border border-[#E4E4E4] hover:border-[#0055FF] hover:text-[#0055FF] transition-colors"
                    >
                      {user.verificationStatus === 'Verified' ? "Revoke" : "Verify"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AuthedLayout>
  );
}
