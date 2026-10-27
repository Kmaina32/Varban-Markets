'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, LineStyle, CrosshairMode } from 'lightweight-charts';
import { Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import type { Tick } from '@/app/lib/synthetic/use-synthetic-feed';
import type { DerivedContract } from '@/app/lib/synthetic/contracts';
import { CONTRACT_LABELS } from '@/app/lib/synthetic/engine';

interface Props {
  symbol: string;
  ticks: Tick[];
  tickMs: number;
  openContracts: DerivedContract[];
  error?: string | null;
}

type View = 'line' | 'c5' | 'c15' | 'c60';
const VIEWS: { id: View; label: string; seconds: number }[] = [
  { id: 'line', label: 'Ticks', seconds: 0 },
  { id: 'c5', label: '5s', seconds: 5 },
  { id: 'c15', label: '15s', seconds: 15 },
  { id: 'c60', label: '1m', seconds: 60 },
];

/** Live chart for our own indices. The time axis is the tick number, shown as a clock time. */
export default function SyntheticChart({ symbol, ticks, tickMs, openContracts, error }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<'Line'> | ISeriesApi<'Candlestick'> | null>(null);
  const lines = useRef<any[]>([]);
  const [view, setView] = useState<View>('line');

  const fmt = useMemo(() => (t: number) => new Date(t * tickMs).toLocaleTimeString([], { hour12: false }), [tickMs]);

  // Build the chart once per view.
  useEffect(() => {
    if (!host.current) return;
    const c = createChart(host.current, {
      autoSize: true,
      layout: { background: { color: '#FFFFFF' }, textColor: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: 11 },
      grid: { vertLines: { color: '#F2F2F0' }, horzLines: { color: '#F2F2F0' } },
      rightPriceScale: { borderColor: '#E4E4E4' },
      timeScale: {
        borderColor: '#E4E4E4',
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 6,
        tickMarkFormatter: (t: any) => fmt(Number(t)),
      },
      localization: { timeFormatter: (t: any) => fmt(Number(t)) },
      crosshair: { mode: CrosshairMode.Normal },
    });
    chart.current = c;
    series.current = view === 'line'
      ? c.addLineSeries({ color: '#0055FF', lineWidth: 2, priceLineVisible: true, lastValueVisible: true })
      : c.addCandlestickSeries({ upColor: '#16835B', downColor: '#C43D3D', borderVisible: false, wickUpColor: '#16835B', wickDownColor: '#C43D3D' });
    lines.current = [];
    return () => { c.remove(); chart.current = null; series.current = null; };
  }, [view, fmt]);

  // Feed the data.
  useEffect(() => {
    const s = series.current;
    if (!s || !ticks.length) return;
    if (view === 'line') {
      (s as ISeriesApi<'Line'>).setData(ticks.map((x) => ({ time: x.t as UTCTimestamp, value: x.p })));
    } else {
      const per = Math.max(1, Math.round((VIEWS.find((v) => v.id === view)!.seconds * 1000) / tickMs));
      const bars: any[] = [];
      for (const x of ticks) {
        const b = Math.floor(x.t / per) * per;
        const last = bars[bars.length - 1];
        if (last && last.time === b) {
          last.high = Math.max(last.high, x.p);
          last.low = Math.min(last.low, x.p);
          last.close = x.p;
        } else bars.push({ time: b as UTCTimestamp, open: x.p, high: x.p, low: x.p, close: x.p });
      }
      (s as ISeriesApi<'Candlestick'>).setData(bars);
    }
  }, [ticks, view, tickMs]);

  // Entry-price lines for contracts that are still running.
  useEffect(() => {
    const s = series.current;
    if (!s) return;
    lines.current.forEach((l) => { try { s.removePriceLine(l); } catch {} });
    lines.current = openContracts.map((c) =>
      s.createPriceLine({
        price: c.entryPrice,
        color: c.type === 'FALL' || c.type === 'ODD' || c.type === 'UNDER' || c.type === 'DIFFER' ? '#C43D3D' : '#16835B',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: CONTRACT_LABELS[c.type],
      })
    );
  }, [openContracts, view, ticks.length === 0]);

  return (
    <div className="relative w-full h-full bg-white flex flex-col">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#E4E4E4] shrink-0">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={cn(
              'px-3 py-1 text-[11px] font-bold border transition-colors',
              view === v.id ? 'bg-[#0055FF] text-white border-[#0055FF]' : 'bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF]'
            )}
          >
            {v.label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[#6B7280] hidden sm:block">{symbol} · new price every {tickMs / 1000}s</span>
      </div>
      <div className="relative flex-1 min-h-0">
        <div ref={host} className="absolute inset-0" />
        {!ticks.length && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-2 text-center px-6">
            {error ? (
              <p className="text-sm text-[#C43D3D] font-bold max-w-xs">{error}</p>
            ) : (
              <>
                <Loader2 className="w-6 h-6 text-[#0055FF] animate-spin" />
                <p className="text-sm text-[#6B7280]">Loading the latest prices…</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
