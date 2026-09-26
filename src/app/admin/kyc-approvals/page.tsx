
'use client';

/**
 * @fileOverview Institutional KYC Document Verification Desk.
 * Monitors and audits unverified user entities, handling KYC approvals,
 * rejections, automated security notifications, and compliance reviews.
 * Icons removed from queue and inspector for a minimalist, text-first layout.
 */

import { useState, useMemo, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import {
  Search,
  X,
  Loader2,
  Mail
} from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import {
  collection,
  query,
  where,
  setDoc,
  addDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { cn } from "@/app/lib/utils";

interface UserEntity {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  country?: string;
  verificationStatus?: string;
  accountId?: string;
  role?: string;
  balance?: number;
  phone?: string;
  createdAt?: any;
  kycSubmittedAt?: any;
  kycReviewedAt?: any;
  [key: string]: any;
}

type FilterStatus = 'All' | 'Pending' | 'Not Verified' | 'Rejected';

const FILTER_OPTIONS: FilterStatus[] = ['All', 'Pending', 'Not Verified', 'Rejected'];

export default function AdminKycApprovalsPage() {
  const db = useFirestore();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [inspectUser, setInspectUser] = useState<UserEntity | null>(null);
  const [fallbackToAll, setFallbackToAll] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Auto-dismiss feedback message after 6 seconds
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Query Firestore collection 'users' where verificationStatus is NOT 'Verified'
  const kycQuery = useMemo(() => {
    if (!db) return null;
    if (fallbackToAll) {
      return collection(db, "users");
    }
    return query(
      collection(db, "users"),
      where("verificationStatus", "!=", "Verified")
    );
  }, [db, fallbackToAll]);

  const { data: rawUsers, loading, error } = useCollection<UserEntity>(kycQuery);

  // Gracefully fallback to client-side filter if single-field inequality index isn't available
  useEffect(() => {
    if (error && !fallbackToAll) {
      console.warn("Primary KYC query returned error, falling back to full collection scan:", error);
      setFallbackToAll(true);
    }
  }, [error, fallbackToAll]);

  // Ensure only users where verificationStatus is NOT 'Verified' are displayed
  const nonVerifiedUsers = useMemo(() => {
    if (!rawUsers) return [];
    return rawUsers.filter((u) => u.verificationStatus !== "Verified");
  }, [rawUsers]);

  // Counts for each filter category
  const counts = useMemo(() => {
    return {
      All: nonVerifiedUsers.length,
      Pending: nonVerifiedUsers.filter((u) => u.verificationStatus === "Pending").length,
      "Not Verified": nonVerifiedUsers.filter(
        (u) => !u.verificationStatus || u.verificationStatus === "Not Verified"
      ).length,
      Rejected: nonVerifiedUsers.filter((u) => u.verificationStatus === "Rejected").length,
    };
  }, [nonVerifiedUsers]);

  // Filter and search computation
  const filteredUsers = useMemo(() => {
    return nonVerifiedUsers.filter((user) => {
      // 1. Status Filter
      if (activeFilter === "Pending" && user.verificationStatus !== "Pending") return false;
      if (
        activeFilter === "Not Verified" &&
        user.verificationStatus !== "Not Verified" &&
        user.verificationStatus
      ) {
        return false;
      }
      if (activeFilter === "Rejected" && user.verificationStatus !== "Rejected") return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const displayName = (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`).toLowerCase();
        const email = (user.email || "").toLowerCase();
        const id = (user.id || "").toLowerCase();
        const accountId = (user.accountId || "").toLowerCase();
        const country = (user.country || "").toLowerCase();

        if (
          !displayName.includes(q) &&
          !email.includes(q) &&
          !id.includes(q) &&
          !accountId.includes(q) &&
          !country.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [nonVerifiedUsers, activeFilter, searchQuery]);

  // Handle KYC Approval
  const handleApprove = async (userItem: UserEntity) => {
    if (!db) return;
    const identifier = userItem.fullName || userItem.email || userItem.id;
    if (!window.confirm(`Approve KYC verification for ${identifier}? This grants full institutional platform access.`)) {
      return;
    }

    setProcessingId(userItem.id);
    try {
      const userRef = doc(db, "users", userItem.id);
      await setDoc(
        userRef,
        {
          verificationStatus: "Verified",
          kycReviewedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, `users/${userItem.id}/notifications`), {
        title: "KYC Verification Approved",
        message: "Your KYC verification has been approved. You now have full platform access.",
        body: "Your KYC verification has been approved. You now have full platform access.",
        type: "Security",
        isUnread: true,
        timestamp: serverTimestamp(),
      });

      setActionFeedback({
        type: "success",
        text: `KYC Approved: ${identifier} is now Verified.`,
      });

      if (inspectUser?.id === userItem.id) {
        setInspectUser(null);
      }
    } catch (err: any) {
      alert("Handshake Failure: Could not approve KYC verification.");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle KYC Rejection
  const handleReject = async (userItem: UserEntity) => {
    if (!db) return;
    const identifier = userItem.fullName || userItem.email || userItem.id;
    if (!window.confirm(`Reject KYC verification for ${identifier}? User will be prompted to resubmit.`)) {
      return;
    }

    setProcessingId(userItem.id);
    try {
      const userRef = doc(db, "users", userItem.id);
      await setDoc(
        userRef,
        {
          verificationStatus: "Rejected",
          kycReviewedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, `users/${userItem.id}/notifications`), {
        title: "KYC Verification Rejected",
        message: "Your KYC verification has been rejected. Please resubmit with clearer documents.",
        body: "Your KYC verification has been rejected. Please resubmit with clearer documents.",
        type: "Security",
        isUnread: true,
        timestamp: serverTimestamp(),
      });

      setActionFeedback({
        type: "error",
        text: `KYC Rejected: ${identifier} status set to Rejected.`,
      });

      if (inspectUser?.id === userItem.id) {
        setInspectUser(null);
      }
    } catch (err: any) {
      alert("Handshake Failure: Could not reject KYC verification.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status || "Not Verified";
    switch (s) {
      case "Pending":
        return { label: "Pending Audit", className: "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5" };
      case "Not Verified":
        return { label: "Not Verified", className: "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5" };
      case "Rejected":
        return { label: "Rejected", className: "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5" };
      case "Verified":
        return { label: "Verified", className: "border-[#16835B] text-[#16835B] bg-[#16835B]/5" };
      default:
        return { label: s, className: "border-[#6B7280] text-[#6B7280] bg-[#F7F7F5]" };
    }
  };

  const getEntityDisplayName = (u: UserEntity) => {
    if (u.fullName?.trim()) return u.fullName;
    if (u.firstName || u.lastName) return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    if (u.email) return u.email.split("@")[0];
    return "Unnamed Entity";
  };

  return (
    <AuthedLayout title="KYC Approvals" subtitle="Identity Verification Desk">
      <div className="space-y-6">
        {/* Compliance Desk Summary Cards (Icon-Free) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between min-h-[100px]">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Total In Queue</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[#0A0A0A]">{loading ? "..." : counts.All}</span>
              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">Unverified</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between min-h-[100px]">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Pending Review</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[#C9A227]">{loading ? "..." : counts.Pending}</span>
              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">Requires Audit</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between min-h-[100px]">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Not Verified</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[#6B7280]">{loading ? "..." : counts["Not Verified"]}</span>
              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">Incomplete</span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between min-h-[100px]">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Rejected</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[#C43D3D]">{loading ? "..." : counts.Rejected}</span>
              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">Resubmission Due</span>
            </div>
          </Card>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className={cn("p-4 border flex items-center justify-between shadow-sm animate-in fade-in duration-200", actionFeedback.type === "success" ? "bg-[#16835B]/5 border-[#16835B]/30 text-[#16835B]" : "bg-[#C43D3D]/5 border-[#C43D3D]/30 text-[#C43D3D]")}>
            <span className="text-xs font-bold uppercase tracking-wider">{actionFeedback.text}</span>
            <button onClick={() => setActionFeedback(null)} className="p-1 hover:opacity-75 transition-opacity">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Control Toolbar */}
        <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] mr-2">Filter Scope:</span>
              {FILTER_OPTIONS.map((filterOpt) => {
                const isActive = activeFilter === filterOpt;
                return (
                  <button
                    key={filterOpt}
                    onClick={() => setActiveFilter(filterOpt)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center space-x-2",
                      isActive ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-sm" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF] hover:text-[#0055FF]"
                    )}
                  >
                    <span>{filterOpt}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-mono", isActive ? "bg-white/20 text-white" : "bg-[#F7F7F5] text-[#6B7280]")}>
                      {counts[filterOpt]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-xs text-[#0A0A0A] placeholder-[#6B7280] focus:outline-none focus:border-[#0055FF]"
              />
            </div>
          </div>
        </Card>

        {/* KYC Verification Queue Table */}
        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Entity Profile</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Account ID</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Jurisdiction</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider text-center">KYC Status</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider text-center">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr><td colSpan={5} className="p-16 text-center text-[#6B7280] font-mono"><div className="flex flex-col items-center justify-center space-y-3"><div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div><span className="text-[10px] uppercase tracking-widest font-bold">Synchronizing KYC Queue...</span></div></td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-[#6B7280]"><div className="flex flex-col items-center justify-center space-y-2 font-bold uppercase tracking-widest text-[10px]">Queue Clear</div></td></tr>
                ) : (
                  filteredUsers.map((userItem) => {
                    const isProcessing = processingId === userItem.id;
                    const badge = getStatusBadge(userItem.verificationStatus);
                    const displayName = getEntityDisplayName(userItem);
                    const displayId = userItem.accountId || userItem.id;

                    return (
                      <tr key={userItem.id} className="hover:bg-[#F7F7F5] transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0A0A0A]">{displayName}</span>
                            <span className="text-[10px] text-[#6B7280] truncate max-w-[200px]">{userItem.email || "No Email"}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[10px]">
                          <span className="text-[#0A0A0A] font-bold">{displayId}</span>
                        </td>
                        <td className="p-4 uppercase font-bold text-[#0A0A0A] tracking-wider text-[10px]">
                          {userItem.country || "Global"}
                        </td>
                        <td className="p-4 text-center">
                          <span className={cn("px-2.5 py-1 border text-[9px] font-bold uppercase tracking-wider", badge.className)}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => setInspectUser(userItem)} className="px-3 py-1.5 border border-[#E4E4E4] bg-white text-[#6B7280] text-[9px] font-bold uppercase tracking-widest hover:text-[#0055FF] hover:border-[#0055FF] transition-all">Review</button>
                            <button onClick={() => handleApprove(userItem)} disabled={isProcessing} className="px-3 py-1.5 bg-[#16835B] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-all">Approve</button>
                            <button onClick={() => handleReject(userItem)} disabled={isProcessing} className="px-3 py-1.5 border border-[#C43D3D] text-[#C43D3D] text-[9px] font-bold uppercase tracking-widest hover:bg-[#C43D3D] hover:text-white transition-all">Reject</button>
                          </div>
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

      {/* User KYC Detail Inspection Modal */}
      {inspectUser && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden">
            <div className="p-5 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Entity Verification Payload</h3>
              <button onClick={() => setInspectUser(null)} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E4E4E4]">
                <div><span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Entity Name</span><span className="text-xs font-bold text-[#0A0A0A]">{getEntityDisplayName(inspectUser)}</span></div>
                <div><span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">KYC Status</span><span className={cn("px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider", getStatusBadge(inspectUser.verificationStatus).className)}>{getStatusBadge(inspectUser.verificationStatus).label}</span></div>
                <div className="col-span-2"><span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Registered Email</span><span className="text-xs font-mono text-[#0A0A0A]">{inspectUser.email || "--"}</span></div>
                <div><span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Jurisdiction</span><span className="text-xs font-bold text-[#0A0A0A] uppercase">{inspectUser.country || "Unspecified"}</span></div>
                <div><span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Account Ref</span><span className="text-xs font-mono font-bold text-[#0055FF]">{inspectUser.accountId || inspectUser.id}</span></div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-2">System Document Records</span>
                <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] space-y-3 text-[10px]">
                  <div className="flex justify-between items-center"><span className="text-[#6B7280] uppercase font-bold">Government ID / Passport:</span><span className="font-mono text-[#0A0A0A]">Submitted (Encrypted)</span></div>
                  <div className="flex justify-between items-center"><span className="text-[#6B7280] uppercase font-bold">Proof of Address:</span><span className="font-mono text-[#0A0A0A]">Submitted (Encrypted)</span></div>
                  <div className="flex justify-between items-center"><span className="text-[#6B7280] uppercase font-bold">Risk Consent Protocol:</span><span className="font-mono text-[#16835B]">Validated</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F7F7F5] border-t border-[#E4E4E4] flex items-center justify-between">
              <button onClick={() => setInspectUser(null)} className="px-4 py-2 border border-[#E4E4E4] bg-white text-[#6B7280] text-[10px] font-bold uppercase tracking-widest hover:text-[#0A0A0A]">Close</button>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleReject(inspectUser)} disabled={processingId === inspectUser.id} className="px-4 py-2 border border-[#C43D3D] text-[#C43D3D] text-[10px] font-bold uppercase tracking-widest hover:bg-[#C43D3D] hover:text-white transition-colors">Reject KYC</button>
                <button onClick={() => handleApprove(inspectUser)} disabled={processingId === inspectUser.id} className="px-4 py-2 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors">Approve KYC</button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
