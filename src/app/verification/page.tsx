"use client";

import { useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ShieldCheck, FileText, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

export default function VerificationPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSimulatedUpload = async (docLabel: string) => {
    if (!user || !db) return;
    
    setUploadingId(docLabel);
    setSuccess(null);

    // Simulate network latency for institutional document processing
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          verificationStatus: "Pending"
        });

        await addDoc(collection(db, `users/${user.uid}/notifications`), {
          title: "Document Received",
          body: `Your ${docLabel} has been uploaded successfully and is now entering the audit queue. Expect review within 24-48 hours.`,
          type: "Security",
          isUnread: true,
          timestamp: serverTimestamp()
        });

        setSuccess(docLabel);
      } catch (e) {
        alert("Transmission failure: Security vault unreachable.");
      } finally {
        setUploadingId(null);
      }
    }, 2000);
  };

  const status = profile?.verificationStatus || "Not Verified";

  return (
    <AuthedLayout 
      title={t('nav.verification')} 
      subtitle={t('pages.verificationSubtitle')}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-[#F7F7F5] p-3 border border-[#E4E4E4]">
              <ShieldCheck className={cn(
                "w-6 h-6",
                status === 'Verified' ? "text-[#16835B]" : status === 'Pending' ? "text-[#C9A227]" : "text-[#6B7280]"
              )} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight">
                {t('wallet.status')}: {status}
              </h3>
              <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
                {status === 'Verified' 
                  ? "Your identity is verified. You have full access to institutional liquidity." 
                  : status === 'Pending'
                  ? "Your documents are currently being audited by our compliance team."
                  : "Please verify your ID to unlock all trading features and faster withdrawals."}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-1">Required Documents</h4>
          
          {[
            { id: "id_card", label: "ID Card / Passport", desc: "Proof of identity." },
            { id: "proof_address", label: "Proof of Address", desc: "Utility bill or bank statement." },
            { id: "risk_consent", label: "Risk Consent", desc: "Legal agreement." }
          ].map((item, i) => {
            const isItemSuccess = success === item.label;
            const isUploading = uploadingId === item.label;
            const isVerified = status === 'Verified' || (status === 'Pending' && item.id === 'risk_consent');

            return (
              <Card key={i} className="bg-white border-[#E4E4E4] p-4 shadow-sm flex justify-between items-center group">
                <div className="flex items-center space-x-4">
                  <FileText className="w-4 h-4 text-[#6B7280]" />
                  <div>
                    <span className="text-[11px] font-bold block">{item.label}</span>
                    <span className="text-[9px] text-[#6B7280]">{item.desc}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {isItemSuccess ? (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 border border-[#16835B] text-[#16835B] bg-[#16835B]/5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Transmitted
                    </span>
                  ) : (
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 border",
                      isVerified ? "border-[#16835B] text-[#16835B]" : "border-[#C9A227] text-[#C9A227]"
                    )}>
                      {isVerified ? t('common.verified') : status === 'Pending' ? 'In Review' : t('common.actionRequired')}
                    </span>
                  )}
                  
                  {!isVerified && !isItemSuccess && (
                    <button 
                      onClick={() => handleSimulatedUpload(item.label)}
                      disabled={!!uploadingId}
                      className="p-1.5 border border-[#E4E4E4] hover:border-[#0055FF] hover:text-[#0055FF] transition-all disabled:opacity-30"
                    >
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-[#0A0A0A] p-4 flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#F7F7F5] leading-relaxed uppercase font-bold">
            All documents are encrypted using institutional-grade protocols. Tampering with legal records will result in immediate account termination.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}
