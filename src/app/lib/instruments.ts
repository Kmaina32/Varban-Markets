
export interface Instrument {
  symbol: string;
  name: string;
  category: 'Synthetic Indices' | 'Forex' | 'Equities' | 'Crypto' | 'Commodities';
  status: 'Open' | 'Closed' | 'Unavailable';
  marketType: string;
  minStake: number;
  maxStake: number;
  durationOptions: string[];
  settlementMethod: string;
}

export const AVAILABLE_INSTRUMENTS: Instrument[] = [
  // CRYPTO
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    category: "Crypto",
    status: "Open",
    marketType: "Digital Derivative",
    minStake: 50,
    maxStake: 50000,
    durationOptions: ["1m", "5m", "15m", "1h", "1D"],
    settlementMethod: "Index Liquidity Weighting"
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    category: "Crypto",
    status: "Open",
    marketType: "Digital Derivative",
    minStake: 20,
    maxStake: 50000,
    durationOptions: ["5m", "30m", "1h", "1D"],
    settlementMethod: "Index Liquidity Weighting"
  },
  {
    symbol: "SOL/USD",
    name: "Solana / US Dollar",
    category: "Crypto",
    status: "Open",
    marketType: "Digital Derivative",
    minStake: 10,
    maxStake: 25000,
    durationOptions: ["1m", "5m", "15m", "1h"],
    settlementMethod: "Index Liquidity Weighting"
  },

  // FOREX
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "Forex",
    status: "Open",
    marketType: "Foreign Exchange",
    minStake: 10,
    maxStake: 250000,
    durationOptions: ["1m", "5m", "30m", "1h"],
    settlementMethod: "Mid-Market Feed Splicing"
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    category: "Forex",
    status: "Open",
    marketType: "Foreign Exchange",
    minStake: 10,
    maxStake: 250000,
    durationOptions: ["1m", "5m", "30m", "1h"],
    settlementMethod: "Mid-Market Feed Splicing"
  },
  {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    category: "Forex",
    status: "Open",
    marketType: "Foreign Exchange",
    minStake: 10,
    maxStake: 250000,
    durationOptions: ["1m", "5m", "30m", "1h"],
    settlementMethod: "Mid-Market Feed Splicing"
  },
  {
    symbol: "AUD/USD",
    name: "Australian Dollar / US Dollar",
    category: "Forex",
    status: "Open",
    marketType: "Foreign Exchange",
    minStake: 10,
    maxStake: 100000,
    durationOptions: ["5m", "15m", "1h"],
    settlementMethod: "Mid-Market Feed Splicing"
  },

  // COMMODITIES
  {
    symbol: "XAU/USD",
    name: "Gold Spot / US Dollar",
    category: "Commodities",
    status: "Open",
    marketType: "Spot Derivative",
    minStake: 25,
    maxStake: 100000,
    durationOptions: ["5m", "15m", "1h", "4h", "1D"],
    settlementMethod: "EOD Fixation"
  },
  {
    symbol: "WTI/USD",
    name: "Crude Oil WTI Spot",
    category: "Commodities",
    status: "Open",
    marketType: "Energy Resource",
    minStake: 20,
    maxStake: 50000,
    durationOptions: ["5m", "15m", "1h", "4h"],
    settlementMethod: "Mid-Market Aggregation"
  },

  // EQUITIES
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "Equities",
    status: "Open",
    marketType: "Equity Derivative",
    minStake: 10,
    maxStake: 100000,
    durationOptions: ["1m", "5m", "15m", "1h", "1D"],
    settlementMethod: "Real-Time Exchange Feed"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    category: "Equities",
    status: "Open",
    marketType: "Equity Derivative",
    minStake: 20,
    maxStake: 200000,
    durationOptions: ["1m", "5m", "15m", "1h", "1D"],
    settlementMethod: "Real-Time Exchange Feed"
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    category: "Equities",
    status: "Open",
    marketType: "Equity Derivative",
    minStake: 10,
    maxStake: 100000,
    durationOptions: ["1m", "5m", "15m", "1h", "1D"],
    settlementMethod: "Real-Time Exchange Feed"
  }
];
