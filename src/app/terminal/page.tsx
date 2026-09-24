'use client';

/**
 * @fileOverview High-Performance Electronic Trading Terminal Workspace.
 * Simulates real-time option contract settlement cycles to update open/closed trade records,
 * evaluate net wins/losses, adapt user capital domains, and broadcast telemetry alerts.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { 
  CheckCircle2, 
  ChevronDown, 
  User, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Menu, 
  X, 
  BarChart3, 
  GripHorizontal,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  DollarSign,
  Sun,
  Moon,
  Zap,
  Settings,
  Sliders,
  XCircle
} from "lucide-react";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import AuthedSidebar from "@/components/layout/AuthedSidebar";
import TerminalTutorial from "@/components/terminal/TerminalTutorial";
import ProfileDropdown from "@/components/layout/ProfileDropdown";

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
  
  // Settings & Toggles
  const [oneClickTrade, setOneClickTrade] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [leftTab, setLeftTab] = useState<'TICKET' | 'MARKETS'>('TICKET');

  // Mobile Drawers
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMarketMenuOpen, setIsMobileMarketMenuOpen] = useState(false);
  const [isMobileTradeMenuOpen, setIsMobileTradeMenuOpen] = useState(false);
  const [isMobilePositionsOpen, setIsMobilePositionsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Bottom Tray Resizing
  const [trayHeight, setTrayHeight] = useState(180);
  const [isResizing, setIsResizing] = useState(false);
  
  // Account Mode
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  // Position listeners
  const tradesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: allPositions, loading: positionsLoading } = useCollection<any>(tradesQuery);

  const activePositions = useMemo(() => {
    return allPositions?.filter((p: any) => p.status === "Open") || [];
  }, [allPositions]);

  // Automated contract settlement cycle simulation
  useEffect(() => {
    if (!user || !db || !allPositions || allPositions.length === 0) return;
    
    const openItems = allPositions.filter((p: any) => p.status === "Open");
    if (openItems.length === 0) return;

    const latest = openItems[0];
    const timestampMs = latest.timestamp?.seconds ? latest.timestamp.seconds * 1000 : Date.now();
    
    if (Date.now() - timestampMs > 18000) {
      const entry = latest.entryPrice || livePrice;
      const isCall = latest.vector === "CALL";
      const isWin = isCall ? livePrice >= entry : livePrice < entry;
      const netProfit = isWin ? latest.stake * 0.85 : -latest.stake;

      const positionDocRef = doc(db, `users/${user.uid}/positions`, latest.id);
      updateDoc(positionDocRef, {
        status: "Closed",
        currentPrice: livePrice,
        profit: netProfit,
        settledAt: new Date().toISOString()
      }).catch(() => {});

      if (accountMode === 'REAL') {
        updateDoc(doc(db, "users", user.uid), {
          balance: increment(netProfit),
          equity: increment(netProfit)
        }).catch(() => {});

        addDoc(collection(db, `users/${user.uid}/transactions`), {
          type: "Trade Settlement",
          asset: latest.instrument,
          amount: latest.stake,
          vector: latest.vector,
          status: "Settled",
          output: netProfit >= 0 ? `+${netProfit.toFixed(2)}` : `${netProfit.toFixed(2)}`,
          timestamp: serverTimestamp()
        }).catch(() => {});
      }

      addDoc(collection(db, `users/${user.uid}/notifications`), {
        title: netProfit >= 0 ? "Option Contract Profit Realized" : "Contract Risk Liquidated",
        body: `Position ${latest.id.slice(0,6).toUpperCase()} on ${latest.instrument} expired. Outcome resulted in ${netProfit >= 0 ? 'Gain' : 'Loss'} of $${Math.abs(netProfit).toFixed(2)} USD.`,
        type: "Trade",
        isUnread: true,
        timestamp: serverTimestamp()
      }).catch(() => {});
    }
  }, [allPositions, livePrice, user, db, accountMode]);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 60 && newHeight < window.innerHeight * 0.6) {
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

  const selectAccountMode = (mode: 'REAL' | 'DEMO') => {
    setAccountMode(mode);
    localStorage.setItem('varban_account_mode', mode);
    window.dispatchEvent(new Event('varban_account_mode_changed'));
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

  // Execution with one-click support
  const handleExecute = (overrideDirection?: "CALL" | "PUT") => {
    const selectedVector = overrideDirection || direction;
    if (!selectedVector) return;

    if (accountMode === 'DEMO') {
      const currentDemoBal = demoBalance - stake;
      setDemoBalance(currentDemoBal);
      localStorage.setItem('varban_demo_balance', currentDemoBal.toString());
      window.dispatchEvent(new Event('varban_account_mode_changed'));
      
      setSuccessMessage(`${activeInst.symbol} ${selectedVector} Simulated Ticket Opened`);
      setReviewActive(false);
      setIsMobileTradeMenuOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    if (!user || !db) return;
    
    if (stake > (profile?.balance || 0)) {
      alert("Deficit Exposure Error: Stake exceeds live capital allocations.");
      return;
    }

    setReviewActive(false);
    
    addDoc(collection(db, `users/${user.uid}/positions`), {
      instrument: activeInst.symbol,
      vector: selectedVector,
      entryPrice: livePrice,
      stake: stake,
      duration: duration,
      status: "Open",
      profit: 0,
      timestamp: serverTimestamp()
    }).catch(() => {});

    setSuccessMessage(`${activeInst.symbol} ${selectedVector} Transmitted @ $${livePrice.toFixed(2)}`);
    setIsMobileTradeMenuOpen(false);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleVectorClick = (vec: "CALL" | "PUT") => {
    setDirection(vec);
    if (oneClickTrade) {
      handleExecute(vec);
    } else {
      setReviewActive(true);
      setIsMobileTradeMenuOpen(true);
    }
  };

  // Early Cashout Functionality
  const handleEarlyCashout = (pos: any) => {
    if (!user || !db) return;
    const partialPayout = pos.stake * 0.35; // 35% cashout return
    const positionDocRef = doc(db, `users/${user.uid}/positions`, pos.id);
    
    updateDoc(positionDocRef, {
      status: "Closed",
      profit: partialPayout - pos.stake,
      settledAt: new Date().toISOString(),
      closedEarly: true
    }).catch(() => {});

    if (accountMode === 'REAL') {
      updateDoc(doc(db, "users", user.uid), {
        balance: increment(partialPayout),
        equity: increment(partialPayout)
      }).catch(() => {});
    } else {
      const currentDemoBal = demoBalance + partialPayout;
      setDemoBalance(currentDemoBal);
      localStorage.setItem('varban_demo_balance', currentDemoBal.toString());
    }

    setSuccessMessage(`Early Cashout: ${pos.instrument} closed. Payout: $${partialPayout.toFixed(2)}`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden font-sans relative transition-colors duration-200",
      isDarkTheme ? "bg-[#0A0A0A] text-white" : "bg-white text-[#0A0A0A]"
    )}>
      <TerminalTutorial />
      
      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-[250] md:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white text-[#0A0A0A] animate-in slide-in-from-left duration-300 shadow-2xl">
             <AuthedSidebar isMobile onLinkClick={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Header Area */}
      <header className={cn(
        "relative h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-6 shrink-0 z-50 shadow-sm transition-colors",
        isDarkTheme ? "bg-[#121212] border-[#262626]" : "bg-white border-[#E4E4E4]"
      )}>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={() => setIsMobileNavOpen(true)} className="p-1.5 hover:bg-[#F7F7F5] dark:hover:bg-[#262626] transition-colors md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center">
            <Image src="/assets/logo2.png" alt="Varban Terminal" width={110} height={26} className="h-6 md:h-7 w-auto object-contain" priority />
          </Link>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Dark / Light Theme Switcher */}
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            title={isDarkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
            className={cn(
              "p-1.5 border transition-colors flex items-center justify-center",
              isDarkTheme ? "border-[#333333] bg-[#1A1A1A] hover:bg-[#262626] text-amber-400" : "border-[#E4E4E4] bg-[#F7F7F5] hover:bg-[#E4E4E4] text-[#0A0A0A]"
            )}
          >
            {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Account Balance Selector Pill */}
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={cn(
              "flex items-center space-x-2 border px-2 md:px-3 py-1 transition-colors shadow-sm select-none",
              isDarkTheme ? "bg-[#1A1A1A] border-[#333333]" : "bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
            )}
          >
            <div className="text-right">
              <span className="text-[7px] md:text-[8px] text-[#6B7280] uppercase tracking-widest font-bold block">
                {accountMode === 'REAL' ? 'Real Account' : 'Demo Mode'}
              </span>
              <span className={cn(
                "text-[9px] md:text-[10px] font-mono font-bold block",
                accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]"
              )}>
                ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#6B7280]" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
              className="flex items-center space-x-2 group focus:outline-none"
            >
              <div className={cn(
                "w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs transition-colors shadow-sm",
                isProfileDropdownOpen ? "ring-2 ring-[#0055FF]" : "group-hover:ring-2 group-hover:ring-[#0055FF]"
              )}>
                {user?.email ? user.email.substring(0, 2).toUpperCase() : 'VM'}
              </div>
            </button>

            <ProfileDropdown 
              user={user}
              profile={profile}
              accountMode={accountMode}
              demoBalance={demoBalance}
              isOpen={isProfileDropdownOpen}
              onClose={() => setIsProfileDropdownOpen(false)}
              onSelectMode={selectAccountMode}
            />
          </div>
        </div>
      </header>

      {/* Terminal Workspace Matrix */}
      <div className="flex-grow flex overflow-hidden relative">
        <AuthedSidebar className="hidden md:flex" />
        
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden md:ml-16">
          
          {/* ========================================================================= */}
          {/* LEFT SIDE PANEL: Trading Features & Settings + Asset Monitoring Panel      */}
          {/* ========================================================================= */}
          <div className={cn(
            "fixed inset-0 z-[200] md:relative md:inset-auto md:z-0 md:flex flex-col w-full md:w-80 border-r shrink-0 transition-transform duration-300 ease-in-out",
            isDarkTheme ? "bg-[#121212] border-[#262626]" : "bg-white border-[#E4E4E4]",
            isMobileTradeMenuOpen || isMobileMarketMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 hidden md:flex"
          )}>
            
            {/* Left Side Header Tabs: Order Ticket vs Asset Markets */}
            <div className={cn(
              "flex border-b shrink-0",
              isDarkTheme ? "border-[#262626] bg-[#1A1A1A]" : "border-[#E4E4E4] bg-[#F7F7F5]"
            )}>
              <button
                onClick={() => setLeftTab('TICKET')}
                className={cn(
                  "flex-1 py-3 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors border-b-2",
                  leftTab === 'TICKET' 
                    ? (isDarkTheme ? "border-[#0055FF] text-white bg-[#121212]" : "border-[#0055FF] text-[#0055FF] bg-white") 
                    : "border-transparent text-[#6B7280] hover:text-[#0A0A0A]"
                )}
              >
                <Sliders className="w-3.5 h-3.5 text-[#0055FF]" />
                <span>Trade & Settings</span>
              </button>
              
              <button
                onClick={() => setLeftTab('MARKETS')}
                className={cn(
                  "flex-1 py-3 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors border-b-2",
                  leftTab === 'MARKETS' 
                    ? (isDarkTheme ? "border-[#0055FF] text-white bg-[#121212]" : "border-[#0055FF] text-[#0055FF] bg-white") 
                    : "border-transparent text-[#6B7280] hover:text-[#0A0A0A]"
                )}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#16835B]" />
                <span>Markets ({AVAILABLE_INSTRUMENTS.length})</span>
              </button>

              <button 
                onClick={() => { setIsMobileTradeMenuOpen(false); setIsMobileMarketMenuOpen(false); }} 
                className="md:hidden p-3 text-[#6B7280]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB CONTENT 1: Trade Configuration & Execution Panel */}
            {leftTab === 'TICKET' && (
              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-grow">
                
                {/* Active Instrument Header Banner */}
                <div className={cn(
                  "p-3 border flex justify-between items-center",
                  isDarkTheme ? "bg-[#1A1A1A] border-[#262626]" : "bg-[#F7F7F5] border-[#E4E4E4]"
                )}>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#6B7280] block">Selected Instrument</span>
                    <span className="text-xs font-mono font-bold text-[#0055FF]">{activeInst.symbol}</span>
                    <span className="text-[9px] text-[#6B7280] block">{activeInst.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold block">${livePrice.toFixed(2)}</span>
                    <span className={cn("text-[9px]", liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                      {liveMetrics.percent >= 0 ? "+" : ""}{liveMetrics.percent}%
                    </span>
                  </div>
                </div>

                {/* Vector Direction Buttons */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Option Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleVectorClick("CALL")}
                      className={cn(
                        "py-3 text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center space-x-1.5 transition-all shadow-sm",
                        direction === "CALL" ? "bg-[#16835B] text-white border-[#16835B]" : "bg-white text-[#16835B] border-[#E4E4E4] hover:bg-[#16835B]/10"
                      )}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>CALL ↑</span>
                    </button>
                    <button 
                      onClick={() => handleVectorClick("PUT")}
                      className={cn(
                        "py-3 text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center space-x-1.5 transition-all shadow-sm",
                        direction === "PUT" ? "bg-[#0055FF] text-white border-[#0055FF]" : "bg-white text-[#0055FF] border-[#E4E4E4] hover:bg-[#0055FF]/10"
                      )}
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>PUT ↓</span>
                    </button>
                  </div>
                </div>

                {/* Duration Presets */}
                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#0055FF]" /> Expiry Duration
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {["1m", "5m", "15m", "1h"].map((d) => (
                      <button 
                        key={d} 
                        onClick={() => setDuration(d)} 
                        className={cn(
                          "py-2 text-[10px] font-bold border transition-all", 
                          duration === d 
                            ? "bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-[#0055FF] dark:border-[#0055FF]" 
                            : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5] dark:bg-[#1A1A1A] dark:border-[#262626] dark:text-[#A0A0A0]"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stake Input & Quick Selectors */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Committed Stake (USD)</label>
                    <span className="text-[9px] font-mono text-[#16835B]">Min: ${activeInst.minStake}</span>
                  </div>
                  <input 
                    type="number" 
                    min={activeInst.minStake} 
                    max={activeInst.maxStake} 
                    value={stake} 
                    onChange={(e) => setStake(Number(e.target.value))} 
                    className={cn(
                      "w-full p-2.5 border text-sm font-mono font-bold focus:border-[#0055FF] outline-none",
                      isDarkTheme ? "bg-[#1A1A1A] border-[#262626] text-white" : "bg-white border-[#E4E4E4] text-[#0A0A0A]"
                    )} 
                  />

                  <div className="grid grid-cols-4 gap-1 mt-1.5">
                    {[10, 50, 100, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setStake(amt)}
                        className={cn(
                          "py-1 border text-[9px] font-mono font-bold transition-colors",
                          isDarkTheme ? "bg-[#1A1A1A] border-[#262626] hover:bg-[#262626] text-white" : "bg-[#F7F7F5] border-[#E4E4E4] hover:bg-[#E4E4E4] text-[#0A0A0A]"
                        )}
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* One-Click Trading Toggle Switch */}
                <div className={cn(
                  "p-3 border flex items-center justify-between",
                  isDarkTheme ? "bg-[#1A1A1A] border-[#262626]" : "bg-[#F7F7F5] border-[#E4E4E4]"
                )}>
                  <div className="flex items-center space-x-2">
                    <Zap className={cn("w-4 h-4", oneClickTrade ? "text-amber-500 fill-amber-500" : "text-[#6B7280]")} />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider block">One-Click Trade</span>
                      <span className="text-[8px] text-[#6B7280] block">Skip confirmation modal</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setOneClickTrade(!oneClickTrade)} 
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative",
                      oneClickTrade ? 'bg-[#0055FF]' : 'bg-[#E4E4E4] dark:bg-[#333333]'
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                      oneClickTrade ? 'left-5.5' : 'left-0.5'
                    )} />
                  </button>
                </div>

                {/* Return Calculations */}
                <div className={cn(
                  "p-3 border space-y-2 text-[10px]",
                  isDarkTheme ? "bg-[#1A1A1A] border-[#262626]" : "bg-[#F7F7F5] border-[#E4E4E4]"
                )}>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] uppercase font-bold">Payout Rate (+85%)</span>
                    <span className="font-mono font-bold text-[#16835B]">+${(stake * 0.85).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-[#E4E4E4] dark:border-[#333333] pt-1.5">
                    <span className="text-[#6B7280] uppercase font-bold">Gross Settlement</span>
                    <span className="font-mono font-bold text-[#16835B]">${(stake * 1.85).toFixed(2)}</span>
                  </div>
                </div>

                {/* Execution Button */}
                <button 
                  onClick={() => handleExecute()}
                  disabled={!direction}
                  className={cn(
                    "w-full py-3 text-xs font-bold uppercase tracking-widest border flex items-center justify-center space-x-2 transition-all shadow-md",
                    direction === "CALL" 
                      ? "bg-[#16835B] text-white border-[#16835B]" 
                      : direction === "PUT" 
                      ? "bg-[#0055FF] text-white border-[#0055FF]" 
                      : "bg-[#E4E4E4] text-[#6B7280] border-[#E4E4E4] cursor-not-allowed dark:bg-[#262626] dark:border-[#262626]"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>TRANSMIT {direction || 'VECTOR'} ORDER</span>
                </button>

                {/* Risk Confirmation Dialog (if one-click trade is disabled) */}
                {reviewActive && !oneClickTrade && (
                  <div className="border-t-2 border-[#0055FF] pt-3 animate-in fade-in duration-200 bg-[#F7F7F5] dark:bg-[#1A1A1A] p-3 rounded">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0055FF]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Risk Confirmation</span>
                    </div>
                    <p className="text-[9px] text-[#6B7280] leading-tight mb-3">
                      Execute <span className="font-bold text-[#0055FF]">{direction}</span> on {activeInst.symbol} for ${stake} USD capital exposure.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleExecute()} className="bg-[#0A0A0A] dark:bg-[#0055FF] text-white py-2 text-[9px] font-bold uppercase hover:bg-[#0055FF] transition-colors">Confirm</button>
                      <button onClick={() => setReviewActive(false)} className="bg-white dark:bg-[#262626] border border-[#E4E4E4] dark:border-[#333333] text-[#0A0A0A] dark:text-white py-2 text-[9px] font-bold uppercase hover:bg-[#E4E4E4] transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: Market Monitor List */}
            {leftTab === 'MARKETS' && (
              <div className="flex-grow overflow-y-auto no-scrollbar divide-y divide-[#E4E4E4] dark:divide-[#262626]">
                {AVAILABLE_INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.symbol}
                    onClick={() => handleSymbolChange(inst.symbol)}
                    className={cn(
                      "w-full p-3.5 text-left transition-colors flex justify-between items-center group",
                      activeInst.symbol === inst.symbol 
                        ? (isDarkTheme ? "bg-[#0055FF]/10 border-l-4 border-l-[#0055FF]" : "bg-[#0055FF]/5 border-l-4 border-l-[#0055FF]")
                        : (isDarkTheme ? "hover:bg-[#1A1A1A]" : "hover:bg-[#F7F7F5]")
                    )}
                  >
                    <div>
                      <span className={cn("text-xs font-mono font-bold block", activeInst.symbol === inst.symbol ? "text-[#0055FF]" : "")}>
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
            )}

          </div>

          {/* ========================================================================= */}
          {/* MAIN CHART AREA & MOBILE TIGHTLY-SPACED ACTION CONTROLS                   */}
          {/* ========================================================================= */}
          <main className={`flex-grow flex flex-col overflow-hidden relative ${isResizing ? 'select-none' : ''}`}>
            
            {/* Consolidated Workspace Toolbar */}
            <div className={cn(
              "flex items-center justify-between p-2.5 border-b z-40 shrink-0 transition-colors",
              isDarkTheme ? "bg-[#121212] border-[#262626]" : "bg-white border-[#E4E4E4]"
            )}>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => { setLeftTab('MARKETS'); setIsMobileMarketMenuOpen(true); }} 
                  className={cn(
                    "flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 transition-colors",
                    isDarkTheme ? "border-[#333333] bg-[#1A1A1A]" : "border-[#E4E4E4] bg-[#F7F7F5] hover:bg-[#E4E4E4]"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#0055FF]" />
                  <span>{activeInst.symbol}</span>
                  <ChevronDown className="w-3 h-3 text-[#6B7280]" />
                </button>
                <div className="hidden md:flex items-center space-x-2 text-[9px] text-[#6B7280] uppercase tracking-widest font-bold">
                  <span>&mdash; {activeInst.name} ({activeInst.settlementMethod})</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-right">
                <div>
                  <span className="text-xs md:text-sm font-mono font-bold block leading-none">
                    {livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <span className={cn("text-[9px] font-mono font-bold block mt-0.5", liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                    {liveMetrics.percent >= 0 ? "+" : ""}{liveMetrics.percent}%
                  </span>
                </div>

                <button
                  onClick={() => setIsMobilePositionsOpen(!isMobilePositionsOpen)}
                  className={cn(
                    "md:hidden p-1.5 border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1",
                    isDarkTheme ? "border-[#333333] bg-[#1A1A1A]" : "border-[#E4E4E4] bg-[#F7F7F5]"
                  )}
                >
                  <Layers className="w-3.5 h-3.5 text-[#0055FF]" />
                  <span>Pos ({activePositions.length})</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {successMessage && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[100] bg-[#0A0A0A] text-white px-4 py-2 border border-[#16835B] shadow-2xl flex items-center space-x-2 animate-in fade-in duration-200 rounded">
                <CheckCircle2 className="w-4 h-4 text-[#16835B]" />
                <div className="text-xs font-mono">
                  <span className="font-bold uppercase text-[#16835B] block">Success</span>
                  <p className="text-[10px] opacity-90">{successMessage}</p>
                </div>
              </div>
            )}

            {/* TradingView Chart Container */}
            <div className="flex-grow relative w-full h-full min-h-0 bg-white">
              <TradingViewChart symbol={activeInst.symbol} />
            </div>

            {/* Desktop Vertical Tray Resizer */}
            <div 
              onMouseDown={startResizing}
              className="hidden md:flex h-1.5 bg-[#E4E4E4] dark:bg-[#262626] hover:bg-[#0055FF] cursor-row-resize items-center justify-center group transition-colors z-[60]"
            >
              <div className="w-12 h-0.5 bg-[#6B7280] group-hover:bg-white rounded-full"></div>
            </div>

            {/* Desktop Active Exposure Tray */}
            <div 
              style={{ height: `${trayHeight}px` }}
              className={cn(
                "hidden md:block border-t shrink-0 overflow-y-auto no-scrollbar relative z-50 transition-colors",
                isDarkTheme ? "bg-[#121212] border-[#262626]" : "bg-white border-[#E4E4E4]"
              )}
            >
              <div className={cn(
                "px-4 py-1.5 border-b flex justify-between items-center sticky top-0 z-10",
                isDarkTheme ? "bg-[#1A1A1A] border-[#262626]" : "bg-[#F7F7F5] border-[#E4E4E4]"
              )}>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">Active Positions ({activePositions.length})</span>
                  <GripHorizontal className="w-3 h-3 text-[#6B7280]" />
                </div>
                <span className="text-[8px] text-[#6B7280] uppercase tracking-widest">Auto-Settles in ~18s</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead>
                    <tr className={cn(
                      "uppercase border-b text-[#6B7280]",
                      isDarkTheme ? "bg-[#1A1A1A]/50 border-[#262626]" : "bg-[#F7F7F5]/50 border-[#E4E4E4]"
                    )}>
                      <th className="p-2 font-bold">Instrument</th>
                      <th className="p-2 font-bold">Direction</th>
                      <th className="p-2 font-bold text-right">Stake</th>
                      <th className="p-2 font-bold text-right">Entry Price</th>
                      <th className="p-2 font-bold text-center">Status</th>
                      <th className="p-2 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E4] dark:divide-[#262626]">
                    {positionsLoading ? (
                      <tr><td colSpan={6} className="p-4 text-center text-[#6B7280] font-mono">Syncing pipeline...</td></tr>
                    ) : activePositions.length === 0 ? (
                      <tr><td colSpan={6} className="p-4 text-center text-[#6B7280] uppercase font-bold text-[9px] tracking-wider">No active exposure records.</td></tr>
                    ) : activePositions.map((pos: any) => (
                      <tr key={pos.id} className="hover:bg-[#F7F7F5] dark:hover:bg-[#1A1A1A]">
                        <td className="p-2 font-mono font-bold">{pos.instrument}</td>
                        <td className="p-2">
                          <span className={cn("px-1.5 py-0.5 border text-[9px] font-bold", pos.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#0055FF] text-[#0055FF]')}>
                            {pos.vector}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono">${formatNumber(pos.stake, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 text-right font-mono">${formatNumber(pos.entryPrice, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 text-center">
                          <span className="text-[8px] font-bold uppercase text-[#0055FF] animate-pulse">Live</span>
                        </td>
                        <td className="p-2 text-center">
                          <button 
                            onClick={() => handleEarlyCashout(pos)} 
                            className="px-2 py-0.5 text-[8px] font-bold uppercase bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 transition-colors rounded"
                          >
                            Cashout (35%)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Bottom Positions Modal */}
            {isMobilePositionsOpen && (
              <div className="fixed inset-0 z-[220] md:hidden flex flex-col justify-end">
                <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobilePositionsOpen(false)}></div>
                <div className="relative bg-white dark:bg-[#121212] text-[#0A0A0A] dark:text-white border-t-2 border-[#0055FF] max-h-[60vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                  <div className="p-3 border-b border-[#E4E4E4] dark:border-[#262626] bg-[#F7F7F5] dark:bg-[#1A1A1A] flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0055FF]" /> Active Positions ({activePositions.length})
                    </span>
                    <button onClick={() => setIsMobilePositionsOpen(false)} className="p-1"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="p-3 overflow-y-auto space-y-2 text-xs">
                    {activePositions.length === 0 ? (
                      <p className="text-center py-6 text-[10px] text-[#6B7280] uppercase tracking-wider font-bold">No active positions open</p>
                    ) : activePositions.map((pos: any) => (
                      <div key={pos.id} className="p-3 border border-[#E4E4E4] dark:border-[#262626] bg-[#F7F7F5] dark:bg-[#1A1A1A] flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold">{pos.instrument}</span>
                            <span className={cn("px-1 py-0.5 border text-[8px] font-bold", pos.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#0055FF] text-[#0055FF]')}>
                              {pos.vector}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#6B7280] font-mono block mt-1">Entry: ${pos.entryPrice?.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold block">${pos.stake?.toFixed(2)}</span>
                          <button 
                            onClick={() => handleEarlyCashout(pos)} 
                            className="mt-1 px-2 py-0.5 text-[8px] font-bold uppercase bg-amber-500 text-white rounded"
                          >
                            Cashout
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MOBILE ACTION BUTTONS: REDUCED LINE SPACING, TIGHT & RESPONSIVE            */}
            {/* ========================================================================= */}
            <div className={cn(
              "md:hidden p-1.5 border-t grid grid-cols-2 gap-1.5 z-40 shadow-lg shrink-0 transition-colors",
              isDarkTheme ? "bg-[#121212] border-[#262626]" : "bg-white border-[#E4E4E4]"
            )}>
              <button 
                onClick={() => handleVectorClick("CALL")}
                className="py-2.5 bg-[#16835B] hover:bg-[#126b4a] text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow active:scale-[0.98] transition-transform rounded"
              >
                <TrendingUp className="w-4 h-4" />
                <span>CALL VECTOR</span>
              </button>
              <button 
                onClick={() => handleVectorClick("PUT")}
                className="py-2.5 bg-[#0055FF] hover:bg-[#0044cc] text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow active:scale-[0.98] transition-transform rounded"
              >
                <TrendingDown className="w-4 h-4" />
                <span>PUT VECTOR</span>
              </button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
