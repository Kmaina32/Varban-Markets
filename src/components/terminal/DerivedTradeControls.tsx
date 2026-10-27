'use client';

/**
 * @fileOverview Institutional Derived Markets Execution Hub (Light Theme).
 * Supports Directional, Growth-based, and Digit-based trade categories.
 */

import React, { useState, useMemo } from 'react';
import { Instrument } from '@/app/lib/instruments';
import { cn } from '@/app/lib/utils';
import { 
  ChevronDown, 
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
  };

  const calculatePayout = () => {
    if (activeType === 'EVEN_ODD' || activeType === 'RISE_FALL') return 1.92;
    if (activeType === 'MATCHES_DIFFERS' && prediction === 'MATCHES') return 9.50;
    if (activeType === 'OVER_UNDER') return 1.90;
    return 1.85;
  };

  const estimatedPayout = (stake * calculatePayout()).toFixed(2);

  return (
    <div className="flex flex-col h-full bg-white text-[#0A0A0A]">
      {/* Category Tabs */}
      <div className="flex border-b border-[#E4E4E4] shrink-0">
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
              activeCategory === cat ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]"
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
            className="w-full flex items-center justify-between p-4 bg-[#F7F7F5] border border-[#E4E4E4] hover:border-[#0055FF] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0055FF]/10 flex items-center justify-center">
                <currentType.icon className="w-4 h-4 text-[#0055FF]" />
              </div>
              <div className="text-left">
                 <span className="text-xs font-bold uppercase tracking-tight block">{currentType.label}</span>
                 <span className="text-[8px] text-[#6B7280] uppercase font-bold tracking-tighter">Yield Ratio: {calculatePayout()}x</span>
              </div>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-[#6B7280] transition-transform", isTypeSelectorOpen && "rotate-180")} />
          </button>

          {isTypeSelectorOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E4E4E4] shadow-2xl z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="p-1 space-y-0.5">
                {filteredTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTypeSelect(t.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 text-[11px] font-bold uppercase tracking-tight text-left transition-all",
                      activeType === t.id ? "bg-[#0055FF]/5 text-[#0055FF]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]"
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

        <div className="space-y-6">
          {/* Duration */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest">Duration</label>
              <div className="flex gap-1.5">
                 {['ticks', 'm', 'h'].map(u => (
                   <button 
                    key={u}
                    onClick={() => setDurationUnit(u as any)}
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-tighter px-2.5 py-1 transition-all border",
                      durationUnit === u ? "bg-[#0A0A0A] border-[#0A0A0A] text-white shadow-sm" : "bg-white border-[#E4E4E4] text-[#6B7280]"
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
              className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 text-sm font-mono font-bold outline-none focus:border-[#0055FF]"
            />
          </div>

          {/* Stake */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest px-1">Stake (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6B7280] font-bold">$</span>
              <input 
                type="number" 
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="w-full bg-[#F7F7F5] border border-[#E4E4E4] p-4 pl-8 text-sm font-mono font-bold outline-none focus:border-[#0055FF]"
              />
            </div>
          </div>
        </div>

        {/* Prediction Areas */}
        {activeCategory === 'DIGIT' && activeType !== 'EVEN_ODD' && (
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest px-1">
              Last Digit Prediction
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPrediction(i)}
                  className={cn(
                    "py-3 font-mono font-bold text-sm border transition-all",
                    prediction === i ? "bg-[#0055FF] border-[#0055FF] text-white shadow-md" : "bg-[#F7F7F5] border-[#E4E4E4] text-[#0A0A0A] hover:bg-white"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Execution Action */}
        <div className="pt-4 space-y-4">
          {activeType === 'EVEN_ODD' ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onExecute({ side: 'EVEN', stake, duration })}
                className="py-10 bg-[#16835B] hover:bg-[#147a54] text-white shadow-lg transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.25em]">Even</span>
                <span className="text-[9px] font-bold text-white/70 uppercase">Payout: ${estimatedPayout}</span>
              </button>
              <button
                onClick={() => onExecute({ side: 'ODD', stake, duration })}
                className="py-10 bg-[#C43D3D] hover:bg-[#b03535] text-white shadow-lg transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.25em]">Odd</span>
                <span className="text-[9px] font-bold text-white/70 uppercase">Payout: ${estimatedPayout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onExecute({ type: activeType, side: 'BUY', stake, duration, prediction })}
              className="w-full py-6 bg-[#0A0A0A] hover:bg-[#0055FF] text-white shadow-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center group"
            >
              <span className="text-sm font-bold uppercase tracking-[0.3em]">Purchase Contract</span>
              <span className="text-[11px] font-bold text-white/80 mt-1 uppercase tracking-widest">Potential Return ${estimatedPayout}</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Footer */}
      <div className="p-4 bg-[#F7F7F5] border-t border-[#E4E4E4] flex items-center justify-between shrink-0">
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16835B]" />
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Matching Verified</span>
         </div>
         <span className="text-[9px] font-mono font-bold text-[#D1D5DB]">DETERMINISTIC V4.2</span>
      </div>
    </div>
  );
}
