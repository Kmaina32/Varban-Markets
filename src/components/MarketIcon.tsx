'use client';

/**
 * @fileOverview Institutional Market Icon Resolver.
 * Dynamically renders Forex flags, Crypto logos, and Stock brand icons.
 * Priority: Specific Assets > Crypto > Stocks > Forex Flags > Text Fallback.
 */

import React, { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { Droplets, Landmark, BarChart3, Coins, Globe } from 'lucide-react';

interface MarketIconProps {
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MarketIcon: React.FC<MarketIconProps> = ({ symbol, className, size = 'md' }) => {
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  // Normalize symbol
  const parts = symbol.includes('/') 
    ? symbol.split('/') 
    : (symbol.length === 6 ? [symbol.substring(0, 3), symbol.substring(3)] : [symbol, '']);
    
  const cleanSymbol = parts[0].toUpperCase();
  const quote = parts[1]?.toUpperCase();

  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const getFlagCode = (curr: string) => {
    const map: Record<string, string> = {
      'USD': 'us',
      'EUR': 'eu',
      'GBP': 'gb',
      'JPY': 'jp',
      'AUD': 'au',
      'CAD': 'ca',
      'CHF': 'ch',
      'NZD': 'nz',
      'ZAR': 'za',
      'NGN': 'ng',
      'GHS': 'gh',
      'KES': 'ke'
    };
    return map[curr] || curr.toLowerCase().substring(0, 2);
  };

  // 1. SPECIFIC INSTRUMENTS & COMMODITIES
  if (cleanSymbol === 'WTI' || cleanSymbol === 'OIL') {
    return (
      <div className={cn(dimensions[size], "rounded-full bg-[#141414] flex items-center justify-center text-white shadow-sm border border-[#E4E4E4]", className)}>
        <Droplets className={cn(size === 'lg' ? 'w-6 h-6' : 'w-4 h-4', "text-[#0055FF]")} />
      </div>
    );
  }

  if (cleanSymbol === 'XAU' || cleanSymbol === 'GOLD') {
    return (
      <div className={cn(dimensions[size], "rounded-full bg-gradient-to-br from-[#C9A227] to-[#E5C158] flex items-center justify-center text-white text-[9px] font-bold border-2 border-white shadow-sm", className)}>
        GOLD
      </div>
    );
  }

  if (cleanSymbol === 'XAG' || cleanSymbol === 'SILV') {
    return (
      <div className={cn(dimensions[size], "rounded-full bg-gradient-to-br from-[#94A3B8] to-[#CBD5E1] flex items-center justify-center text-white text-[9px] font-bold border-2 border-white shadow-sm", className)}>
        SILV
      </div>
    );
  }

  const indexSymbols = ['US30', 'DJI', 'SPY', 'US500', 'SPX', 'NAS100', 'NAS', 'QQQ'];
  if (indexSymbols.includes(cleanSymbol)) {
    return (
      <div className={cn(dimensions[size], "rounded-full border-2 border-[#E4E4E4] bg-white flex items-center justify-center shadow-sm", className)}>
        <Landmark className={cn(size === 'lg' ? 'w-6 h-6' : 'w-4 h-4', "text-[#0055FF]")} />
      </div>
    );
  }

  // 2. CRYPTO LOGIC
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'XRP', 'LTC', 'BNB', 'ADA', 'USDT', 'USDC'];
  if (cryptoSymbols.includes(cleanSymbol)) {
    return (
      <div className={cn(dimensions[size], "rounded-full border border-[#E4E4E4] bg-white p-0.5 shadow-sm overflow-hidden flex items-center justify-center", className)}>
        <img 
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanSymbol.toLowerCase()}.png`}
          alt={cleanSymbol}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://cdn.simpleicons.org/${cleanSymbol.toLowerCase()}`;
          }}
        />
      </div>
    );
  }

  // 3. STOCK BRANDS
  const stockMap: Record<string, string> = {
    'AAPL': 'apple',
    'TSLA': 'tesla',
    'NVDA': 'nvidia',
    'AMZN': 'amazon',
    'MSFT': 'microsoft',
    'GOOGL': 'google',
    'META': 'meta'
  };

  if (stockMap[cleanSymbol]) {
    return (
      <div className={cn(dimensions[size], "rounded-full border border-[#E4E4E4] bg-white flex items-center justify-center p-2 shadow-sm", className)}>
        <img 
          src={`https://cdn.simpleicons.org/${stockMap[cleanSymbol]}`}
          alt={cleanSymbol}
          className="w-full h-full object-contain grayscale opacity-80"
        />
      </div>
    );
  }

  // 4. FOREX FLAGS (Dual flags with Error Handling)
  if (quote && quote.length === 3) {
    return (
      <div className={cn("flex items-center -space-x-2.5", className)}>
        <div className={cn(dimensions[size], "rounded-full border-2 border-white shadow-sm overflow-hidden bg-[#F7F7F5] flex items-center justify-center z-10 relative")}>
          {!img1Error ? (
            <img 
              src={`https://flagcdn.io/w80/${getFlagCode(cleanSymbol)}.png`} 
              alt={cleanSymbol}
              className="w-full h-full object-cover"
              onError={() => setImg1Error(true)}
            />
          ) : (
            <span className="text-[8px] font-bold text-[#6B7280]">{cleanSymbol.substring(0, 2)}</span>
          )}
        </div>
        <div className={cn(dimensions[size], "rounded-full border-2 border-white shadow-sm overflow-hidden bg-[#F7F7F5] flex items-center justify-center relative")}>
          {!img2Error ? (
            <img 
              src={`https://flagcdn.io/w80/${getFlagCode(quote)}.png`} 
              alt={quote}
              className="w-full h-full object-cover"
              onError={() => setImg2Error(true)}
            />
          ) : (
            <span className="text-[8px] font-bold text-[#6B7280]">{quote.substring(0, 2)}</span>
          )}
        </div>
      </div>
    );
  }

  // FINAL FALLBACK
  return (
    <div className={cn(dimensions[size], "rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center text-[10px] font-mono font-bold shadow-inner text-[#0A0A0A]", className)}>
      {cleanSymbol.substring(0, 2)}
    </div>
  );
};