'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { CheckCircle2, ChevronDown, Bell, User, Globe, Menu, X, Check, LogOut, ArrowUpRight, TrendingUp, TrendingDown, Target, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { LocaleCode, LANGUAGE_LABELS } from "@/app/lib/i18n-dictionary";
import { cn } from "@/app/lib/utils";
import placeholderImages from "@/app/lib/placeholder-images.json";

export default function TerminalWorkspace() {
  const { user } = useUser();
  const db = useFirestore();
  const { locale, setLocale, t, formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [activeInst, setActiveInst] = useState<Instrument>(AVAILABLE_INSTRUMENTS[0]);
  const [livePrice, setLivePrice] = useState<number>(activeInst.price);
  const [liveMetrics, setLiveMetrics] = useState({ change: activeInst.change, percent: activeInst.changePercent });
  const [direction, setDirection] = useState<"CALL" | "PUT" | null>(null);
  const [stake, setStake] = useState<number>(activeInst.minStake);
  const [duration, setDuration] = useState<string>("5m");
  const [reviewActive, setReviewActive] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTradePanelOpen, setIsTradePanelOpen] = useState(false);
  const [isAmountDropdownOpen, setIsAmountDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  // Define data stream for active positions
  const tradesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      where("status", "==", "Open"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: activePositions, loading: positionsLoading } = useCollection<any>(tradesQuery);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    const savedDemo = localStorage.getItem('varban_demo_balance');
    if (savedDemo) setDemoBalance(parseFloat(savedDemo));
  }, []);

  useEffect(() => {
    const handleGlobalChange = () => {
      const mode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
      if (mode) setAccountMode(mode);
      const savedDemo = localStorage.getItem('varban_demo_balance');
      if (savedDemo) setDemoBalance(parseFloat(savedDemo));
    };
    window.addEventListener('varban_account_mode_changed', handleGlobalChange);
    return () => window.removeEventListener('varban_account_mode_changed', handleGlobalChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAmountDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectAccountMode = (mode: 'REAL' | 'DEMO') => {
    setAccountMode(mode);
    localStorage.setItem('varban_account_mode', mode);
    window.dispatchEvent(new Event('varban_account_mode_changed'));
    setIsAmountDropdownOpen(false);
  };

  useEffect(() => {
    let active = true;
    const updatePrice = async () => {
      try {
        const data = await fetchLivePrice(activeInst.symbol);
        if (!active) return;
        setLivePrice(data.price);
        setLiveMetrics({ change: data.change, percent: data.changePercent });
        setErrorStatus(null);
      } catch (err) {
        if (!active) return;
        setErrorStatus("Market data is temporarily unavailable.");
      }
    };

    updatePrice();
    const interval = setInterval(updatePrice, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeInst.symbol]);

  const handleSymbolChange = (newSymbol: string) => {
    const nextInst = AVAILABLE_INSTRUMENTS.find(i => i.symbol === newSymbol);
    if (nextInst) {
      setActiveInst(nextInst);
      setStake(nextInst.minStake);
      setDirection(null);
      setReviewActive(false);
    }
  };

  const handleExecute = () => {
    if (accountMode === 'DEMO') {
      const currentDemoBal = demoBalance - stake;
      setDemoBalance(currentDemoBal);
      localStorage.setItem('varban_demo_balance', currentDemoBal.toString());
      window.dispatchEvent(new Event('varban_account_mode_changed'));
      
      setSuccessMessage(`${activeInst.symbol} @ ${livePrice.toFixed(4)}`);
      setReviewActive(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setIsTradePanelOpen(false);
      }, 4000);
      return;
    }

    if (!user || !db || !direction) return;
    setReviewActive(false);
    
    addDoc(collection(db, `users/${user.uid}/positions`), {
      instrument: activeInst.symbol,
      vector: direction,
      entryPrice: livePrice,
      stake: stake,
      duration: duration,
      status: "Open",
      profit: 0,
      timestamp: serverTimestamp()
    }).catch(() => {});

    setSuccessMessage(`${activeInst.symbol} @ ${livePrice.toFixed(4)}`);
    setTimeout(() => {
      setSuccessMessage(null);
      setIsTradePanelOpen(false);
    }, 4000);
  };

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="bg-white text-[#0A0A0A] h-screen flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="relative h-16 border-b border-[#E4E4E4] flex items-center justify-between px-4 md:px-6 bg-white shrink-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-6">
          <Link href="/dashboard" className="flex items-center">
            <Image 
              src="/assets/logo.png"
              alt="Varban Terminal"
              width={130}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
          
          <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
          
          <nav className="hidden md:flex space-x-6 text-[9px] font-bold uppercase tracking-[0.1em]">
            <Link href="/markets" className="text-[#6B7280] hover:text-[#0055FF] transition-colors flex items-center">{t('nav.markets')}</Link>
            <Link href="/portfolio" className="text-[#6B7280] hover:text-[#0055FF] transition-colors flex items-center">{t('nav.portfolio')}</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAmountDropdownOpen(!isAmountDropdownOpen)}
              className="flex items-center space-x-2 border border-[#E4E4E4] px-3 py-1.5 bg-white text-right hover:bg-[#F7F7F5] transition-colors shadow-sm select-none"
            >
              <div className="text-right">
                <span className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold block">
                  {accountMode === 'REAL' ? 'Real Account' : 'Demo Account'}
                </span>
                <span className={cn(
                  "text-[10px] font-mono font-bold block",
                  accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]"
                )}>
                  ${formatNumber(activeBalance, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>

            {isAmountDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E4E4E4] shadow-lg z-50 p-1 flex flex-col space-y-0.5">
                <button
                  onClick={() => selectAccountMode('REAL')}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center justify-between",
                    accountMode === 'REAL' ? "bg-[#F7F7F5] text-[#16835B]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]"
                  )}
                >
                  <div className="flex flex-col">
                    <span>Real Account</span>
                    <span className="text-[9px] font-mono font-normal text-[#6B7280]">
                      ${formatNumber(profile?.balance || 0, { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                  {accountMode === 'REAL' && <Check className="w-3 h-3 text-[#16835B]" />}
                </button>

                <button
                  onClick={() => selectAccountMode('DEMO')}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center justify-between",
                    accountMode === 'DEMO' ? "bg-[#F7F7F5] text-[#0055FF]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]"
                  )}
                >
                  <div className="flex flex-col">
                    <span>Demo Account</span>
                    <span className="text-[9px] font-mono font-normal text-[#6B7280]">
                      ${formatNumber(demoBalance, { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                  {accountMode === 'DEMO' && <Check className="w-3 h-3 text-[#0055FF]" />}
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={profileDropdownRef}>
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center hover:border-[#0055FF] transition-colors"
            >
              <User className="w-4 h-4 text-[#6B7280]" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4E4E4] shadow-lg z-50 py-1 flex flex-col">
                <Link href="/account" className="px-4 py-2.5 text-[10px] font-bold uppercase text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]">Profile</Link>
                <Link href="/notifications" className="px-4 py-2.5 text-[10px] font-bold uppercase text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]">Notifications</Link>
                <Link href="/" className="px-4 py-2.5 text-[10px] font-bold uppercase text-[#C43D3D] hover:bg-[#F7F7F5]">Log Out</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-grow flex overflow-hidden">
        {/* Market Info Bar - Tablet/Desktop */}
        <div className="hidden md:flex flex-col w-64 border-r border-[#E4E4E4] bg-white overflow-y-auto no-scrollbar shrink-0">
          <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Asset Monitoring</span>
          </div>
          <div className="divide-y divide-[#E4E4E4]">
            {AVAILABLE_INSTRUMENTS.map((inst) => (
              <button
                key={inst.symbol}
                onClick={() => handleSymbolChange(inst.symbol)}
                className={cn(
                  "w-full p-4 text-left transition-colors flex justify-between items-center group",
                  activeInst.symbol === inst.symbol ? "bg-[#0055FF]/5 border-r-2 border-r-[#0055FF]" : "hover:bg-[#F7F7F5]"
                )}
              >
                <div>
                  <span className={cn("text-xs font-mono font-bold block", activeInst.symbol === inst.symbol ? "text-[#0055FF]" : "text-[#0A0A0A]")}>
                    {inst.symbol}
                  </span>
                  <span className="text-[9px] text-[#6B7280] uppercase tracking-tighter">{inst.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold block">${formatNumber(inst.price, { minimumFractionDigits: 2 })}</span>
                  <span className={cn("text-[9px] font-mono", inst.changePercent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                    {inst.changePercent >= 0 ? "+" : ""}{inst.changePercent}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Charting Engine */}
        <main className="flex-grow flex flex-col overflow-hidden relative">
          {successMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-[#16835B] text-white px-6 py-3 shadow-xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <CheckCircle2 className="w-5 h-5" />
              <div className="text-xs">
                <span className="font-bold uppercase block">Execution Successful</span>
                <p className="font-mono text-[10px] opacity-90">{successMessage}</p>
              </div>
            </div>
          )}

          <div className="flex-grow">
            <TradingViewChart symbol={activeInst.symbol} onSymbolChange={handleSymbolChange} />
          </div>

          {/* Bottom Positions Tray */}
          <div className="h-48 border-t border-[#E4E4E4] bg-white shrink-0 overflow-y-auto no-scrollbar">
            <div className="px-4 py-2 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center sticky top-0 z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">Active Contracts</span>
              <Link href="/history" className="text-[9px] font-bold uppercase tracking-widest text-[#0055FF] hover:underline">Full Ledger</Link>
            </div>
            <table className="w-full text-[10px] text-left">
              <thead>
                <tr className="text-[#6B7280] uppercase border-b border-[#F7F7F5]">
                  <th className="p-3 font-bold">Instrument</th>
                  <th className="p-3 font-bold">Side</th>
                  <th className="p-3 font-bold text-right">Stake</th>
                  <th className="p-3 font-bold text-right">Entry</th>
                  <th className="p-3 font-bold text-right">Duration</th>
                  <th className="p-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F7F5]">
                {accountMode === 'DEMO' ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#6B7280] font-mono">
                      Positions are logging in Sandbox environment. Switch to Real Account to view live blockchain settled ledger.
                    </td>
                  </tr>
                ) : positionsLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-[#6B7280] uppercase tracking-widest font-bold">Syncing Ledger...</td></tr>
                ) : !activePositions || activePositions.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-[#6B7280] uppercase tracking-widest font-bold">No Open Exposure</td></tr>
                ) : activePositions.map((pos: any) => (
                  <tr key={pos.id} className="hover:bg-[#F7F7F5]">
                    <td className="p-3 font-mono font-bold">{pos.instrument}</td>
                    <td className="p-3">
                      <span className={cn("px-1.5 py-0.5 border text-[9px] font-bold", pos.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#C43D3D] text-[#C43D3D]')}>
                        {pos.vector}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono">${formatNumber(pos.stake, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono">${formatNumber(pos.entryPrice, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right text-[#6B7280]">{pos.duration}</td>
                    <td className="p-3 text-center">
                      <span className="text-[8px] font-bold uppercase bg-[#0055FF]/5 text-[#0055FF] px-2 py-0.5 border border-[#0055FF]/20">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Execution Panel */}
        <div className="w-80 border-l border-[#E4E4E4] bg-white flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Trade Execution Panel</h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Price Metric */}
            <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] text-center">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">Live Feed</span>
              <div className="text-2xl font-mono font-bold text-[#0A0A0A]">
                {livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>
              <div className={cn("text-[10px] font-mono font-bold mt-1", liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                {liveMetrics.percent >= 0 ? "+" : ""}{liveMetrics.percent}%
              </div>
            </div>

            {/* Config */}
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Duration</label>
                <div className="grid grid-cols-4 gap-1">
                  {["1m", "5m", "15m", "1h"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "py-2 text-[10px] font-bold border transition-all",
                        duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Stake Allocation (USD)</label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-[#E4E4E4] text-sm font-mono font-bold focus:outline-none focus:border-[#0055FF]"
                />
                <div className="flex justify-between mt-1 text-[8px] font-bold uppercase text-[#6B7280]">
                  <span>Min: ${activeInst.minStake}</span>
                  <span>Max: $50,000</span>
                </div>
              </div>

              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#6B7280] uppercase font-bold">Potential Return</span>
                  <span className="font-mono font-bold text-[#16835B]">${(stake * 1.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#6B7280] uppercase font-bold">Defined Risk</span>
                  <span className="font-mono font-bold text-[#C43D3D]">${stake.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Execution Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { setDirection("CALL"); setReviewActive(true); }}
                className={cn(
                  "py-4 text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-center space-x-2",
                  direction === "CALL" ? "bg-[#16835B] text-white border-[#16835B]" : "bg-white text-[#16835B] border-[#16835B] hover:bg-[#16835B]/5"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Call Outcome</span>
              </button>
              <button
                onClick={() => { setDirection("PUT"); setReviewActive(true); }}
                className={cn(
                  "py-4 text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-center space-x-2",
                  direction === "PUT" ? "bg-[#C43D3D] text-white border-[#C43D3D]" : "bg-white text-[#C43D3D] border-[#C43D3D] hover:bg-[#C43D3D]/5"
                )}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Put Outcome</span>
              </button>
            </div>

            {/* Review Overlay */}
            {reviewActive && (
              <div className="border-t-4 border-[#0055FF] pt-4 mt-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center space-x-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-[#0055FF]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Verification Required</span>
                </div>
                <div className="text-[11px] space-y-2 text-[#6B7280] mb-6">
                  <p>Proceeding with <span className="font-bold text-[#0A0A0A]">{direction}</span> contract on <span className="font-bold text-[#0A0A0A]">{activeInst.symbol}</span>.</p>
                  <p>Risk: <span className="font-bold text-[#C43D3D]">${stake} USD</span></p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleExecute} className="bg-[#0A0A0A] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF]">Confirm</button>
                  <button onClick={() => setReviewActive(false)} className="bg-white border border-[#E4E4E4] text-[#0A0A0A] py-3 text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
