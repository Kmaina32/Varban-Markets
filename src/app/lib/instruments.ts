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
  {
    symbol: "BTCUSD",
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
    symbol: "ETHUSD",
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
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
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
    symbol: "EURUSD",
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
    symbol: "AAPL",
    name: "Apple Inc. Common Stock",
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
    name: "NVIDIA Corporation Stock",
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
  }
];
