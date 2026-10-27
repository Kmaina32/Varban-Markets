'use client';

/**
 * @fileOverview High-fidelity Buy/Sell Exchange Form.
 * Matches the reference design with asset tabs and percentage buttons.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ArrowUpDown, Info, Check } from 'lucide-react';
import { MarketIcon } from '@/components/MarketIcon';
import { cn } from '@/app/lib/utils';

const BASE_ASSETS = ['ETH', 'BTC', 'USDC', 'USDT'];
const PERCENTAGES = ['25%', '50%', '75%', '100%'];

export default function ExchangeForm() {
  const [activeBase, setActiveBase] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [isSwapped, setIsSwapped] = useState(false);

  return (
    <Card className="bg-white border-[#E4E4E4] p-6 md:p-8 shadow-sm space-y-6 rounded-2xl">
      {/* Top Asset Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {BASE_ASSETS.map(asset => (
          <button
            key={asset}
            onClick={() => setActiveBase(asset)}
            className={cn(
              "px-5 py-2 text-[11px] font-bold uppercase tracking-widest border transition-all rounded-full",
              activeBase === asset 
                ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" 
                : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
            )}
          >
            {asset}
          </button>
        ))}
      </div>

      {/* Pair Selector Block */}
      <div className="p-5 bg-[#F7F7F5] border border-[#E4E4E4] rounded-2xl flex items-center justify-between group cursor-pointer hover:border-[#0055FF] transition-all">
        <div className="flex items-center gap-4">
          <MarketIcon symbol="LTC/ETH" size="md" className="bg-white border border-[#E4E4E4]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0A0A0A] uppercase tracking-tight">LTC/ETH</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-mono font-bold text-[#6B7280]">0.02420</span>
              <span className="text-[10px] font-bold text-[#C43D3D]">(0.41%)</span>
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-[#C43D3D]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Module */}
      <div className="space-y-4">
        {/* Balance Indicator */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MarketIcon symbol={activeBase} size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              {activeBase} Spot balance
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#0A0A0A]">0.00000000</span>
        </div>

        {/* Main Input Field */}
        <div className="relative group">
          <div className="flex items-center justify-between p-5 bg-white border border-[#E4E4E4] rounded-2xl group-focus-within:border-[#0055FF] transition-all">
            <input 
              type="number" 
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-xl font-bold placeholder:text-[#D1D5DB] outline-none w-full"
            />
            <div className="flex items-center gap-2 pl-4 border-l border-[#F7F7F5]">
              <span className="text-sm font-bold uppercase text-[#0A0A0A] tracking-widest">
                {isSwapped ? 'LTC' : activeBase}
              </span>
              <button 
                onClick={() => setIsSwapped(!isSwapped)}
                className="p-1.5 hover:bg-[#F7F7F5] transition-colors rounded-lg"
              >
                <ArrowUpDown className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </div>
        </div>

        {/* Approximation Label */}
        <div className="px-1">
           <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
             ≈ 0.000 LTC
           </span>
        </div>

        {/* Quick Percentages */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {PERCENTAGES.map(pct => (
            <button
              key={pct}
              className="py-3 border border-[#E4E4E4] text-[11px] font-bold text-[#6B7280] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all rounded-full"
            >
              {pct}
            </button>
          ))}
        </div>
      </div>

      {/* Main Action Button */}
      <div className="pt-6">
        <button className="w-full py-5 bg-[#16835B] hover:bg-[#147a54] text-white text-sm font-bold uppercase tracking-[0.2em] rounded-full shadow-lg transition-all active:scale-[0.98]">
          Buy
        </button>
      </div>

      <div className="pt-4 text-center">
         <p className="text-[9px] text-[#D1D5DB] uppercase font-bold tracking-[0.3em] flex items-center justify-center gap-2">
           <Info className="w-3 h-3" />
           Instant Settlement Protocol v2.0
         </p>
      </div>
    </Card>
  );
}