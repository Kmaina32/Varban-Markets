import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Market Data Proxy with Multi-Provider Failover.
 * Normalizes responses from $0 fee sources: Binance, Twelve Data, Alpha Vantage.
 */

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'time_series';
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1min';

  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 });

  const isCrypto = symbol.includes('/') || ['BTC', 'ETH', 'SOL', 'XRP'].some(s => symbol.startsWith(s));

  // 1. CRYPTO: Try Binance Public API (Public, No Key)
  if (isCrypto) {
    const binanceData = await fetchBinanceData(symbol, type, interval);
    if (binanceData) return NextResponse.json(binanceData);
  }

  // 2. FOREX/STOCKS: Try Twelve Data (Key required, Free Tier supports FX)
  if (TWELVE_DATA_KEY && (symbol.includes('/') || symbol.length >= 4)) {
    const twelveData = await fetchTwelveData(symbol, type, interval);
    if (twelveData) return NextResponse.json(twelveData);
  }

  // 3. COMMODITIES/FALLBACK: Try Alpha Vantage
  if (ALPHA_VANTAGE_KEY) {
    const alphaData = await fetchAlphaVantageData(symbol, type, interval);
    if (alphaData) return NextResponse.json(alphaData);
  }

  return NextResponse.json({ 
    error: 'Execution nodes currently restricted or unreachable', 
    status: 503 
  }, { status: 503 });
}

async function fetchBinanceData(symbol: string, type: string, interval: string) {
  try {
    const cleanSymbol = symbol.replace('/', '').replace('USD', 'USDT');
    
    if (type === 'quote') {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`);
      if (!res.ok) return null;
      const d = await res.json();
      return {
        provider: "Binance Public",
        data: {
          price: parseFloat(d.lastPrice),
          change: parseFloat(d.priceChange),
          changePercent: parseFloat(d.priceChangePercent),
          open: parseFloat(d.openPrice),
          high: parseFloat(d.highPrice),
          low: parseFloat(d.lowPrice),
          volume: parseFloat(d.volume),
          status: 'Open',
          timestamp: d.closeTime
        }
      };
    }

    // Historical K-Lines
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${interval === '1day' ? '1d' : interval}&limit=300`);
    if (!res.ok) return null;
    const d = await res.json();
    return {
      provider: "Binance Public",
      data: d.map((k: any) => ({
        time: k[0] / 1000,
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }))
    };
  } catch (e) { return null; }
}

async function fetchTwelveData(symbol: string, type: string, interval: string) {
  try {
    const endpoint = type === 'quote' ? 'quote' : 'time_series';
    const url = `https://api.twelvedata.com/${endpoint}?symbol=${symbol}&interval=${interval}&apikey=${TWELVE_DATA_KEY}&order=asc&outputsize=300`;
    const res = await fetch(url);
    const d = await res.json();
    
    if (d.status === 'error') return null;

    if (type === 'quote') {
      return {
        provider: "Twelve Data",
        data: {
          price: parseFloat(d.price || d.close),
          change: parseFloat(d.change || "0"),
          changePercent: parseFloat(d.percent_change || "0"),
          open: parseFloat(d.open),
          high: parseFloat(d.high),
          low: parseFloat(d.low),
          volume: parseFloat(d.volume || "0"),
          status: 'Open',
          timestamp: Date.now()
        }
      };
    }

    return {
      provider: "Twelve Data",
      data: (d.values || []).map((v: any) => ({
        time: new Date(v.datetime).getTime() / 1000,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close)
      }))
    };
  } catch (e) { return null; }
}

async function fetchAlphaVantageData(symbol: string, type: string, interval: string) {
  // Alpha Vantage implementation for commodities like GOLD (XAU)
  if (!symbol.startsWith('XAU') && !symbol.startsWith('WTI')) return null;
  
  try {
    const func = symbol.startsWith('XAU') ? 'GLOBAL_QUOTE' : 'WTI';
    const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    const res = await fetch(url);
    const d = await res.json();
    
    if (d.Note) return null; // Rate limited

    return {
      provider: "Alpha Vantage",
      data: {
        price: parseFloat(d['Global Quote']?.['05. price'] || "0"),
        status: 'Open',
        timestamp: Date.now()
      }
    };
  } catch (e) { return null; }
}
