
'use client';

/**
 * @fileOverview Institutional KYC Document Verification Desk.
 * Monitors and audits unverified user entities, handling KYC approvals,
 * rejections, and direct document inspection via Cloudflare R2.
 * Hardened: Manual approval protocol only. Embedded in-house viewer.
 */

import { useState, useMemo, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import {
  Search,
  X,
  Loader2,
  ExternalLink,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Check
} from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import {
  collection,
  query,
  where,
  setDoc,
  addDoc,
  doc,
  getDocs,
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

interface KycDocument {
  id: string;
  type: string;
  status: string;
  storageKey?: string;
  fileName?: string;
  timestamp?: any;
}

type FilterStatus = 'All' | 'Pending' | 'Not Verified' | 'Rejected';

const FILTER_OPTIONS: FilterStatus[] = ['All', 'Pending', 'Not Verified', 'Rejected'];

export default function AdminKycApprovalsPage() {
  const db = useFirestore();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [inspectUser, setInspectUser] = useState<UserEntity | null>(null);
  const [inspectDocs, setInspectDocs] = useState<KycDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [fallbackToAll, setFallbackToAll] = useState(false);
  
  // Viewer States
  const [viewingDocUrl, setViewingDocUrl] = useState<string | null>(null);
  const [viewingDocId, setViewingDocType] = useState<string | null>(null);
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Auto-dismiss feedback message
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Main KYC Query
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

  useEffect(() => {
    if (error && !fallbackToAll) {
      setFallbackToAll(true);
    }
  }, [error, fallbackToAll]);

  const nonVerifiedUsers = useMemo(() => {
    if (!rawUsers) return [];
    return rawUsers.filter((u) => u.verificationStatus !== "Verified");
  }, [rawUsers]);

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

  const filteredUsers = useMemo(() => {
    return nonVerifiedUsers.filter((user) => {
      if (activeFilter === "Pending" && user.verificationStatus !== "Pending") return false;
      if (activeFilter === "Not Verified" && user.verificationStatus !== "Not Verified" && user.verificationStatus) return false;
      if (activeFilter === "Rejected" && user.verificationStatus !== "Rejected") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const displayName = (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`).toLowerCase();
        const email = (user.email || "").toLowerCase();
        return displayName.includes(q) || email.includes(q) || user.id.includes(q);
      }
      return true;
    });
  }, [nonVerifiedUsers, activeFilter, searchQuery]);

  // Load documents for inspected user
  const handleInspectUser = async (userItem: UserEntity) => {
    setInspectUser(userItem);
    setInspectDocs([]);
    setViewingDocUrl(null);
    setViewingDocType(null);
    setDocsLoading(true);
    
    if (!db) return;
    
    try {
      const docsSnap = await getDocs(collection(db, `users/${userItem.id}/kyc_submissions`));
      const docsData = docsSnap.docs.map(d => ({ id: d.id, ...d.data() } as KycDocument));
      setInspectDocs(docsData);
    } catch (e) {
      console.error("Failed to load user documentation", e);
    } finally {
      setDocsLoading(false);
    }
  };

  const openInHouseViewer = async (docItem: KycDocument) => {
    if (!docItem.storageKey) return;
    
    setIsViewerLoading(true);
    setViewingDocType(docItem.id);
    
    try {
      const resp = await fetch('/api/storage/view-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageKey: docItem.storageKey })
      });
      const { viewUrl } = await resp.json();
      setViewingDocUrl(viewUrl);
    } catch (e) {
      alert("Handshake Failure: Could not generate secure viewing token.");
    } finally {
      setIsViewerLoading(false);
    }
  };

  const handleApprove = async (userItem: UserEntity) => {
    if (!db) return;
    if (!window.confirm(`DETERMINISTIC ACTION: Manually approve KYC verification for ${userItem.email}? This action grants full platform authority.`)) return;

    setProcessingId(userItem.id);
    try {
      await setDoc(doc(db, "users", userItem.id), {
        verificationStatus: "Verified",
        kycReviewedAt: serverTimestamp(),
      }, { merge: true });

      await addDoc(collection(db, `users/${userItem.id}/notifications`), {
        title: "KYC Verification Approved",
        body: "Your identity has been manually verified by our compliance team. You now have full institutional platform access.",
        type: "Security",
        isUnread: true,
        timestamp: serverTimestamp(),
      });

      setActionFeedback({ type: "success", text: `KYC Manually Approved for ${userItem.email}` });
      setInspectUser(null);
    } catch (err) {
      alert("Handshake Failure.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userItem: UserEntity) => {
    if (!db) return;
    if (!window.confirm(`DETERMINISTIC ACTION: Reject KYC for ${userItem.email}?`)) return;

    setProcessingId(userItem.id);
    try {
      await setDoc(doc(db, "users", userItem.id), {
        verificationStatus: "Rejected",
        kycReviewedAt: serverTimestamp(),
      }, { merge: true });

      await addDoc(collection(db, `users/${userItem.id}/notifications`), {
        title: "KYC Verification Rejected",
        body: "Your identity documents were reviewed and not accepted. Please resubmit clear, high-resolution copies via the Account Hub.",
        type: "Security",
        isUnread: true,
        timestamp: serverTimestamp(),
      });

      setActionFeedback({ type: "error", text: `KYC Rejected for ${userItem.email}` });
      setInspectUser(null);
    } catch (err) {
      alert("Handshake Failure.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status || "Not Verified";
    switch (s) {
      case "Pending": return "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/5";
      case "Rejected": return "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5";
      case "Verified": return "border-[#16835B] text-[#16835B] bg-[#16835B]/5";
      default: return "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5";
    }
  };

  return (
    <AuthedLayout title="KYC Approvals" subtitle="Institutional Verification Desk">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FILTER_OPTIONS.map(opt => (
            <Card key={opt} className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between min-h-[100px]">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">{opt}</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-mono font-bold text-[#0A0A0A]">{loading ? "..." : (counts as any)[opt]}</span>
                <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">Entities</span>
              </div>
            </Card>
          ))}
        </div>

        {actionFeedback && (
          <div className={cn("p-4 border flex items-center justify-between shadow-sm animate-in fade-in duration-200", actionFeedback.type === "success" ? "bg-[#16835B]/5 border-[#16835B]/30 text-[#16835B]" : "bg-[#C43D3D]/5 border-[#C43D3D]/30 text-[#C43D3D]")}>
            <span className="text-xs font-bold uppercase tracking-wider">{actionFeedback.text}</span>
            <button onClick={() => setActionFeedback(null)} className="p-1 hover:opacity-75 transition-opacity"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        <Card className="p-4 bg-white border-[#E4E4E4] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] mr-2">Scope:</span>
            {FILTER_OPTIONS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all", activeFilter === f ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF]")}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
            <input type="text" placeholder="Search entities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF]" />
          </div>
        </Card>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Entity Profile</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Account ID</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Jurisdiction</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider text-center">KYC Status</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr><td colSpan={5} className="p-16 text-center text-[#6B7280] font-mono animate-pulse uppercase tracking-widest text-[10px]">Accessing Verification Registry...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Queue Clear</td></tr>
                ) : filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0A0A0A]">{userItem.fullName || userItem.email}</span>
                        <span className="text-[10px] text-[#6B7280] font-mono">{userItem.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[10px]">{userItem.id.slice(0, 10).toUpperCase()}</td>
                    <td className="p-4 uppercase font-bold text-[#0A0A0A] tracking-wider text-[10px]">{userItem.country || "Global"}</td>
                    <td className="p-4 text-center">
                      <span className={cn("px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider", getStatusBadge(userItem.verificationStatus))}>
                        {userItem.verificationStatus || "Not Verified"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleInspectUser(userItem)} className="px-4 py-1.5 bg-[#0055FF] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-all shadow-sm">Review Documents</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {inspectUser && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Verification Inspector</h3>
              </div>
              <button onClick={() => setInspectUser(null)} className="text-[#6B7280] hover:text-[#0A0A0A]"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
              {/* Sidebar: Details & Document List */}
              <div className="w-full md:w-80 border-r border-[#E4E4E4] overflow-y-auto no-scrollbar bg-white shrink-0">
                <div className="p-6 space-y-6">
                   <div>
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Entity Name</span>
                      <span className="text-sm font-bold text-[#0A0A0A]">{inspectUser.fullName || "Unnamed"}</span>
                   </div>
                   <div>
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Email Domain</span>
                      <span className="text-xs font-mono text-[#0A0A0A] break-all">{inspectUser.email}</span>
                   </div>
                   <div className="pt-4 border-t border-[#F7F7F5] space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#0055FF]" /> Documentation
                      </h4>
                      
                      {docsLoading ? (
                        <div className="p-8 text-center text-[#6B7280] animate-pulse uppercase text-[9px] font-bold">Synchronizing Evidence...</div>
                      ) : inspectDocs.length === 0 ? (
                        <div className="p-8 border border-dashed border-[#E4E4E4] text-center text-[#6B7280] uppercase text-[9px] font-bold">No documents</div>
                      ) : (
                        <div className="space-y-2">
                          {inspectDocs.map((docItem) => (
                            <button 
                              key={docItem.id} 
                              onClick={() => openInHouseViewer(docItem)}
                              className={cn(
                                "w-full p-3 text-left border transition-all flex items-center justify-between group",
                                viewingDocId === docItem.id ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-[#F7F7F5] border-[#E4E4E4] hover:border-[#0055FF]"
                              )}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className={cn("w-3.5 h-3.5 shrink-0", viewingDocId === docItem.id ? "text-white" : "text-[#6B7280]")} />
                                <span className="text-[9px] font-bold uppercase truncate">{docItem.type.replace('_', ' ')}</span>
                              </div>
                              <Eye className={cn("w-3 h-3 shrink-0", viewingDocId === docItem.id ? "text-white" : "text-[#6B7280] opacity-0 group-hover:opacity-100")} />
                            </button>
                          ))}
                        </div>
                      )}
                   </div>
                </div>
              </div>

              {/* Main Content: Document Viewer */}
              <div className="flex-grow bg-[#F7F7F5] overflow-hidden flex flex-col">
                {isViewerLoading ? (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">Generating Secure Token...</span>
                  </div>
                ) : viewingDocUrl ? (
                  <div className="flex-grow p-4 md:p-8 overflow-hidden flex flex-col">
                    <div className="flex-grow bg-white border-2 border-[#0A0A0A] p-2 relative shadow-lg overflow-hidden flex items-center justify-center">
                       <div className="absolute top-2 left-4 px-2 py-0.5 bg-[#0A0A0A] text-white text-[8px] font-bold uppercase tracking-widest z-10 shadow">
                          Institutional Audit Frame
                       </div>
                       <img 
                        src={viewingDocUrl} 
                        className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300" 
                        alt="KYC Source Proof" 
                       />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">
                       <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Deterministic Review Protocol</span>
                       <button onClick={() => setViewingDocUrl(null)} className="hover:text-[#0A0A0A] flex items-center gap-1">Clear Frame <X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <div className="w-16 h-16 border-2 border-dashed border-[#E4E4E4] flex items-center justify-center text-[#E4E4E4]">
                      <Eye className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Source Review Active</h4>
                      <p className="text-[10px] text-[#6B7280] uppercase mt-1">Select a document from the registry list to initiate inspection</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#E4E4E4] bg-[#F7F7F5] flex flex-col sm:flex-row justify-between gap-4 shrink-0">
              <div className="flex items-start gap-3 max-w-md">
                 <AlertTriangle className="w-4 h-4 text-[#0055FF] shrink-0 mt-0.5" />
                 <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
                    Audit Notice: This action requires manual verification. Auto-approval protocols are decommissioned to ensure total financial integrity.
                 </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleReject(inspectUser)} disabled={!!processingId} className="px-6 py-3 border border-[#C43D3D] text-[#C43D3D] text-[10px] font-bold uppercase tracking-widest hover:bg-[#C43D3D] hover:text-white transition-all shadow-sm">Reject Account</button>
                <button onClick={() => handleApprove(inspectUser)} disabled={!!processingId} className="px-8 py-3 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-all shadow-md flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Entity</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
