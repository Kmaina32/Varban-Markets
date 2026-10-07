'use client';

/**
 * @fileOverview Institutional KYC Document Verification Desk.
 * Hardened against null database references and refactored for Next.js 15 build compatibility.
 */

import React, { useState, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, ShieldCheck, X, FileText, Check, AlertTriangle } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

interface UserEntity {
  id: string;
  fullName?: string;
  email?: string;
  verificationStatus?: string;
}

export default function AdminKycApprovalsPage() {
  const db = useFirestore();
  const [activeFilter, setActiveFilter] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectUser, setInspectUser] = useState<UserEntity | null>(null);

  const kycQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: rawUsers, loading } = useCollection<UserEntity>(kycQuery);

  const filteredUsers = useMemo(() => {
    if (!rawUsers) return [];
    return rawUsers.filter(u => {
      const status = u.verificationStatus || "Not Verified";
      if (activeFilter !== "All" && activeFilter !== status) return false;
      const q = searchQuery.toLowerCase();
      return (u.fullName || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
    });
  }, [rawUsers, activeFilter, searchQuery]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Pending": return "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5";
      case "Verified": return "border-[#16835B] text-[#16835B] bg-[#16835B]/5";
      default: return "border-[#6B7280] text-[#6B7280]";
    }
  };

  return (
    <AuthedLayout title="KYC Approvals" subtitle="Institutional Verification Desk">
      <div className="space-y-6">
        <Card className="p-4 bg-white border-[#E4E4E4] flex items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-2">
            {['All', 'Pending', 'Verified'].map(f => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f)} 
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all", 
                  activeFilter === f ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] border-[#E4E4E4]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Filter entities..." 
              className="w-full pl-9 pr-4 py-2 border border-[#E4E4E4] text-xs focus:outline-none" 
            />
          </div>
        </Card>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F7F5] border-b text-[9px] font-bold uppercase text-[#6B7280]">
              <tr>
                <th className="p-4">Entity</th>
                <th className="p-4 text-center">Audit Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E4]">
              {loading ? (
                <tr><td colSpan={3} className="p-12 text-center text-[#6B7280] font-mono">Syncing Registry...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={3} className="p-12 text-center text-[#6B7280]">No matching entities.</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-[#F7F7F5]">
                  <td className="p-4">
                    <span className="font-bold block">{u.fullName || u.email}</span>
                    <span className="text-[9px] text-[#6B7280] font-mono">{u.email}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn("px-2 py-0.5 border text-[9px] font-bold uppercase", getStatusBadge(u.verificationStatus))}>
                      {u.verificationStatus || "Not Verified"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setInspectUser(u)} className="text-[9px] font-bold uppercase underline">Inspect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {!db && (
          <div className="p-4 bg-[#C9A227]/10 border border-[#C9A227] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-[#C9A227] uppercase leading-relaxed">
              Database Sync Restricted: Manual document verification requires an active institutional database connection.
            </p>
          </div>
        )}
      </div>

      {inspectUser && (
        <div className="fixed inset-0 z-[400] bg-[#0A0A0A]/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="bg-white w-full max-w-md p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#F7F7F5] pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest">Entity Inspection</h3>
              <button onClick={() => setInspectUser(null)}><X className="w-4 h-4 text-[#6B7280]" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] rounded-sm">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Subject</span>
                <p className="text-xs font-bold text-[#0A0A0A]">{inspectUser.email}</p>
              </div>
              <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold">
                Manual review is required to verify identity documentation provided by this trader.
              </p>
            </div>
            <button onClick={() => setInspectUser(null)} className="w-full btn-institutional-secondary py-3">Close Inspector</button>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
