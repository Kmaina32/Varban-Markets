'use client';

import { useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Coins, Globe, Info } from "lucide-react";
import MarketHeatmap from "@/components/tradingview/MarketHeatmap";
import { cn } from "@/app/lib/utils";

export default function HeatmapsPage() {
  const [activeType, setActiveType] = useState<'crypto' | 'forex'>('crypto');

  return (
    <AuthedLayout 
      title="Market Heatmaps" 
      subtitle="Visual performance discovery across global domains"
    >
      <div className="space-y-6 h-[calc(100vh-180px)] flex flex-col">
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveType('crypto')}
              className={cn(
                "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2",
                activeType === 'crypto' ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
              )}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Digital Assets</span>
            </button>
            <button 
              onClick={() => setActiveType('forex')}
              className={cn(
                "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2",
                activeType === 'forex' ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Currency Pairs</span>
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
            <Info className="w-3.5 h-3.5 text-[#0055FF]" />
            <span>Real-time Volatility Mapping</span>
          </div>
        </div>

        <div className="flex-grow min-h-0">
          <MarketHeatmap type={activeType} key={activeType} />
        </div>
        
        <div className="p-3 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center gap-3 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></span>
          <p className="text-[9px] text-[#6B7280] uppercase font-bold tracking-widest">
            Live Analysis: Color intensity indicates percentage change relative to session open.
          </p>
        </div>
      </div>
    </AuthedLayout>
  );
}
