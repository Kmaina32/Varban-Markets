"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/firebase";
import { ContractType, didWin } from "./engine";
import { fetchTick, Tick } from "./use-synthetic-feed";
import { adjustDemoBalance } from "@/app/lib/demo-wallet";

export interface DerivedContract {
  id: string;
  symbol: string;
  type: ContractType;
  digit: number;
  stake: number;
  payoutMultiplier: number;
  ticks: number;
  tickMs: number;
  entryTick: number;
  entryPrice: number;
  exitTick: number;
  status: "open" | "won" | "lost" | "void";
  exitPrice?: number;
  /** Money paid back (0 on a loss). */
  payout?: number;
  openedAt: number;
  settledAt?: number;
}

const KEY = "varban_derived_contracts_v1";
const EVENT = "varban_derived_contracts_changed";
const MAX_KEPT = 200;

function read(): DerivedContract[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(list: DerivedContract[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_KEPT))); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Practice-account contracts. Buying takes the stake off the practice balance; once the exit
 * tick has happened the server's price for that exact tick decides win or loss.
 */
export function useDerivedContracts() {
  const { user } = useUser();
  const [contracts, setContracts] = useState<DerivedContract[]>([]);
  const settling = useRef(new Set<string>());

  useEffect(() => {
    const load = () => setContracts(read());
    load();
    window.addEventListener(EVENT, load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener(EVENT, load); window.removeEventListener("storage", load); };
  }, []);

  const buy = useCallback((c: Omit<DerivedContract, "id" | "status" | "openedAt">) => {
    const contract: DerivedContract = { ...c, id: `VRB-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, status: "open", openedAt: Date.now() };
    adjustDemoBalance(-c.stake);
    write([contract, ...read()]);
    return contract;
  }, []);

  /**
   * Settle anything whose exit tick has passed. `known` is the feed's recent ticks (saves a request).
   * If a price for the exit tick can never be found (for example the admin changed the tick speed or
   * restarted the market), the trade is refunded after a couple of minutes instead of hanging forever.
   */
  const settleDue = useCallback(async (known: Tick[], nowTick: number | null) => {
    if (!user) return;
    const candidates = read().filter((c) => {
      if (c.status !== "open" || settling.current.has(c.id)) return false;
      const expired = Date.now() - c.openedAt > c.ticks * c.tickMs + 120_000;
      return expired || (nowTick !== null && nowTick >= c.exitTick);
    });
    for (const c of candidates) {
      settling.current.add(c.id);
      try {
        const due = nowTick !== null && nowTick >= c.exitTick;
        const expired = Date.now() - c.openedAt > c.ticks * c.tickMs + 120_000;
        const exit = known.find((k) => k.t === c.exitTick) ?? (due ? await fetchTick(user, c.symbol, c.exitTick) : null);
        const list = read();
        const i = list.findIndex((x) => x.id === c.id);
        if (i < 0 || list[i].status !== "open") continue;
        if (!exit) {
          if (!expired) continue;
          list[i] = { ...list[i], status: "void", payout: c.stake, settledAt: Date.now() };
          adjustDemoBalance(c.stake);
          write(list);
          continue;
        }
        const won = didWin(c.type, c.digit, c.entryPrice, exit.p);
        const payout = won ? Math.round(c.stake * c.payoutMultiplier * 100) / 100 : 0;
        list[i] = { ...list[i], status: won ? "won" : "lost", exitPrice: exit.p, payout, settledAt: Date.now() };
        if (payout > 0) adjustDemoBalance(payout);
        write(list);
      } finally {
        settling.current.delete(c.id);
      }
    }
  }, [user]);

  return { contracts, buy, settleDue };
}
