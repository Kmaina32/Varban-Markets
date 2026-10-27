'use client';

/**
 * @fileOverview Institutional Market Selector.
 * Categorized instrument browsing with real-time price highlights.
 */

import React, { useState, useMemo } from 'react';
import { Search, Star, Globe, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { AVAILABLE_INSTRUMENTS, Instrument } from '@/app/lib/instruments';
import { MarketIcon } from '@/components/MarketIcon';
import { cn } from '@/app/lib/utils';

interface MarketSelectorProps {
  activeSymbol: string;
  onSelect: (inst: Instrument) => void;
  livePrices: Record<string, { price: number; percent: number }>;
}

const CATEGORIES = ["All", "Crypto", "Forex", "Indices", "Commodities", "Equities"];

export default function MarketSelector({ activeSymbol, onSelect, livePrices }: MarketSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState("All");
  const [search, setSearch] = useState("");

  const activeInst = useMemo(() => 
    AVAILABLE_INSTRUMENTS.find(i => i.symbol === activeSymbol) || AVAILABLE_INSTRUMENTS[0]
  , [activeSymbol]);

  const filtered = useMemo(() => {
    return AVAILABLE_INSTRUMENTS.filter(i => {
      const catMatch = selectedCat === "All" || i.category === selectedCat;
      const searchMatch = i.symbol.toLowerCase().includes(search.toLowerCase()) || 
                          i.name.toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [selectedCat, search]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-4 h-14 px-4 bg-white border-r border-[#E4E4E4] hover:bg-[#F7F7F5] transition-colors group min-w-[240px]"
      >
        <MarketIcon symbol={activeInst.symbol} size="sm" />
        <div className="text-left flex-grow">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#0A0A0A]">{activeInst.symbol}</span>
            <ChevronDown className={cn("w-3 h-3 text-[#6B7280] transition-transform", isOpen && "rotate-180")} />
          </div>
          <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-tight block">{activeInst.name}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-[450px] bg-white border border-[#E4E4E4] shadow-2xl z-[600] animate-in fade-in slide-in-from-top-1 duration-200 rounded-2xl overflow-hidden mt-2">
          <div className="p-4 border-b border-[#E4E4E4] space-y-4 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input 
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ticker or asset name..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF] rounded-xl"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={cn(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap rounded-lg",
                    selectedCat === cat ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto no-scrollbar divide-y divide-[#F7F7F5] bg-white">
            {filtered.map(inst => {
              const live = livePrices[inst.symbol];
              return (
                <button
                  key={inst.symbol}
                  onClick={() => { onSelect(inst); setIsOpen(false); }}
                  className={cn(
                    "w-full p-4 flex items-center justify-between hover:bg-[#F7F7F5] transition-colors group",
                    activeSymbol === inst.symbol && "bg-[#0055FF]/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <MarketIcon symbol={inst.symbol} size="sm" />
                    <div className="text-left">
                      <span className="text-xs font-mono font-bold text-[#0A0A0A] group-hover:text-[#0055FF] transition-colors">{inst.symbol}</span>
                      <span className="text-[9px] text-[#6B7280] uppercase block">{inst.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold block">{live?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "---"}</span>
                    {live && (
                      <span className={cn("text-[9px] font-bold", live.percent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                        {live.percent >= 0 ? "+" : ""}{live.percent}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}