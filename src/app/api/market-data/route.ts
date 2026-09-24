import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Market Data Proxy with Caching for Twelve Data.
 * Handles server-side requests for time series, quotes, and technical indicators.
 */

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = "https://api.twelvedata.com";

// Simple in-memory cache for production prototype
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15000; // 15 seconds cache

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'time_series';
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1min';
  const outputsize = searchParams.get('outputsize') || '300';
  const indicator = searchParams.get('indicator'); // Specific technical indicator e.g. ema, sma
  const timePeriod = searchParams.get('time_period');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  if (!TWELVE_DATA_KEY) {
    return NextResponse.json({ error: 'Market data provider key not configured' }, { status: 500 });
  }

  // Construct cache key based on all identifying params
  const cacheKey = `${type}-${symbol}-${interval}-${outputsize}-${indicator || ''}-${timePeriod || ''}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // Normalize symbol for Twelve Data
  // We handle both format styles: BTC/USD and BTCUSD
  let providerSymbol = symbol;
  
  // If it's a 6-char alpha string without a slash, it's likely a forex/crypto pair
  if (symbol.length === 6 && !symbol.includes('/') && /^[A-Z]+$/.test(symbol)) {
    providerSymbol = `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;
  }

  const params = new URLSearchParams({
    symbol: providerSymbol,
    interval: interval,
    outputsize: outputsize,
    apikey: TWELVE_DATA_KEY,
    order: 'asc'
  });

  if (timePeriod) params.append('time_period', timePeriod);
  if (type === 'indicator') params.append('series_type', 'close');

  try {
    // Determine endpoint based on type
    let endpoint = 'time_series';
    if (type === 'quote') {
      endpoint = 'quote';
    } else if (type === 'indicator' && indicator) {
      endpoint = indicator.toLowerCase();
    } else if (type === 'price') {
      endpoint = 'price';
    } else if (type === 'eod') {
      endpoint = 'eod';
    }

    const response = await fetch(`${BASE_URL}/${endpoint}?${params.toString()}`);
    const data = await response.json();

    if (data.status === 'error' || data.code === 429) {
      return NextResponse.json({ error: data.message || 'Provider Rate Limit reached' }, { status: 429 });
    }

    let result;

    if (type === 'quote') {
      result = {
        data: {
          price: parseFloat(data.price || data.close || "0"),
          change: parseFloat(data.change || "0"),
          changePercent: parseFloat(data.percent_change || "0"),
          open: parseFloat(data.open || "0"),
          high: parseFloat(data.high || "0"),
          low: parseFloat(data.low || "0"),
          volume: parseFloat(data.volume || "0"),
          status: 'Open',
          timestamp: Date.now()
        }
      };
    } else if (type === 'indicator') {
      // Indicator response usually has a key matching the indicator name in lowercase
      const key = indicator!.toLowerCase();
      const points = (data.values || []).map((v: any) => ({
        time: new Date(v.datetime).getTime() / 1000,
        value: parseFloat(v[key])
      }));
      result = { data: points };
    } else if (type === 'price') {
      result = { data: { price: parseFloat(data.price || "0") } };
    } else if (type === 'eod') {
      result = { data: { close: parseFloat(data.close || "0"), datetime: data.datetime } };
    } else {
      const bars = (data.values || []).map((v: any) => ({
        time: new Date(v.datetime).getTime() / 1000,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume || "0")
      }));
      result = { data: bars };
    }

    if (result.data || type === 'quote') {
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Signal Failure' }, { status: 500 });
  }
}
