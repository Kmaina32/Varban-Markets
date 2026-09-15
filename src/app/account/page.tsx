"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Shield, User, Activity } from "lucide-react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";

export default function AccountWorkspace() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, loading: i18nLoading } = useTranslation();
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const personalParams = [
    { label: "ID", value: user?.uid?.slice(0, 12).toUpperCase() || "..." },
    { label: "Email", value: user?.email || "..." },
    { label: "Country", value: profile?.country || "..." },
    { label: "Status", value: profile?.verificationStatus || "..." },
    { label: "Currency", value: profile?.currency || "USD" }
  ];

  return (
    <AuthedLayout 
      title={t('nav.account')} 
      subtitle={t('pages.accountSubtitle')}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="bg-white border border-[#E4E4E4] p-4 flex items-center space-x-3">
              <User className="w-4 h-4 text-[#C9A227]" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('nav.account')}</span>
            </div>
            <div className="bg-white border border-[#E4E4E4] p-4 flex items-center space-x-3">
              <Shield className="w-4 h-4 text-[#16835B]" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('nav.security')}</span>
            </div>
            <div className="bg-white border border-[#E4E4E4] p-4 flex items-center space-x-3">
              <Activity className="w-4 h-4 text-[#C43D3D]" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('nav.history')}</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 rounded-none shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 mb-4">
                {t('pages.accountTitle')}
              </h3>
              <div className="space-y-4">
                {personalParams.map((param, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 text-xs py-1 border-b border-[#F7F7F5] last:border-0">
                    <span className="text-[#6B7280]">{param.label}</span>
                    <span className="font-mono font-semibold text-[#0A0A0A]">
                      {profileLoading ? t('common.loading') : param.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white border-[#E4E4E4] p-6 rounded-none space-y-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
                {t('nav.security')}
              </h3>
              <div className="flex items-center justify-between text-xs py-2">
                <div>
                  <span className="font-bold text-[#0A0A0A] block uppercase mb-0.5">Two-Factor Auth</span>
                  <p className="text-[#6B7280] text-[11px]">Extra protection for your login.</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border bg-[#16835B] text-white border-[#16835B]">
                  {t('common.active')}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
