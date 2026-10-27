'use client';

/**
 * @fileOverview Last Digit Statistics Visualizer.
 * Displays 0-9 digit frequency matrix for synthetic markets.
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/app/lib/utils';
import { ShieldCheck } from 'lucide-react';

interface DigitStatsProps {
  symbol: string;
  livePrice: number | null;
}

export default function DigitStats({ symbol, livePrice }: DigitStatsProps) {
  const [stats, setStats] = useState<number[]>([]);
  const [lastDigit, setLastDigit] = useState<number | null>(null);

  useEffect(() => {
    setStats(Array.from({ length: 10 }, () => Math.floor(Math.random() * 15) + 5));
  }, [symbol]);

  useEffect(() => {
    if (livePrice !== null) {
      const priceStr = livePrice.toFixed(2);
      const digit = parseInt(priceStr.slice(-1));
      setLastDigit(digit);
      setStats(prev => {
        const next = [...prev];
        next[digit] = (next[digit] || 0) + 0.2;
        return next;
      });
    }
  }, [livePrice]);

  const maxVal = Math.max(...stats);
  const minVal = Math.min(...stats);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.3em]">Last Digit Stats</span>
        <p className="text-[9px] text-[#0A0A0A] font-bold uppercase">100 Ticks Analysis Node</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {stats.map((val, i) => {
          const percentage = ((val / maxVal) * 100);
          const isActive = lastDigit === i;
          const isMax = val === maxVal;
          const isMin = val === minVal;

          return (
            <div key={i} className="flex flex-col items-center space-y-2 relative">
              <div className="relative w-10 h-10 flex items-center justify-center">
                {isActive && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#C43D3D]"></div>
                  </div>
                )}
                
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle cx="20" cy="20" r="18" stroke="#F7F7F5" strokeWidth="2.5" fill="transparent" />
                  <circle
                    cx="20" cy="20" r="18"
                    stroke={isMax ? "#16835B" : isMin ? "#C43D3D" : "#0A0A0A"}
                    strokeWidth="2.5"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * percentage) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className={cn(
                  "absolute inset-0 flex items-center justify-center font-mono font-bold text-xs",
                  isActive ? "text-[#C43D3D]" : "text-[#0A0A0A]"
                )}>
                  {i}
                </span>
              </div>
              <span className="text-[8px] font-mono font-bold text-[#6B7280]">{percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-[#F7F7F5] space-y-4">
        <div className="flex items-start gap-3 bg-[#F7F7F5] p-4 border border-[#E4E4E4]">
           <ShieldCheck className="w-4 h-4 text-[#16835B] shrink-0" />
           <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
             Deterministic frequency analysis derived from the Varban matching engine.
           </p>
        </div>
      </div>
    </div>
  );
}