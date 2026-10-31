'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/firebase';

/**
 * @fileOverview Live Synthetic Feed Hook.
 * Polls the tick API and maintains a local buffer for charting and execution.
 * Includes data deduplication and strict sequence enforcement.
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
    // Start fetching from 1 minute ago to fill the initial chart
    nextTickToFetch.current = Math.floor(Date.now() / tickMs) - 60;

    const poll = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/synthetic/ticks?symbol=${symbol}&from=${nextTickToFetch.current}&count=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.ticks && data.ticks.length > 0) {
          if (!active) return;
          
          setTicks(prev => {
            // Merge and deduplicate by tick index to ensure strictly increasing timestamps
            const combined = [...prev, ...data.ticks];
            const unique = Array.from(new Map(combined.map(t => [t.tick, t])).values());
            
            // Sort to ensure strict order
            unique.sort((a, b) => a.tick - b.tick);
            
            // Keep last 300 for UI efficiency
            return unique.slice(-300);
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
