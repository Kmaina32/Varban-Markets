'use client';

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Filter, BarChart4, ShieldCheck } from "lucide-react";
import MarketScreener from "@/components/tradingview/MarketScreener";

export default function ScreenerPage() {
  return (
    <AuthedLayout 
      title="Market Screener" 
      subtitle="Advanced technical filtering and instrument discovery"
    >
      <div className="space-y-6 h-[calc(100vh-180px)] flex flex-col">
        <div className="p-4 bg-[#0055FF]/5 border border-[#0055FF]/20 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-[#0055FF]" />
            <div>
              <span className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest block">Discovery Node</span>
              <p className="text-xs font-bold text-[#0A0A0A] uppercase">Multi-Asset Technical Filtering</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
            <div className="flex items-center gap-2"><BarChart4 className="w-3 h-3" /> RSI & MACD Signals</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-[#16835B]" /> Verified Feeds</div>
          </div>
        </div>

        <div className="flex-grow min-h-0">
          <MarketScreener />
        </div>
        
        <div className="bg-[#0A0A0A] p-3 text-center shrink-0">
          <span className="text-[8px] font-bold text-white uppercase tracking-[0.4em]">
            Institutional Analysis Suite &bull; Varban Markets
          </span>
        </div>
      </div>
    </AuthedLayout>
  );
}
