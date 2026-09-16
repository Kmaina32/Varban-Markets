
"use client";

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Globe, Moon, Clock, DollarSign } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];

export default function PreferencesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const { t } = useTranslation();
  
  const [currency, setCurrency] = useState(profile?.currency || "USD");

  const handleSave = async () => {
    if (!user || !db) return;
    await updateDoc(doc(db, "users", user.uid), {
      currency: currency
    });
    alert("Preferences updated.");
  };

  return (
    <AuthedLayout 
      title={t('nav.preferences')} 
      subtitle={t('pages.preferencesSubtitle')}
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6">Account Domain</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[11px] font-bold uppercase">Base Currency</span>
                </div>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="text-[10px] font-bold uppercase bg-transparent focus:outline-none appearance-none cursor-pointer border-b border-[#E4E4E4] pb-1"
                >
                  {PAYSTACK_CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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

          <Card className="bg-[#0055FF]/5 p-6 shadow-sm border border-[#0055FF]/20">
            <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A] mb-2">{t('common.save')}</h4>
            <p className="text-[10px] text-[#6B7280] leading-relaxed mb-4">
              Currency changes will affect how your balance and stakes are displayed throughout the workspace.
            </p>
            <button 
              onClick={handleSave}
              className="w-full py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all"
            >
              {t('common.save')}
            </button>
          </Card>
        </div>
      </div>
    </AuthedLayout>
  );
}
