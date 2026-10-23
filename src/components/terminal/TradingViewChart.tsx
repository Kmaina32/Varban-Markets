'use client';

/**
 * @fileOverview Institutional Advanced Charting Node.
 * Fully enabled TradingView Advanced Widget with professional toolsets.
 */

import React, { useEffect, useRef, useState } from 'react';
import { getTVSymbol } from '@/app/lib/tradingview-symbols';
import { Loader2 } from 'lucide-react';
import { cn } from "@/app/lib/utils";

interface TradingViewChartProps {
  symbol: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const scriptId = 'tradingview-advanced-chart-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initWidget = () => {
      if (typeof window !== 'undefined' && (window as any).TradingView && containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear container
        const widgetContainer = document.createElement('div');
        widgetContainer.id = `tv_chart_${Math.random().toString(36).substring(7)}`;
        widgetContainer.style.height = '100%';
        containerRef.current.appendChild(widgetContainer);

        new (window as any).TradingView.widget({
          "autosize": true,
          "symbol": getTVSymbol(symbol),
          "interval": "5",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": false, // ENABLED for professional tools
          "allow_symbol_change": true, // ENABLED for workspace flexibility
          "save_image": true,
          "details": true,
          "hotlist": true,
          "calendar": true,
          "container_id": widgetContainer.id,
          "library_path": "https://s3.tradingview.com/tv.js",
          "hide_top_toolbar": false,
          "withdateranges": true,
          "studies": [
            "RSI@tv-basicstudies",
            "MASimple@tv-basicstudies",
            "BollingerBands@tv-basicstudies"
          ],
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          "overrides": {
            "mainSeriesProperties.candleStyle.upColor": "#16835B",
            "mainSeriesProperties.candleStyle.downColor": "#C43D3D",
            "mainSeriesProperties.candleStyle.borderUpColor": "#16835B",
            "mainSeriesProperties.candleStyle.borderDownColor": "#C43D3D",
            "mainSeriesProperties.candleStyle.wickUpColor": "#16835B",
            "mainSeriesProperties.candleStyle.wickDownColor": "#C43D3D",
          }
        });
        
        // Brief delay to allow widget to capture height
        setTimeout(() => setIsLoading(false), 1200);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol]);

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden border border-[#E4E4E4] shadow-sm relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] block">
              Initializing Matching Engine
            </span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-tighter">
              Synchronizing {symbol} Data Node...
            </span>
          </div>
        </div>
      )}
      
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
};
