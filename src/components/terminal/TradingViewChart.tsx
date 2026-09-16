'use client';

/**
 * @fileOverview High-precision TradingView Chart component for the Varban Terminal.
 * Institutional White UI theme implementation optimized to occupy full workspace boundaries.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { fetchHistoricalData } from '@/app/lib/market-service';
import { useTranslation } from '@/app/lib/i18n-context';

interface TradingViewChartProps {
  symbol: string;
  onSymbolChange?: (symbol: string) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#6B7280',
        fontFamily: 'Inter',
      },
      grid: {
        vertLines: { color: '#F0F0F0' },
        horzLines: { color: '#F0F0F0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 450,
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

    const series = chart.addCandlestickSeries({
      upColor: '#16835B',
      downColor: '#C43D3D',
      borderVisible: false,
      wickUpColor: '#16835B',
      wickDownColor: '#C43D3D',
    });

    seriesRef.current = series;
    chartRef.current = chart;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchHistoricalData(symbol);
        if (seriesRef.current && data) {
          seriesRef.current.setData(data as any);
          chart.timeScale().fitContent();
        }
      } catch (e) {}
      setLoading(false);
    };

    loadData();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol]);

  return (
    <div className="w-full h-full relative flex flex-col bg-white">
      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="flex-grow w-full z-10" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">{t('common.loading')}</div>
          </div>
        </div>
      )}
    </div>
  );
};
