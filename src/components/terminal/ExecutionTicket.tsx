'use client';

/**
 * @fileOverview Order ticket for forex, CFDs and crypto.
 * The Buy and Sell buttons carry the live price and the order's parameters
 * (amount, order type, leverage, stop loss, take profit), and the order is checked
 * before it can be sent.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Instrument } from '@/app/lib/instruments';
import { cn } from '@/app/lib/utils';
import { Check } from 'lucide-react';
import DerivedTradeControls from './DerivedTradeControls';
import { getTradingParams, fmtPrice } from '@/app/lib/trading-params';

interface ExecutionTicketProps {
  instrument: Instrument;
  livePrice: number | null | undefined;
  balance: number;
  onExecute: (params: any) => void;
  accountMode: 'REAL' | 'DEMO';
  /** Which side the ticket opens on (the phone Buy and Sell buttons use this). */
  initialSide?: 'BUY' | 'SELL';
}

type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
type TradingMode = 'SPOT' | 'DURATION';
type Side = 'BUY' | 'SELL';

const num = (v: string) => (v.trim() === '' ? NaN : Number(v));
const usd = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ExecutionTicket({ instrument, livePrice, balance, onExecute, accountMode, initialSide = 'BUY' }: ExecutionTicketProps) {
  const isDerivedMarket = instrument.category === 'Synthetic Indices';

  const [mode, setMode] = useState<TradingMode>('SPOT');
  const [side, setSide] = useState<Side>(initialSide);
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [amount, setAmount] = useState<number>(Math.max(instrument.minStake, 50));
  const [duration, setDuration] = useState<string>('5m');
  const [pendingPrice, setPendingPrice] = useState('');
  const [useSL, setUseSL] = useState(false);
  const [slPrice, setSlPrice] = useState('');
  const [useTP, setUseTP] = useState(false);
  const [tpPrice, setTpPrice] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => { setSide(initialSide); }, [initialSide]);
  useEffect(() => { setSent(null); }, [instrument.symbol, side, orderType, mode]);
  // A different market has different prices, so clear the price boxes.
  useEffect(() => { setPendingPrice(''); setSlPrice(''); setTpPrice(''); setUseSL(false); setUseTP(false); setAmount(Math.max(instrument.minStake, 50)); }, [instrument.symbol]);

  const p = useMemo(() => getTradingParams(instrument, livePrice), [instrument, livePrice]);
  const d = p?.decimals ?? 2;

  // Price the order would fill at: Buy at the ask, Sell at the bid. Pending orders fill at their own price.
  const fillPrice = useMemo(() => {
    if (!p) return NaN;
    if (mode === 'SPOT' && orderType !== 'MARKET') return num(pendingPrice);
    return side === 'BUY' ? p.ask : p.bid;
  }, [p, mode, orderType, pendingPrice, side]);

  const leverage = mode === 'SPOT' ? p?.leverage ?? 1 : 1;
  const positionSize = amount * leverage;
  const sl = useSL ? num(slPrice) : NaN;
  const tp = useTP ? num(tpPrice) : NaN;
  const pl = (target: number) => (Number.isFinite(target) && Number.isFinite(fillPrice) && fillPrice > 0
    ? positionSize * ((side === 'BUY' ? target - fillPrice : fillPrice - target) / fillPrice) : NaN);

  const problem = useMemo((): string | null => {
    if (!p) return 'Waiting for the live price…';
    if (!Number.isFinite(amount) || amount < instrument.minStake) return `The smallest amount is $${instrument.minStake}.`;
    if (amount > instrument.maxStake) return `The largest amount is $${instrument.maxStake.toLocaleString()}.`;
    if (amount > balance) return accountMode === 'REAL' ? 'Your balance is too low for this amount.' : 'Your practice balance is too low for this amount.';
    if (mode === 'DURATION') return null;
    if (orderType !== 'MARKET') {
      if (!Number.isFinite(fillPrice) || fillPrice <= 0) return `Enter the price for your ${orderType === 'LIMIT' ? 'limit' : 'stop'} order.`;
      const wrong =
        (orderType === 'LIMIT' && side === 'BUY' && fillPrice >= p.ask) || (orderType === 'LIMIT' && side === 'SELL' && fillPrice <= p.bid) ||
        (orderType === 'STOP' && side === 'BUY' && fillPrice <= p.ask) || (orderType === 'STOP' && side === 'SELL' && fillPrice >= p.bid);
      if (wrong) {
        const dir = (orderType === 'LIMIT') === (side === 'BUY') ? 'below' : 'above';
        return `A ${orderType === 'LIMIT' ? 'limit' : 'stop'} ${side === 'BUY' ? 'buy' : 'sell'} price must be ${dir} the current price.`;
      }
    }
    if (useSL) {
      if (!Number.isFinite(sl)) return 'Enter your stop loss price, or switch it off.';
      if ((side === 'BUY' && sl >= fillPrice) || (side === 'SELL' && sl <= fillPrice)) return `Stop loss must be ${side === 'BUY' ? 'below' : 'above'} your entry price.`;
    }
    if (useTP) {
      if (!Number.isFinite(tp)) return 'Enter your take profit price, or switch it off.';
      if ((side === 'BUY' && tp <= fillPrice) || (side === 'SELL' && tp >= fillPrice)) return `Take profit must be ${side === 'BUY' ? 'above' : 'below'} your entry price.`;
    }
    return null;
  }, [p, amount, instrument.minStake, instrument.maxStake, balance, accountMode, mode, orderType, fillPrice, side, useSL, useTP, sl, tp]);

  const execute = () => {
    if (problem || !p) return;
    onExecute({
      symbol: instrument.symbol,
      side,
      mode,
      orderType: mode === 'SPOT' ? orderType : 'MARKET',
      amount,
      entryPrice: fillPrice,
      limitPrice: mode === 'SPOT' && orderType !== 'MARKET' ? fillPrice : undefined,
      sl: useSL ? sl : undefined,
      tp: useTP ? tp : undefined,
      leverage,
      positionSize,
      duration: mode === 'DURATION' ? duration : undefined,
    });
    setSent(`${side === 'BUY' ? 'Buy' : 'Sell'} order sent: ${usd(amount)} on ${instrument.symbol}.`);
  };

  if (isDerivedMarket) {
    return <DerivedTradeControls instrument={instrument} livePrice={livePrice ?? null} balance={balance} onExecute={onExecute} />;
  }

  const buyOn = side === 'BUY';
  const sideColor = buyOn ? '#16835B' : '#C43D3D';
  const tag = mode === 'DURATION'
    ? `${duration} contract`
    : `${orderType === 'MARKET' ? 'Market' : orderType === 'LIMIT' ? 'Limit' : 'Stop'} · 1:${leverage}`;
  const extras = [useSL && Number.isFinite(sl) ? `SL ${fmtPrice(sl, d)}` : '', useTP && Number.isFinite(tp) ? `TP ${fmtPrice(tp, d)}` : ''].filter(Boolean).join(' · ');

  const chip = (on: boolean) =>
    cn('py-2.5 text-xs font-bold border transition-colors', on ? 'bg-[#0055FF] text-white border-[#0055FF]' : 'bg-white text-[#6B7280] border-[#E4E4E4] hover:border-[#0055FF]/50');
  const field = 'w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-lg font-bold focus:border-[#0055FF] outline-none text-[#0A0A0A]';

  const PriceBox = ({ on, setOn, value, setValue, label, hint, est }: { on: boolean; setOn: (v: boolean) => void; value: string; setValue: (v: string) => void; label: string; hint: string; est: number }) => (
    <div className="space-y-2">
      <button type="button" onClick={() => setOn(!on)} className="flex items-center gap-2.5" aria-pressed={on}>
        <span className={cn('w-4 h-4 border flex items-center justify-center', on ? 'bg-[#0055FF] border-[#0055FF]' : 'border-[#C4C4C4]')}>{on && <Check className="w-3 h-3 text-white" />}</span>
        <span className="text-xs font-bold text-[#0A0A0A]">{label}</span>
      </button>
      {on && (
        <div className="pl-6 space-y-1">
          <input type="number" inputMode="decimal" step="any" placeholder={hint} value={value} onChange={(e) => setValue(e.target.value)} className={field} />
          {Number.isFinite(est) && <p className={cn('text-[11px] font-bold', est >= 0 ? 'text-[#16835B]' : 'text-[#C43D3D]')}>About {usd(est)} if it is reached</p>}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col bg-white select-none">
      {/* Sell / Buy, each with its live price */}
      <div className="grid grid-cols-2 shrink-0">
        {(['SELL', 'BUY'] as Side[]).map((s) => {
          const price = p ? (s === 'BUY' ? p.ask : p.bid) : null;
          const on = side === s;
          const color = s === 'BUY' ? '#16835B' : '#C43D3D';
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              style={on ? { backgroundColor: color, color: '#fff' } : { color }}
              className={cn('py-3 flex flex-col items-center border-b-2 transition-colors', on ? 'border-transparent' : 'bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]')}
            >
              <span className="text-xs font-bold">{s === 'BUY' ? 'Buy / Long' : 'Sell / Short'}</span>
              <span className="text-base font-bold font-mono">{price !== null ? fmtPrice(price, d) : '—'}</span>
            </button>
          );
        })}
      </div>
      <p className="px-4 py-1.5 text-[11px] text-[#6B7280] bg-[#F7F7F5] border-b border-[#E4E4E4] flex justify-between">
        <span>Spread {p ? `${fmtPrice(p.spread, d)} (${p.spreadPct}%)` : '—'}</span>
        <span>Leverage up to 1:{p?.leverage ?? '—'}</span>
      </p>

      {/* Spot or timed */}
      <div className="grid grid-cols-2 border-b border-[#E4E4E4] shrink-0">
        {([['SPOT', 'Spot market'], ['DURATION', 'Timed contract']] as [TradingMode, string][]).map(([m, label]) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={cn('py-3 text-xs font-bold border-b-2 transition-colors', mode === m ? 'border-[#0055FF] text-[#0055FF]' : 'border-transparent text-[#6B7280]')}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-5">
        {mode === 'SPOT' ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0A0A0A]">Order type</label>
              <div className="grid grid-cols-3 gap-1">
                {(['MARKET', 'LIMIT', 'STOP'] as OrderType[]).map((t) => (
                  <button key={t} type="button" onClick={() => setOrderType(t)} className={chip(orderType === t)}>{t === 'MARKET' ? 'Market' : t === 'LIMIT' ? 'Limit' : 'Stop'}</button>
                ))}
              </div>
              <p className="text-[11px] text-[#6B7280]">
                {orderType === 'MARKET' ? 'Trades straight away at the current price.' : orderType === 'LIMIT' ? 'Waits for a better price than now.' : 'Waits for the price to move through your level.'}
              </p>
            </div>
            {orderType !== 'MARKET' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0A0A0A]" htmlFor="pending-price">{orderType === 'LIMIT' ? 'Limit price' : 'Stop price'}</label>
                <input id="pending-price" type="number" inputMode="decimal" step="any" value={pendingPrice} onChange={(e) => setPendingPrice(e.target.value)} placeholder={p ? fmtPrice(p.mid, d) : ''} className={field} />
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0A0A0A]">How long?</label>
            <div className="grid grid-cols-5 gap-1">
              {['1m', '5m', '15m', '30m', '1h'].map((t) => (
                <button key={t} type="button" onClick={() => setDuration(t)} className={chip(duration === t)}>{t}</button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <label className="text-xs font-bold text-[#0A0A0A]" htmlFor="order-amount">Amount (USD)</label>
            <span className="text-[11px] text-[#6B7280]">Available {usd(balance)}</span>
          </div>
          <input id="order-amount" type="number" inputMode="decimal" min={instrument.minStake} value={Number.isFinite(amount) ? amount : ''} onChange={(e) => setAmount(Number(e.target.value))} className={cn(field, 'text-2xl')} />
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 25, 50, 100].map((pct) => (
              <button key={pct} type="button" onClick={() => setAmount(Math.max(0, Math.floor((balance * pct) / 100)))} className="py-2 border border-[#E4E4E4] text-[11px] font-bold text-[#6B7280] hover:border-[#0055FF] hover:text-[#0055FF]">{pct}%</button>
            ))}
          </div>
          <p className="text-[11px] text-[#6B7280]">From ${instrument.minStake} to ${instrument.maxStake.toLocaleString()}.{balance > 0 && Number.isFinite(amount) && ` That is ${((amount / balance) * 100).toFixed(1)}% of your balance.`}</p>
        </div>

        {mode === 'SPOT' && (
          <div className="space-y-4 pt-4 border-t border-[#F0F0EE]">
            <PriceBox on={useSL} setOn={setUseSL} value={slPrice} setValue={setSlPrice} label="Stop loss (limits your loss)" hint={p ? fmtPrice(buyOn ? p.mid * 0.99 : p.mid * 1.01, d) : 'Price'} est={pl(sl)} />
            <PriceBox on={useTP} setOn={setUseTP} value={tpPrice} setValue={setTpPrice} label="Take profit (locks in a gain)" hint={p ? fmtPrice(buyOn ? p.mid * 1.01 : p.mid * 0.99, d) : 'Price'} est={pl(tp)} />
          </div>
        )}

        <div className="p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs space-y-1.5">
          {mode === 'SPOT' ? (
            <>
              <div className="flex justify-between"><span className="text-[#6B7280]">Entry price</span><span className="font-bold font-mono">{Number.isFinite(fillPrice) ? fmtPrice(fillPrice, d) : '—'}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">You put in</span><span className="font-bold">{usd(amount || 0)}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">Position size (1:{leverage})</span><span className="font-bold">{usd(positionSize || 0)}</span></div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><span className="text-[#6B7280]">Pays if you are right</span><span className="font-bold text-[#16835B]">85%</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">You would get back</span><span className="font-bold font-mono">{usd((amount || 0) * 1.85)}</span></div>
            </>
          )}
          <p className="text-[10px] text-[#6B7280] pt-1">Profit and loss figures are estimates.</p>
        </div>

        {sent && <p role="status" className="p-3 text-xs font-bold bg-[#16835B]/5 border border-[#16835B]/30 text-[#16835B]">{sent}</p>}
      </div>

      {/* The button states exactly what will be sent */}
      <div className="sticky bottom-0 p-3 bg-white border-t border-[#E4E4E4] space-y-1.5">
        {problem && <p role="alert" className="text-[11px] font-bold text-[#C43D3D] text-center">{problem}</p>}
        <button
          type="button"
          onClick={execute}
          disabled={!!problem}
          style={problem ? undefined : { backgroundColor: sideColor }}
          className={cn('w-full py-3 text-white transition-opacity active:scale-[0.99]', problem && 'bg-[#D1D5DB] cursor-not-allowed')}
        >
          <span className="block text-base font-bold">
            {buyOn ? 'Buy' : 'Sell'} {usd(amount || 0)}{Number.isFinite(fillPrice) ? ` at ${fmtPrice(fillPrice, d)}` : ''}
          </span>
          <span className="block text-[11px] font-bold opacity-90">{tag}{extras ? ` · ${extras}` : ''}</span>
        </button>
      </div>
    </div>
  );
}
