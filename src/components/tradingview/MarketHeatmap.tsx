'use client';

/**
 * @fileOverview Institutional Market Heatmap Component.
 * Visualizes sector performance across Crypto and Forex domains.
 */

import React from 'react';
import TradingViewBase from './TradingViewBase';

interface MarketHeatmapProps {
  type: 'crypto' | 'forex';
}

export default function MarketHeatmap({ type }: MarketHeatmapProps) {
  const config = type === 'crypto' ? {
    "dataSource": "Crypto",
    "symbol": "BITSTAMP:BTCUSD",
    "colorTheme": "light",
    "hasTopBar": true,
    "isDataSetEnabled": true,
    "isZoomEnabled": true,
    "hasSymbolTooltip": true,
    "width": "100%",
    "height": "100%"
  } : {
    "symbol": "FX:EURUSD",
    "colorTheme": "light",
    "isDataSetEnabled": true,
    "isZoomEnabled": true,
    "hasSymbolTooltip": true,
    "width": "100%",
    "height": "100%",
    "currencies": ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"]
  };

  const widgetName = type === 'crypto' ? 'crypto-coins-heatmap' : 'forex-cross-rates';

  return (
    <div className="h-full w-full bg-white border border-[#E4E4E4] shadow-sm overflow-hidden">
      <TradingViewBase widgetName={widgetName} config={config} className="h-full w-full" />
    </div>
  );
}
