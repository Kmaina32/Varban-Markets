'use client';

/**
 * @fileOverview Institutional Economic Calendar.
 * Tracks global central bank announcements and macroeconomic events.
 */

import React from 'react';
import TradingViewBase from './TradingViewBase';

export default function EconomicCalendar() {
  const config = {
    "colorTheme": "light",
    "isTransparent": false,
    "width": "100%",
    "height": "100%",
    "locale": "en",
    "importanceFilter": "-1,0,1",
    "countryFilter": "us,eu,it,fr,es,de,gb,jp,au,ca,ch,cn"
  };

  return (
    <div className="h-full w-full bg-white border border-[#E4E4E4] shadow-sm">
      <TradingViewBase widgetName="events" config={config} className="h-full w-full" />
    </div>
  );
}
