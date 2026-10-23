'use client';

/**
 * @fileOverview Institutional Bot Modification Workspace.
 * Features AI-assisted parameter tuning and deterministic risk validation.
 */

import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight,
  Info,
  Check,
  Cpu,
  BarChart3,
  History
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/app/lib/utils';
import { useTranslation } from '@/app/lib/i18n-context';
import { BotConfig, BotId } from '@/app/lib/bots-engine/types';
import { modifyBot, ModifyBotOutput } from '@/ai/flows/modify-bot-flow';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ModifyBotModalProps {
  bot: BotConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (config: BotConfig) => void;
}

export default function ModifyBotModal({ bot, isOpen, onClose, onUpdate }: ModifyBotModalProps) {
  const { t, locale } = useTranslation();
  const { user } = useUser();
  const db = useFirestore();

  const [activeTab, setActiveTab] = useState<'FIELDS' | 'AI'>('FIELDS');
  const [editedConfig, setEditedConfig] = useState<BotConfig>({ ...bot });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [proposal, setProposal] = useState<ModifyBotOutput | null>(null);

  if (!isOpen) return null;

  const handleGenerateProposal = async () => {
    if (!aiPrompt.trim()) return;
    setIsProcessing(true);
    try {
      const result = await modifyBot({
        botId: bot.id as BotId,
        currentConfig: editedConfig,
        userRequest: aiPrompt,
        locale: locale
      });
      setProposal(result);
    } catch (e) {
      alert("AI Handshake Failed: Unable to synchronize with strategy engine.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyProposal = () => {
    if (!proposal) return;
    const newConfig = { ...editedConfig };
    proposal.patch.forEach(p => {
      // Logic to merge into nested params or top-level fields
      if (['enabled', 'mode', 'riskPercent', 'minRiskReward', 'maxTradesPerDay'].includes(p.field)) {
        (newConfig as any)[p.field] = p.value;
      } else {
        newConfig.params[p.field] = p.value;
      }
    });
    setEditedConfig(newConfig);
    setProposal(null);
    setAiPrompt('');
    setActiveTab('FIELDS');
  };

  const handleFinalSave = async () => {
    if (!user || !db) return;
    setIsProcessing(true);
    try {
      const updated = {
        ...editedConfig,
        version: editedConfig.version + 1,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, `users/${user.uid}/bot_configs`, bot.id), updated, { merge: true });
      onUpdate(updated);
      onClose();
    } catch (e) {
      alert("Persistence Failure: Could not commit changes to the configuration ledger.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="bg-white border-[#E4E4E4] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-[#F7F7F5] bg-[#F7F7F5] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[#0055FF]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Modify Strategy: {bot.name}</h2>
              <p className="text-[9px] text-[#6B7280] font-mono uppercase">Version {editedConfig.version}.0 &bull; {bot.id.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E4E4E4] bg-white shrink-0">
          <button 
            onClick={() => setActiveTab('FIELDS')}
            className={cn(
              "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all",
              activeTab === 'FIELDS' ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]"
            )}
          >
            Manual Configuration
          </button>
          <button 
            onClick={() => setActiveTab('AI')}
            className={cn(
              "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2",
              activeTab === 'AI' ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            AI Modification
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 no-scrollbar bg-white">
          {activeTab === 'FIELDS' ? (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Markets & Timeframes */}
              <section className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] border-b border-[#F7F7F5] pb-2">Execution Domain</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Active Symbols</label>
                    <div className="flex flex-wrap gap-1.5">
                      {editedConfig.symbols.map(s => (
                        <span key={s} className="px-2 py-1 bg-[#F7F7F5] border border-[#E4E4E4] text-[9px] font-mono font-bold">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Timeframes</label>
                    <div className="flex flex-wrap gap-1.5">
                      {editedConfig.timeframes.map(t => (
                        <span key={t} className="px-2 py-1 bg-[#0A0A0A] text-white text-[9px] font-mono font-bold">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Strategy Specific Params */}
              <section className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] border-b border-[#F7F7F5] pb-2">Strategy Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(editedConfig.params).map(([key, val]) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-[#6B7280]">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <input 
                        type={typeof val === 'number' ? 'number' : 'text'}
                        value={val}
                        step={0.1}
                        onChange={(e) => setEditedConfig({
                          ...editedConfig,
                          params: { ...editedConfig.params, [key]: typeof val === 'number' ? parseFloat(e.target.value) : e.target.value }
                        })}
                        className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#0055FF] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Risk Policy */}
              <section className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C43D3D] border-b border-[#F7F7F5] pb-2">Risk Safeguards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Risk per trade (% of equity)</label>
                    <input 
                      type="number" 
                      value={editedConfig.riskPercent}
                      max={0.5}
                      min={0.01}
                      step={0.01}
                      onChange={(e) => setEditedConfig({ ...editedConfig, riskPercent: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#C43D3D] outline-none"
                    />
                    <p className="text-[8px] text-[#6B7280] uppercase">Max allowed by protocol: 0.50%</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Minimum Reward/Risk Ratio</label>
                    <input 
                      type="number" 
                      value={editedConfig.minRiskReward}
                      step={0.1}
                      onChange={(e) => setEditedConfig({ ...editedConfig, minRiskReward: parseFloat(e.target.value) })}
                      className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs font-mono font-bold focus:border-[#0055FF] outline-none"
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="p-6 bg-[#F7F7F5] border-l-4 border-l-[#0055FF] space-y-3">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">AI Strategy Modification</h4>
                 <p className="text-[11px] text-[#6B7280] leading-relaxed font-bold uppercase">
                   Describe the behavior or parameter adjustments you want to implement. The AI will propose a configuration patch that maintains deterministic safety.
                 </p>
              </div>

              <div className="space-y-4">
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 'Increase the displacement threshold to 1.2 ATR and limit the bot to 2 trades per day for safety.'"
                  rows={4}
                  className="w-full p-5 border border-[#E4E4E4] text-sm focus:border-[#0055FF] outline-none bg-white shadow-inner resize-none"
                />
                <button 
                  onClick={handleGenerateProposal}
                  disabled={isProcessing || !aiPrompt.trim()}
                  className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-30"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate Proposal
                </button>
              </div>

              {proposal && (
                <Card className="border-[#E4E4E4] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                  <div className="p-5 bg-[#F7F7F5] border-b border-[#E4E4E4] flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Proposed Changeset</span>
                    <span className="text-[8px] font-bold bg-[#16835B] text-white px-2 py-0.5 uppercase tracking-tighter">Validated Patch</span>
                  </div>
                  <div className="p-6 space-y-6">
                    <p className="text-xs text-[#333333] font-medium leading-relaxed italic">"{proposal.summary}"</p>
                    
                    <div className="space-y-3">
                      {proposal.patch.map((p, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-[#F7F7F5] text-[10px]">
                           <div className="shrink-0 w-5 h-5 bg-[#0055FF]/10 flex items-center justify-center mt-0.5">
                              <Check className="w-3 h-3 text-[#0055FF]" />
                           </div>
                           <div>
                              <span className="font-bold text-[#0A0A0A] uppercase">{p.field}: </span>
                              <span className="font-mono text-[#16835B] font-bold">{JSON.stringify(p.value)}</span>
                              <p className="text-[#6B7280] mt-1 uppercase font-bold text-[9px]">{p.reason}</p>
                           </div>
                        </div>
                      ))}
                    </div>

                    {proposal.warnings.length > 0 && (
                      <div className="p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 space-y-2">
                        <div className="flex items-center gap-2 text-[#C43D3D]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-bold uppercase">Critical Warnings</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-1">
                          {proposal.warnings.map((w, idx) => (
                            <li key={idx} className="text-[9px] text-[#C43D3D] font-bold uppercase">{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button 
                        onClick={handleApplyProposal}
                        className="py-4 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-[#0A0A0A] transition-all"
                      >
                        Apply Patch
                      </button>
                      <button 
                        onClick={() => setProposal(null)}
                        className="py-4 bg-white border border-[#E4E4E4] text-[#6B7280] text-[10px] font-bold uppercase tracking-widest"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#6B7280] uppercase">
               <ShieldCheck className="w-3 h-3 text-[#16835B]" />
               <span>Deterministic Safety Active</span>
            </div>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={onClose}
              className="px-6 py-3 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors"
             >
               Discard Changes
             </button>
             <button 
              onClick={handleFinalSave}
              disabled={isProcessing}
              className="px-8 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-[#0055FF] transition-all flex items-center gap-2 disabled:opacity-40"
             >
               <Save className="w-3.5 h-3.5" />
               <span>Synchronize Version</span>
             </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
