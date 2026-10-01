
'use client';

import React from 'react';
import TradingViewBase from './TradingViewBase';

export default function TradingViewMarketOverview() {
  const config = {
    colorTheme: "light",
    dateRange: "12M",
    showChart: true,
    locale: "en",
    width: "100%",
    height: "100%",
    largeChartByBars: false,
    plotLineColorGrowing: "rgba(41, 98, 255, 1)",
    plotLineColorFalling: "rgba(41, 98, 255, 1)",
    gridLineColor: "rgba(240, 243, 250, 0)",
    scaleFontColor: "rgba(106, 109, 114, 1)",
    belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
    belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
    belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
    belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
    symbolActiveColor: "rgba(41, 98, 255, 0.12)",
    tabs: [
      {
        title: "Forex",
        symbols: [
          { s: "FX:EURUSD", d: "EUR/USD" },
          { s: "FX:GBPUSD", d: "GBP/USD" },
          { s: "FX:USDJPY", d: "USD/JPY" },
          { s: "FX:USDCHF", d: "USD/CHF" },
          { s: "FX:AUDUSD", d: "AUD/USD" },
          { s: "FX:USDCAD", d: "USD/CAD" }
        ]
      },
      {
        title: "Crypto",
        symbols: [
          { s: "BITSTAMP:BTCUSD", d: "BTC/USD" },
          { s: "BITSTAMP:ETHUSD", d: "ETH/USD" },
          { s: "BINANCE:SOLUSD", d: "SOL/USD" },
          { s: "BITSTAMP:XRPUSD", d: "XRP/USD" }
        ]
      }
    ]
  };

  return <TradingViewBase widgetName="market-overview" config={config} className="h-[600px] w-full" />;
}
