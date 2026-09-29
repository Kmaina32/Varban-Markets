
'use client';

/**
 * @fileOverview Institutional TradingView Advanced Charting Library Integration.
 * Implements the full Advanced Charts widget with custom Datafeed for Varban Markets.
 */

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { fetchHistoricalData } from '@/app/lib/market-service';

export type ChartMode = 'Candlestick' | 'Line' | 'Area';

interface TradingViewChartProps {
  symbol: string;
  chartMode?: ChartMode;
  showSMA?: boolean;
  showEMA?: boolean;
  isDarkTheme?: boolean;
  timeframe?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  chartMode = 'Candlestick',
  isDarkTheme = false,
  timeframe = '5'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<any>(null);
  const [isLibraryReady, setIsLibraryReady] = useState(false);

  useEffect(() => {
    if (!isLibraryReady || !containerRef.current || !window.TradingView) return;

    const configurationData = {
      supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W'],
      exchanges: [{ value: 'Varban', name: 'Varban Markets', desc: 'Institutional Liquidity' }],
      symbols_types: [{ name: 'All types', value: '' }]
    };

    const datafeed = {
      onReady: (callback: any) => {
        setTimeout(() => callback(configurationData), 0);
      },
      searchSymbols: (userInput: string, exchange: string, symbolType: string, onResultReadyCallback: any) => {
        onResultReadyCallback([]);
      },
      resolveSymbol: (symbolName: string, onSymbolResolvedCallback: any, onResolveErrorCallback: any) => {
        const symbolInfo = {
          name: symbolName,
          description: symbolName,
          type: 'crypto',
          session: '24x7',
          timezone: 'Etc/UTC',
          exchange: 'Varban',
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          supported_resolutions: configurationData.supported_resolutions,
          volume_precision: 8,
          data_status: 'streaming',
        };
        setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
      },
      getBars: async (symbolInfo: any, resolution: string, periodParams: any, onHistoryCallback: any, onErrorCallback: any) => {
        try {
          const intervalMap: Record<string, string> = {
            '1': '1min', '5': '5min', '15': '15min', '30': '30min', '60': '1h', '1D': '1day', '1W': '1week'
          };
          const interval = intervalMap[resolution] || '5min';
          const bars = await fetchHistoricalData(symbolInfo.name, interval);
          
          if (bars.length === 0) {
            onHistoryCallback([], { noData: true });
          } else {
            // Filter bars based on from/to if necessary
            onHistoryCallback(bars.map(b => ({
              time: b.time * 1000,
              low: b.low,
              high: b.high,
              open: b.open,
              close: b.close,
              volume: b.volume
            })), { noData: false });
          }
        } catch (error) {
          onErrorCallback(error);
        }
      },
      subscribeBars: (symbolInfo: any, resolution: string, onRealtimeCallback: any, subscribeUID: string, onResetCacheNeededCallback: any) => {
        // Real-time updates handled by terminal polling in parent component for now
      },
      unsubscribeBars: (subscriberUID: string) => {}
    };

    const widgetOptions = {
      symbol: symbol,
      datafeed: datafeed,
      interval: timeframe as any,
      container: containerRef.current,
      library_path: '/charting_library/',
      locale: 'en',
      disabled_features: ['use_localstorage_for_settings_save', 'header_symbol_search'],
      enabled_features: ['study_templates'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'varbanmarkets.com',
      user_id: 'public_user',
      fullscreen: false,
      autosize: true,
      theme: isDarkTheme ? 'Dark' : 'Light',
      overrides: {
        "paneProperties.background": "#FFFFFF",
        "paneProperties.vertGridProperties.color": "#F7F7F5",
        "paneProperties.horzGridProperties.color": "#F7F7F5",
        "mainSeriesProperties.candleStyle.upColor": "#16835B",
        "mainSeriesProperties.candleStyle.downColor": "#0055FF",
        "mainSeriesProperties.candleStyle.borderUpColor": "#16835B",
        "mainSeriesProperties.candleStyle.borderDownColor": "#0055FF",
        "mainSeriesProperties.candleStyle.wickUpColor": "#16835B",
        "mainSeriesProperties.candleStyle.wickDownColor": "#0055FF",
      }
    };

    const tvWidget = new window.TradingView.widget(widgetOptions);
    tvWidgetRef.current = tvWidget;

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [symbol, isLibraryReady, isDarkTheme, timeframe]);

  return (
    <>
      <Script 
        src="/charting_library/charting_library.js" 
        onLoad={() => setIsLibraryReady(true)}
      />
      <div className="w-full h-full relative flex flex-col bg-white">
        <div ref={containerRef} className="flex-grow w-full h-full" />
        
        {!isLibraryReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Initializing Advanced Engine</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
