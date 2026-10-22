/**
 * @fileOverview Institutional Market Data Abstraction Layer (V2).
 * Unified interface for Multi-Provider Price Aggregation.
 * Strictly adheres to $0 fee strategy using public feeds.
 */

export interface PriceSnapshot {
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  status: 'Open' | 'Closed' | 'Unavailable';
  timestamp: number;
  provider: string;
  delay: number; // in seconds
}

export interface HistoricalBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const PROXY_URL = "/api/market-data";

/**
 * Normalizes different API responses into the Varban Institutional Format.
 */
export const fetchLivePrice = async (symbol: string): Promise<PriceSnapshot> => {
  try {
    const res = await fetch(`${PROXY_URL}?type=quote&symbol=${symbol}`);
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    
    const json = await res.json();
    if (!json || json.error) throw new Error(json.error || "Data node mismatch");

    return {
      ...json.data,
      provider: json.provider || "Aggregated Feed",
      delay: json.delay || 0
    };
  } catch (error: any) {
    console.warn(`[MarketData] Connection failure for ${symbol}:`, error.message);
    return {
      price: 0,
      change: 0,
      changePercent: 0,
      open: 0,
      high: 0,
      low: 0,
      volume: 0,
      status: 'Unavailable',
      timestamp: Date.now(),
      provider: "None",
      delay: 0
    };
  }
};

/**
 * Fetches historical OHLC data bars for charting using Twelve Data or Alpha Vantage.
 */
export const fetchHistoricalData = async (symbol: string, interval: string = "1min"): Promise<HistoricalBar[]> => {
  try {
    const mappedInterval = interval === '1D' ? '1day' : interval.replace('m', 'min');
    const res = await fetch(`${PROXY_URL}?type=time_series&symbol=${symbol}&interval=${mappedInterval}&outputsize=300`);
    
    if (!res.ok) return [];
    
    const json = await res.json();
    if (json && Array.isArray(json.data)) {
      return json.data;
    }
    
    return [];
  } catch (e) {
    console.error("[MarketData] History sync failure:", e);
    return [];
  }
};

/**
 * Normalizes symbols for specific providers.
 */
export function getProviderSymbol(symbol: string, provider: 'binance' | 'twelve' | 'alphavantage'): string {
  const clean = symbol.replace('/', '');
  switch (provider) {
    case 'binance':
      // Map USD to USDT for Binance public feeds
      return clean.replace('USD', 'USDT');
    case 'twelve':
      return symbol.includes('/') ? symbol : `${symbol.substring(0, 3)}/${symbol.substring(3)}`;
    default:
      return clean;
  }
}
