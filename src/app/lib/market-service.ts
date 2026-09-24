/**
 * @fileOverview Institutional Market Data Abstraction Layer.
 * Integrated with Alpha Vantage API for professional equities, forex, crypto, and technical indicators.
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

interface MarketDataProvider {
  getLivePrice(symbol: string): Promise<PriceSnapshot>;
  getHistoricalBars(symbol: string): Promise<HistoricalBar[]>;
  getTechnicalIndicator(functionName: string, symbol: string, interval: string, timePeriod: number): Promise<TechnicalIndicatorPoint[]>;
}

const ALPHA_VANTAGE_KEY = "48SDEBM5X6L6WBVV";
const BASE_URL = "https://www.alphavantage.co/query";

class AlphaVantageDataProvider implements MarketDataProvider {
  private getParams(symbol: string, functionType: 'LIVE' | 'HISTORY'): string {
    const interval = "1min"; 
    
    if (symbol.includes('USD') && !['BTCUSD', 'ETHUSD'].includes(symbol)) {
      const from = symbol.substring(0, 3);
      const to = symbol.substring(3, 6);
      if (functionType === 'LIVE') {
        return `function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}`;
      }
      return `function=FX_INTRADAY&from_symbol=${from}&to_symbol=${to}&interval=${interval}`;
    } else if (['BTCUSD', 'ETHUSD'].includes(symbol)) {
      const coin = symbol.substring(0, 3);
      if (functionType === 'LIVE') {
        return `function=CURRENCY_EXCHANGE_RATE&from_currency=${coin}&to_currency=USD`;
      }
      return `function=CRYPTO_INTRADAY&symbol=${coin}&market=USD&interval=${interval}`;
    } else {
      if (functionType === 'LIVE') {
        return `function=GLOBAL_QUOTE&symbol=${symbol}`;
      }
      return `function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}`;
    }
  }

  async getLivePrice(symbol: string): Promise<PriceSnapshot> {
    try {
      const params = this.getParams(symbol, 'LIVE');
      const response = await fetch(`${BASE_URL}?${params}&apikey=${ALPHA_VANTAGE_KEY}`);
      const data = await response.json();

      if (data["Note"] || data["Information"]) {
        throw new Error("Rate limit encountered.");
      }

      if (data["Global Quote"]) {
        const q = data["Global Quote"];
        return {
          price: parseFloat(q["05. price"]),
          change: parseFloat(q["09. change"]),
          changePercent: parseFloat(q["10. change percent"].replace('%', '')),
          open: parseFloat(q["02. open"]),
          high: parseFloat(q["03. high"]),
          low: parseFloat(q["04. low"]),
          volume: parseFloat(q["06. volume"]),
          status: 'Open',
          timestamp: Date.now()
        };
      }

      if (data["Realtime Currency Exchange Rate"]) {
        const r = data["Realtime Currency Exchange Rate"];
        const price = parseFloat(r["5. Exchange Rate"]);
        return {
          price: price,
          change: 0,
          changePercent: 0,
          open: price,
          high: price,
          low: price,
          volume: 0,
          status: 'Open',
          timestamp: Date.now()
        };
      }

      throw new Error("Invalid response");
    } catch (error) {
      return this.deriveLiveFromHistory(symbol);
    }
  }

  private async deriveLiveFromHistory(symbol: string): Promise<PriceSnapshot> {
    const history = await this.getHistoricalBars(symbol);
    if (history.length === 0) throw new Error("No data available");
    const latest = history[history.length - 1];
    const prev = history.length > 1 ? history[history.length - 2] : latest;
    
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

  async getHistoricalBars(symbol: string): Promise<HistoricalBar[]> {
    try {
      const params = this.getParams(symbol, 'HISTORY');
      const response = await fetch(`${BASE_URL}?${params}&apikey=${ALPHA_VANTAGE_KEY}`);
      const data = await response.json();

      const seriesKey = Object.keys(data).find(k => k.toLowerCase().includes('time series'));
      if (!seriesKey) return [];

      const series = data[seriesKey];
      return Object.entries(series).map(([time, val]: [string, any]) => {
        return {
          time: new Date(time).getTime() / 1000,
          open: parseFloat(val["1. open"] || val["1. open (USD)"]),
          high: parseFloat(val["2. high"] || val["2. high (USD)"]),
          low: parseFloat(val["3. low"] || val["3. low (USD)"]),
          close: parseFloat(val["4. close"] || val["4. close (USD)"]),
          volume: parseFloat(val["5. volume"] || val["6. volume"] || "0")
        };
      }).sort((a, b) => a.time - b.time);
    } catch (e) {
      return [];
    }
  }

  async getTechnicalIndicator(functionName: string, symbol: string, interval: string, timePeriod: number): Promise<TechnicalIndicatorPoint[]> {
    try {
      // Map timeframe to Alpha Vantage expected interval strings
      const alphaInterval = interval === '1D' ? 'daily' : interval.replace('m', 'min');
      
      const response = await fetch(`${BASE_URL}?function=${functionName}&symbol=${symbol}&interval=${alphaInterval}&time_period=${timePeriod}&series_type=close&apikey=${ALPHA_VANTAGE_KEY}`);
      const data = await response.json();

      const seriesKey = Object.keys(data).find(k => k.toLowerCase().includes('technical analysis'));
      if (!seriesKey) return [];

      const series = data[seriesKey];
      return Object.entries(series).map(([time, val]: [string, any]) => {
        return {
          time: new Date(time).getTime() / 1000,
          value: parseFloat(Object.values(val)[0] as string)
        };
      }).sort((a, b) => a.time - b.time);
    } catch (e) {
      console.warn(`Indicator load failed for ${functionName}:`, e);
      return [];
    }
  }
}

class MockMarketDataProvider implements MarketDataProvider {
  async getLivePrice(symbol: string): Promise<PriceSnapshot> {
    return {
      price: 150.00,
      change: 0.50,
      changePercent: 0.33,
      open: 149.50,
      high: 151.00,
      low: 149.00,
      volume: 500000,
      status: 'Open',
      timestamp: Date.now()
    };
  }

  async getHistoricalBars(symbol: string): Promise<HistoricalBar[]> {
    const base = 150;
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: 100 }, (_, i) => ({
      time: now - (100 - i) * 3600,
      open: base + Math.random(),
      high: base + 2 + Math.random(),
      low: base - 2 - Math.random(),
      close: base + 0.5 + Math.random(),
      volume: 500000
    }));
  }

  async getTechnicalIndicator(): Promise<TechnicalIndicatorPoint[]> {
    return [];
  }
}

const mode = process.env.NEXT_PUBLIC_MARKET_DATA_MODE || 'live';
const provider: MarketDataProvider = mode === 'mock' ? new MockMarketDataProvider() : new AlphaVantageDataProvider();

export const fetchLivePrice = async (symbol: string): Promise<PriceSnapshot> => {
  return provider.getLivePrice(symbol);
};

export const fetchHistoricalData = async (symbol: string): Promise<HistoricalBar[]> => {
  return provider.getHistoricalBars(symbol);
};

export const fetchTechnicalIndicator = async (indicator: string, symbol: string, interval: string, timePeriod: number): Promise<TechnicalIndicatorPoint[]> => {
  return provider.getTechnicalIndicator(indicator, symbol, interval, timePeriod);
};
