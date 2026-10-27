"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { authFetch } from "@/app/lib/auth-fetch";
import { mergeSyntheticConfig, SyntheticIndexConfig } from "./engine";

export interface Tick { t: number; p: number }

const KEEP = 900;

/** The admin's settings for the synthetic markets (defaults until the admin saves any). */
export function useSyntheticConfig() {
  const db = useFirestore();
  const { user } = useUser();
  const { data, loading } = useDoc<any>(db, user ? "settings/synthetic_markets" : null);
  const config = useMemo(() => mergeSyntheticConfig(data), [data]);
  return { config, loading };
}

/** One tick at an exact tick number, or null if it has not happened yet. */
export async function fetchTick(user: any, symbol: string, tick: number): Promise<Tick | null> {
  const res = await authFetch(user, `/api/synthetic/ticks?symbol=${encodeURIComponent(symbol)}&from=${tick}&to=${tick}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.ticks?.find((x: Tick) => x.t === tick) ?? null;
}

/**
 * Live prices for one synthetic index. Loads recent history, then asks the server for new
 * ticks once per tick. All numbers come from the server; the browser never makes up a price.
 */
export function useSyntheticFeed(symbol: string, active: boolean) {
  const { user } = useUser();
  const { config } = useSyntheticConfig();
  const cfg: SyntheticIndexConfig | undefined = config.indices[symbol];
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tradingOpen, setTradingOpen] = useState(true);
  const lastRef = useRef(0);
  const tickMs = cfg?.tickMs ?? 1000;

  // Start over whenever the market, or the admin's settings for it, change.
  const settingsKey = cfg ? [cfg.volatility, cfg.driftPctPerHour, cfg.tickMs, cfg.anchorTick, cfg.anchorPrice].join("|") : "";
  useEffect(() => { setTicks([]); lastRef.current = 0; setError(null); }, [symbol, settingsKey]);

  const pull = useCallback(async (initial: boolean) => {
    if (!user || !symbol) return;
    try {
      const url = initial || !lastRef.current
        ? `/api/synthetic/ticks?symbol=${symbol}&count=600`
        : `/api/synthetic/ticks?symbol=${symbol}&from=${lastRef.current + 1}`;
      const res = await authFetch(user, url);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error || "Prices are not available right now."); return; }
      setError(null);
      setTradingOpen(!!json.tradingEnabled);
      const fresh: Tick[] = json.ticks || [];
      if (!fresh.length) return;
      lastRef.current = fresh[fresh.length - 1].t;
      setTicks((prev) => {
        const merged = initial || !prev.length ? fresh : [...prev, ...fresh.filter((x) => x.t > prev[prev.length - 1].t)];
        return merged.slice(-KEEP);
      });
    } catch {
      setError("Prices are not available right now.");
    }
  }, [user, symbol]);

  useEffect(() => {
    if (!active || !user) return;
    let stop = false;
    pull(true);
    const id = setInterval(() => { if (!stop && !document.hidden) pull(false); }, tickMs);
    const onVisible = () => { if (!document.hidden) pull(false); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { stop = true; clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [active, user, pull, tickMs, symbol, settingsKey]);

  const latest = ticks.length ? ticks[ticks.length - 1] : null;
  const first = ticks.length ? ticks[0] : null;
  const changePercent = latest && first && first.p ? ((latest.p - first.p) / first.p) * 100 : 0;
  return { ticks, latest, changePercent, cfg, error, tradingOpen };
}
