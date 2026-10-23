import type { BotConfig } from './types';

/**
 * @fileOverview Institutional Bot Defaults & Metadata.
 * Centralized registry for factory-set strategy parameters and marketing descriptions.
 */

export const STATIC_METADATA: Record<string, any> = {
  "bm-liquidity-sweep": {
    category: "scalping",
    winRate: "74%",
    drawdown: "3.5%",
    pnl: "+142%",
    risk: "Medium",
    desc: "Designed for institutional range sweeps, identifying high-precision reversals after Asian session liquidity grabs.",
    features: [
      "Asian-session range sweep detection",
      "Structure-shift validation protocol",
      "Automatic displacement ATR filtering",
      "Planned invalidation stop-loss"
    ]
  },
  "trend-continuation": {
    category: "trend",
    winRate: "68%",
    drawdown: "6.2%",
    pnl: "+94%",
    risk: "Low",
    desc: "Follows established market momentum using dual EMA filters and volatility-adjusted pullbacks.",
    features: [
      "EMA 50/200 dual trend filter",
      "ATR-adjusted pullback entry logic",
      "Bullish/Bearish candle confirmation",
      "Trailing take-profit targets"
    ]
  },
  "breakout-retest": {
    category: "grid",
    winRate: "62%",
    drawdown: "9.5%",
    pnl: "+168%",
    risk: "High",
    desc: "Identifies high-probability consolidation breakouts and validates entries on confirmed structural retests.",
    features: [
      "Consolidation range lookback logic",
      "Retest tolerance ATR monitoring",
      "High-velocity breakout detection",
      "Risk-reward optimization engine"
    ]
  },
  "mean-reversion": {
    category: "arbitrage",
    winRate: "82%",
    drawdown: "2.1%",
    pnl: "+48%",
    risk: "Very Low",
    desc: "Capitalizes on price extremes using Bollinger bands and RSI divergence, filtered by trend-strength guards.",
    features: [
      "Volatility band entry protocol",
      "RSI extreme signal validation",
      "Trend-strength guardian check",
      "Instant mid-line exit targets"
    ]
  },
  "momentum-scanner": {
    category: "trend",
    winRate: "59%",
    drawdown: "14%",
    pnl: "+210%",
    risk: "High",
    desc: "Multi-market scanner that ranks assets by relative momentum for high-velocity trend following.",
    features: [
      "Lookback momentum ranking engine",
      "Multi-EMA trend alignment check",
      "Volatility-adjusted trailing stops",
      "Global asset scan capability"
    ]
  }
};

export const DEFAULT_CONFIGS: BotConfig[] = [
  { 
    id: "bm-liquidity-sweep", 
    name: "BM Liquidity Sweep", 
    enabled: false, 
    mode: 'paper', 
    symbols: ['XAUUSD'], 
    timeframes: ['5m', '15m'], 
    riskPercent: 0.25, 
    minRiskReward: 1.5, 
    maxTradesPerDay: 3, 
    params: { 
      asianBars: 24, 
      displacementAtr: 0.8, 
      structureLookback: 4, 
      stopBuffer: 0.15,
      martingaleMultiplier: 1.0,
      martingaleSteps: 0,
      slAtrMultiplier: 1.5,
      tpAtrMultiplier: 3.0
    }, 
    version: 1, 
    updatedAt: '' 
  },
  { 
    id: "trend-continuation", 
    name: "EMA Momentum", 
    enabled: false, 
    mode: 'paper', 
    symbols: ['EURUSD', 'BTCUSD'], 
    timeframes: ['15m', '1h'], 
    riskPercent: 0.25, 
    minRiskReward: 1.5, 
    maxTradesPerDay: 3, 
    params: { 
      pullbackAtr: 0.35, 
      targetAtr: 2.0, 
      fastEma: 50, 
      slowEma: 200,
      martingaleMultiplier: 1.0,
      martingaleSteps: 0,
      slAtrMultiplier: 1.5,
      tpAtrMultiplier: 3.0
    }, 
    version: 1, 
    updatedAt: '' 
  },
  { 
    id: "breakout-retest", 
    name: "Structure Master", 
    enabled: false, 
    mode: 'paper', 
    symbols: ['EURUSD', 'BTCUSD'], 
    timeframes: ['5m', '15m'], 
    riskPercent: 0.25, 
    minRiskReward: 1.5, 
    maxTradesPerDay: 3, 
    params: { 
      rangeLookback: 20, 
      retestAtr: 0.2, 
      retestExpiry: 5,
      martingaleMultiplier: 1.0,
      martingaleSteps: 0,
      slAtrMultiplier: 1.5,
      tpAtrMultiplier: 3.0
    }, 
    version: 1, 
    updatedAt: '' 
  },
  { 
    id: "mean-reversion", 
    name: "Mean Reversion", 
    enabled: false, 
    mode: 'paper', 
    symbols: ['EURUSD', 'BTCUSD'], 
    timeframes: ['15m', '1h'], 
    riskPercent: 0.25, 
    minRiskReward: 1.5, 
    maxTradesPerDay: 3, 
    params: { 
      period: 20, 
      bandWidth: 2.0, 
      rsiThreshold: 35,
      martingaleMultiplier: 1.0,
      martingaleSteps: 0,
      slAtrMultiplier: 1.5,
      tpAtrMultiplier: 3.0
    }, 
    version: 1, 
    updatedAt: '' 
  },
  { 
    id: "momentum-scanner", 
    name: "Momentum Scanner", 
    enabled: false, 
    mode: 'paper', 
    symbols: ['XAUUSD', 'EURUSD'], 
    timeframes: ['15m', '1h'], 
    riskPercent: 0.25, 
    minRiskReward: 1.5, 
    maxTradesPerDay: 3, 
    params: { 
      momentumLookback: 20, 
      momentumThreshold: 0.004, 
      stopAtr: 1.5,
      martingaleMultiplier: 1.0,
      martingaleSteps: 0,
      slAtrMultiplier: 1.5,
      tpAtrMultiplier: 3.0
    }, 
    version: 1, 
    updatedAt: '' 
  }
];
