'use client';

import { useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Download, Filter, Search } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useCollection, useFirestore } from "@/firebase";
import { collectionGroup, query, orderBy, limit } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

/**
 * @fileOverview Global Platform Ledger.
 * Monitors all transaction activities across every user account using collectionGroup auditing.
 */

export default function GlobalLedger() {
  const { t, formatNumber, formatDate } = useTranslation();
  const db = useFirestore();

  // Use collectionGroup for platform-wide transaction monitoring (Requires index)
  const transactionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collectionGroup(db, "transactions"), orderBy("timestamp", "desc"), limit(100));
  }, [db]);
  const { data: transactions, loading } = useCollection<any>(transactionsQuery);

  return (
    <AuthedLayout 
      title="Platform Ledger" 
      subtitle="Institutional transaction monitoring and auditing conduit"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search global reference keys..." 
              className="w-full bg-white border border-[#E4E4E4] text-[10px] pl-9 pr-4 py-2 focus:outline-none focus:border-[#0055FF]"
            />
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-wider hover:bg-[#F7F7F5] transition-colors">
              <Filter className="w-3 h-3" />
              <span>Filter Feed</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-[#0055FF] text-white border border-[#0055FF] text-[10px] font-bold uppercase tracking-wider hover:bg-[#0A0A0A] transition-colors">
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Reference Token</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Operation Context</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Asset Domain</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-right">Value (USD)</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">Status</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-right">Settlement Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs font-mono">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center text-[#6B7280] font-mono">Accessing Decentralized Ledger...</td></tr>
                ) : transactions?.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-[#6B7280]">No transactions recorded in the global context.</td></tr>
                ) : transactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4 font-bold text-[#0A0A0A]">
                      {tx.ref || tx.id.slice(0, 12).toUpperCase()}
                    </td>
                    <td className="p-4 text-[#6B7280] uppercase text-[10px] tracking-tight">{tx.type}</td>
                    <td className="p-4 text-[#6B7280] uppercase text-[10px]">{tx.asset || "USD"}</td>
                    <td className="p-4 text-right font-bold text-[#0A0A0A]">
                      ${formatNumber(tx.amount || 0, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-1.5 py-0.5 border text-[9px] font-bold uppercase",
                        tx.status === 'Confirmed' ? "border-[#16835B] text-[#16835B]" : "border-[#0055FF] text-[#0055FF]"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#6B7280] text-[10px]">
                      {tx.timestamp?.toDate ? formatDate(tx.timestamp.toDate()) : "---"}
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
