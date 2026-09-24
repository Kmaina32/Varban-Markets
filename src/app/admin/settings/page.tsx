'use client';

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Settings, ShieldCheck, DollarSign, Activity, Save, AlertTriangle, Database, Globe, Copy, Check, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

/**
 * @fileOverview Global Platform Configuration Node.
 * Manages system-wide parameters, operational thresholds, and API configurations.
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
    supportEmail: "support@varbanmarkets.com",
    primaryMarketProvider: "Automatic",
    finnhubKey: "daqjp7pr01qott5g8tg0daqjp7pr01qott5g8tgg",
    finnhubSecret: "daqjp7pr01qott5g8thg",
    alphaVantageKey: "48SDEBM5X6L6WBVV",
    coinbaseApiKey: "",
    coinbaseApiSecret: "",
    coinbaseVersion: "2022-01-06"
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        maintenanceMode: settings.maintenanceMode ?? false,
        payoutRate: settings.payoutRate ?? 85,
        minDeposit: settings.minDeposit ?? 10,
        maxDeposit: settings.maxDeposit ?? 100000,
        supportEmail: settings.supportEmail ?? "support@varbanmarkets.com",
        primaryMarketProvider: settings.primaryMarketProvider ?? "Automatic",
        finnhubKey: settings.finnhubKey ?? "daqjp7pr01qott5g8tg0daqjp7pr01qott5g8tgg",
        finnhubSecret: settings.finnhubSecret ?? "daqjp7pr01qott5g8thg",
        alphaVantageKey: settings.alphaVantageKey ?? "48SDEBM5X6L6WBVV",
        coinbaseApiKey: settings.coinbaseApiKey ?? "",
        coinbaseApiSecret: settings.coinbaseApiSecret ?? "",
        coinbaseVersion: settings.coinbaseVersion ?? "2022-01-06"
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

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/finnhub` : "";

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthedLayout 
      title="Platform Settings" 
      subtitle="Root authority configuration and global state management"
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Financial & Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6 flex items-center text-[#0A0A0A]">
                <Activity className="w-3.5 h-3.5 mr-2 text-[#0055FF]" />
                Operational Status
              </h3>
              <div className="flex justify-between items-center p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                <div>
                  <span className="text-[10px] font-bold uppercase block text-[#0A0A0A]">Maintenance Mode</span>
                  <p className="text-[9px] text-[#6B7280]">Disables all trading operations globally.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.maintenanceMode}
                  onChange={(e) => setFormData({...formData, maintenanceMode: e.target.checked})}
                  className="w-5 h-5 accent-[#0055FF] cursor-pointer"
                />
              </div>
            </Card>

            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6 flex items-center text-[#0A0A0A]">
                <Database className="w-3.5 h-3.5 mr-2 text-[#16835B]" />
                Market Data Node Configuration
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">Primary Data Node (Active Feed)</label>
                  <select 
                    value={formData.primaryMarketProvider}
                    onChange={(e) => setFormData({...formData, primaryMarketProvider: e.target.value})}
                    className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-bold focus:outline-none focus:border-[#0055FF] appearance-none cursor-pointer"
                  >
                    <option value="Automatic">Automatic Failover (Intelligent)</option>
                    <option value="Coinbase">Coinbase CDP (High-Precision)</option>
                    <option value="TwelveData">Twelve Data (Institutional)</option>
                    <option value="AlphaVantage">Alpha Vantage (Forex Specialization)</option>
                    <option value="Finnhub">Finnhub (SME Feed)</option>
                  </select>
                </div>

                {/* Coinbase Settings */}
                <div className="border-l-2 border-[#0055FF] pl-4 space-y-4">
                  <span className="text-[10px] font-bold uppercase text-[#0055FF]">Coinbase CDP Credentials</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">API Key</label>
                      <input 
                        type="password"
                        value={formData.coinbaseApiKey}
                        onChange={(e) => setFormData({...formData, coinbaseApiKey: e.target.value})}
                        className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                        placeholder="organizations/..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">API Secret</label>
                      <input 
                        type="password"
                        value={formData.coinbaseApiSecret}
                        onChange={(e) => setFormData({...formData, coinbaseApiSecret: e.target.value})}
                        className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Alpha Vantage Settings */}
                <div className="border-l-2 border-[#C9A227] pl-4 space-y-4">
                  <span className="text-[10px] font-bold uppercase text-[#C9A227]">Alpha Vantage Node</span>
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">API Key</label>
                    <input 
                      type="password"
                      value={formData.alphaVantageKey}
                      onChange={(e) => setFormData({...formData, alphaVantageKey: e.target.value})}
                      className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                    />
                  </div>
                </div>

                {/* Finnhub Settings */}
                <div className="border-l-2 border-[#16835B] pl-4 space-y-4">
                  <span className="text-[10px] font-bold uppercase text-[#16835B]">Finnhub Integration</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">Finnhub API Key</label>
                      <input 
                        type="password"
                        value={formData.finnhubKey}
                        onChange={(e) => setFormData({...formData, finnhubKey: e.target.value})}
                        className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">Finnhub Webhook Secret</label>
                      <input 
                        type="password"
                        value={formData.finnhubSecret}
                        onChange={(e) => setFormData({...formData, finnhubSecret: e.target.value})}
                        className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs font-mono focus:outline-none focus:border-[#0055FF]"
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-[#E4E4E4] bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-bold uppercase text-[#6B7280]">Finnhub Webhook URL</span>
                      <button onClick={copyWebhook} className="flex items-center gap-1 text-[8px] font-bold uppercase text-[#0055FF] hover:underline">
                        {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copied ? "Copied" : "Copy URL"}</span>
                      </button>
                    </div>
                    <code className="block w-full p-2 bg-[#F7F7F5] text-[10px] font-mono text-[#0A0A0A] truncate">
                      {webhookUrl}
                    </code>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6 flex items-center text-[#0A0A0A]">
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

          {/* Column 2: Authority & Domain */}
          <div className="space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6 flex items-center text-[#0A0A0A]">
                <Globe className="w-3.5 h-3.5 mr-2 text-[#6B7280]" />
                Identity & Domain
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1.5">Primary Support Domain</label>
                  <input 
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                    className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs focus:outline-none focus:border-[#0A0A0A]"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-[#0055FF] p-6 border-b-4 border-b-[#0055FF] shadow-sm">
              <ShieldCheck className="w-8 h-8 text-[#0055FF] mb-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-[#0A0A0A]">Authority Confirmation</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed mb-6">
                Modifying global platform parameters will propagate changes across all user sessions instantly. Ensure all metrics are verified against institutional liquidity boundaries.
              </p>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Synchronize State</span>
              </button>
            </Card>

            <div className="flex items-start space-x-3 p-4 bg-[#0055FF]/5 border border-[#0055FF]/20">
              <AlertTriangle className="w-4 h-4 text-[#0055FF] shrink-0 mt-0.5" />
              <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
                Platform modifications are logged in the immutable audit ledger. Market feed changes may take up to 30 seconds to propagate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
