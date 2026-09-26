
"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AVAILABLE_INSTRUMENTS } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { ArrowLeft, Check, ShieldAlert, LogIn } from "lucide-react";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { useUser } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { MarketIcon } from "@/components/MarketIcon";

export default function MarketDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const inst = AVAILABLE_INSTRUMENTS.find(i => i.symbol === resolvedParams.symbol);

  if (!inst) {
    notFound();
  }

  const { user } = useUser();
  const { t } = useTranslation();
  const [direction, setDirection] = useState<"CALL" | "PUT" | null>(null);
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
    <AuthedLayout title={t('trading.marketDetails')} subtitle={`${inst.name} Execution Workspace`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link href="/markets" className="inline-flex items-center space-x-1.5 text-xs text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-bold">{t('trading.backToRegistry')}</span>
          </Link>
        </div>

        {errorStatus && (
          <div className="p-3 bg-[#C43D3D]/10 border border-[#C43D3D] text-[10px] uppercase font-bold text-[#C43D3D] flex justify-between items-center">
            <span>{errorStatus}</span>
            <Link href="/login" className="flex items-center space-x-1 underline text-[#0A0A0A]">
              <LogIn className="w-3 h-3" />
              <span>Log In</span>
            </Link>
          </div>
        )}

        <div className="bg-white border border-[#E4E4E4] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <MarketIcon symbol={inst.symbol} size="lg" />
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono bg-[#0A0A0A] text-white px-2 py-0.5 font-bold tracking-wider">{inst.symbol}</span>
                <span className="text-xs text-[#6B7280] uppercase tracking-wider font-bold">{inst.category}</span>
              </div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A] mt-1">{inst.name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="text-right">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">{t('dashboard.live')}</span>
              <span className="text-lg font-mono font-bold text-[#0A0A0A]">
                {livePrice !== null ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">24h Change</span>
              <span className={`text-xs font-mono font-bold ${livePercent !== null && livePercent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]"}`}>
                {livePercent !== null ? (livePercent >= 0 ? "+" : "") + livePercent + "%" : "---"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E4E4E4] p-4 shadow-sm">
              <TradingViewChart symbol={inst.symbol} />
            </div>

            <div className="bg-white border border-[#E4E4E4] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2 mb-4">
                {t('trading.specs')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#6B7280] block text-[9px] uppercase font-bold">{t('tables.type')}</span>
                  <span className="font-bold text-[#0A0A0A]">{inst.marketType}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[9px] uppercase font-bold">{t('trading.stake')}</span>
                  <span className="font-mono font-bold text-[#0A0A0A]">${inst.minStake} USD</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[9px] uppercase font-bold">Settlement</span>
                  <span className="font-bold text-[#0A0A0A]">{inst.settlementMethod}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[9px] uppercase font-bold">{t('wallet.status')}</span>
                  <span className="font-bold text-[#16835B]">{t('common.active')}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white border border-[#E4E4E4] p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">
                {t('trading.setup')}
              </h3>

              {tradeResult && (
                <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-3 text-xs text-[#16835B] flex flex-col space-y-2">
                  <div className="flex items-center space-x-1.5 font-bold uppercase">
                    <Check className="w-4 h-4" />
                    <span>{t('trading.orderConfirmed')}</span>
                  </div>
                  <p className="text-[#6B7280] text-[11px] font-mono">{t('trading.confirmedRef')} ID: {tradeResult}</p>
                  <button onClick={() => setTradeResult(null)} className="text-[9px] uppercase font-bold text-[#0A0A0A] text-left underline">
                    {t('common.dismiss')}
                  </button>
                </div>
              )}

              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-2">
                    {t('trading.direction')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDirection("CALL")}
                      className={`text-xs font-bold uppercase py-2.5 border tracking-wider transition-colors ${
                        direction === "CALL"
                          ? "bg-[#16835B] text-white border-[#16835B]"
                          : "bg-white text-[#16835B] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                      }`}
                    >
                      CALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection("PUT")}
                      className={`text-xs font-bold uppercase py-2.5 border tracking-wider transition-colors ${
                        direction === "PUT"
                          ? "bg-[#C43D3D] text-white border-[#C43D3D]"
                          : "bg-white text-[#C43D3D] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                      }`}
                    >
                      PUT
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    {t('trading.stake')}
                  </label>
                  <input
                    type="number"
                    min={inst.minStake}
                    max={inst.maxStake}
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2 border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A] bg-white text-[#0A0A0A]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                    {t('trading.duration')}
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-xs p-2 border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A] bg-white text-[#0A0A0A]"
                  >
                    {inst.durationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">{t('trading.return')}:</span>
                    <span className="font-mono font-bold text-[#16835B]">${potentialReturn} USD</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E4E4E4] pt-2">
                    <span className="text-[#6B7280]">{t('trading.loss')}:</span>
                    <span className="font-mono font-bold text-[#C43D3D]">${stake} USD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!direction || isReviewing}
                  className="w-full btn-institutional-primary"
                >
                  {user ? (direction ? t('trading.review') : t('trading.direction')) : "Log In"}
                </button>
              </form>

              {isReviewing && user && (
                <div className="pt-4 border-t-2 border-[#0A0A0A] bg-[#F7F7F5] p-4 space-y-4">
                  <div className="flex items-center space-x-1.5 text-[#0055FF]">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">{t('trading.riskPreVerify')}</span>
                  </div>
                  
                  <div className="text-[11px] space-y-1 text-[#6B7280]">
                    <p><span className="font-bold text-[#0A0A0A] uppercase">{t('tables.instrument')}:</span> {inst.symbol}</p>
                    <p><span className="font-bold text-[#0A0A0A] uppercase">{t('trading.direction')}:</span> {direction}</p>
                    <p><span className="font-bold text-[#0A0A0A] uppercase">{t('tables.stake')}:</span> ${stake}.00 USD</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleConfirmTrade}
                      disabled={isProcessing}
                      className="bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-wider py-2 hover:bg-[#16835B] transition-colors"
                    >
                      {t('trading.confirm')}
                    </button>
                    <button
                      onClick={() => setIsReviewing(false)}
                      className="bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-wider py-2 text-center"
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
    </AuthedLayout>
  );
}
