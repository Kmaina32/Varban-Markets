'use client';

/**
 * @fileOverview High-precision TradingView Chart component for the Varban Terminal.
 * Refined to consume normalized market and technical indicator data from the Twelve Data Proxy.
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
  CrosshairMode
} from 'lightweight-charts';
import { fetchHistoricalData, fetchTechnicalIndicator } from '@/app/lib/market-service';
import { useTranslation } from '@/app/lib/i18n-context';

export type ChartMode = 'Candlestick' | 'Line' | 'Area';

interface TradingViewChartProps {
  symbol: string;
  chartMode?: ChartMode;
  showSMA?: boolean;
  showEMA?: boolean;
  isDarkTheme?: boolean;
  timeframe?: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  chartMode = 'Candlestick',
  showSMA = false,
  showEMA = false,
  isDarkTheme = false,
  timeframe = '5m'
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const themeColors = {
      background: '#FFFFFF',
      text: '#6B7280',
      grid: '#F7F7F5',
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
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { labelBackgroundColor: '#0A0A0A' },
        horzLine: { labelBackgroundColor: '#0A0A0A' },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
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
        const priceData = await fetchHistoricalData(symbol, timeframe);
        
        if (!priceData || priceData.length === 0) {
          setLoading(false);
          return;
        }

        // Add main series based on mode
        if (chartMode === 'Candlestick') {
          const s = chart.addCandlestickSeries({
            upColor: '#16835B',
            downColor: '#0055FF',
            borderVisible: false,
            wickUpColor: '#16835B',
            wickDownColor: '#0055FF',
          });
          s.setData(priceData as CandlestickData[]);
          mainSeriesRef.current = s;
        } else if (chartMode === 'Line') {
          const s = chart.addLineSeries({ color: '#0055FF', lineWidth: 2 });
          s.setData(priceData.map(d => ({ time: d.time, value: d.close })) as LineData[]);
          mainSeriesRef.current = s;
        } else {
          const s = chart.addAreaSeries({
            lineColor: '#0055FF',
            topColor: 'rgba(0, 85, 255, 0.2)',
            bottomColor: 'rgba(0, 85, 255, 0.0)',
            lineWidth: 2,
          });
          s.setData(priceData.map(d => ({ time: d.time, value: d.close })) as LineData[]);
          mainSeriesRef.current = s;
        }

        // Add indicators if toggled
        if (showSMA) {
          const smaData = await fetchTechnicalIndicator('SMA', symbol, timeframe, 20);
          if (smaData.length > 0) {
            const s = chart.addLineSeries({ 
              color: '#F59E0B', 
              lineWidth: 1, 
              title: 'SMA 20',
              priceLineVisible: false,
              lastValueVisible: false
            });
            s.setData(smaData as LineData[]);
            smaSeriesRef.current = s;
          }
        }

        if (showEMA) {
          const emaData = await fetchTechnicalIndicator('EMA', symbol, timeframe, 50);
          if (emaData.length > 0) {
            const s = chart.addLineSeries({ 
              color: '#8B5CF6', 
              lineWidth: 1, 
              title: 'EMA 50',
              priceLineVisible: false,
              lastValueVisible: false
            });
            s.setData(emaData as LineData[]);
            emaSeriesRef.current = s;
          }
        }

        chart.timeScale().fitContent();
      } catch (e) {
        console.warn("Terminal chart sync failure:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !chartRef.current || !chartContainerRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        mainSeriesRef.current = null;
        smaSeriesRef.current = null;
        emaSeriesRef.current = null;
      }
    };
  }, [symbol, chartMode, showSMA, showEMA, timeframe]);

  return (
    <div className="w-full h-full relative flex flex-col bg-transparent">
      <div className="absolute top-3 left-3 z-20 pointer-events-none select-none">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">
            {symbol}
          </span>
          <span className="text-[9px] font-mono text-[#6B7280]">
            {chartMode} &bull; {timeframe}
          </span>
        </div>
      </div>

      <div ref={chartContainerRef} className="flex-grow w-full h-full z-10" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/40 backdrop-blur-[1px]">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-5 h-5 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-[#0055FF]">Synchronizing Signal</div>
          </div>
        </div>
      )}
    </div>
  );
};
