import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Market Data Proxy with Multi-Provider Auto-Switching.
 * Logic: Twelve Data -> Binance (Crypto Only) -> Alpha Vantage -> Finnhub (Fail-safe).
 * 
 * Auto-Switching Principle: Each fetch function returns null or an error object if 
 * rate-limited or unreachable. The GET handler catches these and cycles to the next.
 */

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
// Provided key used as default if environment variable is missing
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "daqjp7pr01qott5g8tg0daqjp7pr01qott5g8tgg";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds cache to preserve limits

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

  // Provider Chain Iteration
  
  // 1. Try Primary: Twelve Data
  if (TWELVE_DATA_KEY) {
    const result = await fetchTwelveData(symbol, type, interval);
    if (result && !result.error) {
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return NextResponse.json(result);
    }
  }

  // 2. Crypto Specialization: Binance Public (Zero Key Required)
  const isCrypto = symbol.includes('/') || ['BTC', 'ETH', 'SOL', 'XRP'].some(s => symbol.startsWith(s));
  if (isCrypto) {
    const cryptoResult = await fetchBinanceFallback(symbol);
    if (cryptoResult) {
      const formatted = { data: cryptoResult };
      cache.set(cacheKey, { data: formatted, timestamp: Date.now() });
      return NextResponse.json(formatted);
    }
  }

  // 3. Fallback for Stocks/Forex: Alpha Vantage
  if (ALPHA_VANTAGE_KEY) {
    const avResult = await fetchAlphaVantage(symbol, type);
    if (avResult) {
      const formatted = { data: avResult };
      cache.set(cacheKey, { data: formatted, timestamp: Date.now() });
      return NextResponse.json(formatted);
    }
  }

  // 4. Final Fail-Safe: Finnhub (Using provided key)
  if (FINNHUB_KEY) {
    const fhResult = await fetchFinnhubData(symbol, type, interval);
    if (fhResult && !fhResult.error) {
      cache.set(cacheKey, { data: fhResult, timestamp: Date.now() });
      return NextResponse.json(fhResult);
    }
  }

  return NextResponse.json({ 
    error: 'Market data providers unavailable or rate limited', 
    status: 503 
  }, { status: 503 });
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
  } catch (e) {
    return null;
  }
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
  } catch (e) {
    return null;
  }
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
  } catch (e) {
    return null;
  }
}

async function fetchFinnhubData(symbol: string, type: string, interval: string) {
  try {
    // Map symbols to Finnhub requirements
    let cleanSymbol = symbol.replace('/', '');
    if (isCryptoSymbol(symbol)) {
      cleanSymbol = `BINANCE:${symbol.replace('/', '').replace('USD', 'USDT')}`;
    }

    const baseUrl = "https://finnhub.io/api/v1";
    
    if (type === 'quote') {
      const res = await fetch(`${baseUrl}/quote?symbol=${cleanSymbol}&token=${FINNHUB_KEY}`);
      const data = await res.json();
      
      // Error checks for Finnhub
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

    // Time-series / Candlestick logic
    const resolutionMapping: Record<string, string> = {
      '1min': '1', '5min': '5', '15min': '15', '30min': '30', '1h': '60', '1day': 'D'
    };
    const resolution = resolutionMapping[interval.replace('m', 'min')] || '5';
    
    const to = Math.floor(Date.now() / 1000);
    const lookback = getLookbackSeconds(interval);
    const from = to - lookback;
    
    const res = await fetch(`${baseUrl}/stock/candle?symbol=${cleanSymbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`);
    const data = await res.json();
    
    if (data.s !== 'ok' || !data.t) return { error: true };

    return {
      data: data.t.map((time: number, i: number) => ({
        time,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i]
      }))
    };
  } catch (e) {
    return null;
  }
}

function isCryptoSymbol(symbol: string) {
  return symbol.includes('/') || ['BTC', 'ETH', 'SOL', 'XRP'].some(s => symbol.startsWith(s));
}

function getLookbackSeconds(interval: string) {
  const mins = 300; // Number of bars to return
  if (interval.includes('day')) return mins * 24 * 60 * 60;
  if (interval.includes('h')) return mins * 60 * 60;
  const num = parseInt(interval) || 1;
  return mins * num * 60;
}
