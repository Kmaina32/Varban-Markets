
"use client";

import { useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { DollarSign, Globe, Clock, Check, Save, AlertCircle } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { cn } from "@/app/lib/utils";

const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];
const LANGUAGES = ["ENGLISH", "FRENCH", "SPANISH", "PORTUGUESE"];

export default function PreferencesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useTranslation();
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    currency: "USD",
    language: "ENGLISH",
    newTrades: true,
    withdrawSuccess: true,
    securityAlerts: true,
    systemStatus: true
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        currency: profile.currency || "USD",
        language: profile.language || "ENGLISH",
        newTrades: profile.alerts?.newTrades ?? true,
        withdrawSuccess: profile.alerts?.withdrawSuccess ?? true,
        securityAlerts: profile.alerts?.securityAlerts ?? true,
        systemStatus: profile.alerts?.systemStatus ?? true
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !db || isSaving) return;
    setIsSaving(true);
    setSuccess(false);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        currency: formData.currency,
        language: formData.language,
        alerts: {
          newTrades: formData.newTrades,
          withdrawSuccess: formData.withdrawSuccess,
          securityAlerts: formData.securityAlerts,
          systemStatus: formData.systemStatus
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Handshake Failure: Could not synchronize preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAlert = (key: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AuthedLayout 
      title={t('nav.preferences')} 
      subtitle="WORKSPACE CONFIGURATION & ACCOUNT DOMAIN"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Domain & Market */}
          <div className="space-y-8">
            <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] mb-8 border-b border-[#F7F7F5] pb-4">
                Account Domain
              </h3>
              <div className="space-y-10">
                <div className="flex justify-between items-center group">
                  <div className="flex items-center space-x-4">
                    <DollarSign className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Base Currency</span>
                  </div>
                  <select 
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="text-[10px] font-bold uppercase bg-transparent focus:outline-none appearance-none cursor-pointer text-right min-w-[60px]"
                  >
                    {PAYSTACK_CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center group">
                  <div className="flex items-center space-x-4">
                    <Globe className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Display</span>
                  </div>
                  <div className="relative flex items-center">
                    <select 
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="text-[10px] font-bold uppercase bg-transparent focus:outline-none appearance-none cursor-pointer pr-5 text-right"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <Check className="w-3 h-3 text-[#0A0A0A] absolute right-0 pointer-events-none" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] mb-8 border-b border-[#F7F7F5] pb-4">
                Market Settings
              </h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Clock className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Time Zone</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#0A0A0A]">UTC +0</span>
              </div>
            </Card>
          </div>

          {/* Right Column: Alerts & Save */}
          <div className="space-y-8">
            <Card className="bg-white border-[#E4E4E4] p-8 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] mb-8 border-b border-[#F7F7F5] pb-4">
                Alert Settings
              </h3>
              <div className="space-y-2">
                {[
                  { id: "newTrades", label: "New Trades" },
                  { id: "withdrawSuccess", label: "Withdraw Success" },
                  { id: "securityAlerts", label: "Security Alerts" },
                  { id: "systemStatus", label: "System Status" }
                ].map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => toggleAlert(alert.id as any)}
                    className="w-full flex justify-between items-center p-4 bg-[#F7F7F5] hover:bg-white border border-transparent hover:border-[#E4E4E4] transition-all group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">{alert.label}</span>
                    <div className={cn(
                      "w-4 h-4 border flex items-center justify-center transition-colors",
                      formData[alert.id as keyof typeof formData] ? "bg-[#0A0A0A] border-[#0A0A0A]" : "bg-white border-[#E4E4E4]"
                    )}>
                      {formData[alert.id as keyof typeof formData] && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="bg-[#0055FF]/5 border border-[#0055FF]/20 p-8 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] mb-4">Save Changes</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed mb-8 uppercase font-bold">
                  Currency changes will affect how your balance and stakes are displayed throughout the workspace.
                </p>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#0055FF] transition-all flex items-center justify-center gap-3 shadow-md"
                >
                  {isSaving ? "Synchronizing..." : success ? "Settings Updated" : "Save Changes"}
                  {success && <Check className="w-3 h-3" />}
                </button>
              </Card>

              {success && (
                <div className="p-4 bg-[#16835B]/10 border border-[#16835B]/30 flex items-center gap-3 animate-in fade-in duration-300">
                  <Check className="w-4 h-4 text-[#16835B]" />
                  <span className="text-[9px] font-bold uppercase text-[#16835B]">Account Domain synchronized successfully.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
