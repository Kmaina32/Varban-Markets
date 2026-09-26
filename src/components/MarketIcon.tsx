
'use client';

/**
 * @fileOverview Institutional Market Icon Resolver.
 * Dynamically renders Forex flags, Crypto logos, and Stock brand icons.
 * Priority: Commodities > Indices > Crypto > Stocks > Forex Flags.
 */

import React from 'react';
import { cn } from '@/app/lib/utils';

interface MarketIconProps {
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MarketIcon: React.FC<MarketIconProps> = ({ symbol, className, size = 'md' }) => {
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

  // 1. Commodities & Indices Priority (Prevents fallback to broken flags)
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

  const indexSymbols = ['US30', 'DJI', 'NAS100', 'NAS', 'SPY', 'QQQ', 'US500', 'SPX'];
  if (indexSymbols.includes(cleanSymbol)) {
    return (
      <div className={cn(dimensions[size], "rounded-full border-2 border-[#E4E4E4] bg-white flex items-center justify-center font-bold text-[8px] text-[#0A0A0A] shadow-sm uppercase", className)}>
        {cleanSymbol.substring(0, 3)}
      </div>
    );
  }

  // 2. Crypto Logic
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'XRP', 'LTC', 'BNB', 'ADA', 'USDT', 'USDC'];
  if (cryptoSymbols.includes(cleanSymbol)) {
    return (
      <div className={cn(dimensions[size], "rounded-full border border-[#E4E4E4] bg-white p-0.5 shadow-sm overflow-hidden", className)}>
        <img 
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanSymbol.toLowerCase()}.png`}
          alt={cleanSymbol}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 3. Stock Brands
  const stockMap: Record<string, string> = {
    'AAPL': 'apple',
    'TSLA': 'tesla',
    'NVDA': 'nvidia',
    'AMZN': 'amazon',
    'MSFT': 'microsoft',
    'GOOGL': 'google',
    'META': 'meta',
    'NFLX': 'netflix',
    'IBM': 'ibm'
  };

  if (stockMap[cleanSymbol]) {
    return (
      <div className={cn(dimensions[size], "rounded-full border border-[#E4E4E4] bg-white flex items-center justify-center p-2 shadow-sm", className)}>
        <img 
          src={`https://cdn.simpleicons.org/${stockMap[cleanSymbol]}`}
          alt={cleanSymbol}
          className="w-full h-full object-contain grayscale opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </div>
    );
  }

  // 4. Forex Flag-Pairing
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

  if (quote && quote.length === 3) {
    return (
      <div className={cn("flex items-center -space-x-3", className)}>
        <img 
          src={`https://flagcdn.io/w80/${getFlagCode(cleanSymbol)}.png`} 
          alt={cleanSymbol}
          className={cn(dimensions[size], "rounded-full border-2 border-white shadow-sm object-cover bg-white z-10")} 
        />
        <img 
          src={`https://flagcdn.io/w80/${getFlagCode(quote)}.png`} 
          alt={quote}
          className={cn(dimensions[size], "rounded-full border-2 border-white shadow-sm object-cover bg-white")} 
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className={cn(dimensions[size], "rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center text-[10px] font-mono font-bold shadow-inner", className)}>
      {cleanSymbol.substring(0, 2)}
    </div>
  );
};
