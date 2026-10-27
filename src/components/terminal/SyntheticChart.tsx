'use client';

/**
 * @fileOverview Custom Institutional Synthetic Charting Node.
 * Updated to "Institutional White" theme to match the core workspace aesthetic.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, LineStyle } from 'lightweight-charts';
import { Tick } from '@/app/lib/synthetic/use-synthetic-feed';

interface SyntheticChartProps {
  ticks: Tick[];
  loading: boolean;
}

export default function SyntheticChart({ ticks, loading }: SyntheticChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#0A0A0A',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: '#F0F0F0' },
        horzLines: { color: '#F0F0F0' },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#E4E4E4',
        rightOffset: 12,
        barSpacing: 15,
      },
      rightPriceScale: {
        borderColor: '#E4E4E4',
        scaleMargins: { top: 0.1, bottom: 0.1 },
        autoScale: true,
      },
      crosshair: {
        vertLine: {
          color: '#6B7280',
          width: 1,
          style: LineStyle.SparseDotted,
          labelBackgroundColor: '#0A0A0A',
        },
        horzLine: {
          color: '#6B7280',
          width: 1,
          style: LineStyle.SparseDotted,
          labelBackgroundColor: '#0A0A0A',
        },
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#0055FF', // Institutional Blue Line
      lineWidth: 2,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor: '#6B7280',
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ 
          width: containerRef.current.clientWidth, 
          height: containerRef.current.clientHeight 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (lineSeriesRef.current && ticks.length > 0) {
      const data = ticks.map(t => ({
        time: (t.time / 1000) as any,
        value: t.price
      }));
      lineSeriesRef.current.setData(data);
    }
  }, [ticks]);

  return (
    <div className="w-full h-full relative bg-white">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
          <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
