'use client';

/**
 * @fileOverview Ticket for our own indices. Plain choices: what you are betting on,
 * how long, how much. The payout shown comes from the same maths the server uses to settle.
 */

import React, { useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Check, Info } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { ContractType, CONTRACT_LABELS, needsDigit, quote, SyntheticIndexConfig } from '@/app/lib/synthetic/engine';

type Group = 'RISE_FALL' | 'EVEN_ODD' | 'OVER_UNDER' | 'MATCH_DIFFER';

const GROUPS: { id: Group; label: string; a: ContractType; b: ContractType; help: string }[] = [
  { id: 'RISE_FALL', label: 'Rise / Fall', a: 'RISE', b: 'FALL', help: 'Will the price at the end be higher or lower than when you bought?' },
  { id: 'EVEN_ODD', label: 'Even / Odd', a: 'EVEN', b: 'ODD', help: 'Will the last digit of the final price be even or odd?' },
  { id: 'OVER_UNDER', label: 'Over / Under', a: 'OVER', b: 'UNDER', help: 'Will the last digit of the final price be over or under your digit?' },
  { id: 'MATCH_DIFFER', label: 'Matches / Differs', a: 'MATCH', b: 'DIFFER', help: 'Will the last digit of the final price match your digit, or be different?' },
];

export interface BuyRequest {
  type: ContractType;
  digit: number;
  stake: number;
  ticks: number;
  payoutMultiplier: number;
}

interface Props {
  cfg: SyntheticIndexConfig;
  livePrice: number | null;
  balance: number;
  tradingOpen: boolean;
  /** Real-money contracts are not switched on yet; the ticket explains instead of buying. */
  practiceOnly: boolean;
  onSwitchToPractice?: () => void;
  onBuy: (req: BuyRequest) => { ok: boolean; message: string };
}

export default function DerivedTradeControls({ cfg, livePrice, balance, tradingOpen, practiceOnly, onSwitchToPractice, onBuy }: Props) {
  const [group, setGroup] = useState<Group>('RISE_FALL');
  const [ticks, setTicks] = useState<number>(cfg.durationsTicks.includes(5) ? 5 : cfg.durationsTicks[0]);
  const [digit, setDigit] = useState<number>(5);
  const [stake, setStake] = useState<number>(Math.max(cfg.minStake, 10));
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const g = GROUPS.find((x) => x.id === group)!;
  const digitNeeded = needsDigit(g.a);
  const qa = useMemo(() => quote(g.a, digit, ticks, cfg, livePrice ?? cfg.anchorPrice), [g.a, digit, ticks, cfg, livePrice]);
  const qb = useMemo(() => quote(g.b, digit, ticks, cfg, livePrice ?? cfg.anchorPrice), [g.b, digit, ticks, cfg, livePrice]);

  const stakeError =
    !Number.isFinite(stake) || stake < cfg.minStake ? `The smallest stake is $${cfg.minStake}.`
    : stake > cfg.maxStake ? `The largest stake is $${cfg.maxStake.toLocaleString()}.`
    : stake > balance ? 'You do not have enough balance for this stake.'
    : null;

  const blocked = practiceOnly || !tradingOpen || !livePrice;

  const buy = (type: ContractType, q: typeof qa) => {
    if (blocked || stakeError || !q.allowed) return;
    const r = onBuy({ type, digit, stake, ticks, payoutMultiplier: q.payoutMultiplier });
    setNotice({ ok: r.ok, text: r.message });
  };

  const seconds = Math.round((ticks * cfg.tickMs) / 1000);
  const win = (q: typeof qa) => (q.allowed ? stake * q.payoutMultiplier : 0);

  const Action = ({ type, q, tone }: { type: ContractType; q: typeof qa; tone: 'up' | 'down' }) => {
    const color = tone === 'up' ? '#16835B' : '#C43D3D';
    const Icon = tone === 'up' ? ArrowUpRight : ArrowDownRight;
    const disabled = blocked || !!stakeError || !q.allowed;
    return (
      <button
        type="button"
        onClick={() => buy(type, q)}
        disabled={disabled}
        style={{ backgroundColor: disabled ? undefined : color }}
        className={cn(
          'flex-1 py-4 px-3 text-white flex flex-col items-center gap-1 transition-opacity active:scale-[0.98]',
          disabled && 'bg-[#D1D5DB] cursor-not-allowed'
        )}
      >
        <span className="flex items-center gap-1.5 text-base font-bold">
          <Icon className="w-5 h-5" /> {CONTRACT_LABELS[type]}
        </span>
        <span className="text-[11px] font-bold opacity-90">
          {q.allowed ? `Win $${win(q).toFixed(2)}` : 'Not available'}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col bg-white">
      {/* what to bet on */}
      <div className="p-3 border-b border-[#E4E4E4]">
        <div className="grid grid-cols-2 gap-1">
          {GROUPS.map((x) => (
            <button
              key={x.id}
              onClick={() => { setGroup(x.id); setNotice(null); }}
              className={cn(
                'py-2.5 text-xs font-bold border transition-colors',
                group === x.id ? 'bg-[#0055FF]/10 text-[#0055FF] border-[#0055FF]' : 'bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF]/50'
              )}
            >
              {x.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#6B7280] leading-snug mt-2">{g.help}</p>
      </div>

      <div className="p-4 space-y-5">
        {/* how long */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#0A0A0A]">How long?</label>
          <div className="flex flex-wrap gap-1.5">
            {cfg.durationsTicks.map((d) => (
              <button
                key={d}
                onClick={() => setTicks(d)}
                className={cn(
                  'px-3 py-2 text-xs font-bold border transition-colors',
                  ticks === d ? 'bg-[#0055FF] text-white border-[#0055FF]' : 'bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF]/50'
                )}
              >
                {d} {d === 1 ? 'tick' : 'ticks'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#6B7280]">About {seconds} {seconds === 1 ? 'second' : 'seconds'}. A tick is one price update.</p>
        </div>

        {/* which digit */}
        {digitNeeded && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0A0A0A]">Pick your digit</label>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 10 }, (_, d) => (
                <button
                  key={d}
                  onClick={() => setDigit(d)}
                  className={cn(
                    'py-2.5 text-sm font-bold border transition-colors',
                    digit === d ? 'bg-[#0055FF] text-white border-[#0055FF]' : 'bg-white text-[#0A0A0A] border-[#E4E4E4] hover:border-[#0055FF]/50'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* how much */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <label className="text-xs font-bold text-[#0A0A0A]">Stake (USD)</label>
            <span className="text-[11px] text-[#6B7280]">Balance ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <input
            type="number"
            inputMode="decimal"
            min={cfg.minStake}
            max={cfg.maxStake}
            value={Number.isFinite(stake) ? stake : ''}
            onChange={(e) => setStake(Number(e.target.value))}
            className={cn(
              'w-full p-3 bg-[#F7F7F5] border text-xl font-bold outline-none focus:border-[#0055FF]',
              stakeError ? 'border-[#C43D3D]' : 'border-[#E4E4E4]'
            )}
          />
          <div className="flex gap-1.5">
            {[5, 10, 25, 50, 100].map((v) => (
              <button key={v} onClick={() => setStake(v)} className="flex-1 py-1.5 text-[11px] font-bold border border-[#E4E4E4] text-[#6B7280] hover:border-[#0055FF] hover:text-[#0055FF]">
                ${v}
              </button>
            ))}
          </div>
          {stakeError && <p role="alert" className="text-[11px] font-bold text-[#C43D3D]">{stakeError}</p>}
        </div>

        {/* what happens */}
        <div className="p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs space-y-1.5">
          <div className="flex justify-between"><span className="text-[#6B7280]">You risk</span><span className="font-bold">${(Number.isFinite(stake) ? stake : 0).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">{CONTRACT_LABELS[g.a]} pays</span><span className="font-bold text-[#16835B]">{qa.allowed ? `$${win(qa).toFixed(2)}` : '—'}</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">{CONTRACT_LABELS[g.b]} pays</span><span className="font-bold text-[#16835B]">{qb.allowed ? `$${win(qb).toFixed(2)}` : '—'}</span></div>
        </div>

        {practiceOnly && (
          <div className="p-3 bg-[#0055FF]/5 border border-[#0055FF]/30 text-xs space-y-2">
            <p className="flex gap-2 text-[#0A0A0A]"><Info className="w-4 h-4 text-[#0055FF] shrink-0" /> Our own indices can be traded on the practice account for now. Real-money trading on them is not open yet.</p>
            {onSwitchToPractice && (
              <button onClick={onSwitchToPractice} className="px-3 py-2 bg-[#0055FF] text-white font-bold hover:bg-[#0044cc]">Use practice account</button>
            )}
          </div>
        )}
        {!practiceOnly && !tradingOpen && (
          <p className="p-3 bg-[#C9A227]/10 border border-[#C9A227]/40 text-xs text-[#0A0A0A]">Buying is paused on this market for a moment. You can still watch the prices.</p>
        )}

        {notice && (
          <p role="status" className={cn('p-3 text-xs flex gap-2 border', notice.ok ? 'bg-[#16835B]/5 border-[#16835B]/30 text-[#16835B]' : 'bg-[#C43D3D]/5 border-[#C43D3D]/30 text-[#C43D3D]')}>
            {notice.ok && <Check className="w-4 h-4 shrink-0" />} {notice.text}
          </p>
        )}
      </div>

      {/* buy buttons stay in reach */}
      <div className="sticky bottom-0 flex gap-2 p-3 bg-white border-t border-[#E4E4E4]">
        <Action type={g.a} q={qa} tone="up" />
        <Action type={g.b} q={qb} tone="down" />
      </div>
    </div>
  );
}
