'use client';

/**
 * @fileOverview Institutional Market Icon Resolver.
 * Dynamically renders Forex flags, Crypto logos, and Stock brand icons.
 * Matches TradingView's signature style with overlapping flags and circular logos.
 */

import React, { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { Droplets, Landmark, Coins } from 'lucide-react';

interface MarketIconProps {
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MarketIcon: React.FC<MarketIconProps> = ({ symbol, className, size = 'md' }) => {
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  // Normalize symbol (e.g., BTC/USD -> [BTC, USD])
  const parts = symbol.includes('/') 
    ? symbol.split('/') 
    : (symbol.length === 6 ? [symbol.substring(0, 3), symbol.substring(3)] : [symbol, '']);
    
  const base = parts[0].toUpperCase();
  const quote = parts[1]?.toUpperCase();

  const dimensions = {
    sm: 'w-5 h-5',
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
      'KES': 'ke',
      'AED': 'ae'
    };
    return map[curr] || curr.toLowerCase().substring(0, 2);
  };

  // 1. COMMODITIES (GOLD, SILVER, OIL)
  if (base === 'XAU' || base === 'GOLD') {
    return (
      <div className={cn(dimensions[size], "rounded-full bg-gradient-to-br from-[#FFD700] via-[#C9A227] to-[#B8860B] flex items-center justify-center text-white text-[7px] md:text-[9px] font-bold border border-white/20 shadow-sm shrink-0", className)}>
        AU
      </div>
    );
  }

  if (base === 'XAG' || base === 'SILV') {
    return (
      <div className={cn(dimensions[size], "rounded-full bg-gradient-to-br from-[#E2E8F0] via-[#94A3B8] to-[#475569] flex items-center justify-center text-white text-[7px] md:text-[9px] font-bold border border-white/20 shadow-sm shrink-0", className)}>
        AG
      </div>
    );
  }

  if (base === 'WTI' || base === 'OIL' || base === 'BRENT') {
    return (
      <div className={cn(dimensions[size], "rounded-full bg-[#1A1A1A] flex items-center justify-center text-white shadow-sm border border-[#E4E4E4] shrink-0", className)}>
        <Droplets className={cn(size === 'lg' ? 'w-6 h-6' : 'w-4 h-4', "text-[#0055FF] fill-[#0055FF]/20")} />
      </div>
    );
  }

  // 2. INDICES (Circular Landmark Style)
  const indexSymbols = ['US30', 'DJI', 'SPY', 'US500', 'SPX', 'NAS100', 'NAS', 'QQQ', 'GER40'];
  if (indexSymbols.includes(base)) {
    return (
      <div className={cn(dimensions[size], "rounded-full border border-[#E4E4E4] bg-[#F7F7F5] flex items-center justify-center shadow-sm shrink-0", className)}>
        <Landmark className={cn(size === 'lg' ? 'w-6 h-6' : 'w-4 h-4', "text-[#0A0A0A]")} />
      </div>
    );
  }

  // 3. CRYPTO (Official Logos via CDN)
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'XRP', 'LTC', 'BNB', 'ADA', 'USDT', 'USDC'];
  if (cryptoSymbols.includes(base)) {
    return (
      <div className={cn(dimensions[size], "rounded-full border border-[#E4E4E4] bg-white p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0", className)}>
        <img 
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${base.toLowerCase()}.png`}
          alt={base}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://cdn.simpleicons.org/${base.toLowerCase()}`;
          }}
        />
      </div>
    );
  }

  // 4. STOCK BRANDS (Circular logos)
  const stockMap: Record<string, string> = {
    'AAPL': 'apple',
    'TSLA': 'tesla',
    'NVDA': 'nvidia',
    'AMZN': 'amazon',
    'MSFT': 'microsoft',
    'GOOGL': 'google',
    'META': 'meta'
  };

  if (stockMap[base]) {
    return (
      <div className={cn(dimensions[size], "rounded-full border border-[#E4E4E4] bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0", className)}>
        <img 
          src={`https://cdn.simpleicons.org/${stockMap[base]}`}
          alt={base}
          className="w-full h-full object-contain grayscale opacity-80"
        />
      </div>
    );
  }

  // 5. FOREX FLAGS (TradingView signature Overlapping Style)
  if (quote && quote.length === 3) {
    const iconSizeClass = size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className={cn("relative flex items-center shrink-0", dimensions[size], className)}>
        {/* Base Currency Flag (Top Left) */}
        <div className={cn(
          iconSizeClass, 
          "absolute top-0 left-0 rounded-full border border-white shadow-sm overflow-hidden bg-[#F7F7F5] flex items-center justify-center z-20"
        )}>
          {!img1Error ? (
            <img 
              src={`https://flagcdn.io/w80/${getFlagCode(base)}.png`} 
              alt={base}
              className="w-full h-full object-cover"
              onError={() => setImg1Error(true)}
            />
          ) : (
            <span className="text-[6px] font-bold text-[#6B7280]">{base.substring(0, 2)}</span>
          )}
        </div>
        {/* Quote Currency Flag (Bottom Right) */}
        <div className={cn(
          iconSizeClass, 
          "absolute bottom-0 right-0 rounded-full border border-white shadow-sm overflow-hidden bg-[#F7F7F5] flex items-center justify-center z-10"
        )}>
          {!img2Error ? (
            <img 
              src={`https://flagcdn.io/w80/${getFlagCode(quote)}.png`} 
              alt={quote}
              className="w-full h-full object-cover opacity-80"
              onError={() => setImg2Error(true)}
            />
          ) : (
            <span className="text-[6px] font-bold text-[#6B7280]">{quote.substring(0, 2)}</span>
          )}
        </div>
      </div>
    );
  }

  // FINAL FALLBACK
  return (
    <div className={cn(dimensions[size], "rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[8px] md:text-[10px] font-mono font-bold shadow-sm shrink-0 uppercase", className)}>
      {base.substring(0, 2)}
    </div>
  );
};