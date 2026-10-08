"use client";

/**
 * @fileOverview Institutional Instrument detail Workspace.
 * Updated with a full-width banner hero for visual continuity.
 */

import { useState, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AVAILABLE_INSTRUMENTS } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { ArrowLeft, Check, ShieldAlert, LogIn, TrendingUp, Sliders } from "lucide-react";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { useUser } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { MarketIcon } from "@/components/MarketIcon";
import { cn } from "@/app/lib/utils";

export default function MarketDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const inst = AVAILABLE_INSTRUMENTS.find(i => i.symbol === resolvedParams.symbol);

  if (!inst) {
    notFound();
  }

  const { user } = useUser();
  const { t, formatNumber } = useTranslation();
  const [direction, setDirection] = useState<"BUY" | "SELL" | null>(null);
  const [stake, setStake] = useState<number>(inst.minStake);
  const [duration, setDuration] = useState<string>(inst.durationOptions[0]);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tradeResult, setTradeResult] = useState<string | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [livePercent, setLivePercent] = useState<number | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadPrice = async () => {
      try {
        const data = await fetchLivePrice(inst.symbol);
        if (!active) return;
        setLivePrice(data.price);
        setLivePercent(data.changePercent);
      } catch (e) {}
    };
    loadPrice();
    const interval = setInterval(loadPrice, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [inst.symbol]);

  const potentialReturn = (stake * 1.85).toFixed(2);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!direction) return;
    if (!user) {
      setErrorStatus("Authentication required. Please log in to your account to open trade contracts.");
      return;
    }
    setIsReviewing(true);
  };

  const handleConfirmTrade = () => {
    if (!user) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsReviewing(false);
      setTradeResult(`VRB-${Math.floor(Math.random() * 900000 + 100000)}`);
    }, 1500);
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. FULL WIDTH BANNER HERO */}
      <section className="relative h-[300px] md:h-[400px] bg-[#0A0A0A] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={`https://picsum.photos/seed/${inst.symbol}/1920/800`} 
            alt={inst.name} 
            fill 
            className="object-cover opacity-40 grayscale" 
            priority
            sizes="100vw"
            data-ai-hint="trading graph"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F7F7F5] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link href="/markets" className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Registry</span>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <MarketIcon symbol={inst.symbol} size="lg" className="border-2 border-white/20 shadow-2xl" />
                <div>
                  <h1 className="text-3xl md:text-5xl font-normal tracking-tight font-display leading-tight">{inst.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-mono font-bold bg-[#0055FF] px-2 py-0.5 rounded-none uppercase">{inst.symbol}</span>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{inst.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12 bg-black/20 backdrop-blur-md p-6 border border-white/10">
                <div className="text-right">
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block mb-1">Live Feed</span>
                  <span className="text-2xl font-mono font-bold">
                    {livePrice !== null ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block mb-1">24h Change</span>
                  <span className={cn("text-lg font-mono font-bold", livePercent !== null && livePercent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                    {livePercent !== null ? (livePercent >= 0 ? "+" : "") + livePercent + "%" : "---"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="space-y-6">
          {errorStatus && (
            <div className="p-3 bg-[#C43D3D]/10 border border-[#C43D3D] text-[10px] uppercase font-bold text-[#C43D3D] flex justify-between items-center">
              <span>{errorStatus}</span>
              <Link href="/login" className="flex items-center space-x-1 underline text-[#0A0A0A]">
                <LogIn className="w-3 h-3" />
                <span>Log In</span>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#E4E4E4] p-4 shadow-sm">
                <TradingViewChart symbol={inst.symbol} />
              </div>

              <div className="bg-white border border-[#E4E4E4] p-8 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-4 mb-6">
                  {t('trading.specs')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-bold mb-1">Market Domain</span>
                    <span className="font-bold text-[#0A0A0A] uppercase">{inst.marketType}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-bold mb-1">Execution Node</span>
                    <span className="font-mono font-bold text-[#0A0A0A]">${inst.minStake} USD MIN</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-bold mb-1">Settlement</span>
                    <span className="font-bold text-[#0A0A0A] uppercase">{inst.settlementMethod}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-bold mb-1">Availability</span>
                    <span className="font-bold text-[#16835B] uppercase">{t('common.active')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white border border-[#E4E4E4] p-8 space-y-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-4">
                  {t('trading.setup')}
                </h3>

                {tradeResult && (
                  <div className="bg-[#16835B]/5 border border-[#16835B]/20 p-4 text-xs text-[#16835B] flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 font-bold uppercase">
                      <Check className="w-4 h-4" />
                      <span>{t('trading.orderConfirmed')}</span>
                    </div>
                    <p className="text-[#6B7280] text-[11px] font-mono leading-relaxed">{t('trading.confirmedRef')} REF: {tradeResult}</p>
                    <button onClick={() => setTradeResult(null)} className="text-[10px] uppercase font-bold text-[#0A0A0A] text-left underline underline-offset-4 decoration-2">
                      {t('common.dismiss')}
                    </button>
                  </div>
                )}

                <form onSubmit={handleReview} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-3">
                      {t('trading.direction')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDirection("BUY")}
                        className={cn(
                          "text-xs font-bold uppercase py-4 border tracking-[0.2em] transition-all",
                          direction === "BUY"
                            ? "bg-[#16835B] text-white border-[#16835B] shadow-lg"
                            : "bg-white text-[#16835B] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                        )}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirection("SELL")}
                        className={cn(
                          "text-xs font-bold uppercase py-4 border tracking-[0.2em] transition-all",
                          direction === "SELL"
                            ? "bg-[#C43D3D] text-white border-[#C43D3D] shadow-lg"
                            : "bg-white text-[#C43D3D] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                        )}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
                      Execution Stake (USD)
                    </label>
                    <input
                      type="number"
                      min={inst.minStake}
                      max={inst.maxStake}
                      value={stake}
                      onChange={(e) => setStake(Number(e.target.value))}
                      className="w-full text-sm font-mono font-bold p-3.5 bg-[#F7F7F5] border border-[#E4E4E4] outline-none focus:border-[#0A0A0A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
                      Contract Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-xs font-bold uppercase p-3.5 bg-[#F7F7F5] border border-[#E4E4E4] outline-none focus:border-[#0A0A0A] appearance-none"
                    >
                      {inst.durationOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt} Contract
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{t('trading.return')} (85%):</span>
                      <span className="font-mono font-bold text-base text-[#16835B]">+${potentialReturn}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#E4E4E4] pt-3">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Total Exposure:</span>
                      <span className="font-mono font-bold text-base text-[#C43D3D]">${stake}.00</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!direction || isReviewing}
                    className="w-full btn-institutional-primary py-4"
                  >
                    {user ? (direction ? t('trading.review') : "Select Direction") : "Log In to Trade"}
                  </button>
                </form>

                {isReviewing && user && (
                  <div className="pt-6 border-t-2 border-[#0A0A0A] bg-[#F7F7F5] p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center space-x-2 text-[#0055FF]">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">{t('trading.riskPreVerify')}</span>
                    </div>
                    
                    <div className="text-[11px] space-y-2 uppercase font-bold text-[#6B7280]">
                      <div className="flex justify-between border-b border-black/5 pb-1"><span className="text-[#0A0A0A]">Instrument</span> <span className="font-mono">{inst.symbol}</span></div>
                      <div className="flex justify-between border-b border-black/5 pb-1"><span className="text-[#0A0A0A]">Vector</span> <span className={cn(direction === 'BUY' ? 'text-[#16835B]' : 'text-[#C43D3D]')}>{direction}</span></div>
                      <div className="flex justify-between border-b border-black/5 pb-1"><span className="text-[#0A0A0A]">Stake</span> <span className="font-mono">${stake}.00 USD</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleConfirmTrade}
                        disabled={isProcessing}
                        className="bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest py-3.5 hover:bg-[#16835B] transition-colors shadow-md"
                      >
                        {isProcessing ? "Executing..." : t('trading.confirm')}
                      </button>
                      <button
                        onClick={() => setIsReviewing(false)}
                        className="bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest py-3.5 text-center"
                      >
                        {t('trading.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
