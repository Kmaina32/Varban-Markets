'use client';

/**
 * @fileOverview High-precision TradingView Chart component for the Varban Terminal.
 * Integrated with Alpha Vantage Technical Indicator API for remote EMA/SMA data.
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  SeriesType,
  CandlestickData,
  LineData
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
      grid: '#F0F0F0',
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
        // 1. Load historical price action
        const priceData = await fetchHistoricalData(symbol);
        if (!priceData || priceData.length === 0) throw new Error("Price data unavailable");

        // 2. Clear existing series from refs
        mainSeriesRef.current = null;
        smaSeriesRef.current = null;
        emaSeriesRef.current = null;

        // 3. Add primary price series
        if (chartMode === 'Candlestick') {
          const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#16835B',
            downColor: '#0055FF',
            borderVisible: false,
            wickUpColor: '#16835B',
            wickDownColor: '#0055FF',
          });
          candlestickSeries.setData(priceData as CandlestickData[]);
          mainSeriesRef.current = candlestickSeries;
        } else if (chartMode === 'Line') {
          const lineSeries = chart.addLineSeries({
            color: '#0055FF',
            lineWidth: 2,
          });
          lineSeries.setData(priceData.map(d => ({ time: d.time, value: d.close })) as LineData[]);
          mainSeriesRef.current = lineSeries;
        } else {
          const areaSeries = chart.addAreaSeries({
            lineColor: '#0055FF',
            topColor: 'rgba(0, 85, 255, 0.4)',
            bottomColor: 'rgba(0, 85, 255, 0.0)',
            lineWidth: 2,
          });
          areaSeries.setData(priceData.map(d => ({ time: d.time, value: d.close })) as LineData[]);
          mainSeriesRef.current = areaSeries;
        }

        // 4. Load Remote Technical Indicators
        if (showSMA) {
          const smaData = await fetchTechnicalIndicator('SMA', symbol, timeframe, 20);
          if (smaData.length > 0) {
            const smaSeries = chart.addLineSeries({ color: '#F59E0B', lineWidth: 1.5, title: 'SMA 20' });
            smaSeries.setData(smaData);
            smaSeriesRef.current = smaSeries;
          }
        }

        if (showEMA) {
          const emaData = await fetchTechnicalIndicator('EMA', symbol, timeframe, 50);
          if (emaData.length > 0) {
            const emaSeries = chart.addLineSeries({ color: '#8B5CF6', lineWidth: 1.5, title: 'EMA 50' });
            emaSeries.setData(emaData);
            emaSeriesRef.current = emaSeries;
          }
        }

        chart.timeScale().fitContent();
      } catch (e) {
        console.warn("Chart data load failure:", e);
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
      }
    };
  }, [symbol, chartMode, showSMA, showEMA, timeframe]);

  return (
    <div className="w-full h-full relative flex flex-col bg-transparent">
      {/* Dynamic Legend */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none select-none">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">
            {symbol}
          </span>
          <span className="text-[9px] font-mono text-[#6B7280]">
            {chartMode} ({timeframe})
          </span>
        </div>
      </div>

      <div ref={chartContainerRef} className="flex-grow w-full h-full z-10" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/60">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">{t('common.loading')}</div>
          </div>
        </div>
      )}
    </div>
  );
};
