'use client';

/**
 * @fileOverview Specialized Derived/Synthetic Trade Controls.
 * Handles Rise/Fall and Even/Odd contracts with deterministic settlement.
 */

import React, { useState, useMemo } from 'react';
import { Instrument } from '@/app/lib/instruments';
import { cn } from '@/app/lib/utils';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap, Info } from 'lucide-react';
import { getPracticeBalance, updatePracticeBalance } from '@/app/lib/demo-wallet';

interface DerivedTradeControlsProps {
  instrument: Instrument;
  livePrice: number | null;
  balance: number;
  onExecute: (params: any) => void;
}

export default function DerivedTradeControls({ instrument, livePrice, balance, onExecute }: DerivedTradeControlsProps) {
  const [activeMode, setActiveMode] = useState<'EVEN_ODD' | 'RISE_FALL'>('EVEN_ODD');
  const [stake, setStake] = useState<number>(10);
  const [duration, setDuration] = useState<number>(1); // Ticks

  const PayoutRatio = activeMode === 'EVEN_ODD' ? 0.96 : 0.85;
  const potentialReturn = (stake * (1 + PayoutRatio)).toFixed(2);

  const handleTrade = (side: string) => {
    if (stake > balance) {
      alert("Insufficient practice funds.");
      return;
    }

    // Deduct stake
    updatePracticeBalance(-stake);

    onExecute({
      symbol: instrument.symbol,
      side,
      mode: 'SYNTHETIC',
      amount: stake,
      derivedMode: activeMode,
      durationTicks: duration,
      entryPrice: livePrice,
      payoutMultiplier: 1 + PayoutRatio
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex bg-[#F7F7F5] border-b border-[#E4E4E4] p-1 shrink-0">
        <button 
          onClick={() => setActiveMode('EVEN_ODD')}
          className={cn(
            "flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-all",
            activeMode === 'EVEN_ODD' ? "bg-white text-[#0055FF] shadow-sm" : "text-[#6B7280] hover:text-[#0A0A0A]"
          )}
        >
          Even / Odd
        </button>
        <button 
          onClick={() => setActiveMode('RISE_FALL')}
          className={cn(
            "flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-all",
            activeMode === 'RISE_FALL' ? "bg-white text-[#0055FF] shadow-sm" : "text-[#6B7280] hover:text-[#0A0A0A]"
          )}
        >
          Rise / Fall
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Duration (Ticks)</label>
            <div className="grid grid-cols-4 gap-1.5">
               {[1, 5, 10, 20].map(d => (
                 <button 
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "py-2.5 text-[10px] font-bold border transition-all",
                    duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-[#F7F7F5] text-[#6B7280] border-[#E4E4E4]"
                  )}
                 >
                   {d}T
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Stake (USD)</label>
              <span className="text-[9px] text-[#6B7280] font-mono">Min: $1.00</span>
            </div>
            <input 
              type="number"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full p-4 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-3xl font-bold focus:border-[#0055FF] outline-none"
            />
          </div>

          <div className="p-5 bg-[#0055FF]/5 border border-[#0055FF]/10 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className="text-[#6B7280]">Payout Ratio</span>
              <span className="text-[#16835B]">{(PayoutRatio * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#0055FF]/10 pt-3 text-[11px] font-bold uppercase tracking-widest">
              <span className="text-[#0A0A0A]">Total Payout</span>
              <span className="text-[#16835B] font-mono">${potentialReturn}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {activeMode === 'EVEN_ODD' ? (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleTrade('EVEN')}
                className="group py-12 border-2 border-[#16835B] bg-white hover:bg-[#16835B] transition-all flex flex-col items-center justify-center space-y-2 shadow-lg active:scale-[0.98]"
              >
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#0A0A0A] group-hover:text-white">Even</span>
                <span className="text-[8px] font-mono font-bold text-[#16835B] group-hover:text-white/80">0, 2, 4, 6, 8</span>
              </button>
              <button 
                onClick={() => handleTrade('ODD')}
                className="group py-12 border-2 border-[#C43D3D] bg-white hover:bg-[#C43D3D] transition-all flex flex-col items-center justify-center space-y-2 shadow-lg active:scale-[0.98]"
              >
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#0A0A0A] group-hover:text-white">Odd</span>
                <span className="text-[8px] font-mono font-bold text-[#C43D3D] group-hover:text-white/80">1, 3, 5, 7, 9</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleTrade('RISE')}
                className="group py-12 border-2 border-[#16835B] bg-white hover:bg-[#16835B] transition-all flex flex-col items-center justify-center space-y-2 shadow-lg active:scale-[0.98]"
              >
                <ArrowUpRight className="w-6 h-6 text-[#16835B] group-hover:text-white" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#0A0A0A] group-hover:text-white">Rise</span>
              </button>
              <button 
                onClick={() => handleTrade('FALL')}
                className="group py-12 border-2 border-[#C43D3D] bg-white hover:bg-[#C43D3D] transition-all flex flex-col items-center justify-center space-y-2 shadow-lg active:scale-[0.98]"
              >
                <ArrowDownLeft className="w-6 h-6 text-[#C43D3D] group-hover:text-white" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#0A0A0A] group-hover:text-white">Fall</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
           <ShieldCheck className="w-4 h-4 text-[#16835B] shrink-0 mt-0.5" />
           <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
             Deterministic settlement active. Your stake is protected by the Varban matching node v4.2.
           </p>
        </div>
      </div>
    </div>
  );
}
