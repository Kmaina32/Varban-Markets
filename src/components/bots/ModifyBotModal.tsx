'use client';

/**
 * @fileOverview Institutional Bot Modification Workspace.
 * Exclusive manual parameter tuning with deterministic risk validation.
 * Optimized for Martingale, SL, TP and high-precision trading settings.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Save, 
  Check,
  Cpu,
  Settings2,
  Globe,
  TrendingUp,
  Target,
  ArrowRightLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/app/lib/utils';
import { useTranslation } from '@/app/lib/i18n-context';
import { BotConfig } from '@/app/lib/bots-engine/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

interface ModifyBotModalProps {
  bot: BotConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (config: BotConfig) => void;
}

export default function ModifyBotModal({ bot, isOpen, onClose, onUpdate }: ModifyBotModalProps) {
  const { user } = useUser();
  const db = useFirestore();

  const [editedConfig, setEditedConfig] = useState<BotConfig>({ ...bot });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      setEditedConfig({ ...bot });
    }
  }, [isOpen, bot]);

  if (!isOpen) return null;

  const handleFinalSave = async () => {
    if (!user || !db) return;
    
    // Final hard gate for risk percentage
    if (editedConfig.riskPercent > 0.5) {
      setDialog({
        status: 'error',
        title: 'Safety Violation',
        message: 'Risk per trade cannot exceed the institutional hard cap of 0.50%.'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const updated = {
        ...editedConfig,
        version: (editedConfig.version || 1) + 1,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, `users/${user.uid}/bot_configs`, bot.id), updated, { merge: true });
      
      if (onUpdate) onUpdate(updated);
      
      setDialog({
        status: 'success',
        title: 'Configuration Synchronized',
        message: `Version ${updated.version}.0 has been locked in the institutional ledger.`,
      });
      
      setTimeout(onClose, 2000);
    } catch (e) {
      setDialog({
        status: 'error',
        title: 'Persistence Failure',
        message: 'Could not commit the new version to the configuration registry.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateParam = (key: string, value: any) => {
    setEditedConfig({
      ...editedConfig,
      params: { ...editedConfig.params, [key]: value }
    });
  };

  // Common Parameter Filters
  const martingaleKeys = ['martingaleMultiplier', 'martingaleSteps'];
  const exitKeys = ['slAtrMultiplier', 'tpAtrMultiplier', 'stopAtr', 'targetAtr', 'stopBuffer'];
  const strategyKeys = Object.keys(editedConfig.params || {}).filter(
    k => !martingaleKeys.includes(k) && !exitKeys.includes(k)
  );

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-md animate-in fade-in duration-300">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      <Card className="bg-white border-[#E4E4E4] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 rounded-none border-b-4 border-b-[#0055FF]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#F7F7F5] bg-[#F7F7F5] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[#0055FF]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Modify Strategy: {bot.name}</h2>
              <p className="text-[9px] text-[#6B7280] font-mono uppercase">Node ID: {bot.id.toUpperCase()} &bull; Current v{(editedConfig.version || 1).toFixed(1)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 no-scrollbar bg-white">
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* 1. EXECUTION DOMAIN */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] border-b border-[#F7F7F5] pb-2 flex items-center gap-2">
                 <Globe className="w-3 h-3" /> Execution Domain
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Active Symbols</label>
                  <div className="flex flex-wrap gap-1.5">
                    {editedConfig.symbols.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-[#F7F7F5] border border-[#E4E4E4] text-[9px] font-mono font-bold text-[#0A0A0A]">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Target Intervals</label>
                  <div className="flex flex-wrap gap-1.5">
                    {editedConfig.timeframes.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-[#0A0A0A] text-white text-[9px] font-mono font-bold">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. STRATEGY TUNING */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] border-b border-[#F7F7F5] pb-2 flex items-center gap-2">
                 <Settings2 className="w-3 h-3" /> Strategy Tuning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {strategyKeys.map((key) => {
                  const val = editedConfig.params[key];
                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-[#6B7280]">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <input 
                        type={typeof val === 'number' ? 'number' : 'text'}
                        value={val}
                        step={0.1}
                        onChange={(e) => updateParam(key, typeof val === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#0055FF] outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. MONEY MANAGEMENT (Martingale) */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#16835B] border-b border-[#F7F7F5] pb-2 flex items-center gap-2">
                 <TrendingUp className="w-3 h-3" /> Money Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Martingale Multiplier</label>
                  <input 
                    type="number" 
                    value={editedConfig.params.martingaleMultiplier || 1.0}
                    step={0.1}
                    min={1.0}
                    onChange={(e) => updateParam('martingaleMultiplier', parseFloat(e.target.value))}
                    className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#16835B] outline-none"
                  />
                  <p className="text-[8px] text-[#6B7280] uppercase font-bold">Multiplier for stake recovery after a loss (1.0 = Disabled)</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Max Martingale Steps</label>
                  <input 
                    type="number" 
                    value={editedConfig.params.martingaleSteps || 0}
                    min={0}
                    onChange={(e) => updateParam('martingaleSteps', parseInt(e.target.value))}
                    className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#16835B] outline-none"
                  />
                  <p className="text-[8px] text-[#6B7280] uppercase font-bold">Maximum consecutive steps allowed (0 = Infinite)</p>
                </div>
              </div>
            </section>

            {/* 4. EXIT STRATEGY (SL/TP) */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227] border-b border-[#F7F7F5] pb-2 flex items-center gap-2">
                 <Target className="w-3 h-3" /> Exit Strategy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Stop Loss Distance (ATR)</label>
                  <input 
                    type="number" 
                    value={editedConfig.params.slAtrMultiplier || editedConfig.params.stopAtr || 1.5}
                    step={0.1}
                    min={0.1}
                    onChange={(e) => updateParam('slAtrMultiplier', parseFloat(e.target.value))}
                    className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#C9A227] outline-none"
                  />
                  <p className="text-[8px] text-[#6B7280] uppercase font-bold">Distance from entry based on market volatility</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Take Profit Distance (ATR)</label>
                  <input 
                    type="number" 
                    value={editedConfig.params.tpAtrMultiplier || editedConfig.params.targetAtr || 3.0}
                    step={0.1}
                    min={0.5}
                    onChange={(e) => updateParam('tpAtrMultiplier', parseFloat(e.target.value))}
                    className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#C9A227] outline-none"
                  />
                  <p className="text-[8px] text-[#6B7280] uppercase font-bold">Standard target ratio for profit realization</p>
                </div>
              </div>
            </section>

            {/* 5. RISK SAFEGUARDS */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C43D3D] border-b border-[#F7F7F5] pb-2 flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" /> Risk Safeguards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Risk per trade (% of equity)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={editedConfig.riskPercent}
                      max={0.5}
                      min={0.01}
                      step={0.01}
                      onChange={(e) => setEditedConfig({ ...editedConfig, riskPercent: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#C43D3D] outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#6B7280]">%</span>
                  </div>
                  <p className="text-[8px] text-[#6B7280] uppercase font-bold">Hard Institutional Cap: 0.50%</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Minimum Reward/Risk Ratio</label>
                  <input 
                    type="number" 
                    value={editedConfig.minRiskReward}
                    min={1.5}
                    step={0.1}
                    onChange={(e) => setEditedConfig({ ...editedConfig, minRiskReward: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#0055FF] outline-none"
                  />
                  <p className="text-[8px] text-[#6B7280] uppercase font-bold">Minimum Requirement: 1.5</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[9px] font-bold text-[#6B7280] uppercase">
               <ShieldCheck className="w-4 h-4 text-[#16835B]" />
               <span>Risk Engine: ACTIVE</span>
            </div>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={onClose}
              className="px-6 py-3 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors"
             >
               Discard
             </button>
             <button 
              onClick={handleFinalSave}
              disabled={isProcessing}
              className="px-10 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.25em] shadow-xl hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
             >
               <Save className="w-3.5 h-3.5" />
               <span>Sync v{(editedConfig.version || 1) + 1}.0</span>
             </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
