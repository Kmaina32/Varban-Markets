/**
 * @fileOverview Centralized TradingView Symbol Mapping.
 * Maps internal Varban Markets symbols to official TradingView symbols.
 */

export const TV_SYMBOL_MAP: Record<string, string> = {
  // CRYPTO
  "BTC/USD": "BITSTAMP:BTCUSD",
  "ETH/USD": "BITSTAMP:ETHUSD",
  "SOL/USD": "BINANCE:SOLUSD",
  "XRP/USD": "BITSTAMP:XRPUSD",

  // FOREX
  "EUR/USD": "FX:EURUSD",
  "GBP/USD": "FX:GBPUSD",
  "USD/JPY": "FX:USDJPY",
  "AUD/USD": "FX:AUDUSD",
  "USDCAD": "FX:USDCAD",
  "USDCHF": "FX:USDCHF",

  // COMMODITIES
  "XAU/USD": "OANDA:XAUUSD",
  "XAG/USD": "OANDA:XAGUSD",
  "WTI/USD": "TVC:USOIL",
  "BRENT": "TVC:UKOIL",

  // EQUITIES
  "AAPL": "NASDAQ:AAPL",
  "NVDA": "NASDAQ:NVDA",
  "TSLA": "NASDAQ:TSLA",
  "SPY": "AMEX:SPY",
  "QQQ": "NASDAQ:QQQ",

  // INDICES
  "US30": "FOREXCOM:DJI",
  "NAS100": "NASDAQ:NDX",
  "US500": "FOREXCOM:SPXUSD",
  "GER40": "FOREXCOM:GRXEUR"
};

export function getTVSymbol(internalSymbol: string): string {
  const clean = internalSymbol.replace('/', '').toUpperCase();
  return TV_SYMBOL_MAP[internalSymbol] || TV_SYMBOL_MAP[clean] || `FX:${clean}`;
}
