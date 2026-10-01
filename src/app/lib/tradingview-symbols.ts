
/**
 * @fileOverview Centralized TradingView Symbol Mapping.
 * Maps internal Varban Markets symbols to official TradingView symbols.
 */

export interface TVSymbolMapping {
  symbol: string;
  name: string;
}

export const TV_SYMBOLS: Record<string, TVSymbolMapping> = {
  // CRYPTO
  "BTC/USD": { symbol: "BITSTAMP:BTCUSD", name: "Bitcoin" },
  "ETH/USD": { symbol: "BITSTAMP:ETHUSD", name: "Ethereum" },
  "SOL/USD": { symbol: "BINANCE:SOLUSD", name: "Solana" },
  "XRP/USD": { symbol: "BITSTAMP:XRPUSD", name: "Ripple" },

  // FOREX
  "EUR/USD": { symbol: "FX:EURUSD", name: "Euro / USD" },
  "GBP/USD": { symbol: "FX:GBPUSD", name: "Pound / USD" },
  "USD/JPY": { symbol: "FX:USDJPY", name: "USD / Yen" },
  "AUD/USD": { symbol: "FX:AUDUSD", name: "Aussie / USD" },

  // COMMODITIES
  "XAU/USD": { symbol: "OANDA:XAUUSD", name: "Gold" },
  "XAG/USD": { symbol: "OANDA:XAGUSD", name: "Silver" },
  "WTI/USD": { symbol: "TVC:USOIL", name: "Crude Oil" },

  // EQUITIES
  "AAPL": { symbol: "NASDAQ:AAPL", name: "Apple" },
  "NVDA": { symbol: "NASDAQ:NVDA", name: "NVIDIA" },
  "TSLA": { symbol: "NASDAQ:TSLA", name: "Tesla" },
  "SPY": { symbol: "AMEX:SPY", name: "S&P 500 ETF" },
  "QQQ": { symbol: "NASDAQ:QQQ", name: "Nasdaq 100 ETF" },

  // INDICES / OTHERS
  "US30": { symbol: "FOREXCOM:DJI", name: "Dow Jones 30" },
  "NAS100": { symbol: "NASDAQ:NDX", name: "Nasdaq 100" }
};

export function getTVSymbol(internalSymbol: string): string {
  return TV_SYMBOLS[internalSymbol]?.symbol || internalSymbol;
}

export function getTVName(internalSymbol: string): string {
  return TV_SYMBOLS[internalSymbol]?.name || internalSymbol;
}
