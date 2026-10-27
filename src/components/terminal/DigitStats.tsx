'use client';

/** How often each last digit showed up in the most recent prices (real ticks, not a sample). */

import React, { useMemo } from 'react';
import { cn } from '@/app/lib/utils';
import { lastDigit } from '@/app/lib/synthetic/engine';
import type { Tick } from '@/app/lib/synthetic/use-synthetic-feed';

export default function DigitStats({ ticks }: { ticks: Tick[] }) {
  const { counts, total, last } = useMemo(() => {
    const recent = ticks.slice(-100);
    const c = new Array(10).fill(0);
    recent.forEach((t) => { c[lastDigit(t.p)]++; });
    return { counts: c as number[], total: recent.length, last: recent.length ? lastDigit(recent[recent.length - 1].p) : null };
  }, [ticks]);

  const max = Math.max(...counts, 1);
  const min = Math.min(...counts);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[#0A0A0A]">Last digit of the price</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">
          {total ? `Based on the latest ${total} prices.` : 'Waiting for prices…'} Useful for Even / Odd, Over / Under and Matches / Differs.
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {counts.map((n, i) => {
          const pct = total ? (n / total) * 100 : 0;
          const hot = n === max && total > 0;
          const cold = n === min && total > 0;
          return (
            <div key={i} className={cn('border p-2 text-center bg-white', last === i ? 'border-[#0055FF] shadow-sm' : 'border-[#E4E4E4]')}>
              <div className="text-lg font-bold text-[#0A0A0A]">{i}</div>
              <div className="h-1.5 bg-[#F7F7F5] my-1.5">
                <div className={cn('h-full', hot ? 'bg-[#16835B]' : cold ? 'bg-[#C43D3D]' : 'bg-[#0055FF]')} style={{ width: `${(n / max) * 100}%` }} />
              </div>
              <div className="text-[11px] text-[#6B7280] font-bold">{pct.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-[#6B7280]">Green is the most common digit lately, red the least. Each price is still random, so past digits do not predict the next one.</p>
    </div>
  );
}
