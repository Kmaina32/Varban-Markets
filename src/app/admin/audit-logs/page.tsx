'use client';

import { useMemo, useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  Search, 
  Download, 
  Lock, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText 
} from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit, where, addDoc } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

interface AuditLog {
  id: string;
  timestamp?: any;
  adminEmail?: string;
  admin?: string;
  operatorEmail?: string;
  actionType?: string;
  action?: string;
  type?: string;
  targetUser?: string;
  targetUserEmail?: string;
  targetEmail?: string;
  target?: string;
  userId?: string;
  details?: any;
  description?: string;
  status?: string;
  category?: string;
}

type FilterCategory = "All" | "Balance Adjustments" | "User Management" | "Security Events" | "System";

const FILTER_BUTTONS: FilterCategory[] = [
  "All",
  "Balance Adjustments",
  "User Management",
  "Security Events",
  "System",
];

export default function AdminAuditLogsPage() {
  const { formatDate } = useTranslation();
  const db = useFirestore();
  const { user } = useUser();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalLog, setActiveModalLog] = useState<AuditLog | null>(null);

  // Query Firestore collection 'adminLogs' ordered by timestamp desc, limit 200
  const logsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "adminLogs"),
      orderBy("timestamp", "desc"),
      limit(200)
    );
  }, [db]);

  const { data: rawLogs, loading } = useCollection<AuditLog>(logsQuery);

  const getFormattedTimestamp = (ts: any): string => {
    if (!ts) return "--";
    try {
      let date: Date | null = null;
      if (typeof ts.toDate === "function") {
        date = ts.toDate();
      } else if (ts instanceof Date) {
        date = ts;
      } else if (typeof ts === "number" || typeof ts === "string") {
        const parsed = new Date(ts);
        if (!isNaN(parsed.getTime())) date = parsed;
      } else if (ts.seconds) {
        date = new Date(ts.seconds * 1000);
      }

      if (date && !isNaN(date.getTime())) {
        return formatDate(date);
      }
    } catch {
      return "--";
    }
    return "--";
  };

  const getAdminEmail = (log: AuditLog): string => {
    return log.adminEmail || log.admin || log.operatorEmail || "--";
  };

  const getActionType = (log: AuditLog): string => {
    return log.actionType || log.action || log.type || "--";
  };

  const getTargetUser = (log: AuditLog): string => {
    return log.targetUser || log.targetUserEmail || log.targetEmail || log.target || log.userId || "--";
  };

  const getDetails = (log: AuditLog): string => {
    if (log.details !== undefined && log.details !== null && log.details !== "") {
      if (typeof log.details === "object") {
        try {
          return JSON.stringify(log.details);
        } catch {
          return "[Object]";
        }
      }
      return String(log.details);
    }
    if (log.description) return log.description;
    return "--";
  };

  const getStatus = (log: AuditLog): string => {
    return log.status || "--";
  };

  const matchesCategory = (log: AuditLog, filter: FilterCategory): boolean => {
    if (filter === "All") return true;

    const action = getActionType(log).toLowerCase();
    const category = (log.category || "").toLowerCase();
    const details = getDetails(log).toLowerCase();

    switch (filter) {
      case "Balance Adjustments":
        return (
          category.includes("balance") ||
          category.includes("ledger") ||
          category.includes("transaction") ||
          action.includes("balance") ||
          action.includes("credit") ||
          action.includes("debit") ||
          action.includes("deposit") ||
          action.includes("withdraw") ||
          action.includes("adjustment") ||
          details.includes("balance") ||
          details.includes("credit") ||
          details.includes("debit")
        );
      case "User Management":
        return (
          category.includes("user") ||
          category.includes("kyc") ||
          category.includes("account") ||
          action.includes("user") ||
          action.includes("kyc") ||
          action.includes("role") ||
          action.includes("verify") ||
          action.includes("verification") ||
          action.includes("suspend") ||
          action.includes("ban") ||
          action.includes("authority")
        );
      case "Security Events":
        return (
          category.includes("security") ||
          category.includes("auth") ||
          action.includes("security") ||
          action.includes("auth") ||
          action.includes("login") ||
          action.includes("password") ||
          action.includes("2fa") ||
          action.includes("token") ||
          action.includes("permission") ||
          action.includes("session")
        );
      case "System":
        return (
          category.includes("system") ||
          category.includes("market") ||
          category.includes("config") ||
          category.includes("platform") ||
          action.includes("system") ||
          action.includes("market") ||
          action.includes("switch") ||
          action.includes("setting") ||
          action.includes("config") ||
          action.includes("maintenance")
        );
      default:
        return true;
    }
  };

  const matchesSearch = (log: AuditLog, queryStr: string): boolean => {
    if (!queryStr.trim()) return true;
    const term = queryStr.toLowerCase().trim();
    const targetUser = getTargetUser(log).toLowerCase();
    const actionType = getActionType(log).toLowerCase();

    return targetUser.includes(term) || actionType.includes(term);
  };

  const displayedLogs = useMemo(() => {
    if (!rawLogs) return [];
    return rawLogs.filter((log) => matchesCategory(log, selectedFilter) && matchesSearch(log, searchQuery));
  }, [rawLogs, selectedFilter, searchQuery]);

  const handleExportCSV = () => {
    if (!displayedLogs || displayedLogs.length === 0) return;

    const headers = ["Timestamp", "Admin Email", "Action Type", "Target User", "Details", "Status"];

    const escapeCsv = (val: string): string => {
      const stringVal = (val ?? "--").toString();
      if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r")) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    const rows = displayedLogs.map((log) => [
      escapeCsv(getFormattedTimestamp(log.timestamp)),
      escapeCsv(getAdminEmail(log)),
      escapeCsv(getActionType(log)),
      escapeCsv(getTargetUser(log)),
      escapeCsv(getDetails(log)),
      escapeCsv(getStatus(log)),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `varban-admin-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "success" || s === "confirmed" || s === "approved" || s === "resolved" || s === "executed") {
      return "border-[#16835B] text-[#16835B] bg-[#16835B]/5";
    }
    if (s === "failed" || s === "rejected" || s === "error" || s === "blocked") {
      return "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5";
    }
    if (s === "warning" || s === "pending" || s === "flagged") {
      return "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5";
    }
    if (status === "--") {
      return "border-[#E4E4E4] text-[#6B7280] bg-[#F7F7F5]";
    }
    return "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5";
  };

  return (
    <AuthedLayout 
      title="Audit Logs" 
      subtitle="Immutable Security Event Log"
    >
      <div className="space-y-6">
        {/* Notice Banner */}
        <div className="p-4 bg-[#0055FF]/5 border border-[#0055FF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#0055FF]/10 border border-[#0055FF]/20 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#0055FF]" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest block">
                Cryptographic Audit Trail
              </span>
              <p className="text-xs font-bold text-[#0A0A0A]">
                This log is append-only. All admin actions are permanently recorded.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider self-end sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></span>
            <span>Immutable Ledger</span>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Filter by target user email or action type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#E4E4E4] text-xs text-[#0A0A0A] placeholder-[#6B7280] focus:outline-none focus:border-[#0055FF] shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0A0A0A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Export Action */}
            <div className="flex items-center space-x-3 self-end lg:self-auto">
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                  Showing:
                </span>
                <span className="text-xs font-mono font-bold text-[#0A0A0A]">
                  {displayedLogs.length}
                </span>
              </div>
              <button
                onClick={handleExportCSV}
                disabled={displayedLogs.length === 0}
                className={cn(
                  "px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 transition-all shadow-sm",
                  displayedLogs.length > 0
                    ? "bg-[#0055FF] text-white hover:bg-[#0A0A0A]"
                    : "bg-[#F7F7F5] text-[#6B7280] border border-[#E4E4E4] cursor-not-allowed"
                )}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Category Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-[#E4E4E4] pb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] mr-2">
              Domain Filter:
            </span>
            {FILTER_BUTTONS.map((category) => {
              const isActive = selectedFilter === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedFilter(category)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border",
                    isActive
                      ? "bg-[#0055FF] text-white border-[#0055FF] shadow-sm"
                      : "bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF] hover:text-[#0055FF]"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Log Table */}
        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Admin Email
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Action Type
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Target User
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Details
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-[#6B7280] font-mono">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent animate-spin"></div>
                        <span className="text-[10px] uppercase tracking-widest font-bold">
                          Synchronizing Security Ledger...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : displayedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center text-[#6B7280]">
                          <Shield className="w-6 h-6 text-[#6B7280]" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                          No audit events recorded yet
                        </p>
                        <p className="text-[10px] text-[#6B7280] max-w-sm">
                          {searchQuery || selectedFilter !== "All"
                            ? "No log entries match the selected filter criteria or search string."
                            : "All platform administrative and security operations will be logged here chronologically."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedLogs.map((log) => {
                    const formattedTime = getFormattedTimestamp(log.timestamp);
                    const adminEmail = getAdminEmail(log);
                    const actionType = getActionType(log);
                    const targetUser = getTargetUser(log);
                    const details = getDetails(log);
                    const status = getStatus(log);

                    return (
                      <tr key={log.id} className="hover:bg-[#F7F7F5] transition-colors">
                        {/* Timestamp */}
                        <td className="p-4 font-mono text-[10px] text-[#6B7280] whitespace-nowrap">
                          {formattedTime}
                        </td>

                        {/* Admin Email */}
                        <td className="p-4 font-mono text-xs text-[#0A0A0A] font-medium">
                          {adminEmail}
                        </td>

                        {/* Action Type */}
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 bg-[#F7F7F5] border border-[#E4E4E4] text-[9px] font-mono font-bold uppercase tracking-tight text-[#0A0A0A]">
                            {actionType}
                          </span>
                        </td>

                        {/* Target User */}
                        <td className="p-4 font-mono text-xs text-[#6B7280]">
                          {targetUser}
                        </td>

                        {/* Details */}
                        <td className="p-4 max-w-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span 
                              className="text-xs text-[#6B7280] truncate font-mono"
                              title={details}
                            >
                              {details}
                            </span>
                            {details !== "--" && (
                              <button
                                onClick={() => setActiveModalLog(log)}
                                className="text-[#6B7280] hover:text-[#0055FF] p-1 shrink-0"
                                title="Inspect Details Payload"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider",
                              getStatusBadgeClass(status)
                            )}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Log Detail Modal */}
      {activeModalLog && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-xl bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden">
            <div className="p-5 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5]">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
                  Audit Record Inspector
                </h3>
              </div>
              <button
                onClick={() => setActiveModalLog(null)}
                className="text-[#6B7280] hover:text-[#0A0A0A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E4E4E4]">
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Timestamp
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0A0A0A]">
                    {getFormattedTimestamp(activeModalLog.timestamp)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Status
                  </span>
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider",
                      getStatusBadgeClass(getStatus(activeModalLog))
                    )}
                  >
                    {getStatus(activeModalLog)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Admin Operator
                  </span>
                  <span className="text-xs font-mono text-[#0A0A0A]">
                    {getAdminEmail(activeModalLog)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Target User / Entity
                  </span>
                  <span className="text-xs font-mono text-[#0A0A0A]">
                    {getTargetUser(activeModalLog)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Action Type
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0055FF] bg-[#0055FF]/5 border border-[#0055FF]/20 px-2 py-1 inline-block">
                    {getActionType(activeModalLog)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
                  Operation Payload / Details
                </span>
                <pre className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono text-[#0A0A0A] overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                  {(() => {
                    const raw = activeModalLog.details;
                    if (typeof raw === "object") {
                      try {
                        return JSON.stringify(raw, null, 2);
                      } catch {
                        return String(raw);
                      }
                    }
                    try {
                      const parsed = JSON.parse(raw);
                      return JSON.stringify(parsed, null, 2);
                    } catch {
                      return String(raw || activeModalLog.description || "--");
                    }
                  })()}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-[#F7F7F5] border-t border-[#E4E4E4] flex justify-end">
              <button
                onClick={() => setActiveModalLog(null)}
                className="px-5 py-2 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}

/**
 * Institutional helper function to record immutable audit log entries in Firestore.
 * Automatically timestamps and formats the administrative event payload.
 * Defined for system-wide administrative mutations; not directly called on this viewer page.
 */
async function logAdminAction(
  db: any,
  adminEmail: string,
  actionType: string,
  targetUser: string,
  details: any
) {
  if (!db) return;
  try {
    await addDoc(collection(db, "adminLogs"), {
      timestamp: new Date(),
      adminEmail: adminEmail || "--",
      actionType: actionType || "--",
      targetUser: targetUser || "--",
      details: typeof details === "object" ? JSON.stringify(details) : (details || "--"),
      status: "Success",
    });
  } catch (error) {
    console.error("Failed to commit immutable admin audit entry:", error);
  }
}
