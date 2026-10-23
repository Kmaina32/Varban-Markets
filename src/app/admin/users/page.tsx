'use client';

/**
 * @fileOverview User Directory (TanStack v9 Overhaul).
 * Regulatory oversight and entity management.
 */

import * as React from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { UserCog, AlertTriangle, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useFirestore } from "@/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/components/ui/data-table-features";
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

const toDateSafe = (ts: any): Date | null => {
  const ms = toMillis(ts);
  return ms ? new Date(ms) : null;
};

const mapUser = (d: any) => {
  const x = d.data() || {};
  return {
    id: d.id,
    full_name: x.profile?.fullName || [x.profile?.firstName, x.profile?.lastName].filter(Boolean).join(" ") || "",
    email: x.profile?.email || "",
    country: x.profile?.country || "",
    verification_status: x.status?.verificationStatus || "Not Verified",
    role: x.status?.role || "Trader",
    balance: Number(x.balance) || 0,
    created: toMillis(x.profile?.createdAt) || toMillis(x.status?.createdAt),
  };
};

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  verification_status: string;
  role: string;
  balance: number;
};

export default function UserManagement() {
  const { formatNumber } = useTranslation();
  const db = useFirestore();
  
  const [data, setData] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  
  const [dialog, setDialog] = React.useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const loadUsers = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setData(snap.docs.map(mapUser).sort((a, b) => b.created - a.created) as any);
    } catch (e) {
      console.error("User load error:", e);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadUsers();
  }, [db]);

  const handleVerify = async (userId: string, currentStatus: string) => {
    setIsProcessing(userId);
    const nextStatus = currentStatus === 'Verified' ? 'Not Verified' : 'Verified';
    try {
      if (!db) throw new Error('no db');
      await updateDoc(doc(db, 'users', userId), { 'status.verificationStatus': nextStatus });
      await loadUsers();
    } catch (e) {
      setDialog({ status: 'error', title: 'Update Failed', message: 'Failed to modify verification state.' });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (!window.confirm(`Modify authority to ${currentRole === 'Admin' ? 'Trader' : 'Admin'}?`)) return;
    setIsProcessing(userId);
    const nextRole = currentRole === 'Admin' ? 'Trader' : 'Admin';
    try {
      if (!db) throw new Error('no db');
      await updateDoc(doc(db, 'users', userId), { 'status.role': nextRole });
      await loadUsers();
    } catch (e) {
      setDialog({ status: 'error', title: 'Update Failed', message: 'Failed to modify role authority.' });
    } finally {
      setIsProcessing(null);
    }
  };

  const columnHelper = createColumnHelper<DataTableFeatures, UserProfile>();

  const columns = columnHelper.columns([
    columnHelper.accessor("full_name", {
      header: "Entity Profile",
      cell: info => (
        <div className="flex flex-col">
          <span className="font-bold">{info.getValue() || "Unnamed Entity"}</span>
          <span className="text-[9px] text-[#6B7280] font-mono">{info.row.original.id.slice(0, 12).toUpperCase()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Contact Domain",
      cell: info => <span className="font-mono text-[#6B7280]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("verification_status", {
      header: "KYC Status",
      cell: info => {
        const v = info.getValue();
        return (
          <div className="text-center">
            <span className={cn(
              "px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider",
              v === 'Verified' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5"
            )}>
              {v || "Not Verified"}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor("role", {
      header: "Authority",
      cell: info => (
        <button 
          onClick={() => handleToggleRole(info.row.original.id, info.getValue())}
          className={cn(
            "px-3 py-1 border text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 mx-auto shadow-sm",
            info.getValue() === 'Admin' ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
          )}
        >
          <UserCog className="w-3 h-3" />
          <span>{info.getValue() || "Trader"}</span>
        </button>
      ),
    }),
    columnHelper.accessor("balance", {
      header: () => <div className="text-right">Balance</div>,
      cell: info => <div className="text-right font-mono font-bold">${formatNumber(info.getValue() || 0, { minimumFractionDigits: 2 })}</div>,
    }),
    columnHelper.display({
      id: "actions",
      header: "Decision",
      cell: info => (
        <button 
          onClick={() => handleVerify(info.row.original.id, info.row.original.verification_status)}
          className="text-[9px] font-bold uppercase tracking-widest text-[#0055FF] underline decoration-2 underline-offset-4 hover:text-[#0A0A0A] transition-colors"
        >
          {isProcessing === info.row.original.id ? "Syncing..." : "Toggle Audit"}
        </button>
      ),
    }),
  ]);

  return (
    <AuthedLayout title="User Directory" subtitle="Regulatory oversight and entity management">
      <div className="space-y-6">
        <StatusDialog 
          status={dialog.status} 
          title={dialog.title} 
          message={dialog.message} 
          onClose={() => setDialog({ ...dialog, status: null })} 
        />

        <DataTable 
          columns={columns as any} 
          data={data} 
          filterColumn="full_name" 
          filterPlaceholder="Search entities..." 
        />
      </div>
    </AuthedLayout>
  );
}