'use client';

import { useMemo, useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, Loader2, UserCog, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/app/lib/utils";
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

export default function UserManagement() {
  const { formatNumber } = useTranslation();
  const supabase = createClient();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    // Use a multi-column order attempt to prevent 42703 errors if created_at is missing
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error("Error fetching users:", error);
      // Fallback for empty state or schema mismatch
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleVerify = async (userId: string, currentStatus: string) => {
    setIsProcessing(userId);
    const nextStatus = currentStatus === 'Verified' ? 'Not Verified' : 'Verified';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: nextStatus })
        .eq('id', userId);
      
      if (error) throw error;
      await loadUsers();
    } catch (e) {
      setDialog({ status: 'error', title: 'Update Failed', message: 'Failed to modify verification state.' });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (!window.confirm(`Modify authority to ${currentRole === 'Admin' ? 'Trader' : 'Admin'}?`)) return;
    setIsProcessing(userId);
    const nextRole = currentRole === 'Admin' ? 'Trader' : 'Admin';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', userId);
      
      if (error) throw error;
      await loadUsers();
    } catch (e) {
      setDialog({ status: 'error', title: 'Update Failed', message: 'Failed to modify role authority.' });
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const q = searchQuery.toLowerCase();
    return users.filter(u => {
      const name = (u.full_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, searchQuery]);

  return (
    <AuthedLayout title="User Directory" subtitle="Regulatory oversight and entity management">
      <div className="space-y-6">
        <StatusDialog 
          status={dialog.status} 
          title={dialog.title} 
          message={dialog.message} 
          onClose={() => setDialog({ ...dialog, status: null })} 
        />

        <Card className="p-4 bg-white shadow-sm flex items-center gap-4 border-[#E4E4E4]">
          <Search className="w-4 h-4 text-[#6B7280]" />
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search by name, email or entity ID..." 
            className="flex-grow text-xs outline-none bg-transparent" 
          />
        </Card>

        <Card className="bg-white overflow-hidden shadow-sm border-[#E4E4E4]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-[#F7F7F5] border-b border-[#E4E4E4] text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">
                <tr>
                  <th className="p-4">Entity Profile</th>
                  <th className="p-4">Contact Domain</th>
                  <th className="p-4 text-center">KYC Status</th>
                  <th className="p-4 text-center">Authority</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4 text-center">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Accessing Entity Registry...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-[#6B7280] uppercase font-bold tracking-widest">No matching entities found.</td></tr>
                ) : filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4">
                      <span className="font-bold block text-[#0A0A0A]">{u.full_name || "Unnamed Entity"}</span>
                      <span className="text-[9px] text-[#6B7280] font-mono">{u.id.slice(0, 12).toUpperCase()}</span>
                    </td>
                    <td className="p-4 font-mono text-[#6B7280] lowercase">{u.email}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider",
                        u.verification_status === 'Verified' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5"
                      )}>
                        {u.verification_status || "Not Verified"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleRole(u.id, u.role)}
                        disabled={isProcessing === u.id}
                        className={cn(
                          "px-3 py-1 border text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 mx-auto shadow-sm",
                          u.role === 'Admin' ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                        )}
                      >
                        <UserCog className="w-3 h-3" />
                        <span>{u.role || "Trader"}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-[#0A0A0A]">
                      ${formatNumber(u.balance || 0, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleVerify(u.id, u.verification_status)}
                        disabled={isProcessing === u.id}
                        className="text-[9px] font-bold uppercase tracking-widest text-[#0055FF] underline decoration-2 underline-offset-4 hover:text-[#0A0A0A] transition-colors"
                      >
                        {isProcessing === u.id ? "Syncing..." : "Toggle Audit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AuthedLayout>
  );
}