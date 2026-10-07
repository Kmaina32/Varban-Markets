'use client';

/**
 * @fileOverview Global Platform Ledger (Supabase Migrated).
 * Monitors all transaction activities across every user account.
 * Hardened against missing schema relationships (PGRST200).
 */

import { useState, useEffect, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Download, Search, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/app/lib/utils";

export default function GlobalLedger() {
  const { formatNumber, formatDate } = useTranslation();
  const supabase = createClient();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [schemaError, setSchemaError] = useState(false);

  useEffect(() => {
    async function loadLedger() {
      setLoading(true);
      setSchemaError(false);
      
      // Attempt joined query
      const { data, error } = await supabase
        .from('transactions')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) {
        console.error("Ledger load error:", error);
        
        // Handle missing relationship (PGRST200)
        if (error.code === 'PGRST200') {
          setSchemaError(true);
          // Fallback to non-joined query
          const { data: fallbackData } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);
          setTransactions(fallbackData || []);
        }
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    }
    loadLedger();
  }, [supabase]);

  const filteredTx = useMemo(() => {
    if (!transactions) return [];
    const q = searchQuery.toLowerCase();
    return transactions.filter(tx => 
      (tx.ref || "").toLowerCase().includes(q) || 
      (tx.profiles?.email || "").toLowerCase().includes(q) ||
      (tx.type || "").toLowerCase().includes(q) ||
      (tx.user_id || "").toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  return (
    <AuthedLayout 
      title="Platform Ledger" 
      subtitle="Institutional transaction monitoring and auditing conduit"
    >
      <div className="space-y-6">
        {schemaError && (
          <div className="p-4 bg-[#C9A227]/5 border border-[#C9A227]/20 flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#C9A227] uppercase tracking-widest">Database relationship missing (PGRST200)</p>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Supabase cannot link transactions to profile names. Using entity IDs as fallback. Please apply the SQL Foreign Key fix to enable full identity resolution.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search by ref, email, or context..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E4E4E4] text-xs pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0055FF] shadow-sm"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors shadow-md">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Ledger</span>
          </button>
        </div>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-[#F7F7F5] border-b border-[#E4E4E4] text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">
                <tr>
                  <th className="p-4">Reference Token</th>
                  <th className="p-4">Entity Identity</th>
                  <th className="p-4">Operation Context</th>
                  <th className="p-4">Asset Domain</th>
                  <th className="p-4 text-right">Value (USD)</th>
                  <th className="p-4 text-center">Audit Status</th>
                  <th className="p-4 text-right">Settlement Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-20 text-center">
                      <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-bold uppercase text-[#6B7280]">Accessing Decentralized Ledger...</span>
                    </td>
                  </tr>
                ) : filteredTx.length === 0 ? (
                  <tr><td colSpan={7} className="p-16 text-center text-[#6B7280] uppercase font-bold tracking-widest">No transactions detected in the global registry.</td></tr>
                ) : filteredTx.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4 font-bold text-[#0A0A0A]">
                      {tx.ref || tx.id.slice(0, 12).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <span className="block font-bold text-[#0A0A0A] truncate max-w-[150px]">
                        {tx.profiles?.full_name || (schemaError ? `ID: ${tx.user_id.slice(0, 8)}` : "---")}
                      </span>
                      <span className="text-[8px] text-[#6B7280] lowercase">{tx.profiles?.email}</span>
                    </td>
                    <td className="p-4 text-[#6B7280] uppercase text-[10px] tracking-tight">{tx.type}</td>
                    <td className="p-4 text-[#6B7280] uppercase text-[10px]">{tx.asset || "USD"}</td>
                    <td className="p-4 text-right font-bold text-[#0A0A0A]">
                      ${formatNumber(tx.amount || 0, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider",
                        tx.status === 'Confirmed' || tx.status === 'Approved' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : 
                        tx.status === 'Rejected' ? "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5" :
                        "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#6B7280] text-[10px]">
                      {tx.created_at ? formatDate(new Date(tx.created_at)) : "---"}
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