'use client';

/**
 * @fileOverview Institutional Advanced Charting Module.
 * Integrates the full TradingView Advanced Widget with native window detachment.
 */

import React, { useEffect, useRef, useState } from 'react';
import { getTVSymbol } from '@/app/lib/tradingview-symbols';
import { 
  Maximize2, 
  ExternalLink, 
  BarChart2, 
  Activity
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

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
  const [isNative, setIsNative] = useState(false);
  const tvSymbol = getTVSymbol(symbol);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.VarbanNative?.isNative) {
      setIsNative(true);
    }
  }, []);

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

  const handleDetach = () => {
    if (window.VarbanNative) {
      window.VarbanNative.detachChart(symbol);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden border border-[#E4E4E4] shadow-sm">
      {/* Institutional Widget Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#F7F7F5] border-b border-[#E4E4E4]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#0055FF] flex items-center justify-center rounded-none shadow-sm">
            <BarChart2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-wider leading-none">
              Varban Markets Institutional Charting
            </span>
            <span className="text-[8px] text-[#6B7280] font-mono mt-0.5 uppercase tracking-tighter">
              Node: {tvSymbol} &bull; Deterministic Sync Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16835B] animate-pulse"></span>
            <span className="text-[9px] font-bold text-[#16835B] uppercase tracking-widest">
              Live Feed Connected
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-[#E4E4E4] pl-4">
            {isNative && (
              <button 
                onClick={handleDetach}
                className="p-1.5 text-[#0055FF] hover:bg-[#0055FF]/5 transition-all flex items-center gap-2"
                title="Detach Terminal"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase hidden md:inline">Detach</span>
              </button>
            )}
            <a
              href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
              title="Full TradingView Analysis"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Primary Widget Container */}
      <div 
        id="tradingview_advanced_node" 
        className="tradingview-widget-container flex-1 w-full"
        ref={containerRef}
      />
      
      {/* Bottom Status Bar */}
      <div className="h-6 bg-white border-t border-[#E4E4E4] flex items-center px-3 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em]">Execution: 0ms</span>
          <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em]">Aggregator: 10/10</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-2.5 h-2.5 text-[#16835B]" />
          <span className="text-[8px] font-bold text-[#16835B] uppercase tracking-widest">Stable</span>
        </div>
      </div>
    </div>
  );
};
