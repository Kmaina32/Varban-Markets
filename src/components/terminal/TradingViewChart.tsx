'use client';

/**
 * @fileOverview Institutional Charting Node.
 * Re-engineered to use the TradingView Lightweight Charts library (Open Source).
 * Pipes real-time normalized data directly into the renderer.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ISeriesApi, CandlestickData, ColorType, IChartApi } from 'lightweight-charts';
import { fetchHistoricalData, fetchLivePrice } from '@/app/lib/market-service';
import { Loader2, Info } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  theme = 'light'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [providerInfo, setProviderInfo] = useState({ name: "...", status: "Syncing" });

  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#6B7280',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: '#F7F7F5' },
        horzLines: { color: '#F7F7F5' },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      timeScale: {
        borderColor: '#E4E4E4',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#16835B',
      downColor: '#C43D3D',
      borderVisible: false,
      wickUpColor: '#16835B',
      wickDownColor: '#C43D3D',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Load initial data
    const initData = async () => {
      const history = await fetchHistoricalData(symbol);
      if (history.length > 0) {
        series.setData(history as CandlestickData[]);
        setIsLoading(false);
      }
    };

    initData();

    // Real-time Polling / Simulated Stream for $0 cost
    const interval = setInterval(async () => {
      const latest = await fetchLivePrice(symbol);
      if (latest.status !== 'Unavailable') {
        setProviderInfo({ name: latest.provider, status: latest.status });
        series.update({
          time: Math.floor(latest.timestamp / 1000) as any,
          open: latest.open,
          high: latest.high,
          low: latest.low,
          close: latest.price
        });
      } else {
        setProviderInfo({ name: "None", status: "Offline" });
      }
    }, 5000);

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      chart.remove();
    };
  }, [symbol, theme]);

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden border border-[#E4E4E4] shadow-sm relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 text-[#0055FF] animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Connecting to Node...</span>
        </div>
      )}
      
      {/* Chart Attribution Bar */}
      <div className="h-8 border-b border-[#F7F7F5] bg-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5">
             <div className={cn("w-1.5 h-1.5 rounded-full", providerInfo.status === 'Open' ? "bg-[#16835B]" : "bg-[#C43D3D]")}></div>
             <span className="text-[9px] font-bold uppercase text-[#0A0A0A]">{symbol}</span>
           </div>
           <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">Feed: {providerInfo.name}</span>
        </div>
        <div className="flex items-center gap-2">
           <Info className="w-3 h-3 text-[#D1D5DB]" />
           <span className="text-[8px] font-bold text-[#D1D5DB] uppercase">TradingView technology</span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
};
