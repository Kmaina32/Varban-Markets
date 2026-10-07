'use client';

/**
 * @fileOverview Admin Withdrawal Approval Queue (Supabase Migrated).
 * Allows administrators to review and approve outgoing remittance requests.
 */

import { useState, useEffect, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, User, Loader2, ShieldAlert } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

export default function AdminWithdrawalQueue() {
  const { formatDate, formatNumber } = useTranslation();
  const supabase = createClient();
  
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const loadWithdrawals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, email, balance)')
      .in('type', ['Withdrawal', 'Crypto Withdrawal'])
      .eq('status', 'Pending Verification')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Withdrawal load error:", error);
    } else {
      setWithdrawals(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleApprove = async (tx: any) => {
    if (!window.confirm(`Confirm $${tx.amount} remittance? Ensure funds are sent externally first.`)) return;
    setIsSyncing(tx.id);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'Approved' })
        .eq('id', tx.id);
      
      if (error) throw error;
      setDialog({ status: 'success', title: 'Remittance Approved', message: 'Payout state updated to Approved in the institutional ledger.' });
      await loadWithdrawals();
    } catch (e) {
      setDialog({ status: 'error', title: 'Sync Failure', message: 'Failed to update transaction status.' });
    } finally {
      setIsSyncing(null);
    }
  };

  const handleReject = async (tx: any) => {
    if (!window.confirm("Reject withdrawal and refund entity balance?")) return;
    setIsSyncing(tx.id);
    try {
      // 1. Fetch current profile state
      const { data: profile } = await supabase.from('profiles').select('balance, equity').eq('id', tx.user_id).single();
      if (!profile) throw new Error("Entity context unreachable.");

      const newBalance = (parseFloat(profile.balance) || 0) + parseFloat(tx.amount);
      const newEquity = (parseFloat(profile.equity) || 0) + parseFloat(tx.amount);

      // 2. Refund balance & update transaction
      const { error: txErr } = await supabase
        .from('transactions')
        .update({ status: 'Rejected' })
        .eq('id', tx.id);
      
      if (txErr) throw txErr;

      const { error: profErr } = await supabase
        .from('profiles')
        .update({ balance: newBalance, equity: newEquity })
        .eq('id', tx.user_id);
      
      if (profErr) throw profErr;

      setDialog({ status: 'success', title: 'Capital Refunded', message: 'Withdrawal rejected. Stake has been returned to the entity balance.' });
      await loadWithdrawals();
    } catch (e: any) {
      setDialog({ status: 'error', title: 'Sync Failure', message: e.message || 'Handshake failure with ledger nodes.' });
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <AuthedLayout title="Withdrawal Queue" subtitle="Oversight for outgoing capital remittance">
      <div className="space-y-6">
        <StatusDialog 
          status={dialog.status} 
          title={dialog.title} 
          message={dialog.message} 
          onClose={() => setDialog({ ...dialog, status: null })} 
        />

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-[#F7F7F5] border-b border-[#E4E4E4] text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">
                <tr>
                  <th className="p-4">Recipient Profile</th>
                  <th className="p-4">Remittance Value</th>
                  <th className="p-4">Destination Protocol</th>
                  <th className="p-4">Requested</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-bold uppercase text-[#6B7280]">Syncing Risk Queue...</span>
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-[#6B7280] uppercase font-bold tracking-widest">No pending remittance requests in the queue.</td></tr>
                ) : withdrawals.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-[#0055FF]" />
                        <div>
                          <span className="font-bold block text-[#0A0A0A]">{tx.profiles?.full_name || tx.user_id.slice(0, 8)}</span>
                          <span className="text-[9px] text-[#6B7280] font-mono lowercase">{tx.profiles?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#C43D3D]">
                      ${formatNumber(tx.amount, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-[#6B7280]">
                      <span className="block font-bold text-[#0A0A0A] uppercase tracking-tighter">{tx.asset}</span>
                      <span className="truncate max-w-[150px] block">{tx.meta_data?.destinationAddress || tx.meta_data?.accountNumber || "MANUAL_CHECK"}</span>
                    </td>
                    <td className="p-4 text-[#6B7280] font-mono text-[10px]">
                      {tx.created_at ? formatDate(new Date(tx.created_at)) : '---'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleApprove(tx)} 
                          disabled={!!isSyncing}
                          className="px-4 py-1.5 bg-[#0A0A0A] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all shadow-sm disabled:opacity-30"
                        >
                          Dispatch
                        </button>
                        <button 
                          onClick={() => handleReject(tx)} 
                          disabled={!!isSyncing}
                          className="p-2 border border-[#E4E4E4] text-[#C43D3D] hover:bg-[#F7F7F5] transition-colors disabled:opacity-30"
                          title="Reject & Refund"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="p-4 bg-[#0A0A0A]/5 border border-[#E4E4E4] flex items-start space-x-3">
          <ShieldAlert className="w-4 h-4 text-[#C43D3D] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            Ensure the remittance has been successfully broadcast to the destination bank or network before finalizing approval in this dashboard.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}
