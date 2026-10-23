'use client';

/**
 * @fileOverview Institutional Execution Ticket.
 * Supports Spot and Duration trading modes.
 * Updated: Integrated Risk-Per-Trade Calculator (Stage 2 Roadmap).
 */

import React, { useState, useMemo } from 'react';
import { Instrument } from '@/app/lib/instruments';
import { cn } from '@/app/lib/utils';
import { useTranslation } from '@/app/lib/i18n-context';
import { AlertCircle, Calculator } from 'lucide-react';

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

  const riskPercentage = useMemo(() => {
    if (!balance || !amount) return 0;
    return ((amount / balance) * 100).toFixed(2);
  }, [amount, balance]);

  const percentages = [10, 25, 50, 100];

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
      {/* Side Toggle: BUY/SELL */}
      <div className="flex p-1 bg-[#F7F7F5] border-b border-[#E4E4E4] shrink-0">
        <button 
          onClick={() => setSide('BUY')}
          className={cn(
            "flex-1 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
            side === 'BUY' ? "bg-[#16835B] text-white shadow-sm" : "text-[#6B7280] hover:text-[#0A0A0A]"
          )}
        >
          Buy / Long
        </button>
        <button 
          onClick={() => setSide('SELL')}
          className={cn(
            "flex-1 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
            side === 'SELL' ? "bg-[#C43D3D] text-white shadow-sm" : "text-[#6B7280] hover:text-[#0A0A0A]"
          )}
        >
          Sell / Short
        </button>
      </div>

      {/* Mode Toggle: SPOT/DURATION */}
      <div className="flex border-b border-[#E4E4E4] shrink-0">
        <button 
          onClick={() => setMode('SPOT')}
          className={cn(
            "flex-1 py-3 text-[9px] font-bold uppercase tracking-[0.25em] border-b-2 transition-all",
            mode === 'SPOT' ? "border-[#0055FF] text-[#0055FF]" : "border-transparent text-[#6B7280]"
          )}
        >
          Spot Market
        </button>
        <button 
          onClick={() => setMode('DURATION')}
          className={cn(
            "flex-1 py-3 text-[9px] font-bold uppercase tracking-[0.25em] border-b-2 transition-all",
            mode === 'DURATION' ? "border-[#C9A227] text-[#C9A227]" : "border-transparent text-[#6B7280]"
          )}
        >
          Duration Option
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8">
        {/* Order Configuration */}
        {mode === 'SPOT' ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Order Type</label>
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

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Amount (USD)</label>
                <span className="text-[9px] text-[#6B7280] font-mono">Available: ${balance.toLocaleString()}</span>
              </div>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full p-4 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-2xl font-bold focus:border-[#0055FF] outline-none"
              />
              
              {/* Institutional Risk Calculator Output */}
              <div className="flex items-center justify-between p-3 bg-[#0055FF]/5 border border-[#0055FF]/20 mt-1">
                 <div className="flex items-center gap-2">
                    <Calculator className="w-3 h-3 text-[#0055FF]" />
                    <span className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest">Risk Analysis</span>
                 </div>
                 <span className={cn(
                   "text-[10px] font-mono font-bold",
                   Number(riskPercentage) > 5 ? "text-[#C43D3D]" : "text-[#16835B]"
                 )}>
                   {riskPercentage}% of Equity
                 </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {percentages.map(p => (
                  <button key={p} onClick={() => handlePercentage(p)} className="py-2 border border-[#E4E4E4] text-[9px] font-bold text-[#6B7280] hover:bg-[#F7F7F5] transition-colors">{p}%</button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#F7F7F5]">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={cn("w-4 h-4 border border-[#E4E4E4] flex items-center justify-center transition-colors", useSL ? "bg-[#C43D3D] border-[#C43D3D]" : "bg-white")}>
                    {useSL && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <input type="checkbox" checked={useSL} onChange={e => setUseSL(e.target.checked)} className="hidden" />
                  <span className="text-[9px] font-bold text-[#0A0A0A] uppercase tracking-widest">Stop Loss</span>
                </label>
                {useSL && <input type="number" value={slPrice} onChange={e => setSlPrice(e.target.value)} placeholder="Target" className="w-28 p-2 text-[10px] border border-[#E4E4E4] focus:border-[#C43D3D] outline-none font-mono" />}
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={cn("w-4 h-4 border border-[#E4E4E4] flex items-center justify-center transition-colors", useTP ? "bg-[#16835B] border-[#16835B]" : "bg-white")}>
                    {useTP && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <input type="checkbox" checked={useTP} onChange={e => setUseTP(e.target.checked)} className="hidden" />
                  <span className="text-[9px] font-bold text-[#0A0A0A] uppercase tracking-widest">Take Profit</span>
                </label>
                {useTP && <input type="number" value={tpPrice} onChange={e => setTpPrice(e.target.value)} placeholder="Target" className="w-28 p-2 text-[10px] border border-[#E4E4E4] focus:border-[#16835B] outline-none font-mono" />}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-300">
             <div className="space-y-4">
                <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Contract Duration</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['1m', '5m', '15m', '30m', '1h'].map(d => (
                    <button 
                      key={d} 
                      onClick={() => setDuration(d)} 
                      className={cn(
                        "py-3.5 text-[10px] font-bold border transition-all", 
                        duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Contract Stake (USD)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full p-5 bg-[#F7F7F5] border border-[#E4E4E4] font-mono text-3xl font-bold focus:border-[#C9A227] outline-none text-[#0A0A0A]"
                />
             </div>

             <div className="p-6 bg-[#F7F7F5] border border-[#E4E4E4] space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                  <span className="text-[#6B7280]">Payout Ratio</span>
                  <span className="text-[#16835B]">85.00%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                  <span className="text-[#6B7280]">Potential Return</span>
                  <span className="text-[#16835B] font-mono">+${(amount * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#E4E4E4] pt-4 text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-[#0A0A0A]">Total Settlement</span>
                  <span className="text-[#0A0A0A] font-mono">${(amount * 1.85).toFixed(2)}</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="p-6 border-t border-[#E4E4E4] bg-[#F7F7F5] space-y-4 shrink-0">
        <button 
          onClick={handleExecute}
          className={cn(
            "w-full py-5 text-[11px] font-bold uppercase tracking-[0.35em] shadow-xl transition-all transform active:scale-[0.98]",
            side === 'BUY' ? "bg-[#16835B] text-white hover:bg-[#147a54]" : "bg-[#C43D3D] text-white hover:bg-[#b03535]"
          )}
        >
          {side === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'}
        </button>
      </div>
    </div>
  );
}
