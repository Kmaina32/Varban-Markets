'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { CheckCircle2, ChevronDown, User, Check, TrendingUp, TrendingDown, ShieldCheck, Menu, X, BarChart3, GripHorizontal } from "lucide-react";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import AuthedSidebar from "@/components/layout/AuthedSidebar";

export default function TerminalWorkspace() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [activeInst, setActiveInst] = useState<Instrument>(AVAILABLE_INSTRUMENTS[0]);
  const [livePrice, setLivePrice] = useState<number>(activeInst.price);
  const [liveMetrics, setLiveMetrics] = useState({ change: activeInst.change, percent: activeInst.changePercent });
  const [direction, setDirection] = useState<"CALL" | "PUT" | null>(null);
  const [stake, setStake] = useState<number>(activeInst.minStake);
  const [duration, setDuration] = useState<string>("5m");
  const [reviewActive, setReviewActive] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAmountDropdownOpen, setIsAmountDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMarketMenuOpen, setIsMobileMarketMenuOpen] = useState(false);
  const [isMobileTradeMenuOpen, setIsMobileTradeMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Tray Resizing State Logic
  const [trayHeight, setTrayHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  const tradesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      where("status", "==", "Open"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: activePositions, loading: positionsLoading } = useCollection<any>(tradesQuery);

  // Resize Handlers
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 80 && newHeight < window.innerHeight * 0.6) {
        setTrayHeight(newHeight);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

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
      } catch (err) {}
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
      setIsMobileMarketMenuOpen(false);
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
      setIsMobileTradeMenuOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
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
    setIsMobileTradeMenuOpen(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="bg-white text-[#0A0A0A] h-screen flex flex-col overflow-hidden font-sans relative">
      {/* Mobile Navbar Overlay Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300">
             <AuthedSidebar isMobile onLinkClick={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative h-16 border-b border-[#E4E4E4] flex items-center justify-between px-4 md:px-6 bg-white shrink-0 z-50 shadow-sm">
        <div className="flex items-center w-full md:w-auto justify-center md:justify-start">
          <button onClick={() => setIsMobileNavOpen(true)} className="absolute left-4 md:relative p-2 hover:bg-[#F7F7F5] transition-colors md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center">
            <Image src="/assets/logo.png" alt="Varban Terminal" width={110} height={26} className="h-6 md:h-7 w-auto object-contain" priority />
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-8 absolute right-4 md:relative">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAmountDropdownOpen(!isAmountDropdownOpen)}
              className="flex items-center space-x-2 border border-[#E4E4E4] px-2 md:px-3 py-1 bg-white hover:bg-[#F7F7F5] transition-colors shadow-sm select-none"
            >
              <div className="text-right">
                <span className="text-[7px] md:text-[8px] text-[#6B7280] uppercase tracking-widest font-bold block">
                  {accountMode === 'REAL' ? 'Real' : 'Demo'}
                </span>
                <span className={cn(
                  "text-[9px] md:text-[10px] font-mono font-bold block",
                  accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]"
                )}>
                  ${formatNumber(activeBalance, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>

            {isAmountDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 md:w-56 bg-white border border-[#E4E4E4] shadow-lg z-50 p-1 flex flex-col space-y-0.5">
                <button onClick={() => selectAccountMode('REAL')} className={cn("w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-between", accountMode === 'REAL' ? "bg-[#F7F7F5] text-[#16835B]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]")}>
                  <span>Real Account</span>
                  {accountMode === 'REAL' && <Check className="w-3 h-3 text-[#16835B]" />}
                </button>
                <button onClick={() => selectAccountMode('DEMO')} className={cn("w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-between", accountMode === 'DEMO' ? "bg-[#F7F7F5] text-[#0055FF]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]")}>
                  <span>Demo Account</span>
                  {accountMode === 'DEMO' && <Check className="w-3 h-3 text-[#0055FF]" />}
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={profileDropdownRef}>
            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center hover:border-[#0055FF] transition-colors">
              <User className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4E4E4] shadow-lg z-50 py-1 flex flex-col">
                <Link href="/account" className="px-4 py-2.5 text-[10px] font-bold uppercase text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]">Profile</Link>
                <Link href="/" className="px-4 py-2.5 text-[10px] font-bold uppercase text-[#C43D3D] hover:bg-[#F7F7F5]">Log Out</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Workspace Wrapper */}
      <div className="flex-grow flex overflow-hidden relative">
        <AuthedSidebar className="hidden md:flex" />
        
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden md:ml-16">
          
          {/* Market List Selection Layer */}
          <div className={cn(
            "fixed inset-0 z-[150] md:relative md:inset-auto md:z-0 md:flex flex-col w-full md:w-64 border-r border-[#E4E4E4] bg-white transition-transform duration-300 ease-in-out",
            isMobileMarketMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}>
            <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Asset Monitoring</span>
              <button onClick={() => setIsMobileMarketMenuOpen(false)} className="md:hidden p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-grow overflow-y-auto no-scrollbar divide-y divide-[#E4E4E4]">
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

          {/* Main Chart Section */}
          <main className={`flex-grow flex flex-col overflow-hidden relative ${isResizing ? 'select-none' : ''}`}>
            
            {/* Master Unified Instrument and Pricing Status Header */}
            <div className="flex items-center justify-between p-3 border-b border-[#E4E4E4] bg-white z-40 shrink-0">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsMobileMarketMenuOpen(true)} 
                  className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider border border-[#E4E4E4] px-3 py-1.5 bg-[#F7F7F5] md:hover:bg-[#E4E4E4] transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#0055FF]" />
                  <span>{activeInst.symbol}</span>
                  <ChevronDown className="w-3 h-3 text-[#6B7280]" />
                </button>
                <div className="hidden md:flex items-center space-x-2 text-[9px] text-[#6B7280] uppercase tracking-widest font-bold">
                  <span>&mdash; {activeInst.name}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-right">
                <div>
                  <span className="text-xs md:text-sm font-mono font-bold text-[#0A0A0A] block leading-none">
                    {livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <span className={cn("text-[9px] font-mono font-bold block mt-0.5", liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                    {liveMetrics.percent >= 0 ? "+" : ""}{liveMetrics.percent}%
                  </span>
                </div>
              </div>
            </div>

            {successMessage && (
              <div className="absolute top-20 md:top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#16835B] text-white px-6 py-3 shadow-xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <CheckCircle2 className="w-5 h-5" />
                <div className="text-xs">
                  <span className="font-bold uppercase block">Executed</span>
                  <p className="font-mono text-[10px] opacity-90">{successMessage}</p>
                </div>
              </div>
            )}

            <div className="flex-grow relative">
              <TradingViewChart symbol={activeInst.symbol} onSymbolChange={handleSymbolChange} />
            </div>

            {/* Resize Handle for Desktop */}
            <div 
              onMouseDown={startResizing}
              className="hidden md:flex h-1.5 bg-[#E4E4E4] hover:bg-[#0055FF] cursor-row-resize items-center justify-center group transition-colors z-[60]"
            >
              <div className="w-10 h-0.5 bg-[#6B7280] group-hover:bg-white rounded-full"></div>
            </div>

            {/* Bottom Info / Positions Tray - Hidden on Mobile */}
            <div 
              style={{ height: `${trayHeight}px` }}
              className="hidden md:block border-t border-[#E4E4E4] bg-white shrink-0 overflow-y-auto no-scrollbar relative z-50 transition-[height] duration-75 ease-out md:transition-none"
            >
              <div className="px-4 py-2 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">Active Positions</span>
                  <GripHorizontal className="hidden md:block w-3 h-3 text-[#E4E4E4]" />
                </div>
                <Link href="/history" className="text-[9px] font-bold uppercase tracking-widest text-[#0055FF]">Full Ledger</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse min-w-[500px] md:min-w-0">
                  <thead>
                    <tr className="text-[#6B7280] uppercase border-b border-[#F7F7F5]">
                      <th className="p-3 font-bold">Market</th>
                      <th className="p-3 font-bold">Side</th>
                      <th className="p-3 font-bold text-right">Stake</th>
                      <th className="p-3 font-bold text-right">Entry</th>
                      <th className="p-3 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F7F5]">
                    {positionsLoading ? (
                      <tr><td colSpan={5} className="p-6 text-center text-[#6B7280] font-mono">Syncing...</td></tr>
                    ) : !activePositions || activePositions.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-[#6B7280] uppercase font-bold text-[9px]">No Open Exposure</td></tr>
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
                        <td className="p-3 text-center">
                          <span className="text-[8px] font-bold uppercase text-[#0055FF]">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Action Bar */}
            <div className="md:hidden p-4 bg-white border-t border-[#E4E4E4] flex justify-between space-x-3 z-40">
              <button 
                onClick={() => { setDirection("CALL"); setIsMobileTradeMenuOpen(true); }}
                className="flex-grow py-3 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Call Vector</span>
              </button>
              <button 
                onClick={() => { setDirection("PUT"); setIsMobileTradeMenuOpen(true); }}
                className="flex-grow py-3 bg-[#C43D3D] text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-2"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Put Vector</span>
              </button>
            </div>
          </main>

          {/* Trade Configuration Layer */}
          <div className={cn(
            "fixed inset-0 z-[160] md:relative md:inset-auto md:z-0 md:flex flex-col w-full md:w-80 border-l border-[#E4E4E4] bg-white transition-all duration-300 ease-in-out",
            isMobileTradeMenuOpen ? "translate-y-0 opacity-100" : "translate-y-full md:translate-y-0 opacity-0 md:opacity-100"
          )}>
            <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Trade Configuration</h3>
              <button onClick={() => setIsMobileTradeMenuOpen(false)} className="md:hidden p-2"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
              <div className="hidden md:block p-4 bg-[#F7F7F5] border border-[#E4E4E4] text-center">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">Live Feed</span>
                <div className="text-2xl font-mono font-bold">{livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
                <div className={cn("text-[10px] font-mono font-bold mt-1", liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                  {liveMetrics.percent >= 0 ? "+" : ""}{liveMetrics.percent}%
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Duration</label>
                  <div className="grid grid-cols-4 gap-1">
                    {["1m", "5m", "15m", "1h"].map((d) => (
                      <button key={d} onClick={() => setDuration(d)} className={cn("py-2 text-[10px] font-bold border", duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4]")}>{d}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Stake (USD)</label>
                  <input type="number" min={activeInst.minStake} max={activeInst.maxStake} value={stake} onChange={(e) => setStake(Number(e.target.value))} className="w-full p-3 bg-white border border-[#E4E4E4] text-sm font-mono font-bold focus:border-[#0055FF] outline-none" />
                </div>

                <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5] space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#6B7280] uppercase font-bold">Return</span>
                    <span className="font-mono font-bold text-[#16835B]">${(stake * 1.85).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] border-t border-[#E4E4E4] pt-2">
                    <span className="text-[#6B7280] uppercase font-bold">Risk Limit</span>
                    <span className="font-mono font-bold text-[#C43D3D]">${stake.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={ () => { setDirection("CALL"); setReviewActive(true); } }
                  className={cn("py-4 text-xs font-bold uppercase tracking-widest border flex items-center justify-center space-x-2", direction === "CALL" ? "bg-[#16835B] text-white border-[#16835B]" : "bg-white text-[#16835B] border-[#16835B]")}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Call Outcome</span>
                </button>
                <button 
                  onClick={ () => { setDirection("PUT"); setReviewActive(true); } }
                  className={cn("py-4 text-xs font-bold uppercase tracking-widest border flex items-center justify-center space-x-2", direction === "PUT" ? "bg-[#C43D3D] text-white border-[#C43D3D]" : "bg-white text-[#C43D3D] border-[#C43D3D]")}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Put Outcome</span>
                </button>
              </div>

              {reviewActive && (
                <div className="border-t-4 border-[#0055FF] pt-4 mt-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center space-x-2 mb-4">
                    <ShieldCheck className="w-4 h-4 text-[#0055FF]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Risk Pre-Verification</span>
                  </div>
                  <div className="text-[11px] space-y-2 text-[#6B7280] mb-6">
                    <p>Execute <span className="font-bold text-[#0A0A0A]">{direction}</span> contract on <span className="font-bold text-[#0A0A0A]">{activeInst.symbol}</span>.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleExecute} className="bg-[#0A0A0A] text-white py-3 text-[10px] font-bold uppercase hover:bg-[#0055FF]">Confirm</button>
                    <button onClick={() => setReviewActive(false)} className="bg-white border border-[#E4E4E4] text-[#0A0A0A] py-3 text-[10px] font-bold uppercase">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
