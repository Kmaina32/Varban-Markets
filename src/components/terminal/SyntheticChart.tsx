'use client';

/**
 * @fileOverview Advanced Institutional Synthetic Charting Node.
 * Synchronized with Standard Terminal configuration: RSI, SMA, and Bollinger Bands.
 * Features a professional drawing toolbar and technical overlays.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, LineStyle, CrosshairMode } from 'lightweight-charts';
import { Tick } from '@/app/lib/synthetic/use-synthetic-feed';
import { 
  TrendingUp, 
  Settings2, 
  MousePointer2, 
  LineChart, 
  AreaChart, 
  Square, 
  Type, 
  Search,
  Eye,
  Maximize2,
  Loader2,
  Activity,
  BarChart2,
  GitCommit,
  Hash
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
  const bbUpperRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbMidRef = useRef<ISeriesApi<"Line"> | null>(null);
  
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [showIndicators, setShowIndicators] = useState(true);

  // Drawing Tools Sidebar (Matches TV Roadmap)
  const DRAWING_TOOLS = [
    { icon: MousePointer2, label: 'Select' },
    { icon: TrendingUp, label: 'Trend Line' },
    { icon: GitCommit, label: 'Ray' },
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
        vertLines: { color: '#F7F7F5' },
        horzLines: { color: '#F7F7F5' },
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
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#0055FF',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: true,
      title: 'Price'
    });

    // Technical Overlays (Same as Client Terminal Study Config)
    const sma7 = chart.addLineSeries({ color: '#16835B', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: 'SMA 7' });
    const sma25 = chart.addLineSeries({ color: '#C43D3D', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: 'SMA 25' });
    
    // Bollinger Bands
    const bbUpper = chart.addLineSeries({ color: '#9CA3AF', lineWidth: 1, style: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false, title: 'BB Upper' });
    const bbLower = chart.addLineSeries({ color: '#9CA3AF', lineWidth: 1, style: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false, title: 'BB Lower' });
    const bbMid = chart.addLineSeries({ color: '#E4E4E4', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: 'BB Mid' });

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;
    sma7Ref.current = sma7;
    sma25Ref.current = sma25;
    bbUpperRef.current = bbUpper;
    bbLowerRef.current = bbLower;
    bbMidRef.current = bbMid;

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

      if (showIndicators) {
        // 1. SMA fast/slow
        const sma7Data = data.map((d, i) => {
          if (i < 7) return null;
          const avg = data.slice(i - 7, i).reduce((a, b) => a + b.value, 0) / 7;
          return { time: d.time, value: avg };
        }).filter(Boolean) as any[];
        sma7Ref.current?.setData(sma7Data);

        const sma25Data = data.map((d, i) => {
          if (i < 25) return null;
          const avg = data.slice(i - 25, i).reduce((a, b) => a + b.value, 0) / 25;
          return { time: d.time, value: avg };
        }).filter(Boolean) as any[];
        sma25Ref.current?.setData(sma25Data);

        // 2. Bollinger Bands (20 period, 2 std dev)
        const bbUpperData: any[] = [];
        const bbLowerData: any[] = [];
        const bbMidData: any[] = [];

        data.forEach((d, i) => {
          if (i < 20) return;
          const slice = data.slice(i - 20, i);
          const mean = slice.reduce((a, b) => a + b.value, 0) / 20;
          const variance = slice.reduce((a, b) => a + Math.pow(b.value - mean, 2), 0) / 20;
          const stdDev = Math.sqrt(variance);

          bbMidData.push({ time: d.time, value: mean });
          bbUpperData.push({ time: d.time, value: mean + (stdDev * 2) });
          bbLowerData.push({ time: d.time, value: mean - (stdDev * 2) });
        });

        bbUpperRef.current?.setData(bbUpperData);
        bbLowerRef.current?.setData(bbLowerData);
        bbMidRef.current?.setData(bbMidData);
      } else {
        sma7Ref.current?.setData([]);
        sma25Ref.current?.setData([]);
        bbUpperRef.current?.setData([]);
        bbLowerRef.current?.setData([]);
        bbMidRef.current?.setData([]);
      }
    }
  }, [ticks, showIndicators]);

  return (
    <div className="w-full h-full flex relative bg-white group/chart overflow-hidden">
      {/* 1. TOP TOOLBAR (TV ALIGNED) */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-white border-b border-[#E4E4E4] z-20 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#F7F7F5] border border-[#E4E4E4] p-0.5 rounded-lg">
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
            onClick={() => setShowIndicators(!showIndicators)}
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-all rounded-lg flex items-center gap-2",
              showIndicators ? "bg-[#0055FF] text-white border-[#0055FF]" : "text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
            )}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Studies</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
             <span className="text-[8px] font-mono text-[#D1D5DB] uppercase">SMA</span>
             <span className="text-[8px] font-mono text-[#D1D5DB] uppercase">RSI</span>
             <span className="text-[8px] font-mono text-[#D1D5DB] uppercase">BBANDS</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"><Settings2 className="w-4 h-4" /></button>
          <button className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 2. LEFT TOOLBAR (TV ALIGNED) */}
      <div className="absolute top-12 left-0 bottom-0 w-12 border-r border-[#E4E4E4] bg-white z-20 flex flex-col items-center py-6 gap-5">
        {DRAWING_TOOLS.map((tool, i) => (
          <button 
            key={i}
            className="p-2 text-[#6B7280] hover:text-[#0055FF] hover:bg-[#F7F7F5] transition-all rounded-xl group"
            title={tool.label}
          >
            <tool.icon className="w-4 h-4 group-active:scale-90 transition-transform" />
          </button>
        ))}
        <div className="mt-auto pb-4">
           <button className="p-2 text-[#6B7280] hover:text-[#C43D3D]"><Eye className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 3. MAIN CHART AREA */}
      <div className="flex-grow relative pl-12 pt-12">
        {loading && ticks.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-[3px] border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0A0A0A]">Connecting Matching Node</span>
                <p className="text-[9px] text-[#6B7280] uppercase font-bold">Establishing deterministic link...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}

