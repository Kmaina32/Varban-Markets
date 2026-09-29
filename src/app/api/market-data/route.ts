import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Market Data Proxy with Expanded Multi-Provider Failover.
 * All keys are strictly consumed via environment variables.
 * Includes fallback to fawazahmed0 Currency API for high-speed redundancy.
 */

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const POLYGON_KEY = process.env.POLYGON_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const COINBASE_VERSION = "2022-01-06";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'time_series';
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1min';

  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 });

  const cacheKey = `${type}-${symbol}-${interval}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // 1. Try Coinbase CDP (Institutional High Priority)
  const isMajor = ['BTC', 'ETH', 'SOL', 'EUR', 'GBP'].some(s => symbol.startsWith(s));
  if (isMajor && type === 'quote') {
    const cbResult = await fetchCoinbaseData(symbol);
    if (cbResult) {
      cache.set(cacheKey, { data: cbResult, timestamp: Date.now() });
      return NextResponse.json(cbResult);
    }
  }

  // 2. Try Twelve Data
  if (TWELVE_DATA_KEY) {
    const result = await fetchTwelveData(symbol, type, interval);
    if (result && !result.error) {
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return NextResponse.json(result);
    }
  }

  // 3. Try Polygon.io (Tier-1 Failover)
  if (POLYGON_KEY) {
    const polyResult = await fetchPolygonData(symbol, type);
    if (polyResult && !polyResult.error) {
      cache.set(cacheKey, { data: polyResult, timestamp: Date.now() });
      return NextResponse.json(polyResult);
    }
  }

  // 4. Try Binance Fallback
  const isCrypto = symbol.includes('/') || ['BTC', 'ETH', 'SOL', 'XRP'].some(s => symbol.startsWith(s));
  if (isCrypto) {
    const cryptoResult = await fetchBinanceFallback(symbol);
    if (cryptoResult) {
      const formatted = { data: cryptoResult };
      cache.set(cacheKey, { data: formatted, timestamp: Date.now() });
      return NextResponse.json(formatted);
    }
  }

  // 5. Try Alpha Vantage
  if (ALPHA_VANTAGE_KEY) {
    const avResult = await fetchAlphaVantage(symbol, type);
    if (avResult) {
      const formatted = { data: avResult };
      cache.set(cacheKey, { data: formatted, timestamp: Date.now() });
      return NextResponse.json(formatted);
    }
  }

  // 6. Try Currency API (Free, Fast Fallback for Quotes)
  if (type === 'quote') {
    const currencyResult = await fetchCurrencyApiData(symbol);
    if (currencyResult) {
      const formatted = { data: currencyResult };
      cache.set(cacheKey, { data: formatted, timestamp: Date.now() });
      return NextResponse.json(formatted);
    }
  }

  // 7. Final Fail-Safe: Finnhub
  if (FINNHUB_KEY) {
    const fhResult = await fetchFinnhubData(symbol, type, interval);
    if (fhResult && !fhResult.error) {
      cache.set(cacheKey, { data: fhResult, timestamp: Date.now() });
      return NextResponse.json(fhResult);
    }
  }

  return NextResponse.json({ 
    error: 'Market data providers unavailable', 
    status: 503 
  }, { status: 503 });
}

async function fetchCurrencyApiData(symbol: string) {
  try {
    // Parse base/target from e.g. "EUR/USD" or "EURUSD"
    const parts = symbol.includes('/') ? symbol.split('/') : [symbol.substring(0, 3), symbol.substring(3)];
    const base = parts[0].toLowerCase();
    const target = parts[1]?.toLowerCase() || 'usd';

    // Node Fallback Strategy: JSDelivr -> Cloudflare Pages
    const urls = [
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`,
      `https://latest.currency-api.pages.dev/v1/currencies/${base}.json`
    ];

    let data: any = null;
    for (const url of urls) {
      try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch (e) {
        continue; // Failover to next node
      }
    }

    if (!data || !data[base] || data[base][target] === undefined) return null;

    return {
      price: data[base][target],
      change: 0,
      changePercent: 0,
      open: data[base][target],
      high: data[base][target],
      low: data[base][target],
      volume: 0,
      status: 'Open',
      timestamp: Date.now()
    };
  } catch (e) {
    return null;
  }
}

async function fetchPolygonData(symbol: string, type: string) {
  try {
    const cleanSymbol = symbol.replace('/', '');
    const isCrypto = symbol.includes('/') || ['BTC', 'ETH'].some(s => symbol.startsWith(s));
    const prefix = isCrypto ? 'X:' : 'C:';
    
    if (type === 'quote') {
      const url = `https://api.polygon.io/v2/last/crypto/${prefix}${cleanSymbol}?apiKey=${POLYGON_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status !== 'OK' || !data.last) return { error: true };
      
      return {
        data: {
          price: data.last.price,
          change: 0,
          changePercent: 0,
          timestamp: data.last.timestamp,
          status: 'Open'
        }
      };
    }
    return { error: true };
  } catch (e) {
    return null;
  }
}

async function fetchCoinbaseData(symbol: string) {
  try {
    const baseAsset = symbol.split('/')[0] || symbol.substring(0, 3);
    const url = `https://api.coinbase.com/v2/prices/${baseAsset}-USD/spot`;
    const res = await fetch(url, { headers: { 'CB-VERSION': COINBASE_VERSION } });
    const json = await res.json();
    if (!json.data || !json.data.amount) return null;
    return {
      data: {
        price: parseFloat(json.data.amount),
        change: 0,
        changePercent: 0,
        timestamp: Date.now(),
        status: 'Open'
      }
    };
  } catch (e) { return null; }
}

async function fetchTwelveData(symbol: string, type: string, interval: string) {
  try {
    let providerSymbol = symbol;
    if (symbol.length === 6 && !symbol.includes('/')) {
      providerSymbol = `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;
    }
    const endpoint = type === 'quote' ? 'quote' : 'time_series';
    const url = `https://api.twelvedata.com/${endpoint}?symbol=${providerSymbol}&interval=${interval}&apikey=${TWELVE_DATA_KEY}&order=asc&outputsize=300`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'error' || data.code === 429) return { error: true };
    if (type === 'quote') {
      return {
        data: {
          price: parseFloat(data.price || data.close || "0"),
          change: parseFloat(data.change || "0"),
          changePercent: parseFloat(data.percent_change || "0"),
          timestamp: Date.now(),
          status: 'Open'
        }
      };
    }
    return {
      data: (data.values || []).map((v: any) => ({
        time: new Date(v.datetime).getTime() / 1000,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close)
      }))
    };
  } catch (e) { return null; }
}

async function fetchBinanceFallback(symbol: string) {
  try {
    const cleanSymbol = symbol.replace('/', '').replace('USD', 'USDT');
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`);
    const data = await res.json();
    if (!data.lastPrice) return null;
    return {
      price: parseFloat(data.lastPrice),
      change: parseFloat(data.priceChange),
      changePercent: parseFloat(data.priceChangePercent),
      timestamp: Date.now(),
      status: 'Open'
    };
  } catch (e) { return null; }
}

async function fetchAlphaVantage(symbol: string, type: string) {
  try {
    const isForex = symbol.includes('/') || symbol.length === 6;
    const functionName = isForex ? 'CURRENCY_EXCHANGE_RATE' : 'GLOBAL_QUOTE';
    let url = `https://www.alphavantage.co/query?function=${functionName}&apikey=${ALPHA_VANTAGE_KEY}`;
    if (isForex) {
      const from = symbol.substring(0, 3);
      const to = symbol.includes('/') ? symbol.split('/')[1] : symbol.substring(3, 6);
      url += `&from_currency=${from}&to_currency=${to}`;
    } else {
      url += `&symbol=${symbol}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (isForex && data['Realtime Currency Exchange Rate']) {
      const rate = data['Realtime Currency Exchange Rate'];
      return {
        price: parseFloat(rate['5. Exchange Rate']),
        change: 0,
        changePercent: 0,
        timestamp: Date.now(),
        status: 'Open'
      };
    }
    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        timestamp: Date.now(),
        status: 'Open'
      };
    }
    return null;
  } catch (e) { return null; }
}

async function fetchFinnhubData(symbol: string, type: string, interval: string) {
  try {
    let cleanSymbol = symbol.replace('/', '');
    if (symbol.includes('/') || ['BTC', 'ETH', 'SOL', 'XRP'].some(s => symbol.startsWith(s))) {
      cleanSymbol = `BINANCE:${symbol.replace('/', '').replace('USD', 'USDT')}`;
    }
    const baseUrl = "https://finnhub.io/api/v1";
    if (type === 'quote') {
      const res = await fetch(`${baseUrl}/quote?symbol=${cleanSymbol}&token=${FINNHUB_KEY}`);
      const data = await res.json();
      if (!data.c || data.c === 0) return { error: true };
      return {
        data: {
          price: data.c,
          change: data.d,
          changePercent: data.dp,
          timestamp: (data.t || Date.now() / 1000) * 1000,
          status: 'Open'
        }
      };
    }
    const resMapping: Record<string, string> = { '1min': '1', '5min': '5', '15min': '15', '30min': '30', '1h': '60', '1day': 'D' };
    const resolution = resMapping[interval.replace('m', 'min')] || '5';
    const to = Math.floor(Date.now() / 1000);
    const from = to - (300 * (parseInt(interval) || 1) * 60);
    const res = await fetch(`${baseUrl}/stock/candle?symbol=${cleanSymbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    if (data.s !== 'ok' || !data.t) return { error: true };
    return {
      data: data.t.map((time: number, i: number) => ({ time, open: data.o[i], high: data.h[i], low: data.l[i], close: data.c[i] }))
    };
  } catch (e) { return null; }
}