'use client';

/**
 * @fileOverview High-Fidelity Derived Markets Execution Hub.
 * Supports Directional, Growth-based, and Digit-based trade categories.
 * Matched to professional dark-mode terminal aesthetics.
 */

import React, { useState, useMemo } from 'react';
import { Instrument } from '@/app/lib/instruments';
import { cn } from '@/app/lib/utils';
import { 
  ChevronDown, 
  Info, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  BarChart2, 
  Layers, 
  Target, 
  ArrowUpRight, 
  Activity, 
  Box, 
  Hash, 
  MoreHorizontal, 
  Binary,
  Check
} from 'lucide-react';
import { useTranslation } from '@/app/lib/i18n-context';

interface DerivedTradeControlsProps {
  instrument: Instrument;
  livePrice: number | null;
  balance: number;
  onExecute: (params: any) => void;
}

type TradeCategory = 'DIRECTIONAL' | 'GROWTH' | 'DIGIT';

interface TradeType {
  id: string;
  label: string;
  category: TradeCategory;
  icon: any;
  description: string;
}

const TRADE_TYPES: TradeType[] = [
  // Directional
  { id: 'RISE_FALL', label: 'Rise/Fall', category: 'DIRECTIONAL', icon: TrendingUp, description: 'Win if exit price is higher or lower than entry.' },
  { id: 'TOUCH_NO_TOUCH', label: 'Touch/No Touch', category: 'DIRECTIONAL', icon: Target, description: 'Win if price hits or avoids a target barrier.' },
  { id: 'HIGHER_LOWER', label: 'Higher/Lower', category: 'DIRECTIONAL', icon: ArrowUpRight, description: 'Win if exit is higher or lower than a set barrier.' },
  // Growth based
  { id: 'ACCUMULATORS', label: 'Accumulators', category: 'GROWTH', icon: Layers, description: 'Profit grows as long as price stays within range.' },
  { id: 'MULTIPLIERS', label: 'Multipliers', category: 'GROWTH', icon: Zap, description: 'Amplify profits with set risk limits.' },
  { id: 'TURBOS', label: 'Turbos', category: 'GROWTH', icon: Activity, description: 'High-speed fixed-payout contracts.' },
  { id: 'VANILLAS', label: 'Vanillas', category: 'GROWTH', icon: Box, description: 'Traditional-style option contracts.' },
  // Digit based
  { id: 'MATCHES_DIFFERS', label: 'Matches/Differs', category: 'DIGIT', icon: Hash, description: 'Predict the last digit of the exit price.' },
  { id: 'OVER_UNDER', label: 'Over/Under', category: 'DIGIT', icon: MoreHorizontal, description: 'Win if digit is over or under a target.' },
  { id: 'EVEN_ODD', label: 'Even/Odd', category: 'DIGIT', icon: Binary, description: 'Predict if the last digit is even or odd.' },
];

export default function DerivedTradeControls({ instrument, livePrice, balance, onExecute }: DerivedTradeControlsProps) {
  const { formatNumber } = useTranslation();
  
  const [activeCategory, setActiveCategory] = useState<TradeCategory>('DIRECTIONAL');
  const [activeType, setActiveType] = useState<string>('RISE_FALL');
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  
  const [stake, setStake] = useState<number>(10);
  const [duration, setDuration] = useState<number>(5);
  const [durationUnit, setDurationUnit] = useState<'ticks' | 'm' | 'h'>('ticks');
  
  // Type-specific state
  const [prediction, setPrediction] = useState<string | number>('EVEN');
  const [barrier, setBarrier] = useState<string>('+0.15');

  const filteredTypes = useMemo(() => 
    TRADE_TYPES.filter(t => t.category === activeCategory)
  , [activeCategory]);

  const currentType = useMemo(() => 
    TRADE_TYPES.find(t => t.id === activeType) || TRADE_TYPES[0]
  , [activeType]);

  const handleTypeSelect = (id: string) => {
    setActiveType(id);
    setIsTypeSelectorOpen(false);
    // Reset specific states
    if (id === 'EVEN_ODD') setPrediction('EVEN');
    if (id === 'MATCHES_DIFFERS') setPrediction(0);
    if (id === 'OVER_UNDER') setPrediction(4);
  };

  const calculatePayout = () => {
    // Conceptual multipliers matching Varban's synthetic engine logic
    if (activeType === 'EVEN_ODD' || activeType === 'RISE_FALL') return 1.92; // 4% house margin
    if (activeType === 'MATCHES_DIFFERS' && prediction === 'MATCHES') return 9.50;
    if (activeType === 'OVER_UNDER') return 1.90;
    return 1.85;
  };

  const estimatedPayout = (stake * calculatePayout()).toFixed(2);

  return (
    <div className="flex flex-col h-full bg-[#131722] text-white">
      {/* Category Tabs */}
      <div className="flex border-b border-[#1E222D] shrink-0">
        {(['DIRECTIONAL', 'GROWTH', 'DIGIT'] as TradeCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              const firstInCat = TRADE_TYPES.find(t => t.category === cat)!;
              setActiveType(firstInCat.id);
            }}
            className={cn(
              "flex-1 py-4 text-[9px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all",
              activeCategory === cat ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#1E222D]"
            )}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="flex-grow p-6 space-y-6 overflow-y-auto no-scrollbar">
        
        {/* Trade Type Selector Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest block mb-2 px-1">Contract Type</label>
          <button 
            onClick={() => setIsTypeSelectorOpen(!isTypeSelectorOpen)}
            className="w-full flex items-center justify-between p-4 bg-[#1E222D] border border-transparent hover:border-[#31363F] rounded-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0055FF]/10 flex items-center justify-center">
                <currentType.icon className="w-4 h-4 text-[#0055FF]" />
              </div>
              <div className="text-left">
                 <span className="text-xs font-bold uppercase tracking-tight block">{currentType.label}</span>
                 <span className="text-[8px] text-[#6B7280] uppercase font-bold">Standard Payout: {calculatePayout()}x</span>
              </div>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-[#6B7280] transition-transform", isTypeSelectorOpen && "rotate-180")} />
          </button>

          {isTypeSelectorOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E222D] border border-[#31363F] shadow-2xl z-[100] rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="p-2 space-y-1">
                {filteredTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTypeSelect(t.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 text-[11px] font-bold uppercase tracking-tight text-left rounded-md transition-all",
                      activeType === t.id ? "bg-[#31363F] text-[#0055FF]" : "text-[#D1D4DC] hover:bg-[#252A34]"
                    )}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Inputs Based on Type */}
        <div className="space-y-6">
          {/* Duration */}
          {activeType !== 'ACCUMULATORS' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest">Duration</label>
                <div className="flex gap-2">
                   {['ticks', 'm', 'h'].map(u => (
                     <button 
                      key={u}
                      onClick={() => setDurationUnit(u as any)}
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-tighter px-3 py-1 rounded transition-all",
                        durationUnit === u ? "bg-[#0055FF] text-white" : "bg-[#1E222D] text-[#6B7280]"
                      )}
                     >
                       {u}
                     </button>
                   ))}
                </div>
              </div>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#1E222D] border border-transparent p-4 text-sm font-mono font-bold outline-none rounded-lg focus:border-[#31363F]"
              />
            </div>
          )}

          {/* Barrier for Higher/Lower / Touch */}
          {(activeType === 'HIGHER_LOWER' || activeType === 'TOUCH_NO_TOUCH') && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest px-1">Barrier Offset</label>
              <input 
                type="text" 
                value={barrier}
                onChange={(e) => setBarrier(e.target.value)}
                className="w-full bg-[#1E222D] border border-transparent p-4 text-sm font-mono font-bold outline-none rounded-lg focus:border-[#31363F]"
                placeholder="+0.15"
              />
            </div>
          )}

          {/* Digit Prediction Grid */}
          {activeCategory === 'DIGIT' && activeType !== 'EVEN_ODD' && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest px-1">
                Last Digit Prediction
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPrediction(i)}
                    className={cn(
                      "py-3 font-mono font-bold text-sm border rounded-lg transition-all",
                      prediction === i ? "bg-[#0055FF] border-[#0055FF] text-white shadow-lg" : "bg-[#1E222D] border-transparent text-[#6B7280] hover:bg-[#252A34]"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stake */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest px-1">Stake (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6B7280] font-bold">$</span>
              <input 
                type="number" 
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="w-full bg-[#1E222D] border border-transparent p-4 pl-8 text-sm font-mono font-bold outline-none rounded-lg focus:border-[#31363F]"
              />
            </div>
          </div>
        </div>

        {/* Execution Area */}
        <div className="pt-6 border-t border-[#1E222D] space-y-4">
          {activeType === 'EVEN_ODD' ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onExecute({ side: 'EVEN', stake, duration })}
                className="py-8 bg-[#16835B] hover:bg-[#147a54] text-white rounded-xl shadow-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1"
              >
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Even</span>
                <span className="text-[10px] font-medium text-white/70">Payout: ${estimatedPayout}</span>
              </button>
              <button
                onClick={() => onExecute({ side: 'ODD', stake, duration })}
                className="py-8 bg-[#C43D3D] hover:bg-[#b03535] text-white rounded-xl shadow-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1"
              >
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Odd</span>
                <span className="text-[10px] font-medium text-white/70">Payout: ${estimatedPayout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onExecute({ type: activeType, side: 'BUY', stake, duration, prediction })}
              className="w-full py-6 bg-[#00A015] hover:bg-[#008F12] text-white rounded-xl shadow-2xl transition-all active:scale-[0.98] flex flex-col items-center justify-center group"
            >
              <span className="text-sm font-bold uppercase tracking-[0.3em] group-hover:scale-110 transition-transform">Buy {currentType.label}</span>
              <span className="text-[11px] font-medium text-white/80 mt-1 uppercase tracking-widest">Potential Return ${estimatedPayout}</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Proof Footer */}
      <div className="p-5 bg-[#0B0E11] border-t border-[#1E222D] flex items-center justify-between shrink-0">
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00A015]" />
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Deterministic Safety Locked</span>
         </div>
         <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#16835B] animate-pulse"></div>
            <span className="text-[9px] font-mono font-bold text-[#D1D5DB]">V4.2 LIVE</span>
         </div>
      </div>
    </div>
  );
}
