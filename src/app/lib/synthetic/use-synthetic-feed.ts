'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/firebase';

/**
 * @fileOverview Live Synthetic Feed Hook.
 * Polls the tick API and maintains a local buffer for charting and execution.
 */

export interface Tick {
  tick: number;
  price: number;
  time: number;
}

export function useSyntheticFeed(symbol: string, tickMs: number = 1000) {
  const { user } = useUser();
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [lastTick, setLastTick] = useState<Tick | null>(null);
  const [loading, setLoading] = useState(true);
  const nextTickToFetch = useRef<number>(0);

  useEffect(() => {
    if (!user || !symbol) return;

    let active = true;
    setLoading(true);
    setTicks([]);
    nextTickToFetch.current = Math.floor(Date.now() / tickMs) - 50;

    const poll = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/synthetic/ticks?symbol=${symbol}&from=${nextTickToFetch.current}&count=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.ticks && data.ticks.length > 0) {
          if (!active) return;
          
          setTicks(prev => {
            const combined = [...prev, ...data.ticks];
            // Keep last 300 for UI efficiency
            return combined.slice(-300);
          });
          
          const latest = data.ticks[data.ticks.length - 1];
          setLastTick(latest);
          nextTickToFetch.current = latest.tick + 1;
        }
      } catch (e) {
        console.error("Tick poll failure:", e);
      } finally {
        if (active) setLoading(false);
      }
    };

    poll();
    const interval = setInterval(poll, tickMs);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user, symbol, tickMs]);

  return { ticks, lastTick, loading };
}
