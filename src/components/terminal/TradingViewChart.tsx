'use client';

/**
 * @fileOverview High-precision TradingView Chart component for the Varban Terminal.
 * Institutional White UI theme implementation with custom embedded instrument selector menu.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { fetchHistoricalData } from '@/app/lib/market-service';
import { AVAILABLE_INSTRUMENTS } from '@/app/lib/instruments';
import { ChevronDown, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/app/lib/i18n-context';

interface TradingViewChartProps {
  symbol: string;
  onSymbolChange?: (symbol: string) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, onSymbolChange }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && !(event.target as HTMLElement).closest('.instrument-selector')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
      {/* Chart Toolbar / Header */}
      <div className="flex items-center justify-between py-2 px-4 border-b border-[#E4E4E4] bg-[#F7F7F5] z-30 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="relative instrument-selector">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center space-x-2 bg-white border border-[#E4E4E4] px-3 py-1.5 hover:border-[#0055FF] transition-all shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#0055FF]" />
              <span className="text-[10px] font-mono font-bold text-[#0A0A0A] uppercase tracking-wider">{symbol}</span>
              <ChevronDown className={`w-3 h-3 text-[#6B7280] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white border border-[#E4E4E4] shadow-xl z-[100] max-h-80 overflow-y-auto no-scrollbar py-1">
                <div className="px-3 py-2 border-b border-[#F7F7F5] bg-[#F7F7F5]">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">{t('nav.markets')}</span>
                </div>
                {AVAILABLE_INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.symbol}
                    onClick={() => {
                      if (onSymbolChange) onSymbolChange(inst.symbol);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-[10px] uppercase block font-mono border-b border-[#F7F7F5] last:border-0 hover:bg-[#F7F7F5] transition-colors ${
                      inst.symbol === symbol ? 'bg-[#0055FF]/5 text-[#0055FF]' : 'text-[#0A0A0A]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{inst.symbol}</span>
                      <span className="text-[8px] font-bold bg-[#F7F7F5] px-1 text-[#6B7280]">{inst.category}</span>
                    </div>
                    <span className="text-[9px] text-[#6B7280] block truncate mt-0.5">{inst.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#E4E4E4]"></div>

          <div className="flex items-center space-x-2 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
            <span className={loading ? "animate-pulse" : ""}>
              {loading ? t('trading.loadingExposure') : "Live Candlestick Feed"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="flex-grow w-full z-10" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20 top-12">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">{t('common.loading')}</div>
          </div>
        </div>
      )}
    </div>
  );
};
