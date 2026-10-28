'use client';

/**
 * @fileOverview Chart for forex, CFDs and crypto.
 * Uses the TradingView widget. If TradingView is slow or blocked it never leaves the page
 * stuck on a spinner: after a short wait it shows our own simple chart built from our price
 * data, with a Retry button for the full chart.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createChart, UTCTimestamp, CrosshairMode } from 'lightweight-charts';
import { getTVSymbol } from '@/app/lib/tradingview-symbols';
import { fetchHistoricalData } from '@/app/lib/market-service';
import { Loader2, RefreshCw } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
}

const TV_SRC = 'https://s3.tradingview.com/tv.js';
const GIVE_UP_MS = 10000;

let scriptPromise: Promise<void> | null = null;

/** One shared load of tv.js, however many times the chart mounts. Resolves when window.TradingView exists. */
function loadTradingView(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if ((window as any).TradingView) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = TV_SRC;
    s.async = true;
    s.onload = () => ((window as any).TradingView ? resolve() : reject(new Error('missing')));
    s.onerror = () => { scriptPromise = null; s.remove(); reject(new Error('blocked')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** Our own candles, used only when the TradingView widget cannot load. */
function FallbackChart({ symbol, onRetry }: { symbol: string; onRetry: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'empty'>('loading');

  useEffect(() => {
    let cancelled = false;
    if (!host.current) return;
    const chart = createChart(host.current, {
      autoSize: true,
      layout: { background: { color: '#FFFFFF' }, textColor: '#6B7280', fontSize: 11 },
      grid: { vertLines: { color: '#F2F2F0' }, horzLines: { color: '#F2F2F0' } },
      rightPriceScale: { borderColor: '#E4E4E4' },
      timeScale: { borderColor: '#E4E4E4', timeVisible: true },
      crosshair: { mode: CrosshairMode.Normal },
    });
    const series = chart.addCandlestickSeries({ upColor: '#16835B', downColor: '#C43D3D', borderVisible: false, wickUpColor: '#16835B', wickDownColor: '#C43D3D' });
    const load = async () => {
      const bars = await fetchHistoricalData(symbol, '5m');
      if (cancelled) return;
      const data = bars
        .map((b: any) => ({ time: Math.floor(new Date(b.time).getTime() / 1000) as UTCTimestamp, open: +b.open, high: +b.high, low: +b.low, close: +b.close }))
        .filter((b) => Number.isFinite(b.time) && Number.isFinite(b.open))
        .sort((a, b) => a.time - b.time);
      const unique = data.filter((b, i) => i === 0 || b.time !== data[i - 1].time);
      if (unique.length) { series.setData(unique); setState('ready'); } else setState('empty');
    };
    load();
    const id = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(id); chart.remove(); };
  }, [symbol]);

  return (
    <div className="relative w-full h-full bg-white">
      <div ref={host} className="absolute inset-0" />
      <div className="absolute top-2 left-2 right-2 z-10 flex flex-wrap items-center gap-2 text-xs bg-[#F7F7F5]/95 border border-[#E4E4E4] px-3 py-2">
        <span className="text-[#6B7280] flex-1 min-w-[180px]">The full chart could not load, so this is a simpler one.</span>
        <button onClick={onRetry} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0055FF] text-white font-bold hover:bg-[#0044cc]">
          <RefreshCw className="w-3.5 h-3.5" /> Try full chart again
        </button>
      </div>
      {state !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 px-6 text-center">
          {state === 'loading' ? (
            <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 text-[#0055FF] animate-spin" /><p className="text-sm text-[#6B7280]">Loading prices…</p></div>
          ) : (
            <p className="text-sm text-[#6B7280] max-w-xs">We could not get chart data for {symbol} right now. Check your connection and try again.</p>
          )}
        </div>
      )}
    </div>
  );
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setPhase('loading'); setAttempt((n) => n + 1); }, []);

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    const giveUp = setTimeout(() => { if (!cancelled) setPhase((p) => (p === 'ready' ? p : 'failed')); }, GIVE_UP_MS);

    loadTradingView()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = '';
        const el = document.createElement('div');
        el.id = `tv_chart_${Math.random().toString(36).slice(2)}`;
        el.style.height = '100%';
        containerRef.current.appendChild(el);
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: getTVSymbol(symbol),
          interval: '5',
          timezone: 'Etc/UTC',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          save_image: false,
          container_id: el.id,
          hide_top_toolbar: false,
          withdateranges: true,
          studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies', 'BollingerBands@tv-basicstudies'],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
        });
        // The widget has no "ready" event for this embed, so give it a moment to paint.
        setTimeout(() => { if (!cancelled) { clearTimeout(giveUp); setPhase('ready'); } }, 1200);
      })
      .catch(() => { if (!cancelled) { clearTimeout(giveUp); setPhase('failed'); } });

    return () => {
      cancelled = true;
      clearTimeout(giveUp);
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol, attempt]);

  if (phase === 'failed') {
    return (
      <div className="w-full h-full bg-white overflow-hidden border border-[#E4E4E4]">
        <FallbackChart symbol={symbol} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden border border-[#E4E4E4] shadow-sm relative">
      {phase === 'loading' && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-[#0055FF] animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-[#0A0A0A]">Loading the chart…</p>
            <p className="text-xs text-[#6B7280]">{symbol}</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
};
