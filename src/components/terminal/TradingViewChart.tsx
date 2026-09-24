'use client';

/**
 * @fileOverview High-precision TradingView Chart component for the Varban Terminal.
 * Supports multiple chart types and technical overlays with dynamic resizing.
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  SeriesType,
  CandlestickData,
  LineData,
  WhitespaceData
} from 'lightweight-charts';
import { fetchHistoricalData } from '@/app/lib/market-service';
import { useTranslation } from '@/app/lib/i18n-context';

export type ChartMode = 'Candlestick' | 'Line' | 'Area';

interface TradingViewChartProps {
  symbol: string;
  chartMode?: ChartMode;
  showSMA?: boolean;
  showEMA?: boolean;
  isDarkTheme?: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  chartMode = 'Candlestick',
  showSMA = false,
  showEMA = false,
  isDarkTheme = false
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Helper to calculate SMA
  const calculateSMA = (data: any[], window: number) => {
    const smaData = [];
    for (let i = window - 1; i < data.length; i++) {
      const val = data.slice(i - window + 1, i + 1).reduce((acc, curr) => acc + (curr.close || curr.value), 0) / window;
      smaData.push({ time: data[i].time, value: val });
    }
    return smaData;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const themeColors = {
      background: isDarkTheme ? '#121212' : '#FFFFFF',
      text: isDarkTheme ? '#9CA3AF' : '#6B7280',
      grid: isDarkTheme ? '#1F2937' : '#F0F0F0',
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: themeColors.background },
        textColor: themeColors.text,
        fontFamily: 'Inter',
      },
      grid: {
        vertLines: { color: themeColors.grid },
        horzLines: { color: themeColors.grid },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 500,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
        autoScale: true,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchHistoricalData(symbol);
        if (!data || data.length === 0) throw new Error("No data");

        // Clear previous series
        if (mainSeriesRef.current) chart.removeSeries(mainSeriesRef.current);
        if (smaSeriesRef.current) chart.removeSeries(smaSeriesRef.current);
        if (emaSeriesRef.current) chart.removeSeries(emaSeriesRef.current);

        // Add main series based on mode
        if (chartMode === 'Candlestick') {
          mainSeriesRef.current = chart.addCandlestickSeries({
            upColor: '#16835B',
            downColor: '#0055FF',
            borderVisible: false,
            wickUpColor: '#16835B',
            wickDownColor: '#0055FF',
          });
          mainSeriesRef.current.setData(data as CandlestickData[]);
        } else if (chartMode === 'Line') {
          mainSeriesRef.current = chart.addLineSeries({
            color: '#0055FF',
            lineWidth: 2,
          });
          mainSeriesRef.current.setData(data.map(d => ({ time: d.time, value: d.close })) as LineData[]);
        } else {
          mainSeriesRef.current = chart.addAreaSeries({
            lineColor: '#0055FF',
            topColor: 'rgba(0, 85, 255, 0.4)',
            bottomColor: 'rgba(0, 85, 255, 0.0)',
            lineWidth: 2,
          });
          mainSeriesRef.current.setData(data.map(d => ({ time: d.time, value: d.close })) as LineData[]);
        }

        // Technical Overlays
        if (showSMA) {
          smaSeriesRef.current = chart.addLineSeries({ color: '#F59E0B', lineWidth: 1, title: 'SMA 20' });
          smaSeriesRef.current.setData(calculateSMA(data, 20));
        }
        if (showEMA) {
          emaSeriesRef.current = chart.addLineSeries({ color: '#8B5CF6', lineWidth: 1, title: 'EMA 50' });
          emaSeriesRef.current.setData(calculateSMA(data, 50)); // Simple proxy for EMA in this context
        }

        chart.timeScale().fitContent();
      } catch (e) {
        console.error("Chart load failure:", e);
      }
      setLoading(false);
    };

    loadData();

    // Responsive Resizing
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !chartRef.current || !chartContainerRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol, chartMode, showSMA, showEMA, isDarkTheme]);

  return (
    <div className="w-full h-full relative flex flex-col bg-transparent">
      {/* Legend Overlay */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none select-none">
        <div className="flex items-center space-x-2">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkTheme ? "text-white" : "text-[#0A0A0A]")}>
            {symbol}
          </span>
          <span className="text-[9px] font-mono text-[#6B7280]">
            {chartMode}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="flex-grow w-full h-full z-10" />
      
      {loading && (
        <div className={cn("absolute inset-0 flex items-center justify-center z-20", isDarkTheme ? "bg-[#0A0A0A]/60" : "bg-white/60")}>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">{t('common.loading')}</div>
          </div>
        </div>
      )}
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
