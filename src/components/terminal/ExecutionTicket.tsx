'use client';

/**
 * @fileOverview Institutional Execution Ticket.
 * Supports Spot (Market/Limit/Stop) and Duration trading modes.
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ShieldAlert, 
  ChevronDown, 
  Target,
  ArrowRight
} from 'lucide-react';
import { Instrument } from '@/app/lib/instruments';
import { cn } from '@/app/lib/utils';
import { useTranslation } from '@/app/lib/i18n-context';

interface ExecutionTicketProps {
  instrument: Instrument;
  livePrice: number | null;
  balance: number;
  onExecute: (params: any) => void;
  accountMode: 'REAL' | 'DEMO';
}

type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
type TradingMode = 'SPOT' | 'DURATION';

export default function ExecutionTicket({ instrument, livePrice, balance, onExecute, accountMode }: ExecutionTicketProps) {
  const { formatNumber } = useTranslation();
  const [mode, setMode] = useState<TradingMode>('SPOT');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  
  const [amount, setAmount] = useState<number>(instrument.minStake);
  const [duration, setDuration] = useState<string>("5m");
  const [limitPrice, setLimitPrice] = useState<number | string>("");
  
  const [useSL, setUseSL] = useState(false);
  const [slPrice, setSlPrice] = useState<number | string>("");
  const [useTP, setUseTP] = useState(false);
  const [tpPrice, setTpPrice] = useState<number | string>("");

  const quickAmounts = [10, 25, 50, 100];
  const percentages = [25, 50, 75, 100];

  const estimatedQuantity = useMemo(() => {
    const p = orderType === 'LIMIT' && limitPrice ? Number(limitPrice) : (livePrice || 1);
    return amount / p;
  }, [amount, livePrice, orderType, limitPrice]);

  const handlePercentage = (pct: number) => {
    setAmount(Math.floor((balance * pct) / 100));
  };

  const handleExecute = () => {
    onExecute({
      symbol: instrument.symbol,
      side,
      mode,
      orderType,
      amount,
      duration: mode === 'DURATION' ? duration : undefined,
      limitPrice: orderType !== 'MARKET' ? limitPrice : undefined,
      sl: useSL ? slPrice : undefined,
      tp: useTP ? tpPrice : undefined
    });
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Side Toggle */}
      <div className="flex p-1 bg-[#F7F7F5] border-b border-[#E4E4E4] shrink-0">
        <button 
          onClick={() => setSide('BUY')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
            side === 'BUY' ? "bg-[#16835B] text-white shadow-md" : "text-[#6B7280] hover:text-[#0A0A0A]"
          )}
        >
          Buy / Long
        </button>
        <button 
          onClick={() => setSide('SELL')}
          className={cn(
            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
            side === 'SELL' ? "bg-[#C43D3D] text-white shadow-md" : "text-[#6B7280] hover:text-[#0A0A0A]"
          )}
        >
          Sell / Short
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex border-b border-[#E4E4E4] shrink-0">
        <button 
          onClick={() => setMode('SPOT')}
          className={cn(
            "flex-1 py-3 text-[9px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all",
            mode === 'SPOT' ? "border-[#0055FF] text-[#0055FF]" : "border-transparent text-[#6B7280]"
          )}
        >
          Spot Market
        </button>
        <button 
          onClick={() => setMode('DURATION')}
          className={cn(
            "flex-1 py-3 text-[9px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all",
            mode === 'DURATION' ? "border-[#C9A227] text-[#C9A227]" : "border-transparent text-[#6B7280]"
          )}
        >
          Duration Option
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-6">
        {/* Order Configuration */}
        {mode === 'SPOT' ? (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Order Type</label>
              <div className="grid grid-cols-3 gap-1">
                {(['MARKET', 'LIMIT', 'STOP'] as OrderType[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={cn(
                      "py-2 text-[9px] font-bold uppercase border transition-all",
                      orderType === t ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {orderType !== 'MARKET' && (
              <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block">{orderType} Price</label>
                <input 
                  type="number" 
                  value={limitPrice}
                  onChange={e => setLimitPrice(e.target.value)}
                  placeholder={livePrice?.toString()}
                  className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-sm font-bold focus:border-[#0055FF] outline-none"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Amount (USD)</label>
                <span className="text-[9px] text-[#6B7280] font-mono">Bal: ${balance.toLocaleString()}</span>
              </div>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full p-4 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-2xl font-bold focus:border-[#0055FF] outline-none"
              />
              <div className="grid grid-cols-4 gap-1.5">
                {percentages.map(p => (
                  <button key={p} onClick={() => handlePercentage(p)} className="py-1.5 border border-[#E4E4E4] text-[9px] font-bold text-[#6B7280] hover:bg-[#F7F7F5] transition-colors">{p}%</button>
                ))}
              </div>
            </div>

            {/* Risk Management */}
            <div className="space-y-3 pt-2 border-t border-[#F7F7F5]">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={useSL} onChange={e => setUseSL(e.target.checked)} className="w-3 h-3 accent-[#0055FF]" />
                  <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest">Stop Loss</span>
                </label>
                {useSL && <input type="number" value={slPrice} onChange={e => setSlPrice(e.target.value)} placeholder="Price" className="w-24 p-1.5 text-[10px] border border-[#E4E4E4] focus:border-[#C43D3D] outline-none font-mono" />}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={useTP} onChange={e => setUseTP(e.target.checked)} className="w-3 h-3 accent-[#16835B]" />
                  <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest">Take Profit</span>
                </label>
                {useTP && <input type="number" value={tpPrice} onChange={e => setTpPrice(e.target.value)} placeholder="Price" className="w-24 p-1.5 text-[10px] border border-[#E4E4E4] focus:border-[#16835B] outline-none font-mono" />}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
             <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-3">Duration Block</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['1m', '5m', '15m', '30m', '1h'].map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={cn("py-3 text-[10px] font-bold border transition-all", duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]")}>{d}</button>
                  ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block">Contract Stake (USD)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full p-4 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-2xl font-bold focus:border-[#C9A227] outline-none"
                />
             </div>

             <div className="p-5 bg-[#F7F7F5] border border-[#E4E4E4] space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-[#6B7280]">Payout Ratio</span>
                  <span className="text-[#16835B]">85.00%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-[#6B7280]">Potential Return</span>
                  <span className="text-[#16835B] font-mono">+${(amount * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#E4E4E4] pt-4 text-xs font-bold uppercase">
                  <span className="text-[#0A0A0A]">Total Settlement</span>
                  <span className="text-[#0A0A0A] font-mono">${(amount * 1.85).toFixed(2)}</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="p-6 border-t border-[#E4E4E4] bg-[#F7F7F5] space-y-4 shrink-0">
        <div className="flex flex-col gap-1 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
           <div className="flex justify-between">
              <span>Est. Execution Price</span>
              <span className="text-[#0A0A0A] font-mono">${livePrice?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---'}</span>
           </div>
           <div className="flex justify-between">
              <span>Trading Fee (Est.)</span>
              <span className="text-[#16835B] font-mono">$0.00</span>
           </div>
        </div>

        <button 
          onClick={handleExecute}
          className={cn(
            "w-full py-5 text-xs font-bold uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]",
            side === 'BUY' ? "bg-[#16835B] text-white hover:bg-[#147a54]" : "bg-[#C43D3D] text-white hover:bg-[#b03535]"
          )}
        >
          {side === 'BUY' ? 'Confirm Long Order' : 'Confirm Short Order'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-2.5 p-3 bg-white border border-[#E4E4E4] shadow-sm">
           <ShieldAlert className="w-4 h-4 text-[#C9A227] shrink-0" />
           <p className="text-[8px] text-[#6B7280] uppercase font-bold leading-relaxed tracking-tight">
             Executing this order will commit ${amount.toFixed(2)} of your capital. All trades are subject to the platform risk disclosure.
           </p>
        </div>
      </div>
    </div>
  );
}
