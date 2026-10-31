/**
 * @fileOverview Core Synthetic Price Engine.
 * Implements the deterministic random-walk algorithm for institutional indices.
 * 
 * price[n] = price[n-1] * exp( drift - sigma^2/2 + sigma * z[n] )
 */

import { z } from "zod";

export const SyntheticConfigSchema = z.object({
  symbol: z.string(),
  active: z.boolean().default(true),
  allowTrades: z.boolean().default(true),
  volatility: z.number().min(1).max(300),
  driftPerHour: z.number().min(-5).max(5).default(0),
  tickMs: z.number().default(1000),
  houseMargin: z.number().min(1).max(20).default(4),
  minStake: z.number().default(1),
  maxStake: z.number().default(5000),
  maxPayoutMultiplier: z.number().default(9.5),
  contractLengths: z.array(z.number()).default([1, 5, 10, 30, 60]),
  anchorTick: z.number().default(0),
  anchorPrice: z.number(),
});

export type SyntheticConfig = z.infer<typeof SyntheticConfigSchema>;

/**
 * RECENT ANCHOR (Oct 30 2024)
 * This prevents the loop from running for billions of ticks.
 */
const RECENT_ANCHOR = 1730300000;

export const DEFAULT_SYNTHETIC_CONFIGS: Record<string, SyntheticConfig> = {
  V10: { symbol: "V10", active: true, allowTrades: true, volatility: 10, driftPerHour: 0, tickMs: 1000, houseMargin: 4, minStake: 1, maxStake: 5000, maxPayoutMultiplier: 9.5, contractLengths: [1, 5, 10, 30, 60], anchorTick: RECENT_ANCHOR, anchorPrice: 6000 },
  V25: { symbol: "V25", active: true, allowTrades: true, volatility: 25, driftPerHour: 0, tickMs: 1000, houseMargin: 4, minStake: 1, maxStake: 5000, maxPayoutMultiplier: 9.5, contractLengths: [1, 5, 10, 30, 60], anchorTick: RECENT_ANCHOR, anchorPrice: 2400 },
  V50: { symbol: "V50", active: true, allowTrades: true, volatility: 50, driftPerHour: 0, tickMs: 1000, houseMargin: 4, minStake: 1, maxStake: 5000, maxPayoutMultiplier: 9.5, contractLengths: [1, 5, 10, 30, 60], anchorTick: RECENT_ANCHOR, anchorPrice: 1200 },
  V75: { symbol: "V75", active: true, allowTrades: true, volatility: 75, driftPerHour: 0, tickMs: 1000, houseMargin: 4, minStake: 1, maxStake: 5000, maxPayoutMultiplier: 9.5, contractLengths: [1, 5, 10, 30, 60], anchorTick: RECENT_ANCHOR, anchorPrice: 600000 },
  V100: { symbol: "V100", active: true, allowTrades: true, volatility: 100, driftPerHour: 0, tickMs: 1000, houseMargin: 4, minStake: 1, maxStake: 5000, maxPayoutMultiplier: 9.5, contractLengths: [1, 5, 10, 30, 60], anchorTick: RECENT_ANCHOR, anchorPrice: 1000 },
};

/** Simple hash for tick-to-uniform generation */
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0) / 0xffffffff;
}

/** Box-Muller transform for standard normal z[n] */
export function getZ(secret: string, symbol: string, tick: number): number {
  const u1 = hash(`${secret}:${symbol}:${tick}:u1`);
  const u2 = hash(`${secret}:${symbol}:${tick}:u2`);
  return Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
}

/** 
 * Returns a range of ticks starting from targetTick.
 * Optimized O(N) where N is (endTick - anchor).
 */
export function getPriceRange(secret: string, config: SyntheticConfig, fromTick: number, count: number): { tick: number; price: number; time: number }[] {
  const results = [];
  const start = config.anchorTick;
  let currentPrice = config.anchorPrice;
  
  const tickSeconds = config.tickMs / 1000;
  const sigmaPerTick = (config.volatility / 100) * Math.sqrt(tickSeconds / (365 * 24 * 3600));
  const driftPerTick = (config.driftPerHour / 100) * (tickSeconds / 3600);

  const endTick = fromTick + count - 1;
  
  // To avoid calculating from the beginning of time, we only calculate the necessary window.
  // In a production environment, you would cache intermediate prices.
  const actualStart = Math.max(start, fromTick - 500); 

  for (let i = actualStart + 1; i <= endTick; i++) {
    const z = getZ(secret, config.symbol, i);
    const exponent = driftPerTick - (sigmaPerTick ** 2) / 2 + sigmaPerTick * z;
    currentPrice = Math.round(currentPrice * Math.exp(exponent) * 100) / 100;
    
    if (i >= fromTick) {
      results.push({
        tick: i,
        price: currentPrice,
        time: i * config.tickMs
      });
    }
  }

  return results;
}

/** Returns the price at a specific tick index (Legacy wrapper) */
export function getPriceAtTick(secret: string, config: SyntheticConfig, targetTick: number): number {
  const range = getPriceRange(secret, config, targetTick, 1);
  return range[0]?.price || config.anchorPrice;
}
