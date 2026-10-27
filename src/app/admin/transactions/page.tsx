'use client';

/**
 * @fileOverview Global Platform Ledger (TanStack v9 Overhaul).
 * Monitors all transaction activities across every user account.
 */

import * as React from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Download, AlertCircle, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useFirestore } from "@/firebase";
import { collectionGroup, collection, getDocs } from "firebase/firestore";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/components/ui/data-table-features";
import { cn } from "@/app/lib/utils";

const toMillis = (ts: any): number => {
  try {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch { return 0; }
};

type Transaction = {
  id: string;
  ref: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  created_at: number;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

export default function GlobalLedger() {
  const { formatNumber, formatDate } = useTranslation();
  const db = useFirestore();
  
  const [data, setData] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [schemaError, setSchemaError] = React.useState(false);

  React.useEffect(() => {
    async function loadLedger() {
      if (!db) return;
      setLoading(true);
      try {
        const [txSnap, userSnap] = await Promise.all([
          getDocs(collectionGroup(db, 'transactions')),
          getDocs(collection(db, 'users')).catch(() => null),
        ]);
        const profileMap: Record<string, { full_name: string; email: string }> = {};
        userSnap?.docs.forEach(u => {
          const x: any = u.data() || {};
          profileMap[u.id] = {
            full_name: x.profile?.fullName || [x.profile?.firstName, x.profile?.lastName].filter(Boolean).join(" ") || "",
            email: x.profile?.email || "",
          };
        });
        const rows = txSnap.docs.map(d => {
          const x: any = d.data() || {};
          const uid = d.ref.parent.parent?.id || "";
          return {
            id: d.id,
            ref: x.ref || "",
            type: x.type || "",
            asset: x.asset || "",
            amount: Number(x.amount) || 0,
            status: x.status || "",
            created_at: toMillis(x.timestamp),
            user_id: uid,
            profiles: profileMap[uid] || { full_name: "", email: "" },
          } as Transaction;
        });
        rows.sort((a, b) => b.created_at - a.created_at);
        setData(rows.slice(0, 200));
      } catch (e) {
        console.error("Ledger load error:", e);
        setSchemaError(true);
      }
      setLoading(false);
    }
    loadLedger();
  }, [db]);

  const columnHelper = createColumnHelper<DataTableFeatures, Transaction>();

  const columns = columnHelper.columns([
    columnHelper.accessor("ref", {
      header: "Reference",
      cell: info => <span className="font-mono font-bold uppercase">{info.getValue() || (info.row.original.id || "").slice(0, 8)}</span>,
    }),
    columnHelper.accessor("profiles.full_name", {
      id: "entity",
      header: "Entity",
      cell: info => (
        <div className="flex flex-col">
          <span className="font-bold">{info.getValue() || `ID: ${(info.row.original.user_id || "").slice(0, 8)}`}</span>
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
          ${formatNumber(info.getValue() || 0, { minimumFractionDigits: 2 })}
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
      cell: info => <div className="text-right font-mono text-[#6B7280]">{info.getValue() ? formatDate(new Date(info.getValue())) : "---"}</div>,
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
              <p className="text-xs font-bold text-[#C9A227] uppercase tracking-widest">Ledger query failed</p>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Unable to load the full ledger. Check admin permissions and indexes.
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
