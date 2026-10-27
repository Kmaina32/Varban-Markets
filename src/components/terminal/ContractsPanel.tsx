'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import { CONTRACT_LABELS, needsDigit } from '@/app/lib/synthetic/engine';
import type { DerivedContract } from '@/app/lib/synthetic/contracts';
import { Clock, Check, X, RotateCcw } from 'lucide-react';

interface Props {
  contracts: DerivedContract[];
  /** Latest tick number, to show how many ticks are left. */
  nowTick: number | null;
  className?: string;
}

const title = (c: DerivedContract) => `${CONTRACT_LABELS[c.type]}${needsDigit(c.type) ? ` ${c.digit}` : ''}`;

export default function ContractsPanel({ contracts, nowTick, className }: Props) {
  const open = contracts.filter((c) => c.status === 'open');
  const done = contracts.filter((c) => c.status !== 'open').slice(0, 30);

  const Row = ({ c }: { c: DerivedContract }) => {
    const left = nowTick === null ? c.ticks : Math.max(0, c.exitTick - nowTick);
    const profit = c.status === 'won' ? (c.payout ?? 0) - c.stake : c.status === 'void' ? 0 : -c.stake;
    return (
      <li className="p-3 bg-white border border-[#E4E4E4] flex items-center gap-3">
        <span
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            c.status === 'open' ? 'bg-[#0055FF]/10 text-[#0055FF]' : c.status === 'void' ? 'bg-[#6B7280]/10 text-[#6B7280]' : c.status === 'won' ? 'bg-[#16835B]/10 text-[#16835B]' : 'bg-[#C43D3D]/10 text-[#C43D3D]'
          )}
        >
          {c.status === 'open' ? <Clock className="w-4 h-4" /> : c.status === 'void' ? <RotateCcw className="w-4 h-4" /> : c.status === 'won' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#0A0A0A] truncate">{c.symbol} · {title(c)}</p>
          <p className="text-[11px] text-[#6B7280]">
            Bought at {c.entryPrice.toFixed(2)}
            {c.status !== 'open' && c.exitPrice !== undefined ? ` · ended at ${c.exitPrice.toFixed(2)}` : ''}
          </p>
        </div>
        <div className="text-right shrink-0">
          {c.status === 'open' ? (
            <>
              <p className="text-sm font-bold text-[#0055FF]">{left === 0 ? 'Finishing…' : `${left} ${left === 1 ? 'tick' : 'ticks'} left`}</p>
              <p className="text-[11px] text-[#6B7280]">Stake ${c.stake.toFixed(2)}</p>
            </>
          ) : (
            <>
              <p className={cn('text-sm font-bold', c.status === 'void' ? 'text-[#6B7280]' : profit >= 0 ? 'text-[#16835B]' : 'text-[#C43D3D]')}>
                {c.status === 'void' ? `$${c.stake.toFixed(2)}` : `${profit >= 0 ? '+' : '-'}$${Math.abs(profit).toFixed(2)}`}
              </p>
              <p className="text-[11px] text-[#6B7280]">{c.status === 'won' ? 'Won' : c.status === 'void' ? 'Refunded' : 'Lost'}</p>
            </>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className={cn('p-3 space-y-4 bg-[#F7F7F5] overflow-y-auto', className)}>
      <section>
        <h3 className="text-xs font-bold text-[#0A0A0A] mb-2">Running now ({open.length})</h3>
        {open.length === 0 ? (
          <p className="text-xs text-[#6B7280] bg-white border border-[#E4E4E4] p-4 text-center">Nothing running. Your next trade will show up here.</p>
        ) : (
          <ul className="space-y-2">{open.map((c) => <Row key={c.id} c={c} />)}</ul>
        )}
      </section>
      <section>
        <h3 className="text-xs font-bold text-[#0A0A0A] mb-2">Finished</h3>
        {done.length === 0 ? (
          <p className="text-xs text-[#6B7280] bg-white border border-[#E4E4E4] p-4 text-center">No finished trades yet.</p>
        ) : (
          <ul className="space-y-2">{done.map((c) => <Row key={c.id} c={c} />)}</ul>
        )}
      </section>
    </div>
  );
}
