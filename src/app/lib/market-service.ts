
/**
 * @fileOverview Institutional Market Data Abstraction Layer.
 * Unified interface for Multi-Provider Price Aggregation via secure proxy.
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
}

export interface HistoricalBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TechnicalIndicatorPoint {
  time: number;
  value: number;
}

const PROXY_URL = "/api/market-data";

/**
 * Fetches real-time market results with multi-provider failover.
 * Priority: Coinbase CDP -> Twelve Data -> Binance -> Finnhub
 */
export const fetchLivePrice = async (symbol: string): Promise<PriceSnapshot> => {
  try {
    const res = await fetch(`${PROXY_URL}?type=quote&symbol=${symbol}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.warn("Real-time quote failed, falling back to history:", error);
    const history = await fetchHistoricalData(symbol);
    if (history.length === 0) throw new Error("Market data unreachable");
    const latest = history[history.length - 1];
    const prev = history[history.length - 2] || latest;
    return {
      price: latest.close,
      change: latest.close - prev.close,
      changePercent: ((latest.close - prev.close) / prev.close) * 100,
      open: latest.open,
      high: latest.high,
      low: latest.low,
      volume: latest.volume || 0,
      status: 'Open',
      timestamp: Date.now()
    };
  }
};

export const fetchHistoricalData = async (symbol: string, interval: string = "1min"): Promise<HistoricalBar[]> => {
  try {
    // Interval mapping for Twelve Data / Finnhub
    const mappedInterval = interval === '1D' ? '1day' : interval.replace('m', 'min');
    const res = await fetch(`${PROXY_URL}?type=time_series&symbol=${symbol}&interval=${mappedInterval}&outputsize=300`);
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error("Historical data fetch failed:", e);
    return [];
  }
};

export const fetchTechnicalIndicator = async (indicator: string, symbol: string, interval: string, timePeriod: number): Promise<TechnicalIndicatorPoint[]> => {
  try {
    const mappedInterval = interval === '1D' ? '1day' : interval.replace('m', 'min');
    const res = await fetch(`${PROXY_URL}?type=indicator&indicator=${indicator.toLowerCase()}&symbol=${symbol}&interval=${mappedInterval}&time_period=${timePeriod}&outputsize=300`);
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error(`Technical indicator ${indicator} fetch failed:`, e);
    return [];
  }
};
