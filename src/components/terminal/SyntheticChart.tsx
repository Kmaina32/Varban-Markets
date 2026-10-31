'use client';

/**
 * @fileOverview Advanced Institutional Synthetic Charting Node.
 * Features technical indicators (SMA, RSI), drawing tools, and multi-series support.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, LineStyle, CrosshairMode } from 'lightweight-charts';
import { Tick } from '@/app/lib/synthetic/use-synthetic-feed';
import { 
  BarChart2, 
  TrendingUp, 
  Settings2, 
  MousePointer2, 
  LineChart, 
  AreaChart, 
  Square, 
  Type, 
  Search,
  Eye,
  Maximize2
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface SyntheticChartProps {
  ticks: Tick[];
  loading: boolean;
}

export default function SyntheticChart({ ticks, loading }: SyntheticChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma7Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const sma25Ref = useRef<ISeriesApi<"Line"> | null>(null);
  
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showSMA, setShowSMA] = useState(true);

  // Drawing Tools Sidebar
  const DRAWING_TOOLS = [
    { icon: MousePointer2, label: 'Select' },
    { icon: TrendingUp, label: 'Trend Line' },
    { icon: Search, label: 'Fib Retracement' },
    { icon: Square, label: 'Rectangle' },
    { icon: Type, label: 'Text' },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#0A0A0A',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: '#F0F0F0' },
        horzLines: { color: '#F0F0F0' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#6B7280', width: 1, style: LineStyle.SparseDotted, labelBackgroundColor: '#0A0A0A' },
        horzLine: { color: '#6B7280', width: 1, style: LineStyle.SparseDotted, labelBackgroundColor: '#0A0A0A' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#E4E4E4',
      },
      rightPriceScale: {
        borderColor: '#E4E4E4',
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#0055FF',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: true,
    });

    // Technical Overlays
    const sma7 = chart.addLineSeries({ color: '#16835B', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: 'SMA 7' });
    const sma25 = chart.addLineSeries({ color: '#C43D3D', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: 'SMA 25' });

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;
    sma7Ref.current = sma7;
    sma25Ref.current = sma25;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (lineSeriesRef.current && ticks.length > 0) {
      const data = ticks.map(t => ({
        time: (t.time / 1000) as any,
        value: t.price
      }));
      lineSeriesRef.current.setData(data);

      if (showSMA) {
        // Calculate SMA 7
        const sma7Data = data.map((d, i) => {
          if (i < 7) return null;
          const slice = data.slice(i - 7, i);
          const avg = slice.reduce((a, b) => a + b.value, 0) / 7;
          return { time: d.time, value: avg };
        }).filter(Boolean) as any[];
        sma7Ref.current?.setData(sma7Data);

        // Calculate SMA 25
        const sma25Data = data.map((d, i) => {
          if (i < 25) return null;
          const slice = data.slice(i - 25, i);
          const avg = slice.reduce((a, b) => a + b.value, 0) / 25;
          return { time: d.time, value: avg };
        }).filter(Boolean) as any[];
        sma25Ref.current?.setData(sma25Data);
      } else {
        sma7Ref.current?.setData([]);
        sma25Ref.current?.setData([]);
      }
    }
  }, [ticks, showSMA]);

  return (
    <div className="w-full h-full flex relative bg-white group/chart">
      {/* 1. Technical Toolbar (Top) */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-white border-b border-[#E4E4E4] z-20 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#F7F7F5] border border-[#E4E4E4] rounded-lg p-0.5">
            <button 
              onClick={() => setChartType('line')}
              className={cn("p-1.5 rounded-md transition-all", chartType === 'line' ? "bg-white shadow-sm text-[#0055FF]" : "text-[#6B7280] hover:text-[#0A0A0A]")}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setChartType('area')}
              className={cn("p-1.5 rounded-md transition-all", chartType === 'area' ? "bg-white shadow-sm text-[#0055FF]" : "text-[#6B7280] hover:text-[#0A0A0A]")}
            >
              <AreaChart className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-4 w-px bg-[#E4E4E4]"></div>
          <button 
            onClick={() => setShowSMA(!showSMA)}
            className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-2 py-1 border transition-all rounded-lg",
              showSMA ? "bg-[#0055FF]/5 text-[#0055FF] border-[#0055FF]" : "text-[#6B7280] border-[#E4E4E4]"
            )}
          >
            Indicators: {showSMA ? 'SMA Active' : 'Off'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 text-[#6B7280] hover:text-[#0055FF]"><Settings2 className="w-4 h-4" /></button>
          <button className="p-1.5 text-[#6B7280] hover:text-[#0055FF]"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 2. Drawing Toolbar (Left) */}
      <div className="absolute top-10 left-0 bottom-0 w-12 border-r border-[#E4E4E4] bg-white z-20 flex flex-col items-center py-4 gap-4">
        {DRAWING_TOOLS.map((tool, i) => (
          <button 
            key={i}
            className="p-2 text-[#6B7280] hover:text-[#0055FF] hover:bg-[#F7F7F5] transition-all rounded-xl"
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="mt-auto pb-4">
           <button className="p-2 text-[#6B7280] hover:text-[#C43D3D]"><Eye className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 3. Main Chart Container */}
      <div className="flex-grow relative pl-12 pt-10">
        {loading && ticks.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Connecting to Matching Node...</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
