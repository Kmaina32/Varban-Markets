'use client';

/**
 * @fileOverview Institutional Charting Module using TradingView Lightweight Charts.
 * Replaces the private Advanced Charts library to ensure seamless installation 
 * and high-performance real-time rendering.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { fetchHistoricalData } from '@/app/lib/market-service';

interface TradingViewChartProps {
  symbol: string;
  isDarkTheme?: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  isDarkTheme = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Chart with Institutional Styling
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
      rightPriceScale: {
        borderColor: '#E4E4E4',
        autoScale: true,
      },
      handleScale: true,
      handleScroll: true,
    });

    const series = chart.addCandlestickSeries({
      upColor: '#16835B',
      downColor: '#0055FF', // Varban's standard color choice for "Down"
      borderUpColor: '#16835B',
      borderDownColor: '#0055FF',
      wickUpColor: '#16835B',
      wickDownColor: '#0055FF',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    const loadData = async () => {
      try {
        const data = await fetchHistoricalData(symbol, '5min');
        if (seriesRef.current && data && data.length > 0) {
          seriesRef.current.setData(data as any);
          chart.timeScale().fitContent();
        }
      } catch (err) {
        console.error("Chart Data Load Failure:", err);
      }
    };

    loadData();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol]);

  // Handle data updates when symbol changes
  useEffect(() => {
    const loadData = async () => {
      if (seriesRef.current) {
        try {
          const data = await fetchHistoricalData(symbol, '5min');
          if (seriesRef.current && data && data.length > 0) {
            seriesRef.current.setData(data as any);
          }
        } catch (err) {
          console.error("Symbol Transition Failure:", err);
        }
      }
    };
    loadData();
  }, [symbol]);

  return (
    <div className="w-full h-full relative flex flex-col bg-white overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
