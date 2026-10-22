'use client';

/**
 * @fileOverview Advanced Market Screener Component.
 * Supports Crypto and Forex screening with technical indicators.
 */

import React from 'react';
import TradingViewBase from './TradingViewBase';

export default function MarketScreener() {
  const config = {
    "width": "100%",
    "height": "100%",
    "defaultColumn": "overview",
    "screener_type": "crypto_mkt",
    "displayCurrency": "USD",
    "colorTheme": "light",
    "locale": "en"
  };

  return (
    <div className="h-full w-full bg-white border border-[#E4E4E4] shadow-sm">
      <TradingViewBase widgetName="screener" config={config} className="h-full w-full" />
    </div>
  );
}
