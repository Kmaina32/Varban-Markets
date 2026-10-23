'use client';

/**
 * @fileOverview Admin Deposit Verification Queue (Firestore).
 * Allows administrators to review submitted TxHashes and confirm crypto deposits.
 * Resilient to missing schema relationships.
 */

import { useState, useEffect, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ExternalLink, Loader2, Database, AlertCircle } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, collectionGroup, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';


const toMillis = (ts: any): number => {
  try {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch { return 0; }
};

const mapTx = (d: any, profileMap: Record<string, any>) => {
  const x: any = d.data() || {};
  const uid: string = d.ref.parent.parent?.id || "";
  return {
    id: d.id,
    docRef: d.ref,
    user_id: uid,
    ref: x.ref || "",
    type: x.type || "",
    asset: x.asset || "",
    amount: Number(x.amount) || 0,
    status: x.status || "",
    created_at: toMillis(x.timestamp),
    meta_data: {
      txHash: x.txHash,
      destinationAddress: x.destinationAddress,
      accountNumber: x.accountNumber,
    },
    profiles: profileMap[uid] || null,
  };
};

const loadProfileMap = async (db: any) => {
  const map: Record<string, any> = {};
  try {
    const snap = await getDocs(collection(db, "users"));
    snap.docs.forEach(u => {
      const x: any = u.data() || {};
      map[u.id] = {
        full_name: x.profile?.fullName || [x.profile?.firstName, x.profile?.lastName].filter(Boolean).join(" ") || "",
        email: x.profile?.email || "",
        balance: Number(x.balance) || 0,
      };
    });
  } catch (e) {
    console.error("Profile lookup failed:", e);
  }
  return map;
};

export default function AdminDepositQueue() {
  const { formatDate, formatNumber } = useTranslation();
  const db = useFirestore();
  
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
    if (!db) return;
    setLoading(true);
    setSchemaError(false);
    try {
      const [snap, profileMap] = await Promise.all([
        getDocs(collectionGroup(db, 'transactions')),
        loadProfileMap(db),
      ]);
      const rows = snap.docs
        .map(d => mapTx(d, profileMap))
        .filter(t => t.type === 'Crypto Deposit' && t.status === 'Pending Verification')
        .sort((a, b) => b.created_at - a.created_at);
      setDeposits(rows);
    } catch (error) {
      console.error("Deposit load error:", error);
      setSchemaError(true);
      setDeposits([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeposits();
  }, [db]);

  const handleApprove = async (tx: any) => {
    if (!window.confirm(`Finalize $${tx.amount} deposit? Account balance will be incremented.`)) return;

    setIsSyncing(tx.id);
    try {
      if (!db || !tx.user_id) throw new Error("Entity context unreachable.");
      const amt = Number(tx.amount) || 0;

      await updateDoc(tx.docRef, { status: 'Confirmed' });
      await updateDoc(doc(db, 'users', tx.user_id), { balance: increment(amt), equity: increment(amt) });

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
      await updateDoc(tx.docRef, { status: 'Rejected' });
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
              <p className="text-xs font-bold text-[#C9A227] uppercase tracking-widest">Deposit query failed</p>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Unable to load the deposit queue. Check admin permissions and indexes.
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
                      <span className="font-bold block text-[#0A0A0A]">{tx.profiles?.full_name || `ID: ${(tx.user_id || "").slice(0, 8)}`}</span>
                      <span className="text-[9px] text-[#6B7280] uppercase font-mono tracking-tighter">{tx.asset}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#16835B]">
                      ${formatNumber(tx.amount || 0, { minimumFractionDigits: 2 })}
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