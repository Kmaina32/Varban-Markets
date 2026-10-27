'use client';

/**
 * @fileOverview Admin: Synthetic Market Controller.
 * Manages volatility, house margin, and execution parameters for proprietary indices.
 */

import React, { useState } from 'react';
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Settings2, 
  TrendingUp, 
  ShieldCheck, 
  Save, 
  RefreshCw,
  Power
} from "lucide-react";
import { DEFAULT_SYNTHETIC_CONFIGS, SyntheticConfig } from "@/app/lib/synthetic/engine";
import { cn } from "@/app/lib/utils";

export default function AdminSyntheticMarkets() {
  const [configs, setConfigs] = useState<Record<string, SyntheticConfig>>(DEFAULT_SYNTHETIC_CONFIGS);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = (symbol: string, field: keyof SyntheticConfig, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [symbol]: { ...prev[symbol], [field]: value }
    }));
  };

  const handleSave = async (symbol: string) => {
    setIsSaving(true);
    // In a real implementation, this would write to Firestore settings/synthetic_markets
    setTimeout(() => {
      alert(`${symbol} engine synchronized.`);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <AuthedLayout 
      title="Synthetic Markets" 
      subtitle="Root authority for proprietary index algorithms"
    >
      <div className="space-y-6 pb-20">
        <div className="grid grid-cols-1 gap-6">
          {Object.values(configs).map((cfg) => (
            <Card key={cfg.symbol} className="bg-white border-[#E4E4E4] p-8 shadow-sm flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-sm">
                    {cfg.symbol}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-tight">{cfg.symbol} Index</h3>
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Matching Node Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#F7F7F5] border border-[#E4E4E4]">
                   <span className="text-[10px] font-bold uppercase text-[#0A0A0A]">Trade Node</span>
                   <button 
                    onClick={() => handleUpdate(cfg.symbol, 'allowTrades', !cfg.allowTrades)}
                    className={cn(
                      "p-1.5 border transition-all",
                      cfg.allowTrades ? "bg-[#16835B] text-white border-[#16835B]" : "bg-[#6B7280] text-white border-[#6B7280]"
                    )}
                   >
                     <Power className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Volatility (1-300)</label>
                    <input 
                      type="number" 
                      value={cfg.volatility}
                      onChange={e => handleUpdate(cfg.symbol, 'volatility', Number(e.target.value))}
                      className="w-full p-2.5 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold outline-none focus:border-[#0055FF]" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Trend (% per hr)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={cfg.driftPerHour}
                      onChange={e => handleUpdate(cfg.symbol, 'driftPerHour', Number(e.target.value))}
                      className="w-full p-2.5 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold outline-none focus:border-[#0055FF]" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">House Margin (%)</label>
                    <input 
                      type="number" 
                      value={cfg.houseMargin}
                      onChange={e => handleUpdate(cfg.symbol, 'houseMargin', Number(e.target.value))}
                      className="w-full p-2.5 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold outline-none focus:border-[#0055FF]" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Tick Speed (ms)</label>
                    <select 
                      value={cfg.tickMs}
                      onChange={e => handleUpdate(cfg.symbol, 'tickMs', Number(e.target.value))}
                      className="w-full p-2.5 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value={500}>500ms (High Speed)</option>
                      <option value={1000}>1000ms (Standard)</option>
                      <option value={2000}>2000ms (Stable)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-3">
                  <button 
                    onClick={() => handleSave(cfg.symbol)}
                    className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Deploy Logic</span>
                  </button>
                  <button className="w-full py-4 border border-[#E4E4E4] text-[#C43D3D] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#F7F7F5] transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restart Cycle</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AuthedLayout>
  );
}
