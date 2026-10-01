
'use client';

import React from 'react';
import TradingViewBase from './TradingViewBase';
import { getTVSymbol } from '@/app/lib/tradingview-symbols';

interface TechnicalAnalysisProps {
  symbol: string;
}

export default function TradingViewTechnicalAnalysis({ symbol }: TechnicalAnalysisProps) {
  const config = {
    interval: "1m",
    width: "100%",
    isTransparent: false,
    height: "100%",
    symbol: getTVSymbol(symbol),
    showIntervalTabs: true,
    displayMode: "single",
    locale: "en",
    colorTheme: "light"
  };

  return (
    <div className="h-[450px] w-full bg-white border border-[#E4E4E4] shadow-sm">
      <TradingViewBase widgetName="technical-analysis" config={config} className="h-full w-full" />
    </div>
  );
}
