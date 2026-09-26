'use client';

/**
 * @fileOverview Institutional KYC Document Verification Desk.
 * Monitors and audits unverified user entities, handling KYC approvals,
 * rejections, automated security notifications, and compliance reviews.
 */

import { useState, useMemo, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Search,
  Globe,
  Mail,
  Eye,
  X,
  Loader2,
  Check,
  User,
  ShieldAlert,
  FileText,
  Filter,
  CheckCheck
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
      // 1. Update users/{userId} with verificationStatus: 'Verified'
      const userRef = doc(db, "users", userItem.id);
      await setDoc(
        userRef,
        {
          verificationStatus: "Verified",
          kycReviewedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2. Write notification to users/{userId}/notifications collection
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
        text: `KYC Approved: ${identifier} is now Verified. Compliance dispatch notification sent.`,
      });

      if (inspectUser?.id === userItem.id) {
        setInspectUser(null);
      }
    } catch (err: any) {
      console.error("KYC Approval Failure:", err);
      alert("Handshake Failure: Could not approve KYC verification. " + (err.message || ""));
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
      // 1. Update users/{userId} with verificationStatus: 'Rejected'
      const userRef = doc(db, "users", userItem.id);
      await setDoc(
        userRef,
        {
          verificationStatus: "Rejected",
          kycReviewedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2. Write notification to users/{userId}/notifications collection
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
        text: `KYC Rejected: ${identifier} status set to Rejected. Resubmission notification sent.`,
      });

      if (inspectUser?.id === userItem.id) {
        setInspectUser(null);
      }
    } catch (err: any) {
      console.error("KYC Rejection Failure:", err);
      alert("Handshake Failure: Could not reject KYC verification. " + (err.message || ""));
    } finally {
      setProcessingId(null);
    }
  };

  // Helper for badge rendering
  const getStatusBadge = (status?: string) => {
    const s = status || "Not Verified";
    switch (s) {
      case "Pending":
        return {
          label: "Pending Audit",
          className: "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5",
          icon: Clock,
        };
      case "Not Verified":
        return {
          label: "Not Verified",
          className: "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5",
          icon: AlertCircle,
        };
      case "Rejected":
        return {
          label: "Rejected",
          className: "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5",
          icon: XCircle,
        };
      case "Verified":
        return {
          label: "Verified",
          className: "border-[#16835B] text-[#16835B] bg-[#16835B]/5",
          icon: CheckCircle2,
        };
      default:
        return {
          label: s,
          className: "border-[#6B7280] text-[#6B7280] bg-[#F7F7F5]",
          icon: AlertCircle,
        };
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
        {/* Compliance Desk Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
                Total In Queue
              </span>
              <ShieldAlert className="w-3.5 h-3.5 text-[#0055FF]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[#0A0A0A]">
                {loading ? "..." : counts.All}
              </span>
              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">
                Unverified Entities
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
                Pending Review
              </span>
              <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[#C9A227]">
                {loading ? "..." : counts.Pending}
              </span>
              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">
                Requires Audit
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
                Not Verified
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[#6B7280]">
                {loading ? "..." : counts["Not Verified"]}
              </span>
              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">
                Incomplete Profile
              </span>
            </div>
          </Card>

          <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
                Rejected Submissions
              </span>
              <XCircle className="w-3.5 h-3.5 text-[#C43D3D]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[#C43D3D]">
                {loading ? "..." : counts.Rejected}
              </span>
              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">
                Resubmission Due
              </span>
            </div>
          </Card>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={cn(
              "p-4 border flex items-center justify-between shadow-sm animate-in fade-in duration-200",
              actionFeedback.type === "success"
                ? "bg-[#16835B]/5 border-[#16835B]/30 text-[#16835B]"
                : "bg-[#C43D3D]/5 border-[#C43D3D]/30 text-[#C43D3D]"
            )}
          >
            <div className="flex items-center space-x-3">
              {actionFeedback.type === "success" ? (
                <CheckCheck className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                {actionFeedback.text}
              </span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="p-1 hover:opacity-75 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Control Toolbar: Filter Row & Search */}
        <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Row: All, Pending, Not Verified, Rejected */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] mr-2 flex items-center">
                <Filter className="w-3 h-3 mr-1" />
                Filter Scope:
              </span>
              {FILTER_OPTIONS.map((filterOpt) => {
                const isActive = activeFilter === filterOpt;
                const filterCount = counts[filterOpt];
                return (
                  <button
                    key={filterOpt}
                    onClick={() => setActiveFilter(filterOpt)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center space-x-2 select-none",
                      isActive
                        ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-sm"
                        : "bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF] hover:text-[#0055FF]"
                    )}
                  >
                    <span>{filterOpt}</span>
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-mono",
                        isActive ? "bg-white/20 text-white" : "bg-[#F7F7F5] text-[#6B7280]"
                      )}
                    >
                      {filterCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search by name, email, country, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-xs text-[#0A0A0A] placeholder-[#6B7280] focus:outline-none focus:border-[#0055FF]"
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
          </div>
        </Card>

        {/* KYC Verification Queue Table */}
        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Entity Profile
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Account ID
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Jurisdiction
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider text-center">
                    KYC Status
                  </th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider text-center">
                    Review Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-[#6B7280] font-mono">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] uppercase tracking-widest font-bold">
                          Synchronizing KYC Verification Queue...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  /* Empty state if no pending users matching current filter */
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center text-[#16835B]">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                          Verification Queue Clear
                        </p>
                        <p className="text-[10px] text-[#6B7280] max-w-sm">
                          {searchQuery
                            ? `No unverified entities match your search "${searchQuery}".`
                            : activeFilter === "All"
                            ? "There are currently no users pending verification. All registered platform accounts hold verified status."
                            : `No users found currently matching status "${activeFilter}".`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => {
                    const isProcessing = processingId === userItem.id;
                    const badge = getStatusBadge(userItem.verificationStatus);
                    const BadgeIcon = badge.icon;
                    const displayName = getEntityDisplayName(userItem);
                    const initial = displayName.charAt(0).toUpperCase() || "U";
                    const displayId = userItem.accountId || userItem.id;

                    return (
                      <tr key={userItem.id} className="hover:bg-[#F7F7F5] transition-colors">
                        {/* Entity Profile: Name + Email */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center font-bold text-[10px] text-[#0055FF] shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold block text-[#0A0A0A] truncate">
                                {displayName}
                              </span>
                              <div className="flex items-center space-x-1.5 text-[10px] text-[#6B7280] mt-0.5">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{userItem.email || "No Email Bound"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Account ID */}
                        <td className="p-4 font-mono text-[10px]">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-[#6B7280] shrink-0" />
                            <span className="text-[#0A0A0A] font-bold tracking-tight">
                              {displayId}
                            </span>
                          </div>
                          <span className="text-[8px] text-[#6B7280] uppercase tracking-tighter block mt-0.5">
                            UID: {userItem.id.slice(0, 12)}...
                          </span>
                        </td>

                        {/* Country */}
                        <td className="p-4">
                          <div className="flex items-center space-x-1.5 text-[10px] text-[#6B7280]">
                            <Globe className="w-3.5 h-3.5 text-[#0055FF] shrink-0" />
                            <span className="uppercase font-bold text-[#0A0A0A]">
                              {userItem.country || "Global / Unspecified"}
                            </span>
                          </div>
                        </td>

                        {/* Verification Status Badge */}
                        <td className="p-4 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center space-x-1 px-2.5 py-1 border text-[9px] font-bold uppercase tracking-wider",
                              badge.className
                            )}
                          >
                            <BadgeIcon className="w-3 h-3 shrink-0" />
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Actions: Approve & Reject */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* Inspect Payload Button */}
                            <button
                              onClick={() => setInspectUser(userItem)}
                              className="p-1.5 border border-[#E4E4E4] bg-white text-[#6B7280] hover:text-[#0055FF] hover:border-[#0055FF] transition-colors"
                              title="Inspect Entity Credentials"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Approve Button */}
                            <button
                              onClick={() => handleApprove(userItem)}
                              disabled={isProcessing}
                              className={cn(
                                "px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center space-x-1.5 transition-all shadow-sm",
                                "bg-[#16835B] text-white hover:bg-[#0A0A0A] disabled:opacity-50"
                              )}
                              title="Approve KYC Verification"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Approve</span>
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={() => handleReject(userItem)}
                              disabled={isProcessing}
                              className={cn(
                                "px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center space-x-1.5 transition-all",
                                "border border-[#C43D3D] text-[#C43D3D] hover:bg-[#C43D3D] hover:text-white disabled:opacity-50"
                              )}
                              title="Reject KYC Verification"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
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
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
                  Entity Verification Payload
                </h3>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E4E4E4]">
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Entity Name
                  </span>
                  <span className="text-xs font-bold text-[#0A0A0A]">
                    {getEntityDisplayName(inspectUser)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Current KYC Status
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center space-x-1 px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider",
                      getStatusBadge(inspectUser.verificationStatus).className
                    )}
                  >
                    <span>{getStatusBadge(inspectUser.verificationStatus).label}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Registered Email
                  </span>
                  <span className="text-xs font-mono text-[#0A0A0A] break-all">
                    {inspectUser.email || "--"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Jurisdiction / Country
                  </span>
                  <span className="text-xs font-bold text-[#0A0A0A] uppercase">
                    {inspectUser.country || "Unspecified"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Account Reference
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0055FF]">
                    {inspectUser.accountId || inspectUser.id}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Platform Role
                  </span>
                  <span className="text-xs font-mono text-[#0A0A0A]">
                    {inspectUser.role || "Trader"}
                  </span>
                </div>
                {inspectUser.phone && (
                  <div>
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                      Phone Number
                    </span>
                    <span className="text-xs font-mono text-[#0A0A0A]">
                      {inspectUser.phone}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    Current Balance
                  </span>
                  <span className="text-xs font-mono font-bold text-[#16835B]">
                    ${(inspectUser.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
                  System Document Records
                </span>
                <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#6B7280] uppercase font-bold">Government ID / Passport:</span>
                    <span className="font-mono text-[#0A0A0A]">
                      {inspectUser.verificationStatus === "Pending" ? "Submitted (Encrypted)" : "Awaiting Submission"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#6B7280] uppercase font-bold">Proof of Address:</span>
                    <span className="font-mono text-[#0A0A0A]">
                      {inspectUser.verificationStatus === "Pending" ? "Submitted (Encrypted)" : "Awaiting Submission"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#6B7280] uppercase font-bold">Risk Consent Protocol:</span>
                    <span className="font-mono text-[#16835B]">Acknowledged</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F7F7F5] border-t border-[#E4E4E4] flex items-center justify-between">
              <button
                onClick={() => setInspectUser(null)}
                className="px-4 py-2 border border-[#E4E4E4] bg-white text-[#6B7280] text-[10px] font-bold uppercase tracking-widest hover:text-[#0A0A0A]"
              >
                Close
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReject(inspectUser)}
                  disabled={processingId === inspectUser.id}
                  className="px-4 py-2 border border-[#C43D3D] text-[#C43D3D] text-[10px] font-bold uppercase tracking-widest hover:bg-[#C43D3D] hover:text-white transition-colors"
                >
                  Reject KYC
                </button>
                <button
                  onClick={() => handleApprove(inspectUser)}
                  disabled={processingId === inspectUser.id}
                  className="px-4 py-2 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-colors"
                >
                  Approve KYC
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
