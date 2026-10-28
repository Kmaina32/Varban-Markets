/**
 * @fileOverview The trading parameters shown on the Buy and Sell buttons and in the order ticket.
 * Prices come from the live feed (the mid price). Buy fills at the ask and Sell at the bid, a small
 * spread either side of it. Leverage and spread are display defaults by market type.
 */
import type { Instrument } from "./instruments";

export interface TradingParams {
  mid: number;
  bid: number;
  ask: number;
  spread: number;
  spreadPct: number;
  leverage: number;
  decimals: number;
  minStake: number;
  maxStake: number;
}

const SPREAD_PCT: Record<string, number> = { Crypto: 0.04, Forex: 0.01, Commodities: 0.03, Indices: 0.02, Equities: 0.05, "Synthetic Indices": 0 };
const LEVERAGE: Record<string, number> = { Crypto: 20, Forex: 100, Commodities: 50, Indices: 50, Equities: 5, "Synthetic Indices": 1 };

export const decimalsFor = (price: number) => (price >= 1000 ? 2 : price >= 10 ? 3 : 5);

export function getTradingParams(inst: Instrument, mid: number | null | undefined): TradingParams | null {
  if (!mid || !Number.isFinite(mid) || mid <= 0) return null;
  const pct = SPREAD_PCT[inst.category] ?? 0.03;
  const half = (mid * pct) / 100 / 2;
  const decimals = decimalsFor(mid);
  const round = (n: number) => Number(n.toFixed(decimals));
  return {
    mid,
    bid: round(mid - half),
    ask: round(mid + half),
    spread: round(half * 2),
    spreadPct: pct,
    leverage: LEVERAGE[inst.category] ?? 10,
    decimals,
    minStake: inst.minStake,
    maxStake: inst.maxStake,
  };
}

export const fmtPrice = (n: number, decimals: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
