
'use client';

/**
 * @fileOverview Admin Withdrawal Approval Queue.
 * Allows administrators to review, approve, or reject outgoing remittance requests.
 */

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, CheckCircle2, XCircle, User, Wallet, AlertTriangle } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collectionGroup, query, where, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

export default function AdminWithdrawalQueue() {
  const { formatDate, formatNumber } = useTranslation();
  const db = useFirestore();

  const { data: withdrawals, loading } = useCollection<any>(
    db ? query(
      collectionGroup(db, "transactions"),
      where("type", "in", ["Withdrawal", "Crypto Withdrawal"]),
      where("status", "==", "Pending Verification"),
      orderBy("timestamp", "desc")
    ) : null
  );

  const handleApprove = async (tx: any) => {
    if (!db || !window.confirm(`Finalize payout for $${tx.amount}? Ensure funds are sent on-chain first.`)) return;
    const txRef = doc(db, `users/${tx.userId}/transactions`, tx.id);
    await updateDoc(txRef, { status: "Approved", processedAt: serverTimestamp() });
    
    await addDoc(collection(db, `users/${tx.userId}/notifications`), {
      title: "Withdrawal Approved",
      body: `Your withdrawal of $${tx.amount} has been approved and dispatched to your destination.`,
      type: "Funds",
      isUnread: true,
      timestamp: serverTimestamp()
    });
    alert("Withdrawal marked as Approved.");
  };

  const handleReject = async (tx: any) => {
    if (!db || !window.confirm("Reject withdrawal and refund user balance?")) return;
    
    // 1. Refund Balance
    const userRef = doc(db, "users", tx.userId);
    await updateDoc(userRef, {
      balance: increment(tx.amount),
      equity: increment(tx.amount)
    });

    // 2. Update Transaction
    const txRef = doc(db, `users/${tx.userId}/transactions`, tx.id);
    await updateDoc(txRef, { status: "Rejected", processedAt: serverTimestamp() });

    alert("Withdrawal rejected and balance refunded.");
  };

  return (
    <AuthedLayout title="Withdrawal Queue" subtitle="Root authority oversight for outgoing capital remittance">
      <div className="space-y-6">
        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Recipient Profile</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Amount & Fee</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Destination Protocol</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Requested</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center text-[#6B7280] font-mono">Synchronizing Risk Queue...</td></tr>
                ) : withdrawals?.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-[#6B7280]">Queue clear. No pending remittance requests.</td></tr>
                ) : withdrawals?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#F7F7F5]">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-[#0055FF]" />
                        <span className="font-bold text-[#0A0A0A] uppercase tracking-tighter">{tx.userId.slice(0,10)}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="font-bold text-[#C43D3D]">${formatNumber(tx.amount, { minimumFractionDigits: 2 })}</div>
                      <div className="text-[8px] text-[#6B7280] uppercase">Fee: ${tx.fee || 0}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#0A0A0A]">{tx.asset}</span>
                        <span className="text-[9px] text-[#6B7280] font-mono truncate max-w-[150px]">{tx.destinationAddress || tx.bankDetails?.accountNumber}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#6B7280] text-[10px]">
                      {tx.timestamp?.toDate ? formatDate(tx.timestamp.toDate()) : '---'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleApprove(tx)} className="px-3 py-1.5 bg-[#0A0A0A] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-colors">
                          Dispatch
                        </button>
                        <button onClick={() => handleReject(tx)} className="p-2 border border-[#E4E4E4] text-[#C43D3D] hover:bg-[#F7F7F5]">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
