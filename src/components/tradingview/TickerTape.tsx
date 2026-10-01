
'use client';

import React from 'react';
import TradingViewBase from './TradingViewBase';

export default function TradingViewTickerTape() {
  const config = {
    symbols: [
      { proName: "FX:EURUSD", title: "EUR/USD" },
      { proName: "FX:GBPUSD", title: "GBP/USD" },
      { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" },
      { proName: "BITSTAMP:ETHUSD", title: "ETH/USD" },
      { proName: "OANDA:XAUUSD", title: "Gold" },
      { proName: "NASDAQ:AAPL", title: "Apple" },
      { proName: "NASDAQ:NVDA", title: "Nvidia" }
    ],
    showSymbolLogo: true,
    isTransparent: false,
    displayMode: "adaptive",
    colorTheme: "light",
    locale: "en"
  };

  return <TradingViewBase widgetName="ticker-tape" config={config} className="h-[46px] w-full" />;
}
