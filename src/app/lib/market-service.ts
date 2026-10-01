
/**
 * @fileOverview Institutional Market Data Abstraction Layer.
 * Unified interface for Multi-Provider Price Aggregation via secure proxy.
 * Hardened to prevent JSON parsing errors on empty or malformed responses.
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

const PROXY_URL = "/api/market-data";

/**
 * Helper to safely fetch and parse JSON from the proxy.
 * Prevents "Unexpected end of JSON input" by checking res.ok and body content using text() first.
 */
async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Node Request Failed: ${url} returned ${res.status}`);
      return null;
    }
    const text = await res.text();
    if (!text || text.trim() === "" || text.trim() === "null") {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error(`JSON Parse Error at ${url}:`, parseError, "Response head:", text.substring(0, 50));
      return null;
    }
  } catch (e) {
    console.error(`Fetch Failure at ${url}:`, e);
    return null;
  }
}

/**
 * Fetches real-time market results with multi-provider failover.
 */
export const fetchLivePrice = async (symbol: string): Promise<PriceSnapshot> => {
  try {
    const json = await safeFetchJson(`${PROXY_URL}?type=quote&symbol=${symbol}`);
    if (!json || json.error || !json.data) {
      throw new Error(json?.error || "Missing data payload");
    }
    return json.data;
  } catch (error) {
    // Fallback to historical estimation to maintain UI stability
    try {
      const history = await fetchHistoricalData(symbol);
      if (!history || history.length === 0) throw new Error("Market data unreachable");
      const latest = history[history.length - 1];
      const prev = history[history.length - 2] || latest;
      return {
        price: latest.close,
        change: latest.close - prev.close,
        changePercent: prev.close !== 0 ? ((latest.close - prev.close) / prev.close) * 100 : 0,
        open: latest.open,
        high: latest.high,
        low: latest.low,
        volume: latest.volume || 0,
        status: 'Open',
        timestamp: Date.now()
      };
    } catch (fallbackError) {
      throw new Error("Market data node unreachable");
    }
  }
};

/**
 * Fetches historical OHLC data bars for charting.
 */
export const fetchHistoricalData = async (symbol: string, interval: string = "1min"): Promise<HistoricalBar[]> => {
  try {
    const mappedInterval = interval === '1D' ? '1day' : interval.replace('m', 'min');
    const json = await safeFetchJson(`${PROXY_URL}?type=time_series&symbol=${symbol}&interval=${mappedInterval}&outputsize=300`);
    return (json && json.data) ? json.data : [];
  } catch (e) {
    console.error("Historical data node failure:", e instanceof Error ? e.message : String(e));
    return [];
  }
};
