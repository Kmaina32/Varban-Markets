export type Side = "buy" | "sell";
export type BotId = "bm-liquidity-sweep" | "trend-continuation" | "breakout-retest" | "mean-reversion" | "momentum-scanner";
export type MarketType = "xauusd" | "forex" | "crypto" | "stocks" | "indices" | "synthetic-indices";
export type TradingMode = "backtest" | "paper" | "live";

export interface Candle {
  symbol: string; marketType: MarketType; timeframe: string;
  time: number; open: number; high: number; low: number; close: number; volume?: number;
}

export interface InstrumentSpec {
  symbol: string; marketType: MarketType; tickSize: number;
  quantityStep: number; minQuantity: number; maxQuantity: number;
  contractMultiplier: number; quoteCurrency: string; enabled: boolean;
}

export interface StrategySignal {
  id: string; botId: BotId; symbol: string; timeframe: string; side: Side;
  entry: number; stopLoss: number; takeProfit: number; riskReward: number;
  rationale: string[]; createdAt: number; expiresAt: number;
}

export interface BotConfig {
  id: string;
  name: string;
  enabled: boolean; 
  mode: TradingMode; 
  symbols: string[]; 
  timeframes: string[];
  riskPercent: number; 
  minRiskReward: number; 
  maxTradesPerDay: number;
  params: Record<string, any>;
  version: number;
  updatedAt: string;
}

export interface AccountRiskState {
  equity: number; dayStartEquity: number; dailyRealizedPnl: number;
  openPositions: number; tradesTodayByBot: Record<string, number>;
  killSwitch: boolean; dataFresh: boolean; accountAuthorized: boolean;
}

export interface OrderIntent {
  signalId: string; symbol: string; side: Side; quantity: number;
  orderType: "market" | "limit"; limitPrice?: number;
  stopLoss: number; takeProfit: number; clientOrderId: string;
}

export interface StrategyContext {
  candles: Candle[];
  instrument: InstrumentSpec;
  now: number;
  params?: Record<string, number | string | boolean>;
}
