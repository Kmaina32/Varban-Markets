'use client';

/**
 * @fileOverview Synthetic/Derived Markets Execution Panel.
 * Specialized UI for Rise/Fall, Even/Odd, and Volatility Index trading.
 */

import React, { useState } from 'react';
import { Instrument } from '@/app/lib/instruments';
import { cn } from '@/app/lib/utils';
import { Zap, TrendingUp, TrendingDown, Info, Calculator, ShieldCheck } from 'lucide-react';

interface DerivedExecutionPanelProps {
  instrument: Instrument;
  livePrice: number | null;
  onExecute: (params: any) => void;
}

type DerivedMode = 'RISE_FALL' | 'EVEN_ODD' | 'MATCH_DIFF';

export default function DerivedExecutionPanel({ instrument, livePrice, onExecute }: DerivedExecutionPanelProps) {
  const [activeMode, setActiveMode] = useState<DerivedMode>('RISE_FALL');
  const [stake, setStake] = useState<number>(10);
  const [duration, setDuration] = useState<string>("5 ticks");
  const [prediction, setPrediction] = useState<string | null>(null);

  const PayoutRatio = activeMode === 'EVEN_ODD' ? 0.95 : 0.85;

  const handleTrade = (side: string) => {
    onExecute({
      symbol: instrument.symbol,
      side,
      mode: 'DURATION',
      amount: stake,
      derivedMode: activeMode,
      prediction,
      duration
    });
  };

  return (
    <div className="bg-white h-full flex flex-col border-t border-[#E4E4E4] overflow-hidden">
      {/* Sub-Header */}
      <div className="px-6 py-3 bg-[#F7F7F5] border-b border-[#E4E4E4] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#0055FF]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">
            Synthetic Hub: {instrument.symbol}
          </span>
        </div>
        <div className="flex gap-1">
          {['RISE_FALL', 'EVEN_ODD'].map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m as DerivedMode)}
              className={cn(
                "px-3 py-1 text-[8px] font-bold uppercase tracking-widest border transition-all",
                activeMode === m ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4]"
              )}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Settings */}
        <div className="md:col-span-4 space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Contract Duration</label>
            <div className="grid grid-cols-3 gap-1">
               {['5 ticks', '10 ticks', '1m', '5m', '15m'].map(d => (
                 <button 
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "py-2 text-[9px] font-bold uppercase border transition-all",
                    duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-[#F7F7F5] text-[#6B7280] border-[#E4E4E4]"
                  )}
                 >
                   {d}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Stake Amount (USD)</label>
            <input 
              type="number"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full p-4 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-xl font-bold focus:border-[#0055FF] outline-none"
            />
          </div>

          <div className="p-4 bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Calculator className="w-3 h-3 text-[#0055FF]" />
                <span className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest">Expected Return</span>
             </div>
             <span className="text-xs font-mono font-bold text-[#16835B]">
               +${(stake * PayoutRatio).toFixed(2)}
             </span>
          </div>
        </div>

        {/* Center: Specialized Predictions */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-6">
          {activeMode === 'RISE_FALL' ? (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleTrade('RISE')}
                className="group p-8 border-2 border-[#16835B] bg-white hover:bg-[#16835B] transition-all flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#16835B]/10 group-hover:bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#16835B] group-hover:text-white" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] group-hover:text-white block">Rise</span>
                  <span className="text-[9px] text-[#6B7280] group-hover:text-white/70 uppercase">Prediction: High</span>
                </div>
              </button>

              <button 
                onClick={() => handleTrade('FALL')}
                className="group p-8 border-2 border-[#C43D3D] bg-white hover:bg-[#C43D3D] transition-all flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#C43D3D]/10 group-hover:bg-white/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-[#C43D3D] group-hover:text-white" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] group-hover:text-white block">Fall</span>
                  <span className="text-[9px] text-[#6B7280] group-hover:text-white/70 uppercase">Prediction: Low</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.3em]">Last Digit Prediction</span>
                <p className="text-xs text-[#0A0A0A] uppercase font-medium">Predict if the last digit of the price will be Even or Odd</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setPrediction('EVEN'); handleTrade('EVEN'); }}
                  className="py-12 border border-[#E4E4E4] bg-[#F7F7F5] hover:border-[#0055FF] hover:bg-white transition-all text-center space-y-2"
                >
                  <span className="text-3xl font-mono font-bold text-[#0A0A0A]">2, 4, 6...</span>
                  <span className="block text-[10px] font-bold uppercase text-[#0055FF] tracking-widest">Even</span>
                </button>
                <button 
                  onClick={() => { setPrediction('ODD'); handleTrade('ODD'); }}
                  className="py-12 border border-[#E4E4E4] bg-[#F7F7F5] hover:border-[#0055FF] hover:bg-white transition-all text-center space-y-2"
                >
                  <span className="text-3xl font-mono font-bold text-[#0A0A0A]">1, 3, 5...</span>
                  <span className="block text-[10px] font-bold uppercase text-[#0055FF] tracking-widest">Odd</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-[#F7F7F5] p-4 border border-[#E4E4E4]">
             <ShieldCheck className="w-4 h-4 text-[#16835B]" />
             <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
               Deterministic tick verification active. This contract is governed by the Varban Synthetic Index algorithm v4.2.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
