
"use client";

import { useState, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";

export default function ComprehensiveAuditLedger() {
  const { user } = useUser();
  const db = useFirestore();
  const [filterType, setFilterType] = useState<string>("All");

  const transactionsQuery = useMemo(() => {
    if (!db || !user) return null;
    let q = query(collection(db, `users/${user.uid}/transactions`), orderBy("timestamp", "desc"));
    if (filterType === "Trades") {
      q = query(q, where("type", "==", "Trade Settlement"));
    } else if (filterType === "Cashier") {
      q = query(q, where("type", "in", ["Vault Deposit", "Remittance Withdrawal"]));
    }
    return q;
  }, [db, user, filterType]);

  const { data: transactions, loading } = useCollection<any>(transactionsQuery);

  return (
    <AuthedLayout 
      title="Comprehensive Transaction Ledger" 
      subtitle="IMMUTABLE ACCOUNT AUDITING LOG"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-white border-[#E4E4E4] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-none shadow-sm">
          <div className="flex space-x-2">
            {["All", "Trades", "Cashier"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 border transition-all ${filterType === type ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-[#0A0A0A] border-[#E4E4E4] hover:bg-[#F7F7F5]'}`}
              >
                {type} Scope
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-[#6B7280]" />
            </span>
            <input
              type="text"
              placeholder="Search reference keys..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-[#6B7280] rounded-none focus:outline-none"
            />
          </div>
        </Card>

        <Card className="bg-white border-[#E4E4E4] rounded-none overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4E4E4] bg-[#F7F7F5] text-[#6B7280]">
                  <th className="p-3 font-mono text-[10px] uppercase">Transaction Timestamp</th>
                  <th className="p-3 font-mono text-[10px] uppercase">Reference Token</th>
                  <th className="p-3 text-[10px] uppercase">Operation Context</th>
                  <th className="p-3 text-[10px] uppercase">Asset Domain</th>
                  <th className="p-3 text-[10px] uppercase text-center">Vector</th>
                  <th className="p-3 text-[10px] uppercase text-right">Committed Value</th>
                  <th className="p-3 text-[10px] uppercase text-center">Execution Status</th>
                  <th className="p-3 text-[10px] uppercase text-right">Net Return Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4]">
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-[#6B7280] font-mono">Loading transaction records...</td></tr>
                ) : transactions?.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-[#6B7280] font-mono">No transaction history found for the selected scope.</td></tr>
                ) : transactions?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                    <td className="p-3 font-mono text-[#6B7280]">
                      {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : log.timestamp}
                    </td>
                    <td className="p-3 font-mono font-bold">{log.id.slice(0, 10).toUpperCase()}</td>
                    <td className="p-3 font-medium text-[#0A0A0A]">{log.type}</td>
                    <td className="p-3 text-[#6B7280] uppercase tracking-wider text-[11px]">{log.asset}</td>
                    <td className="p-3 text-center">
                      {log.vector && log.vector !== "--" ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${log.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#C43D3D] text-[#C43D3D]'}`}>
                          {log.vector}
                        </span>
                      ) : <span className="text-[#6B7280] font-mono">--</span>}
                    </td>
                    <td className="p-3 text-right font-mono">${(log.amount || 0).toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#E4E4E4] bg-[#F7F7F5]">
                        {log.status}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-mono font-bold ${log.output?.startsWith('+') ? 'text-[#16835B]' : 'text-[#0A0A0A]'}`}>
                      {log.output || '--'}
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
