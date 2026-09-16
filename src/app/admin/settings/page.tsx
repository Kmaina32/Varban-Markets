'use client';

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Settings, ShieldCheck, DollarSign, Activity, Save, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

/**
 * @fileOverview Global Platform Configuration Node.
 * Manages system-wide parameters and operational thresholds.
 */

export default function PlatformSettings() {
  const { t } = useTranslation();
  const db = useFirestore();
  const { data: settings, loading } = useDoc<any>(db, "settings/platform");
  
  const [formData, setFormData] = useState({
    maintenanceMode: false,
    payoutRate: 85,
    minDeposit: 10,
    maxDeposit: 100000,
    supportEmail: "support@varbanmarkets.com"
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        maintenanceMode: settings.maintenanceMode || false,
        payoutRate: settings.payoutRate || 85,
        minDeposit: settings.minDeposit || 10,
        maxDeposit: settings.maxDeposit || 100000,
        supportEmail: settings.supportEmail || "support@varbanmarkets.com"
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!db) return;
    try {
      await setDoc(doc(db, "settings", "platform"), formData, { merge: true });
      alert("Platform configurations successfully synchronized.");
    } catch (e) {
      alert("Critical Failure: Authority to modify global state denied.");
    }
  };

  return (
    <AuthedLayout 
      title="Platform Settings" 
      subtitle="Root authority configuration and global state management"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-2 text-[#0055FF]" />
                Operational Status
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                  <div>
                    <span className="text-[10px] font-bold uppercase block">Maintenance Mode</span>
                    <p className="text-[9px] text-[#6B7280]">Disables all trading operations globally.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.maintenanceMode}
                    onChange={(e) => setFormData({...formData, maintenanceMode: e.target.checked})}
                    className="w-5 h-5 accent-[#C43D3D] cursor-pointer"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6 flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-2 text-[#16835B]" />
                Financial Thresholds
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">Standard Payout Rate (%)</label>
                  <input 
                    type="number"
                    value={formData.payoutRate}
                    onChange={(e) => setFormData({...formData, payoutRate: Number(e.target.value)})}
                    className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">Min Deposit (USD)</label>
                    <input 
                      type="number"
                      value={formData.minDeposit}
                      onChange={(e) => setFormData({...formData, minDeposit: Number(e.target.value)})}
                      className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">Max Deposit (USD)</label>
                    <input 
                      type="number"
                      value={formData.maxDeposit}
                      onChange={(e) => setFormData({...formData, maxDeposit: Number(e.target.value)})}
                      className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6 flex items-center">
                <Settings className="w-3.5 h-3.5 mr-2 text-[#6B7280]" />
                Identity & Compliance
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">Primary Support Domain</label>
                  <input 
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                    className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs focus:outline-none focus:border-[#0055FF]"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-[#0A0A0A] p-6 border-b-4 border-[#0055FF] text-white">
              <ShieldCheck className="w-8 h-8 text-[#0055FF] mb-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Authority Confirmation</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed mb-6">
                Modifying global platform parameters will propagate changes across all user sessions instantly. Ensure all metrics are verified against institutional liquidity boundaries.
              </p>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full py-4 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#0055FF] transition-all flex items-center justify-center space-x-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Synchronize State</span>
              </button>
            </Card>

            <div className="flex items-start space-x-3 p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20">
              <AlertTriangle className="w-4 h-4 text-[#C43D3D] shrink-0 mt-0.5" />
              <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
                Platform modifications are logged in the immutable audit ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
