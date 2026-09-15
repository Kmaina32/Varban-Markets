"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Globe, Moon, Clock } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";

export default function PreferencesPage() {
  const { t } = useTranslation();

  return (
    <AuthedLayout 
      title={t('nav.preferences')} 
      subtitle={t('pages.preferencesSubtitle')}
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6">App Look</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Moon className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[11px] font-bold uppercase">Dark Mode</span>
                </div>
                <div className="w-10 h-5 bg-[#0A0A0A] relative flex items-center px-1">
                  <div className="w-3.5 h-3.5 bg-white"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[11px] font-bold uppercase">{t('nav.preferences')}</span>
                </div>
                <select className="text-[10px] font-bold uppercase bg-transparent focus:outline-none">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6">Market Settings</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase">Main Currency</span>
                <span className="text-[11px] font-mono font-bold">USD</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[11px] font-bold uppercase">Time Zone</span>
                </div>
                <span className="text-[10px] font-bold uppercase">UTC +0</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6">Alert Settings</h3>
            <div className="space-y-4">
              {[
                "New Trades",
                "Withdraw Success",
                "Security Alerts",
                "System Status"
              ].map((label, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-[#F7F7F5] bg-[#F7F7F5]">
                  <span className="text-[10px] font-bold uppercase">{label}</span>
                  <input type="checkbox" defaultChecked className="accent-[#0A0A0A]" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#C9A227] p-6 shadow-sm border border-[#0A0A0A]/10">
            <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A] mb-2">{t('common.save')}</h4>
            <p className="text-[10px] text-[#0A0A0A]/70 leading-relaxed mb-4">
              All setting changes are saved in your activity log.
            </p>
            <button className="w-full py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-all">
              {t('common.save')}
            </button>
          </Card>
        </div>
      </div>
    </AuthedLayout>
  );
}
