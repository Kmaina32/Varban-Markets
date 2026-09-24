'use client';

/**
 * @fileOverview Admin Deposit Verification Queue.
 * Allows administrators to review submitted TxHashes and confirm crypto deposits.
 */

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search, CheckCircle2, XCircle, ExternalLink, Clock, DollarSign } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, collectionGroup, query, where, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

export default function AdminDepositQueue() {
  const { formatDate, formatNumber } = useTranslation();
  const db = useFirestore();

  const { data: deposits, loading } = useCollection<any>(
    db ? query(
      collectionGroup(db, "transactions"),
      where("type", "==", "Crypto Deposit"),
      where("status", "==", "Pending Verification"),
      orderBy("timestamp", "desc")
    ) : null
  );

  const handleApprove = async (tx: any) => {
    if (!db || !window.confirm(`Approve $${tx.amount} deposit for user?`)) return;

    try {
      // 1. Update Transaction Status
      const txRef = doc(db, `users/${tx.userId}/transactions`, tx.id);
      await updateDoc(txRef, { status: "Confirmed", processedAt: serverTimestamp() });

      // 2. Update User Balance
      const userRef = doc(db, "users", tx.userId);
      await updateDoc(userRef, {
        balance: increment(tx.amount),
        equity: increment(tx.amount)
      });

      // 3. Notify User
      await addDoc(collection(db, `users/${tx.userId}/notifications`), {
        title: "Deposit Confirmed",
        body: `Your crypto deposit of $${tx.amount} has been verified and added to your balance.`,
        type: "Funds",
        isUnread: true,
        timestamp: serverTimestamp()
      });

      alert("Deposit successfully processed.");
    } catch (e) {
      alert("Processing failure: " + e.message);
    }
  };

  const handleReject = async (tx: any) => {
    if (!db || !window.confirm("Reject this deposit record?")) return;
    const txRef = doc(db, `users/${tx.userId}/transactions`, tx.id);
    await updateDoc(txRef, { status: "Rejected", processedAt: serverTimestamp() });
  };

  return (
    <AuthedLayout title="Deposit Verification" subtitle="Review and confirm incoming blockchain transmissions">
      <div className="space-y-6">
        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Asset & Network</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Amount (USD)</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Verification Hash</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Submitted</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center text-[#6B7280] font-mono">Accessing Blockchain Logs...</td></tr>
                ) : deposits?.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-[#6B7280]">No pending deposits found in the verification queue.</td></tr>
                ) : deposits?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#F7F7F5]">
                    <td className="p-4">
                      <span className="font-bold block text-[#0A0A0A]">{tx.asset}</span>
                      <span className="text-[9px] text-[#6B7280] uppercase font-mono">{tx.network}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#16835B]">
                      ${formatNumber(tx.amount, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-[#6B7280] truncate max-w-[120px]">{tx.txHash}</span>
                        <a href={`https://tronscan.org/#/transaction/${tx.txHash}`} target="_blank" className="text-[#0055FF] hover:underline">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="p-4 text-[#6B7280] text-[10px]">
                      {tx.timestamp?.toDate ? formatDate(tx.timestamp.toDate()) : '---'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleApprove(tx)} className="p-2 bg-[#16835B] text-white hover:bg-[#0A0A0A] transition-colors shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleReject(tx)} className="p-2 border border-[#E4E4E4] text-[#C43D3D] hover:bg-[#C43D3D] hover:text-white transition-colors">
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
