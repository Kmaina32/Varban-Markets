import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Market Data Proxy with Caching.
 * Handles server-side requests to Twelve Data and implements a basic cache 
 * to prevent rate-limit exhaustion on basic API plans.
 */

const TWELVE_DATA_KEY = "a05d6e793a2341b59ca2fbc7e6098d79";
const BASE_URL = "https://api.twelvedata.com";

// Simple in-memory cache for production prototype
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds cache for quotes and series

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'time_series';
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1min';
  const outputsize = searchParams.get('outputsize') || '300';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const cacheKey = `${type}-${symbol}-${interval}-${outputsize}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // Normalize symbol for Twelve Data (e.g. BTCUSD -> BTC/USD)
  let providerSymbol = symbol;
  const cryptoForexSymbols = ["BTCUSD", "ETHUSD", "EURUSD", "GBPUSD", "USDJPY", "XAUUSD"];
  if (cryptoForexSymbols.includes(symbol) || (symbol.length === 6 && !symbol.includes('/'))) {
    providerSymbol = `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;
  }

  const params = new URLSearchParams({
    symbol: providerSymbol,
    interval: interval,
    outputsize: outputsize,
    apikey: TWELVE_DATA_KEY,
    order: 'asc'
  });

  try {
    const endpoint = type === 'quote' ? 'quote' : 'time_series';
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

    if (result.data) {
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Signal Failure' }, { status: 500 });
  }
}
