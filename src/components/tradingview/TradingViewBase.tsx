
'use client';

/**
 * @fileOverview Reusable Base Loader for TradingView Widgets.
 * Ensures scripts are loaded only once and cleaned up on unmount.
 */

import React, { useEffect, useRef } from 'react';

interface TradingViewBaseProps {
  widgetName: string;
  config: any;
  className?: string;
}

export default function TradingViewBase({ widgetName, config, className }: TradingViewBaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = `https://s3.tradingview.com/external-embedding/embed-widget-${widgetName}.js`;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      ...config,
      width: "100%",
      height: "100%",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [widgetName, JSON.stringify(config)]);

  return (
    <div className={className} ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
