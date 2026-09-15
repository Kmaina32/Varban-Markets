"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { ShieldCheck, FileText, Upload, AlertCircle } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";

export default function VerificationPage() {
  const { t } = useTranslation();

  return (
    <AuthedLayout 
      title={t('nav.verification')} 
      subtitle={t('pages.verificationSubtitle')}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-[#F7F7F5] p-3 border border-[#E4E4E4]">
              <ShieldCheck className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight">{t('wallet.status')}: {t('common.notVerified')}</h3>
              <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
                Please verify your ID to unlock all trading features and faster withdrawals.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-1">Required Documents</h4>
          
          {[
            { label: "ID Card / Passport", status: t('common.actionRequired'), desc: "Proof of identity." },
            { label: "Proof of Address", status: t('common.pendingReview'), desc: "Utility bill or bank statement." },
            { label: "Risk Consent", status: t('common.verified'), desc: "Legal agreement." }
          ].map((doc, i) => (
            <Card key={i} className="bg-white border-[#E4E4E4] p-4 shadow-sm flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <FileText className="w-4 h-4 text-[#6B7280]" />
                <div>
                  <span className="text-[11px] font-bold block">{doc.label}</span>
                  <span className="text-[9px] text-[#6B7280]">{doc.desc}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
                  doc.status === t('common.verified') ? 'border-[#16835B] text-[#16835B]' : 'border-[#C9A227] text-[#C9A227]'
                }`}>
                  {doc.status}
                </span>
                <button className="p-1 hover:text-[#C9A227] transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-[#0A0A0A] p-4 flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#6B7280] leading-relaxed">
            Your data is encrypted. We usually check documents within 24-48 hours.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}
