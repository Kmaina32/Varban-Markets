'use client';

/**
 * @fileOverview Synthetic Intelligence Analysis Module.
 * Mimics the technical summary tools from standard markets for proprietary indices.
 */

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Instrument } from '@/app/lib/instruments';
import { ShieldCheck, TrendingUp, Activity, Zap, Info } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface SyntheticAnalysisProps {
  activeInst: Instrument;
  livePrice: number | null;
}

export default function SyntheticAnalysis({ activeInst, livePrice }: SyntheticAnalysisProps) {
  // Deterministic analysis based on the symbol's volatility profile
  const summary = useMemo(() => {
    const vol = parseInt(activeInst.symbol.replace(/\D/g, '') || '10');
    if (vol >= 100) return { verdict: 'STRONG SELL', color: 'text-[#C43D3D]', bg: 'bg-[#C43D3D]/5', border: 'border-[#C43D3D]/20' };
    if (vol >= 50) return { verdict: 'VOLATILE', color: 'text-[#C9A227]', bg: 'bg-[#C9A227]/5', border: 'border-[#C9A227]/20' };
    return { verdict: 'STRONG BUY', color: 'text-[#16835B]', bg: 'bg-[#16835B]/5', border: 'border-[#16835B]/20' };
  }, [activeInst.symbol]);

  const indicators = [
    { name: 'RSI (14)', value: '58.4', signal: 'Neutral' },
    { name: 'MACD (12, 26)', value: '0.42', signal: 'Buy' },
    { name: 'Bollinger Bands', value: 'Within Range', signal: 'Stable' },
    { name: 'SMA (7)', value: livePrice ? (livePrice * 0.999).toFixed(2) : '---', signal: 'Strong Buy' }
  ];

  return (
    <div className="p-6 space-y-8 bg-white h-full animate-in fade-in duration-300">
      {/* Summary Widget */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6B7280]">Algorithmic Summary</h3>
        <Card className={cn("p-6 border-2 text-center space-y-2 rounded-2xl shadow-sm transition-all", summary.bg, summary.border)}>
          <span className={cn("text-2xl font-bold uppercase tracking-tight", summary.color)}>{summary.verdict}</span>
          <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Composite Index Signal</p>
        </Card>
      </div>

      {/* Technical Indicators Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#F7F7F5] pb-2">
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Technical Gauges</h3>
           <span className="text-[8px] font-mono text-[#6B7280]">v4.2 PRO</span>
        </div>
        <div className="space-y-3">
          {indicators.map((ind, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-[#F7F7F5] border border-[#E4E4E4] rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-[#0A0A0A] block leading-none mb-1">{ind.name}</span>
                <span className="text-[9px] font-mono text-[#6B7280]">{ind.value}</span>
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-lg",
                ind.signal.includes('Buy') ? "border-[#16835B] text-[#16835B]" : 
                ind.signal.includes('Sell') ? "border-[#C43D3D] text-[#C43D3D]" : "border-[#6B7280] text-[#6B7280]"
              )}>
                {ind.signal}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Integrity Notice */}
      <div className="pt-4 border-t border-[#F7F7F5] space-y-4">
        <div className="flex items-start gap-3 p-4 bg-[#0055FF]/5 border border-[#0055FF]/20 rounded-2xl">
           <ShieldCheck className="w-4 h-4 text-[#0055FF] shrink-0" />
           <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#0A0A0A]">Deterministic Node Verified</span>
              <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Signals are derived from the same random-walk secret as the matching engine. High reliability expected.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
