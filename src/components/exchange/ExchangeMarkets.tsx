'use client';

/**
 * @fileOverview Exchange Market Discovery List.
 * Features filters, search, and mini sparkline charts.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Search, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MarketIcon } from '@/components/MarketIcon';
import { cn } from '@/app/lib/utils';

const FILTERS = ['Trending', 'Gainers', 'Losers'];

const MARKETS_DATA = [
  { symbol: 'DOGE/USDT', vol: '141.46M', price: '0.07738', change: '+0.26%', trend: [20, 25, 22, 28, 26, 30, 29] },
  { symbol: 'DOGE/BTC', vol: '40.46M', price: '0.00000096', change: '+0.00%', trend: [10, 10, 30, 10, 30, 10, 10] },
  { symbol: 'ADA/USDT', vol: '35.91M', price: '0.2035', change: '-0.54%', trend: [30, 25, 22, 21, 20, 18, 17] },
  { symbol: 'TRX/USDT', vol: '34.71M', price: '0.3283', change: '-0.70%', trend: [25, 24, 23, 22, 21, 20, 19] },
  { symbol: 'XRP/USDT', vol: '33.93M', price: '1.3065', change: '+0.97%', trend: [15, 18, 17, 20, 22, 25, 28] },
];

function Sparkline({ data, color }: { data: number[], color: string }) {
  const width = 80;
  const height = 30;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function ExchangeMarkets() {
  const [activeFilter, setActiveFilter] = useState('Trending');

  return (
    <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm space-y-6 rounded-2xl">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
        <input 
          placeholder="Search 38 pairs"
          className="w-full pl-10 pr-4 py-3 bg-[#F7F7F5] border border-[#E4E4E4] rounded-xl text-sm outline-none focus:border-[#0055FF] transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-5 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-full",
              activeFilter === filter 
                ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" 
                : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 px-2 text-[9px] font-bold uppercase tracking-widest text-[#9CA3AF] border-b border-[#F7F7F5] pb-3">
        <div className="col-span-5">Coin</div>
        <div className="col-span-4 text-center">24H chart</div>
        <div className="col-span-3 text-right">24H price</div>
      </div>

      {/* Markets List */}
      <div className="divide-y divide-[#F7F7F5]">
        {MARKETS_DATA.map((item) => {
          const isUp = item.change.startsWith('+');
          const isNeutral = item.change === '+0.00%';
          const color = isNeutral ? '#9CA3AF' : isUp ? '#16835B' : '#C43D3D';

          return (
            <div key={item.symbol} className="grid grid-cols-12 py-4 px-2 items-center hover:bg-[#F7F7F5] transition-colors cursor-pointer group rounded-xl">
              <div className="col-span-5 flex items-center gap-3">
                <MarketIcon symbol={item.symbol} size="sm" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0A0A0A] block uppercase group-hover:text-[#0055FF] transition-colors truncate">
                    {item.symbol}
                  </span>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-tighter">
                    Vol {item.vol}
                  </span>
                </div>
              </div>
              
              <div className="col-span-4 flex justify-center">
                <Sparkline data={item.trend} color={color} />
              </div>

              <div className="col-span-3 text-right">
                <div className="text-xs font-mono font-bold text-[#0A0A0A]">{item.price}</div>
                <div className={cn(
                  "text-[10px] font-bold flex items-center justify-end gap-1",
                  isNeutral ? "text-[#9CA3AF]" : isUp ? "text-[#16835B]" : "text-[#C43D3D]"
                )}>
                  {item.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}