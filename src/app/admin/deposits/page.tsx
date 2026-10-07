'use client';

/**
 * @fileOverview Admin Deposit Verification Queue (Supabase Migrated).
 * Allows administrators to review submitted TxHashes and confirm crypto deposits.
 * Resilient to missing schema relationships.
 */

import { useState, useEffect, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ExternalLink, Loader2, Database, AlertCircle } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

export default function AdminDepositQueue() {
  const { formatDate, formatNumber } = useTranslation();
  const supabase = createClient();
  
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState(false);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const loadDeposits = async () => {
    setLoading(true);
    setSchemaError(false);
    
    // Primary attempt with profile join
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, email)')
      .eq('type', 'Crypto Deposit')
      .eq('status', 'Pending Verification')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Deposit load error:", error);
      if (error.code === 'PGRST200') {
        setSchemaError(true);
        // Fallback fetch
        const { data: fallbackData } = await supabase
          .from('transactions')
          .select('*')
          .eq('type', 'Crypto Deposit')
          .eq('status', 'Pending Verification')
          .order('created_at', { ascending: false });
        setDeposits(fallbackData || []);
      }
    } else {
      setDeposits(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const handleApprove = async (tx: any) => {
    if (!window.confirm(`Finalize $${tx.amount} deposit? Account balance will be incremented.`)) return;

    setIsSyncing(tx.id);
    try {
      const { data: profile } = await supabase.from('profiles').select('balance, equity').eq('id', tx.user_id).single();
      if (!profile) throw new Error("Entity context unreachable.");

      const newBalance = (parseFloat(profile.balance) || 0) + parseFloat(tx.amount);
      const newEquity = (parseFloat(profile.equity) || 0) + parseFloat(tx.amount);

      const { error: txErr } = await supabase
        .from('transactions')
        .update({ status: 'Confirmed' })
        .eq('id', tx.id);
      
      if (txErr) throw txErr;

      const { error: profErr } = await supabase
        .from('profiles')
        .update({ balance: newBalance, equity: newEquity })
        .eq('id', tx.user_id);
      
      if (profErr) throw profErr;

      setDialog({ status: 'success', title: 'Capital Provisioned', message: 'The deposit has been verified and the trader balance has been updated.' });
      await loadDeposits();
    } catch (e: any) {
      setDialog({ status: 'error', title: 'Sync Error', message: e.message || 'Handshake failure with ledger nodes.' });
    } finally {
      setIsSyncing(null);
    }
  };

  const handleReject = async (tx: any) => {
    if (!window.confirm("Reject this deposit transmission?")) return;
    setIsSyncing(tx.id);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'Rejected' })
        .eq('id', tx.id);
      if (error) throw error;
      await loadDeposits();
    } catch (e) {
      setDialog({ status: 'error', title: 'Action Failed', message: 'Failed to update transaction status.' });
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <AuthedLayout title="Deposit Verification" subtitle="Auditing incoming blockchain transmissions">
      <div className="space-y-6">
        <StatusDialog 
          status={dialog.status} 
          title={dialog.title} 
          message={dialog.message} 
          onClose={() => setDialog({ ...dialog, status: null })} 
        />

        {schemaError && (
          <div className="p-4 bg-[#C9A227]/5 border border-[#C9A227]/20 flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#C9A227] uppercase tracking-widest">Profile lookup offline (PGRST200)</p>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Foreign key relationships are being synchronized. Trading entity names are currently represented by numeric IDs.
              </p>
            </div>
          </div>
        )}

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-[#F7F7F5] border-b border-[#E4E4E4] text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">
                <tr>
                  <th className="p-4">Entity & Network</th>
                  <th className="p-4">Amount (USD)</th>
                  <th className="p-4">Evidence Hash</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-center">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-bold uppercase text-[#6B7280]">Querying Ledger...</span>
                    </td>
                  </tr>
                ) : deposits.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-[#6B7280] uppercase font-bold tracking-widest">Deposit verification queue is empty.</td></tr>
                ) : deposits.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4">
                      <span className="font-bold block text-[#0A0A0A]">{tx.profiles?.full_name || `ID: ${tx.user_id.slice(0, 8)}`}</span>
                      <span className="text-[9px] text-[#6B7280] uppercase font-mono tracking-tighter">{tx.asset}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#16835B]">
                      ${formatNumber(tx.amount, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-[#6B7280] truncate max-w-[120px]">{tx.meta_data?.txHash || "NO_HASH"}</span>
                        <a href={`https://tronscan.org/#/transaction/${tx.meta_data?.txHash}`} target="_blank" className="text-[#0055FF] hover:opacity-70">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="p-4 text-[#6B7280] font-mono text-[10px]">
                      {tx.created_at ? formatDate(new Date(tx.created_at)) : '---'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleApprove(tx)} 
                          disabled={!!isSyncing}
                          className="p-2.5 bg-[#16835B] text-white hover:bg-[#0A0A0A] transition-colors shadow-sm disabled:opacity-30"
                          title="Verify & Fund"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleReject(tx)} 
                          disabled={!!isSyncing}
                          className="p-2.5 border border-[#E4E4E4] text-[#C43D3D] hover:bg-[#C43D3D] hover:text-white transition-colors disabled:opacity-30"
                          title="Reject Transaction"
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

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start space-x-3">
          <Database className="w-4 h-4 text-[#0055FF] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            Verify the evidence hash on the official blockchain explorer before authorizing capital provisioning.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}