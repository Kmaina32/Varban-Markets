'use client';

import React, { useState, useEffect, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, ShieldCheck, X, Check, Loader2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/app/lib/utils";
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

export default function AdminKycApprovalsPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectUser, setInspectUser] = useState<any | null>(null);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const loadEntities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error("KYC load error:", error);
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEntities();
  }, []);

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', userId);
      
      if (error) throw error;
      
      setDialog({ 
        status: 'success', 
        title: 'Audit Finalized', 
        message: `Entity state successfully updated to ${status}.` 
      });
      setInspectUser(null);
      await loadEntities();
    } catch (e) {
      setDialog({ status: 'error', title: 'Transmission Error', message: 'Failed to synchronize decision with core node.' });
    }
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
      <div className="space-y-6">
        <StatusDialog 
          status={dialog.status} 
          title={dialog.title} 
          message={dialog.message} 
          onClose={() => setDialog({ ...dialog, status: null })} 
        />

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
                        Inspect Evidence
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
        <div className="fixed inset-0 z-[400] bg-[#0A0A0A]/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="bg-white w-full max-w-xl shadow-2xl relative overflow-hidden">
            <div className="p-5 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Manual Audit Node</h3>
              </div>
              <button onClick={() => setInspectUser(null)} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Subject Identity</span>
                  <p className="text-sm font-bold text-[#0A0A0A]">{inspectUser.full_name}</p>
                  <p className="text-[10px] text-[#6B7280] font-mono">{inspectUser.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Origin Domain</span>
                  <p className="text-xs font-bold uppercase text-[#0A0A0A]">{inspectUser.country || "GLOBAL"}</p>
                </div>
              </div>

              <div className="p-6 bg-[#F7F7F5] border-l-4 border-l-[#0055FF] space-y-3">
                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">Audit Evidence Check</h4>
                 <p className="text-[11px] text-[#6B7280] leading-relaxed font-medium">
                   Verify that the provided government identification matches the entity name exactly. Check for document integrity and expiration dates.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleUpdateStatus(inspectUser.id, 'Verified')}
                  className="py-4 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0A0A0A] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve Entity
                </button>
                <button 
                  onClick={() => handleUpdateStatus(inspectUser.id, 'Rejected')}
                  className="py-4 bg-white border border-[#C43D3D] text-[#C43D3D] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C43D3D] hover:text-white transition-all shadow-sm"
                >
                  Reject & Flag
                </button>
              </div>
            </div>

            <div className="bg-[#F7F7F5] p-3 text-center border-t border-[#E4E4E4]">
               <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.3em]">
                 All audit decisions are logged in the immutable security ledger.
               </span>
            </div>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}