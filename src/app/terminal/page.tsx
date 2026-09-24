'use client';

/**
 * @fileOverview High-Performance Electronic Trading Terminal Workspace.
 * Optimized layout with technical analysis settings and responsive action controls.
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
  LineChart,
  AreaChart,
  Activity,
  Maximize2
} from "lucide-react";
import { TradingViewChart, ChartMode } from "@/components/terminal/TradingViewChart";
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
  const [leftTab, setLeftTab] = useState<'TICKET' | 'MARKETS'>('TICKET');

  // Chart Analysis Settings
  const [chartMode, setChartMode] = useState<ChartMode>('Candlestick');
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [timeframe, setTimeframe] = useState('5m');

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
    <div className="h-screen flex flex-col overflow-hidden font-sans relative transition-colors duration-200 bg-white text-[#0A0A0A]">
      <TerminalTutorial />
      
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-[250] md:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white text-[#0A0A0A] animate-in slide-in-from-left duration-300 shadow-2xl">
             <AuthedSidebar isMobile onLinkClick={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <header className="relative h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-6 shrink-0 z-50 shadow-sm transition-colors bg-white border-[#E4E4E4]">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={() => setIsMobileNavOpen(true)} className="p-1.5 hover:bg-[#F7F7F5] transition-colors md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center">
            <Image src="/assets/logo2.png" alt="Varban Terminal" width={110} height={26} className="h-6 md:h-7 w-auto object-contain" priority />
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-2 border px-2 md:px-3 py-1 transition-colors shadow-sm select-none bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
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

      <div className="flex-grow flex overflow-hidden relative">
        <AuthedSidebar className="hidden md:flex" />
        
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden md:ml-16">
          
          {/* LEFT SIDE PANEL: Trading & Asset Monitoring */}
          <div className={cn(
            "fixed inset-0 z-[200] md:relative md:inset-auto md:z-0 md:flex flex-col w-full md:w-80 border-r shrink-0 transition-transform duration-300 ease-in-out bg-white border-[#E4E4E4]",
            isMobileTradeMenuOpen || isMobileMarketMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 hidden md:flex"
          )}>
            
            <div className="flex border-b shrink-0 border-[#E4E4E4] bg-[#F7F7F5]">
              <button
                onClick={() => setLeftTab('TICKET')}
                className={cn(
                  "flex-1 py-3 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors border-b-2",
                  leftTab === 'TICKET' 
                    ? "border-[#0055FF] text-[#0055FF] bg-white" 
                    : "border-transparent text-[#6B7280] hover:text-[#0A0A0A]"
                )}
              >
                <Sliders className="w-3.5 h-3.5 text-[#0055FF]" />
                <span>Trade Configuration</span>
              </button>
              
              <button
                onClick={() => setLeftTab('MARKETS')}
                className={cn(
                  "flex-1 py-3 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors border-b-2",
                  leftTab === 'MARKETS' 
                    ? "border-[#0055FF] text-[#0055FF] bg-white" 
                    : "border-transparent text-[#6B7280] hover:text-[#0A0A0A]"
                )}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#16835B]" />
                <span>Markets</span>
              </button>
            </div>

            {leftTab === 'TICKET' && (
              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-grow">
                <div className="p-3 border flex justify-between items-center bg-[#F7F7F5] border-[#E4E4E4]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#6B7280] block">Instrument</span>
                    <span className="text-xs font-mono font-bold text-[#0055FF]">{activeInst.symbol}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold block">${livePrice.toFixed(2)}</span>
                    <span className={cn("text-[9px]", liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#0055FF]")}>
                      {liveMetrics.percent >= 0 ? "+" : ""}{liveMetrics.percent}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleVectorClick("CALL")} className={cn("py-3 text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center space-x-1.5 transition-all shadow-sm", direction === "CALL" ? "bg-[#16835B] text-white border-[#16835B]" : "bg-white text-[#16835B] border-[#E4E4E4]")}>
                      <TrendingUp className="w-4 h-4" /> <span>CALL ↑</span>
                    </button>
                    <button onClick={() => handleVectorClick("PUT")} className={cn("py-3 text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center space-x-1.5 transition-all shadow-sm", direction === "PUT" ? "bg-[#0055FF] text-white border-[#0055FF]" : "bg-white text-[#0055FF] border-[#E4E4E4]")}>
                      <TrendingDown className="w-4 h-4" /> <span>PUT ↓</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Expiry Duration</label>
                  <div className="grid grid-cols-4 gap-1">
                    {["1m", "5m", "15m", "1h"].map((d) => (
                      <button key={d} onClick={() => setDuration(d)} className={cn("py-2 text-[10px] font-bold border transition-all", duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4]")}>{d}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">Committed Stake (USD)</label>
                  <input type="number" min={activeInst.minStake} max={activeInst.maxStake} value={stake} onChange={(e) => setStake(Number(e.target.value))} className="w-full p-2.5 border text-sm font-mono font-bold focus:border-[#0055FF] outline-none bg-white border-[#E4E4E4]" />
                </div>

                <div className="p-3 border flex items-center justify-between bg-[#F7F7F5] border-[#E4E4E4]">
                  <div className="flex items-center space-x-2">
                    <Zap className={cn("w-4 h-4", oneClickTrade ? "text-amber-500" : "text-[#6B7280]")} />
                    <div><span className="text-[9px] font-bold uppercase tracking-wider block">One-Click Trade</span></div>
                  </div>
                  <button onClick={() => setOneClickTrade(!oneClickTrade)} className={cn("w-10 h-5 rounded-full transition-colors relative", oneClickTrade ? 'bg-[#0055FF]' : 'bg-[#E4E4E4]')}><span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", oneClickTrade ? 'left-5.5' : 'left-0.5')} /></button>
                </div>

                <div className="p-3 border space-y-2 text-[10px] bg-[#F7F7F5] border-[#E4E4E4]">
                  <div className="flex justify-between"><span className="text-[#6B7280] uppercase font-bold">Return (+85%)</span><span className="font-mono font-bold text-[#16835B]">+${(stake * 0.85).toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-dashed border-[#E4E4E4] pt-1.5"><span className="text-[#6B7280] uppercase font-bold">Total Settlement</span><span className="font-mono font-bold text-[#16835B]">${(stake * 1.85).toFixed(2)}</span></div>
                </div>

                <button onClick={() => handleExecute()} disabled={!direction} className={cn("w-full py-3 text-xs font-bold uppercase tracking-widest border flex items-center justify-center space-x-2 transition-all shadow-md", direction === "CALL" ? "bg-[#16835B] text-white border-[#16835B]" : direction === "PUT" ? "bg-[#0055FF] text-white border-[#0055FF]" : "bg-[#E4E4E4] text-[#6B7280]")}>
                  <ShieldCheck className="w-4 h-4" /> <span>TRANSMIT {direction || 'VECTOR'} ORDER</span>
                </button>
              </div>
            )}

            {leftTab === 'MARKETS' && (
              <div className="flex-grow overflow-y-auto no-scrollbar divide-y divide-[#E4E4E4]">
                {AVAILABLE_INSTRUMENTS.map((inst) => (
                  <button key={inst.symbol} onClick={() => handleSymbolChange(inst.symbol)} className={cn("w-full p-3.5 text-left transition-colors flex justify-between items-center group", activeInst.symbol === inst.symbol ? "bg-[#0055FF]/5 border-l-4 border-l-[#0055FF]" : "hover:bg-[#F7F7F5]")}>
                    <div><span className={cn("text-xs font-mono font-bold block", activeInst.symbol === inst.symbol ? "text-[#0055FF]" : "")}>{inst.symbol}</span><span className="text-[9px] text-[#6B7280] uppercase tracking-tighter">{inst.category}</span></div>
                    <div className="text-right"><span className="text-[10px] font-mono font-bold block">${formatNumber(inst.price, { minimumFractionDigits: 2 })}</span><span className={cn("text-[9px] font-mono", inst.changePercent >= 0 ? "text-[#16835B]" : "text-[#0055FF]")}>{inst.changePercent >= 0 ? "+" : ""}{inst.changePercent}%</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MAIN CHART AREA */}
          <main className={`flex-grow flex flex-col overflow-hidden relative ${isResizing ? 'select-none' : ''}`}>
            
            {/* Header Toolbar */}
            <div className="flex items-center justify-between p-2.5 border-b z-40 shrink-0 transition-colors bg-white border-[#E4E4E4]">
              <div className="flex items-center space-x-2">
                <button onClick={() => { setLeftTab('MARKETS'); setIsMobileMarketMenuOpen(true); }} className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 transition-colors border-[#E4E4E4] bg-white hover:bg-[#F7F7F5]">
                  <BarChart3 className="w-3.5 h-3.5 text-[#0055FF]" /> <span>{activeInst.symbol}</span> <ChevronDown className="w-3 h-3 text-[#6B7280]" />
                </button>
              </div>
              <div className="flex items-center space-x-3 text-right">
                <div>
                  <span className="text-xs md:text-sm font-mono font-bold block leading-none">{livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                  <span className={cn("text-[9px] font-mono font-bold block mt-0.5", liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#0055FF]")}>{liveMetrics.percent >= 0 ? "+" : ""}{liveMetrics.percent}%</span>
                </div>
                <button onClick={() => setIsMobilePositionsOpen(!isMobilePositionsOpen)} className="md:hidden p-1.5 border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border-[#E4E4E4] bg-white">
                  <Layers className="w-3.5 h-3.5 text-[#0055FF]" /> <span>({activePositions.length})</span>
                </button>
              </div>
            </div>

            {/* TECHNICAL CHART SETTINGS BAR */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b shrink-0 z-30 transition-colors bg-[#F7F7F5] border-[#E4E4E4]">
              <div className="flex items-center space-x-1.5">
                {/* Timeframes */}
                <div className="flex bg-white border border-[#E4E4E4] rounded overflow-hidden">
                  {['1m', '5m', '15m', '1h', '1D'].map(tf => (
                    <button 
                      key={tf} 
                      onClick={() => setTimeframe(tf)}
                      className={cn("px-2 py-1 text-[9px] font-bold border-r last:border-r-0 transition-colors", timeframe === tf ? "bg-[#0055FF] text-white" : "text-[#6B7280] hover:text-[#0A0A0A]")}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="w-px h-4 bg-[#E4E4E4] mx-1"></div>

                {/* Chart Mode */}
                <div className="flex bg-white border border-[#E4E4E4] rounded overflow-hidden">
                  <button onClick={() => setChartMode('Candlestick')} className={cn("p-1.5 border-r transition-colors", chartMode === 'Candlestick' ? "bg-[#0055FF] text-white" : "text-[#6B7280]")}>
                    <BarChart3 className="w-3 h-3" />
                  </button>
                  <button onClick={() => setChartMode('Line')} className={cn("p-1.5 border-r transition-colors", chartMode === 'Line' ? "bg-[#0055FF] text-white" : "text-[#6B7280]")}>
                    <LineChart className="w-3 h-3" />
                  </button>
                  <button onClick={() => setChartMode('Area')} className={cn("p-1.5 transition-colors", chartMode === 'Area' ? "bg-[#0055FF] text-white" : "text-[#6B7280]")}>
                    <AreaChart className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Indicators Toggle */}
                <button 
                  onClick={() => setShowSMA(!showSMA)}
                  className={cn("px-2 py-1 border text-[9px] font-bold uppercase rounded transition-all", showSMA ? "bg-[#F59E0B] border-[#F59E0B] text-white" : "bg-white border-[#E4E4E4] text-[#6B7280]")}
                >
                  SMA 20
                </button>
                <button 
                  onClick={() => setShowEMA(!showEMA)}
                  className={cn("px-2 py-1 border text-[9px] font-bold uppercase rounded transition-all", showEMA ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-white border-[#E4E4E4] text-[#6B7280]")}
                >
                  EMA 50
                </button>
                <button className="p-1.5 border border-[#E4E4E4] rounded text-[#6B7280] hover:text-[#0055FF] bg-white">
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CHART CONTAINER */}
            <div className="flex-grow relative w-full h-full min-h-0 bg-transparent">
              <TradingViewChart 
                symbol={activeInst.symbol} 
                chartMode={chartMode}
                showSMA={showSMA}
                showEMA={showEMA}
                isDarkTheme={false}
              />
            </div>

            {/* Desktop Exposure Tray */}
            <div onMouseDown={startResizing} className="hidden md:flex h-1.5 bg-[#E4E4E4] hover:bg-[#0055FF] cursor-row-resize items-center justify-center z-[60]"><div className="w-12 h-0.5 bg-[#6B7280] rounded-full"></div></div>
            <div style={{ height: `${trayHeight}px` }} className="hidden md:block border-t shrink-0 overflow-y-auto no-scrollbar transition-colors bg-white border-[#E4E4E4]">
              <div className="px-4 py-1.5 border-b flex justify-between items-center sticky top-0 z-10 bg-inherit"><span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">Active Exposure Matrix ({activePositions.length})</span></div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead><tr className="uppercase border-b text-[#6B7280]"><th className="p-2 font-bold">Asset</th><th className="p-2 font-bold">Vector</th><th className="p-2 font-bold text-right">Stake</th><th className="p-2 font-bold text-right">Entry</th><th className="p-2 font-bold text-center">Status</th><th className="p-2 font-bold text-center">Action</th></tr></thead>
                  <tbody className="divide-y divide-[#E4E4E4]">{activePositions.length === 0 ? <tr><td colSpan={6} className="p-4 text-center uppercase font-bold text-[9px]">No open contracts</td></tr> : activePositions.map((pos: any) => (<tr key={pos.id} className="hover:bg-[#F7F7F5]"><td className="p-2 font-mono font-bold">{pos.instrument}</td><td className="p-2"><span className={cn("px-1.5 py-0.5 border text-[9px] font-bold", pos.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#0055FF] text-[#0055FF]')}>{pos.vector}</span></td><td className="p-2 text-right font-mono">${formatNumber(pos.stake, { minimumFractionDigits: 2 })}</td><td className="p-2 text-right font-mono">${formatNumber(pos.entryPrice, { minimumFractionDigits: 2 })}</td><td className="p-2 text-center"><span className="text-[8px] font-bold uppercase text-[#0055FF] animate-pulse">Live</span></td><td className="p-2 text-center"><button onClick={() => handleEarlyCashout(pos)} className="px-2 py-0.5 text-[8px] font-bold uppercase bg-amber-500 text-white rounded">Cashout</button></td></tr>))}</tbody>
                </table>
              </div>
            </div>

            {/* MOBILE ACTION BUTTONS: COMPRESSED SPACING */}
            <div className="md:hidden p-1.5 border-t grid grid-cols-2 gap-1.5 z-40 shadow-lg shrink-0 transition-colors bg-white border-[#E4E4E4]">
              <button onClick={() => handleVectorClick("CALL")} className="py-2.5 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 rounded active:scale-[0.98]">
                <TrendingUp className="w-4 h-4" /> <span>CALL VECTOR</span>
              </button>
              <button onClick={() => handleVectorClick("PUT")} className="py-2.5 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 rounded active:scale-[0.98]">
                <TrendingDown className="w-4 h-4" /> <span>PUT VECTOR</span>
              </button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
