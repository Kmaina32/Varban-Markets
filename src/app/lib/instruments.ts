export interface Instrument {
  symbol: string;
  name: string;
  category: 'Synthetic Indices' | 'Forex' | 'Equities' | 'Digital Assets' | 'Commodities';
  price: number;
  change: number;
  changePercent: number;
  status: 'Open' | 'Closed' | 'Unavailable';
  marketType: string;
  minStake: number;
  maxStake: number;
  durationOptions: string[];
  settlementMethod: string;
}

export const AVAILABLE_INSTRUMENTS: Instrument[] = [
  // DIGITAL ASSETS
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    category: "Digital Assets",
    price: 67432.10,
    change: 876.50,
    changePercent: 1.32,
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
    category: "Digital Assets",
    price: 3248.52,
    change: 30.85,
    changePercent: 0.96,
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
    category: "Digital Assets",
    price: 145.22,
    change: 4.12,
    changePercent: 2.85,
    status: "Open",
    marketType: "Digital Derivative",
    minStake: 10,
    maxStake: 25000,
    durationOptions: ["1m", "5m", "15m", "1h"],
    settlementMethod: "Index Liquidity Weighting"
  },
  {
    symbol: "XRP/USD",
    name: "Ripple / US Dollar",
    category: "Digital Assets",
    price: 0.62,
    change: 0.01,
    changePercent: 1.55,
    status: "Open",
    marketType: "Digital Derivative",
    minStake: 10,
    maxStake: 10000,
    durationOptions: ["5m", "15m", "1h"],
    settlementMethod: "Index Liquidity Weighting"
  },

  // FOREX
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "Forex",
    price: 1.0942,
    change: 0.0023,
    changePercent: 0.21,
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
    price: 1.2654,
    change: -0.0012,
    changePercent: -0.09,
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
    price: 151.42,
    change: 0.85,
    changePercent: 0.56,
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
    price: 0.6521,
    change: 0.0004,
    changePercent: 0.06,
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
    price: 2642.85,
    change: 12.46,
    changePercent: 0.47,
    status: "Open",
    marketType: "Spot Derivative",
    minStake: 25,
    maxStake: 100000,
    durationOptions: ["5m", "15m", "1h", "4h", "1D"],
    settlementMethod: "EOD Fixation"
  },
  {
    symbol: "XAG/USD",
    name: "Silver Spot / US Dollar",
    category: "Commodities",
    price: 31.15,
    change: 0.45,
    changePercent: 1.45,
    status: "Open",
    marketType: "Spot Derivative",
    minStake: 15,
    maxStake: 50000,
    durationOptions: ["5m", "15m", "1h", "1D"],
    settlementMethod: "EOD Fixation"
  },
  {
    symbol: "WTI/USD",
    name: "Crude Oil WTI Spot",
    category: "Commodities",
    price: 78.45,
    change: -1.20,
    changePercent: -1.50,
    status: "Open",
    marketType: "Energy Resource",
    minStake: 20,
    maxStake: 50000,
    durationOptions: ["5m", "15m", "1h", "4h"],
    settlementMethod: "Mid-Market Aggregation"
  },
  {
    symbol: "HG1",
    name: "Copper Spot",
    category: "Commodities",
    price: 4.12,
    change: 0.05,
    changePercent: 1.22,
    status: "Open",
    marketType: "Industrial Metal",
    minStake: 10,
    maxStake: 25000,
    durationOptions: ["15m", "1h", "4h"],
    settlementMethod: "Mid-Market Aggregation"
  },

  // EQUITIES
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "Equities",
    price: 175.50,
    change: 1.20,
    changePercent: 0.69,
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
    price: 875.12,
    change: 14.50,
    changePercent: 1.68,
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
    price: 168.25,
    change: -4.30,
    changePercent: -2.48,
    status: "Open",
    marketType: "Equity Derivative",
    minStake: 10,
    maxStake: 100000,
    durationOptions: ["1m", "5m", "15m", "1h", "1D"],
    settlementMethod: "Real-Time Exchange Feed"
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    category: "Equities",
    price: 520.45,
    change: 3.12,
    changePercent: 0.60,
    status: "Open",
    marketType: "ETF",
    minStake: 25,
    maxStake: 250000,
    durationOptions: ["5m", "15m", "1h", "1D"],
    settlementMethod: "Index Liquidity Weighting"
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust (Nasdaq 100)",
    category: "Equities",
    price: 442.10,
    change: 4.85,
    changePercent: 1.11,
    status: "Open",
    marketType: "ETF",
    minStake: 25,
    maxStake: 250000,
    durationOptions: ["5m", "15m", "1h", "1D"],
    settlementMethod: "Index Liquidity Weighting"
  },

  // FIXED INCOME / BONDS
  {
    symbol: "US2Y",
    name: "US Treasury Yield 2 Years",
    category: "Equities", // Mapping Fixed Income to Equities for UI compatibility or we could add a new category
    price: 4.62,
    change: 0.01,
    changePercent: 0.22,
    status: "Open",
    marketType: "Bond Derivative",
    minStake: 50,
    maxStake: 1000000,
    durationOptions: ["1h", "4h", "1D", "1W"],
    settlementMethod: "Real-Time Yield Feed"
  }
];
