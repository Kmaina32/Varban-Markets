'use client';

/**
 * @fileOverview Institutional Charting Module with Integrated Toolbar.
 * Uses TradingView Lightweight Charts with support for Multiple Chart Types.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, AreaData } from 'lightweight-charts';
import { fetchHistoricalData } from '@/app/lib/market-service';
import { 
  LineChart, 
  AreaChart as AreaIcon, 
  Settings, 
  Maximize2, 
  MousePointer2, 
  TrendingUp,
  BarChart3,
  Search,
  Clock
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface TradingViewChartProps {
  symbol: string;
  isDarkTheme?: boolean;
}

type ChartType = 'CANDLES' | 'AREA';

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  isDarkTheme = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  
  const [activeType, setActiveType] = useState<ChartType>('CANDLES');
  const [activeTimeframe, setActiveTimeframe] = useState('5m');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const initChart = async () => {
    if (!containerRef.current) return;
    
    // Clear previous
    if (chartRef.current) {
      chartRef.current.remove();
    }

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
      },
      rightPriceScale: {
        borderColor: '#E4E4E4',
      },
    });

    let series;
    if (activeType === 'CANDLES') {
      series = chart.addCandlestickSeries({
        upColor: '#16835B',
        downColor: '#0055FF',
        borderUpColor: '#16835B',
        borderDownColor: '#0055FF',
        wickUpColor: '#16835B',
        wickDownColor: '#0055FF',
      });
    } else {
      series = chart.addAreaSeries({
        lineColor: '#0055FF',
        topColor: '#0055FF40',
        bottomColor: '#0055FF00',
      });
    }

    chartRef.current = chart;
    seriesRef.current = series;

    try {
      const data = await fetchHistoricalData(symbol, activeTimeframe);
      if (seriesRef.current && data && data.length > 0) {
        seriesRef.current.setData(data);
        chart.timeScale().fitContent();
      }
    } catch (err) {
      console.error("Chart Load Failure:", err);
    }

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  useEffect(() => {
    initChart();
  }, [symbol, activeType, activeTimeframe]);

  return (
    <div className={cn(
      "w-full h-full flex flex-col bg-white overflow-hidden transition-all",
      isFullscreen && "fixed inset-0 z-[600] p-4"
    )}>
      {/* TRADINGVIEW STYLE TOOLBAR */}
      <div className="h-9 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-2 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1">
          <div className="flex items-center bg-[#F7F7F5] border border-[#E4E4E4] p-0.5 mr-2">
            <button 
              onClick={() => setActiveType('CANDLES')}
              className={cn("p-1 transition-all", activeType === 'CANDLES' ? "bg-white text-[#0A0A0A] shadow-sm" : "text-[#6B7280]")}
              title="Candlesticks"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setActiveType('AREA')}
              className={cn("p-1 transition-all", activeType === 'AREA' ? "bg-white text-[#0A0A0A] shadow-sm" : "text-[#6B7280]")}
              title="Area Chart"
            >
              <AreaIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-[#E4E4E4] mx-1"></div>

          {['1m', '5m', '15m', '1h', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={cn(
                "px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                activeTimeframe === tf ? "text-[#0055FF]" : "text-[#6B7280] hover:text-[#0A0A0A]"
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
            <MousePointer2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-[#E4E4E4]"></div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-[#6B7280] hover:text-[#0055FF] transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-grow min-h-0" />
      
      {/* WATERMARK LOGO */}
      <div className="absolute bottom-4 left-4 opacity-10 pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};
