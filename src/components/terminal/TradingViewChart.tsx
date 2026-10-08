'use client';

/**
 * @fileOverview Institutional Advanced Charting Module.
 * Integrates the full TradingView Advanced Widget without custom wrappers.
 */

import React, { useEffect, useRef } from 'react';
import { getTVSymbol } from '@/app/lib/tradingview-symbols';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    VarbanNative?: {
      isNative: boolean;
      detachChart: (symbol: string) => void;
    };
  }
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  theme = 'light'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tvSymbol = getTVSymbol(symbol);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval: "5",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: true,
      backgroundColor: "#FFFFFF",
      gridColor: "#F7F7F5",
      container_id: "tradingview_advanced_node",
      studies: [
        "STD;EMA",
        "STD;RSI"
      ],
      support_host: "https://www.tradingview.com"
    };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol, theme]);

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden border border-[#E4E4E4] shadow-sm">
      {/* Primary Widget Container */}
      <div 
        id="tradingview_advanced_node" 
        className="tradingview-widget-container flex-1 w-full"
        ref={containerRef}
      />
    </div>
  );
};
