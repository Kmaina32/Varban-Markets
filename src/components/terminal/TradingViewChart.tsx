'use client';

/**
 * @fileOverview Institutional TradingView Advanced Charting Library Integration.
 * Optimized for performance by reusing the widget instance and using setSymbol for transitions.
 */

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { fetchHistoricalData } from '@/app/lib/market-service';
import { useUser } from '@/firebase';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  isDarkTheme?: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  isDarkTheme = false
}) => {
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<any>(null);
  const [isLibraryReady, setIsLibraryReady] = useState(false);

  // Check if library is already loaded on mount (handles navigation back/forth)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.TradingView) {
      setIsLibraryReady(true);
    }
  }, []);

  // Handle Symbol changes separately to avoid re-initializing the whole engine
  useEffect(() => {
    if (tvWidgetRef.current && isLibraryReady) {
      try {
        // Use the native setSymbol method for near-instant transitions
        tvWidgetRef.current.setSymbol(symbol, '5', () => {
          // Symbol change complete
        });
      } catch (e) {
        console.warn("TradingView setSymbol failed, falling back to full init.");
      }
    }
  }, [symbol, isLibraryReady]);

  useEffect(() => {
    // Only initialize the widget if it doesn't already exist
    if (!isLibraryReady || !containerRef.current || !window.TradingView || tvWidgetRef.current) return;

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
      subscribeBars: (symbolInfo: any, resolution: string, onRealtimeCallback: any, subscribeUID: string, onResetCacheNeededCallback: any) => {},
      unsubscribeBars: (subscriberUID: string) => {}
    };

    const widgetOptions = {
      symbol: symbol,
      datafeed: datafeed,
      interval: '5' as any,
      container: containerRef.current,
      library_path: '/charting_library/',
      locale: 'en',
      debug: false, // Performance: Disabled debug for production-like execution
      disabled_features: [
        'use_localstorage_for_settings_save',
        'header_symbol_search',
        'symbol_info',
        'display_market_status'
      ],
      enabled_features: [
        'study_templates', 
        'snapshot_trading_drawings', 
        'side_toolbar', 
        'header_widget', 
        'header_indicators', 
        'header_chart_type', 
        'header_resolutions',
        'header_undo_redo',
        'header_saveload'
      ],
      client_id: 'varbanmarkets.com',
      user_id: user?.uid || 'public_user',
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

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        // Add SMA Toggle Button to Header
        const smaBtn = tvWidget.createButton();
        smaBtn.setAttribute('title', 'Simple Moving Average');
        smaBtn.textContent = 'SMA';
        smaBtn.classList.add('apply-common-tooltip');
        smaBtn.addEventListener('click', () => {
          tvWidget.activeChart().createStudy('Moving Average', false, false, [9], { "Plot.color": "#0055FF" });
        });

        // Add EMA Toggle Button to Header
        const emaBtn = tvWidget.createButton();
        emaBtn.setAttribute('title', 'Exponential Moving Average');
        emaBtn.textContent = 'EMA';
        emaBtn.classList.add('apply-common-tooltip');
        emaBtn.addEventListener('click', () => {
          tvWidget.activeChart().createStudy('Moving Average Exponential', false, false, [9], { "Plot.color": "#16835B" });
        });
      });
    });

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [isLibraryReady, isDarkTheme, user]); // Dependency array no longer triggers on symbol change

  return (
    <>
      <Script 
        src="/charting_library/charting_library.js" 
        strategy="afterInteractive"
        onLoad={() => setIsLibraryReady(true)}
      />
      <div className="w-full h-full relative flex flex-col bg-white">
        <div ref={containerRef} className="flex-grow w-full h-full" />
        
        {!isLibraryReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-20 animate-in fade-in duration-500">
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