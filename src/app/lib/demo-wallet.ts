'use client';

/**
 * @fileOverview Browser-side Practice Wallet.
 * Maintains virtual funds for synthetic market testing.
 */

const KEY = 'varban_practice_balance';
const INITIAL = 10000;

export function getPracticeBalance(): number {
  if (typeof window === 'undefined') return INITIAL;
  const saved = localStorage.getItem(KEY);
  return saved ? parseFloat(saved) : INITIAL;
}

export function updatePracticeBalance(delta: number): number {
  const current = getPracticeBalance();
  const next = Math.max(0, current + delta);
  localStorage.setItem(KEY, next.toString());
  window.dispatchEvent(new Event('varban_balance_update'));
  return next;
}

export function resetPracticeBalance() {
  localStorage.setItem(KEY, INITIAL.toString());
  window.dispatchEvent(new Event('varban_balance_update'));
}
