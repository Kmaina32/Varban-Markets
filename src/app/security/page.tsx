"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Lock, Shield, Key, Smartphone, History } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";

export default function SecurityManagementPage() {
  const t = useTranslation().t;

  const sessions = [
    { device: "Chrome / Windows", ip: "192.168.1.1", status: t('dashboard.live'), last: "Active Now" },
    { device: "Mobile App", ip: "10.0.0.1", status: t('common.active'), last: "2h ago" }
  ];

  return (
    <AuthedLayout 
      title={t('nav.security')} 
      subtitle={t('pages.securitySubtitle')}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6">Manage Access</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border border-[#F7F7F5] bg-[#F7F7F5]">
                <div className="flex items-center space-x-4">
                  <Key className="w-4 h-4 text-[#C9A227]" />
                  <span className="text-[11px] font-bold uppercase">Password</span>
                </div>
                <button className="text-[10px] font-bold uppercase underline">Change</button>
              </div>
              <div className="flex justify-between items-center p-4 border border-[#F7F7F5] bg-[#F7F7F5]">
                <div className="flex items-center space-x-4">
                  <Smartphone className="w-4 h-4 text-[#16835B]" />
                  <span className="text-[11px] font-bold uppercase">2FA Auth</span>
                </div>
                <span className="text-[9px] font-bold bg-[#16835B] text-white px-2 py-0.5">ON</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6">Active Sessions</h3>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-4 border border-[#E4E4E4] text-[11px]">
                  <div className="flex items-center space-x-4">
                    <History className="w-4 h-4 text-[#6B7280]" />
                    <div>
                      <span className="font-bold block uppercase">{s.device}</span>
                      <span className="font-mono text-[#6B7280]">{s.ip}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold block uppercase text-[#16835B]">{s.status}</span>
                    <span className="text-[9px] text-[#6B7280] block">{s.last}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border border-[#C43D3D] text-[#C43D3D] text-[10px] font-bold uppercase tracking-widest hover:bg-[#C43D3D] hover:text-white transition-all">
              Log Out Everywhere Else
            </button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white text-[#0A0A0A] p-6 shadow-sm border border-[#C9A227]">
            <Shield className="w-8 h-8 text-[#C9A227] mb-4" />
            <h4 className="text-sm font-bold uppercase tracking-tight mb-2">Status: Protected</h4>
            <p className="text-[11px] text-[#6B7280] leading-relaxed mb-4">
              Your account is safe. All money moves need a second code to confirm.
            </p>
            <div className="h-1 w-full bg-[#F7F7F5] overflow-hidden">
              <div className="h-full bg-[#16835B] w-full"></div>
            </div>
          </Card>
        </div>
      </div>
    </AuthedLayout>
  );
}