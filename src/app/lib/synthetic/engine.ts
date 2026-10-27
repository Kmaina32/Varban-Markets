/**
 * @fileOverview Varban synthetic index engine (volatility indices + derived contracts).
 *
 * How it works
 *  - Every index is a random walk whose size is set by the admin (volatility %, drift,
 *    tick speed). The "randomness" comes from a keyed hash of (secret, symbol, tick number),
 *    so the price at any tick is fixed and can be recomputed later to settle or audit a contract.
 *  - The secret key lives ONLY on the server (SYNTHETIC_ENGINE_SECRET). The browser never has it,
 *    so nobody can work out future ticks. The server only hands out ticks that have already happened.
 *  - Contract prices are worked out from the true chance of winning plus the admin's house margin,
 *    so changing volatility or drift can never create a pricing loophole.
 *
 * This file is plain maths with no framework imports. The browser uses the types, quote() and
 * settle(); only the server uses PriceSeries (it needs the secret).
 */

export const SECONDS_PER_YEAR = 365 * 24 * 3600;
export const MAX_CATCH_UP_TICKS = 20_000_000;

export type ContractType = "RISE" | "FALL" | "EVEN" | "ODD" | "OVER" | "UNDER" | "MATCH" | "DIFFER";

export const CONTRACT_LABELS: Record<ContractType, string> = {
  RISE: "Rise",
  FALL: "Fall",
  EVEN: "Even",
  ODD: "Odd",
  OVER: "Over",
  UNDER: "Under",
  MATCH: "Matches",
  DIFFER: "Differs",
};

export const needsDigit = (t: ContractType) => t === "OVER" || t === "UNDER" || t === "MATCH" || t === "DIFFER";

export interface SyntheticIndexConfig {
  symbol: string;
  name: string;
  /** Shown in the terminal at all. */
  enabled: boolean;
  /** New contracts can be bought. Turn off to freeze buying but keep the chart running. */
  tradingEnabled: boolean;
  /** Annualised volatility in percent (the "10" in Volatility 10). */
  volatility: number;
  /** Trend, in percent per hour. 0 = no trend. */
  driftPctPerHour: number;
  /** Milliseconds between ticks. */
  tickMs: number;
  /** House margin on every contract, in percent of the stake. */
  houseEdgePct: number;
  minStake: number;
  maxStake: number;
  /** Longest payout multiplier allowed (guards against extreme digit bets). */
  maxPayoutMultiplier: number;
  /** Allowed contract lengths, in ticks. */
  durationsTicks: number[];
  /** The path starts from here. Changing settings re-anchors so the price never jumps. */
  anchorTick: number;
  anchorPrice: number;
}

export interface SyntheticConfig {
  indices: Record<string, SyntheticIndexConfig>;
  updatedAt?: string;
  updatedBy?: string;
}

const ANCHOR_TICK_DEFAULT = Math.floor(Date.UTC(2026, 9, 27) / 1000);

const index = (symbol: string, name: string, volatility: number, price: number): SyntheticIndexConfig => ({
  symbol,
  name,
  enabled: true,
  tradingEnabled: true,
  volatility,
  driftPctPerHour: 0,
  tickMs: 1000,
  houseEdgePct: 4,
  minStake: 1,
  maxStake: 5000,
  maxPayoutMultiplier: 9.5,
  durationsTicks: [1, 5, 10, 30, 60],
  anchorTick: ANCHOR_TICK_DEFAULT,
  anchorPrice: price,
});

export const DEFAULT_SYNTHETIC_CONFIG: SyntheticConfig = {
  indices: {
    V10: index("V10", "Volatility 10 Index", 10, 6000),
    V25: index("V25", "Volatility 25 Index", 25, 2400),
    V50: index("V50", "Volatility 50 Index", 50, 1200),
    V75: index("V75", "Volatility 75 Index", 75, 600000),
    V100: index("V100", "Volatility 100 Index", 100, 1000),
  },
};

const num = (v: any, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Fill gaps and clamp every value, so a half-written or tampered document can't break the engine. */
export function mergeSyntheticConfig(raw: any): SyntheticConfig {
  const out: SyntheticConfig = { indices: {} };
  for (const [sym, def] of Object.entries(DEFAULT_SYNTHETIC_CONFIG.indices)) {
    const r = raw?.indices?.[sym] ?? {};
    const durations = Array.isArray(r.durationsTicks)
      ? r.durationsTicks.map((n: any) => Math.round(Number(n))).filter((n: number) => n >= 1 && n <= 3600)
      : def.durationsTicks;
    out.indices[sym] = {
      symbol: sym,
      name: def.name,
      enabled: typeof r.enabled === "boolean" ? r.enabled : def.enabled,
      tradingEnabled: typeof r.tradingEnabled === "boolean" ? r.tradingEnabled : def.tradingEnabled,
      volatility: clamp(num(r.volatility, def.volatility), 1, 300),
      driftPctPerHour: clamp(num(r.driftPctPerHour, def.driftPctPerHour), -5, 5),
      tickMs: clamp(Math.round(num(r.tickMs, def.tickMs)), 500, 5000),
      houseEdgePct: clamp(num(r.houseEdgePct, def.houseEdgePct), 1, 20),
      minStake: clamp(num(r.minStake, def.minStake), 0.35, 1000),
      maxStake: clamp(num(r.maxStake, def.maxStake), 1, 100000),
      maxPayoutMultiplier: clamp(num(r.maxPayoutMultiplier, def.maxPayoutMultiplier), 1.1, 50),
      durationsTicks: durations.length ? Array.from(new Set<number>(durations)).sort((a, b) => a - b) : def.durationsTicks,
      anchorTick: Math.round(num(r.anchorTick, def.anchorTick)),
      anchorPrice: clamp(num(r.anchorPrice, def.anchorPrice), 1, 10_000_000),
    };
    if (out.indices[sym].maxStake < out.indices[sym].minStake) out.indices[sym].maxStake = out.indices[sym].minStake;
  }
  out.updatedAt = typeof raw?.updatedAt === "string" ? raw.updatedAt : undefined;
  out.updatedBy = typeof raw?.updatedBy === "string" ? raw.updatedBy : undefined;
  return out;
}

/* ------------------------------------------------------------------ randomness */

function mix(x: number): number {
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

/** Hash a secret string to a 32-bit key. */
export function keyFromSecret(secret: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < secret.length; i++) {
    h ^= secret.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return mix(h >>> 0);
}

function uniform(key: number, tick: number, k: number): number {
  const lo = tick >>> 0;
  const hi = Math.floor(tick / 4294967296) >>> 0;
  const h = mix((mix((mix(key) + lo) >>> 0) + Math.imul(hi + 1, 0x9e3779b1) + Math.imul(k + 1, 0x85ebca6b)) >>> 0);
  return (h + 0.5) / 4294967296;
}

function gaussian(key: number, tick: number): number {
  const u1 = uniform(key, tick, 0);
  const u2 = uniform(key, tick, 1);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/* ------------------------------------------------------------------ price path */

export function perTickSigma(cfg: SyntheticIndexConfig): number {
  return (cfg.volatility / 100) * Math.sqrt(cfg.tickMs / 1000 / SECONDS_PER_YEAR);
}

export function perTickDrift(cfg: SyntheticIndexConfig): number {
  return (cfg.driftPctPerHour / 100) * (cfg.tickMs / 1000 / 3600);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** The price at tick n, given the price at tick n-1. */
export function nextPrice(prev: number, tick: number, cfg: SyntheticIndexConfig, key: number): number {
  const s = perTickSigma(cfg);
  const mu = perTickDrift(cfg) - 0.5 * s * s;
  return Math.max(0.01, round2(prev * Math.exp(mu + s * gaussian(key, tick))));
}

const CHECKPOINT_EVERY = 4096;

/**
 * Server-side price path for one index. Keeps a checkpoint every 4096 ticks so asking for
 * "the last few minutes" never replays the whole history.
 */
export class PriceSeries {
  private checkpoints: number[] = []; // price at anchorTick + i*CHECKPOINT_EVERY
  private tick: number;
  private price: number;

  constructor(private cfg: SyntheticIndexConfig, private key: number) {
    this.tick = cfg.anchorTick;
    this.price = cfg.anchorPrice;
    this.checkpoints[0] = cfg.anchorPrice;
  }

  private rewindTo(target: number) {
    const i = Math.min(Math.floor((target - this.cfg.anchorTick) / CHECKPOINT_EVERY), this.checkpoints.length - 1);
    this.tick = this.cfg.anchorTick + i * CHECKPOINT_EVERY;
    this.price = this.checkpoints[i];
  }

  private step() {
    this.tick += 1;
    this.price = nextPrice(this.price, this.tick, this.cfg, this.key);
    const off = this.tick - this.cfg.anchorTick;
    if (off % CHECKPOINT_EVERY === 0 && this.checkpoints[off / CHECKPOINT_EVERY] === undefined) {
      this.checkpoints[off / CHECKPOINT_EVERY] = this.price;
    }
  }

  priceAt(tick: number): number {
    if (tick <= this.cfg.anchorTick) return this.cfg.anchorPrice;
    if (tick - this.cfg.anchorTick > MAX_CATCH_UP_TICKS) throw new Error("ANCHOR_TOO_OLD");
    if (tick < this.tick) this.rewindTo(tick);
    while (this.tick < tick) this.step();
    return this.price;
  }

  /** Prices for ticks [from, to] inclusive. */
  range(from: number, to: number): { t: number; p: number }[] {
    const start = Math.max(from, this.cfg.anchorTick);
    const out: { t: number; p: number }[] = [];
    if (to < start) return out;
    this.priceAt(start);
    out.push({ t: start, p: this.price });
    while (this.tick < to) {
      this.step();
      out.push({ t: this.tick, p: this.price });
    }
    return out;
  }
}

/* ------------------------------------------------------------------ contracts */

export const lastDigit = (price: number) => Math.abs(Math.round(price * 100)) % 10;

/** Standard normal CDF (Abramowitz-Stegun). */
function phi(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}

/** Chance of winning, from the maths of the walk itself. */
export function winProbability(type: ContractType, digit: number, ticks: number, cfg: SyntheticIndexConfig, price: number = cfg.anchorPrice): number {
  switch (type) {
    case "EVEN":
    case "ODD":
      return 0.5;
    case "OVER":
      return (9 - digit) / 10;
    case "UNDER":
      return digit / 10;
    case "MATCH":
      return 0.1;
    case "DIFFER":
      return 0.9;
    case "RISE":
    case "FALL": {
      const s = perTickSigma(cfg);
      const mu = perTickDrift(cfg) - 0.5 * s * s;
      const z = (mu * ticks) / (s * Math.sqrt(ticks));
      // Prices sit on a 0.01 grid and a flat finish loses for both sides, so take the
      // chance of an exact tie out of both Rise and Fall.
      const spread = price * s * Math.sqrt(ticks) * Math.sqrt(2 * Math.PI);
      const tie = Math.min(0.5, 0.01 / spread);
      const pUp = (1 - tie) * phi(z);
      return type === "RISE" ? pUp : (1 - tie) - pUp;
    }
  }
}

export interface Quote {
  allowed: boolean;
  reason?: string;
  probability: number;
  /** Total paid back on a win per 1 staked (includes the stake). */
  payoutMultiplier: number;
}

export function quote(type: ContractType, digit: number, ticks: number, cfg: SyntheticIndexConfig, price: number = cfg.anchorPrice): Quote {
  if ((type === "OVER" && digit >= 9) || (type === "UNDER" && digit <= 0)) {
    return { allowed: false, reason: "That digit can never win.", probability: 0, payoutMultiplier: 0 };
  }
  const p = clamp(winProbability(type, digit, ticks, cfg, price), 0.02, 0.98);
  const raw = (1 - cfg.houseEdgePct / 100) / p;
  const payoutMultiplier = Math.min(cfg.maxPayoutMultiplier, Math.round(raw * 1000) / 1000);
  if (payoutMultiplier <= 1.0) return { allowed: false, reason: "No payout is available for this bet.", probability: p, payoutMultiplier };
  return { allowed: true, probability: p, payoutMultiplier };
}

export function didWin(type: ContractType, digit: number, entry: number, exit: number): boolean {
  const d = lastDigit(exit);
  switch (type) {
    case "RISE": return exit > entry;
    case "FALL": return exit < entry;
    case "EVEN": return d % 2 === 0;
    case "ODD": return d % 2 === 1;
    case "OVER": return d > digit;
    case "UNDER": return d < digit;
    case "MATCH": return d === digit;
    case "DIFFER": return d !== digit;
  }
}
