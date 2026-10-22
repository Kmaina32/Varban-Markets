'use client';

/**
 * @fileOverview Global Platform Ledger (TanStack v9 Overhaul).
 * Monitors all transaction activities across every user account.
 */

import * as React from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Download, AlertCircle, FileSpreadsheet } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { createClient } from "@/app/lib/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/components/ui/data-table-features";
import { cn } from "@/app/lib/utils";

type Transaction = {
  id: string;
  ref: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

export default function GlobalLedger() {
  const { formatNumber, formatDate } = useTranslation();
  const supabase = createClient();
  
  const [data, setData] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [schemaError, setSchemaError] = React.useState(false);

  React.useEffect(() => {
    async function loadLedger() {
      setLoading(true);
      const { data: tx, error } = await supabase
        .from('transactions')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error && error.code === 'PGRST200') setSchemaError(true);
      if (tx) setData(tx as any);
      setLoading(false);
    }
    loadLedger();
  }, [supabase]);

  const columnHelper = createColumnHelper<DataTableFeatures, Transaction>();

  const columns = columnHelper.columns([
    columnHelper.accessor("ref", {
      header: "Reference",
      cell: info => <span className="font-mono font-bold uppercase">{info.getValue() || info.row.original.id.slice(0, 8)}</span>,
    }),
    columnHelper.accessor("profiles.full_name", {
      id: "entity",
      header: "Entity",
      cell: info => (
        <div className="flex flex-col">
          <span className="font-bold">{info.getValue() || `ID: ${info.row.original.user_id.slice(0, 8)}`}</span>
          <span className="text-[9px] text-[#6B7280] lowercase font-mono">{info.row.original.profiles?.email}</span>
        </div>
      ),
    }),
    columnHelper.accessor("type", {
      header: "Context",
      cell: info => <span className="uppercase text-[10px] font-bold text-[#6B7280]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("amount", {
      header: () => <div className="text-right">Value (USD)</div>,
      cell: info => (
        <div className="text-right font-mono font-bold text-[#0A0A0A]">
          ${formatNumber(info.getValue(), { minimumFractionDigits: 2 })}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Audit Status",
      cell: info => {
        const s = info.getValue();
        return (
          <div className="text-center">
            <span className={cn(
              "px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider",
              s === 'Confirmed' || s === 'Approved' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : 
              s === 'Rejected' ? "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5" :
              "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5"
            )}>
              {s}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor("created_at", {
      header: () => <div className="text-right">Settlement Time</div>,
      cell: info => <div className="text-right font-mono text-[#6B7280]">{formatDate(new Date(info.getValue()))}</div>,
    }),
  ]);

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
                Supabase cannot link transactions to profile names. Identity resolution is restricted to entity IDs.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors shadow-md">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Ledger</span>
          </button>
        </div>

        <DataTable 
          columns={columns as any} 
          data={data} 
          filterColumn="ref" 
          filterPlaceholder="Search by reference..." 
        />
      </div>
    </AuthedLayout>
  );
}