"use client";

/**
 * @fileOverview Institutional Execution History (TanStack v9 Overhaul).
 */

import * as React from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Download, AlertCircle } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/components/ui/data-table-features";
import { cn } from "@/app/lib/utils";

type Trade = {
  id: string;
  instrument: string;
  vector: string;
  stake: number;
  profit: number;
  isDemo: boolean;
  timestamp: any;
};

export default function TradeHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();

  const [accountMode, setAccountMode] = React.useState<'REAL' | 'DEMO'>('REAL');

  React.useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
  }, []);

  const historyQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      where("status", "==", "Closed"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: allHistory } = useCollection<Trade>(historyQuery);

  const history = React.useMemo(() => {
    return allHistory?.filter((h) => (h.isDemo || false) === (accountMode === 'DEMO')) || [];
  }, [allHistory, accountMode]);

  const columnHelper = createColumnHelper<DataTableFeatures, Trade>();

  const columns = columnHelper.columns([
    columnHelper.accessor("id", {
      header: "Reference",
      cell: info => <span className="font-mono text-[#6B7280]">{info.getValue().slice(0, 8).toUpperCase()}</span>,
    }),
    columnHelper.accessor("instrument", {
      header: "Instrument",
      cell: info => <span className="font-bold text-[#0A0A0A]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("vector", {
      header: "Side",
      cell: info => (
        <span className={cn(
          "px-1.5 py-0.5 border text-[9px] font-bold",
          info.getValue() === 'CALL' ? "border-[#16835B] text-[#16835B]" : "border-[#C43D3D] text-[#C43D3D]"
        )}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("stake", {
      header: () => <div className="text-right">Stake</div>,
      cell: info => <div className="text-right font-mono text-[#0A0A0A]">${formatNumber(info.getValue(), { minimumFractionDigits: 2 })}</div>,
    }),
    columnHelper.accessor("profit", {
      header: () => <div className="text-right">Outcome</div>,
      cell: info => {
        const val = info.getValue();
        return (
          <div className={cn(
            "text-right font-mono font-bold",
            val >= 0 ? 'text-[#16835B]' : 'text-[#C43D3D]'
          )}>
            {val >= 0 ? '+' : ''}${formatNumber(val, { minimumFractionDigits: 2 })}
          </div>
        )
      },
    }),
  ]);

  return (
    <AuthedLayout title={t('pages.historyTitle')} subtitle={`${accountMode} Execution Archive`}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="flex items-center space-x-2 px-6 py-2 bg-white border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] shadow-sm transition-all">
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>

        <DataTable 
          columns={columns as any} 
          data={history} 
          filterColumn="instrument" 
          filterPlaceholder="Search by instrument..." 
        />

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center space-x-3 text-[#6B7280]">
          <AlertCircle className="w-4 h-4 text-[#0055FF]" />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Historical ledger synchronization is currently processing. All trades remain registered in the immutable core database.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}