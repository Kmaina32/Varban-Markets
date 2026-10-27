"use client";

/** The practice account balance. Lives in this browser only; it is not real money. */
const KEY = "varban_demo_balance";
const EVENT = "varban_demo_balance_changed";
export const DEMO_START_BALANCE = 10000;

export function readDemoBalance(): number {
  try {
    const v = parseFloat(localStorage.getItem(KEY) || "");
    return Number.isFinite(v) ? v : DEMO_START_BALANCE;
  } catch {
    return DEMO_START_BALANCE;
  }
}

export function writeDemoBalance(next: number) {
  const value = Math.round(next * 100) / 100;
  try { localStorage.setItem(KEY, String(value)); } catch {}
  window.dispatchEvent(new Event(EVENT));
  return value;
}

export const adjustDemoBalance = (delta: number) => writeDemoBalance(readDemoBalance() + delta);

export function onDemoBalanceChange(fn: () => void) {
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", fn);
  return () => { window.removeEventListener(EVENT, fn); window.removeEventListener("storage", fn); };
}
