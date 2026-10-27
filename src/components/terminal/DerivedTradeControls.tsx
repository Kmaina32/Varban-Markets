'use client';

/**
 * @fileOverview High-Fidelity Derived Markets Execution Panel.
 * Matched precisely to the reference screenshot.
 * Implements Rise/Fall with integrated payout calculations.
 */

import React, { useState } from 'react';
import { Instrument } from '@/app/lib/instruments';
import { cn } from '@/app/lib/utils';
import { ChevronRight, Info, Plus, Minus } from 'lucide-react';
import { useTranslation } from '@/app/lib/i18n-context';
import { Switch } from '@/components/ui/switch';

interface DerivedTradeControlsProps {
  instrument: Instrument;
  livePrice: number | null;
  balance: number;
  onExecute: (params: any) => void;
}

export default function DerivedTradeControls({ instrument, livePrice, balance, onExecute }: DerivedTradeControlsProps) {
  const { formatNumber } = useTranslation();
  const [side, setSide] = useState<'RISE' | 'FALL'>('RISE');
  const [duration, setDuration] = useState<number>(5);
  const [stake, setStake] = useState<number>(2);
  const [allowEquals, setAllowEquals] = useState(false);

  // Payout calculation: (1 - houseMargin) / prob
  // With 4% margin and ~50% prob, multiplier is roughly 1.9x
  const payoutMultiplier = allowEquals ? 1.85 : 1.90;
  const potentialPayout = (stake * payoutMultiplier).toFixed(2);

  return (
    <div className="flex flex-col h-full bg-[#131722] text-white">
      <div className="flex-grow p-6 space-y-6 overflow-y-auto no-scrollbar">
        
        {/* Help Link */}
        <button className="flex items-center gap-2 text-[11px] font-medium text-[#D1D4DC] hover:text-white transition-colors group">
          <span>How to trade Rise/Fall?</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
        </button>

        {/* Direction Toggle */}
        <div className="p-1 bg-[#1E222D] rounded-lg flex">
          <button
            onClick={() => setSide('RISE')}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-md transition-all",
              side === 'RISE' ? "bg-[#31363F] text-[#00A015] shadow-lg" : "text-[#6B7280]"
            )}
          >
            Rise
          </button>
          <button
            onClick={() => setSide('FALL')}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-md transition-all",
              side === 'FALL' ? "bg-[#31363F] text-[#FF444F] shadow-lg" : "text-[#6B7280]"
            )}
          >
            Fall
          </button>
        </div>

        {/* Duration Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest px-1">Duration</label>
          <div className="relative group">
            <input 
              type="text" 
              readOnly 
              value={`${duration} ticks`} 
              className="w-full bg-[#1E222D] border border-transparent group-hover:border-[#31363F] p-4 text-sm font-bold outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Stake Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest px-1">Stake</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6B7280] font-bold">$</span>
            <input 
              type="number" 
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="w-full bg-[#1E222D] border border-transparent group-hover:border-[#31363F] p-4 pl-7 text-sm font-mono font-bold outline-none"
            />
          </div>
        </div>

        {/* Allow Equals Toggle */}
        <div className="flex items-center justify-between px-1 py-2">
          <div className="flex items-center gap-2 border-b border-[#6B7280] border-dotted cursor-help group relative">
            <span className="text-[11px] font-bold text-[#D1D4DC]">Allow equals</span>
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-[#1E222D] border border-[#31363F] text-[9px] hidden group-hover:block z-50">
              Win if exit price equals entry price. Payout adjusted accordingly.
            </div>
          </div>
          <Switch 
            checked={allowEquals} 
            onCheckedChange={setAllowEquals} 
            className="data-[state=checked]:bg-[#00A015] data-[state=unchecked]:bg-[#31363F]"
          />
        </div>
      </div>

      {/* Execution Footer */}
      <div className="p-6 shrink-0 bg-[#131722] border-t border-[#1E222D]">
        <button
          onClick={() => onExecute({ side, stake, duration, allowEquals })}
          className="w-full py-4 bg-[#00A015] hover:bg-[#008F12] text-white rounded-lg shadow-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest">Buy</span>
          <span className="text-[10px] font-medium text-white/80">Payout ${potentialPayout}</span>
        </button>
      </div>
    </div>
  );
}
