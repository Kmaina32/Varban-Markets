'use client';

/**
 * @fileOverview High-Performance Electronic Trading Terminal Workspace.
 * Simplified language for a better user experience.
 * Threshold increased to lg (1024px) for optimized tablet views.
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
import { useUser, useDoc, useFirestore, useCollection, useAuth } from "@/firebase";
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
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<{ change: number | null, percent: number | null }>({ change: null, percent: null });
  const [direction, setDirection] = useState<"CALL" | "PUT" | null>(null);
  const [stake, setStake] = useState<number>(activeInst.minStake);
  const [duration, setDuration] = useState<string>("5m");
  const [reviewActive, setReviewActive] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [oneClickEnabled, setOneClickEnabled] = useState<boolean>(false);
  const [leftTab, setLeftTab] = useState<'TICKET' | 'MARKETS'>('TICKET');

  const [chartMode, setChartMode] = useState<ChartMode>('Candlestick');
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [timeframe, setTimeframe] = useState('5m');

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMarketMenuOpen, setIsMobileMarketMenuOpen] = useState(false);
  const [isMobileTradeMenuOpen, setIsMobileTradeMenuOpen] = useState(false);
  const [isMobilePositionsOpen, setIsMobilePositionsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const [trayHeight, setTrayHeight] = useState(180);
  const [isResizing, setIsResizing] = useState(false);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

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

  useEffect(() => {
    if (!user || !db || !allPositions || allPositions.length === 0 || livePrice === null) return;
    
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
        title: netProfit >= 0 ? "Trade Profit Added" : "Trade Lost",
        body: `Your trade ${latest.id.slice(0,6).toUpperCase()} on ${latest.instrument} has finished. Result: $${Math.abs(netProfit).toFixed(2)} ${netProfit >= 0 ? 'Gain' : 'Loss'}.`,
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
      setLivePrice(null);
      setLiveMetrics({ change: null, percent: null });
      setDirection(null);
      setReviewActive(false);
      setIsMobileMarketMenuOpen(false);
    }
  };

  const handleExecute = (overrideDirection?: "CALL" | "PUT") => {
    const selectedVector = overrideDirection || direction;
    if (!selectedVector || livePrice === null) return;

    if (accountMode === 'DEMO') {
      const currentDemoBal = demoBalance - stake;
      setDemoBalance(currentDemoBal);
      localStorage.setItem('varban_demo_balance', currentDemoBal.toString());
      window.dispatchEvent(new Event('varban_account_mode_changed'));
      
      setSuccessMessage(`${activeInst.symbol} ${selectedVector} Practice Trade Placed`);
      setReviewActive(false);
      setIsMobileTradeMenuOpen(false);
      setTimeout(() => setSuccessMessage(null), 3500);
      return;
    }

    if (!user || !db) return;
    
    if (stake > (profile?.balance || 0)) {
      alert("Not Enough Money: Please add more funds to your account to place this trade.");
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

    setSuccessMessage(`${activeInst.symbol} ${selectedVector} Trade Placed @ $${livePrice.toFixed(2)}`);
    setIsMobileTradeMenuOpen(false);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleVectorClick = (vec: "CALL" | "PUT") => {
    setDirection(vec);
    if (oneClickEnabled) {
      handleExecute(vec);
    } else {
      setReviewActive(true);
      setIsMobileTradeMenuOpen(true);
    }
  };

  const handleEarlyCashout = (pos: any) => {
    if (!user || !db) return;
    // a. Calculate early cashout amount as stake * 0.35
    const cashoutAmount = pos.stake * 0.35;
    const positionDocRef = doc(db, `users/${user.uid}/positions`, pos.id);
    
    // b. Call updateDoc on position doc: status='Closed', profit=-(stake * 0.65), earlyExit=true, closedAt=new Date().toISOString()
    updateDoc(positionDocRef, {
      status: "Closed",
      profit: -(pos.stake * 0.65),
      earlyExit: true,
      closedEarly: true,
      closedAt: new Date().toISOString(),
      settledAt: new Date().toISOString()
    }).catch((err) => {
      console.error("Failed to update position doc:", err);
    });

    // c. Call updateDoc on users/{uid} to add cashout amount back to balance (use increment)
    if (accountMode === 'REAL') {
      updateDoc(doc(db, "users", user.uid), {
        balance: increment(cashoutAmount),
        equity: increment(cashoutAmount)
      }).catch((err) => {
        console.error("Failed to update balance:", err);
      });

      addDoc(collection(db, `users/${user.uid}/transactions`), {
        type: "Early Cashout",
        asset: pos.instrument,
        amount: pos.stake,
        cashout: cashoutAmount,
        status: "Settled",
        output: `+${cashoutAmount.toFixed(2)}`,
        timestamp: serverTimestamp()
      }).catch((err) => {
        console.error("Failed to update transactions:", err);
      });
    } else {
      const currentDemoBal = demoBalance + cashoutAmount;
      setDemoBalance(currentDemoBal);
      localStorage.setItem('varban_demo_balance', currentDemoBal.toString());
      window.dispatchEvent(new Event('varban_account_mode_changed'));
    }

    // d. Show brief success toast/message
    setSuccessMessage(`Cashout 35% Executed: +$${cashoutAmount.toFixed(2)} returned to balance`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="h-screen h-[100dvh] flex flex-col overflow-hidden font-sans relative transition-colors duration-200 bg-white text-[#0A0A0A]">
      <TerminalTutorial />

      {/* FLOATING SUCCESS NOTIFICATION TOAST */}
      {successMessage && (
        <div className="fixed top-14 right-4 z-[260] bg-white border-2 border-[#16835B] text-[#16835B] px-4 py-3 shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#16835B] shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider">{successMessage}</span>
        </div>
      )}

      {/* RISK PRE-VERIFICATION / TRADE CONFIRMATION DIALOG */}
      {reviewActive && direction && (
        <div className="fixed inset-0 z-[300] bg-[#0A0A0A]/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E4E4] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 relative">
            <button 
              onClick={() => setReviewActive(false)} 
              className="absolute top-4 right-4 p-1 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-[#E4E4E4] pb-3">
              <div className="w-8 h-8 rounded-full bg-[#0055FF]/10 text-[#0055FF] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Risk Pre-Verification</h3>
                <p className="text-[10px] text-[#6B7280]">Review contract parameters before execution</p>
              </div>
            </div>

            <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-3 space-y-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280] uppercase text-[9px] font-bold">Instrument</span>
                <span className="font-mono font-bold text-[#0A0A0A]">{activeInst.symbol} ({activeInst.name})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280] uppercase text-[9px] font-bold">Direction Vector</span>
                <span className={cn(
                  "font-bold uppercase px-2 py-0.5 text-[9px] border rounded",
                  direction === 'CALL' ? "bg-[#16835B]/10 text-[#16835B] border-[#16835B]" : "bg-[#0055FF]/10 text-[#0055FF] border-[#0055FF]"
                )}>
                  {direction === 'CALL' ? 'Higher (CALL)' : 'Lower (PUT)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280] uppercase text-[9px] font-bold">Current Strike Price</span>
                <span className="font-mono font-bold text-[#0A0A0A]">
                  {livePrice !== null ? `$${livePrice.toFixed(2)}` : "---"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280] uppercase text-[9px] font-bold">Contract Duration</span>
                <span className="font-mono font-bold text-[#0A0A0A]">{duration}</span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-[#E4E4E4] pt-2">
                <span className="text-[#6B7280] uppercase text-[9px] font-bold">Committed Stake</span>
                <span className="font-mono font-bold text-[#0A0A0A]">${formatNumber(stake, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280] uppercase text-[9px] font-bold">Expected Payout (+85%)</span>
                <span className="font-mono font-bold text-[#16835B]">${formatNumber(stake * 1.85, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280] uppercase text-[9px] font-bold">Account</span>
                <span className="font-bold text-[9px] uppercase text-[#6B7280]">
                  {accountMode === 'REAL' ? 'Real Account' : 'Demo Account'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white border border-[#E4E4E4]">
              <div className="flex items-center space-x-2">
                <Zap className={cn("w-3.5 h-3.5", oneClickEnabled ? "text-[#0055FF]" : "text-[#6B7280]")} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">Enable One-Click Mode</span>
              </div>
              <button
                type="button"
                onClick={() => setOneClickEnabled(!oneClickEnabled)}
                className={cn(
                  "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border transition-colors",
                  oneClickEnabled ? "bg-[#0055FF] text-white border-[#0055FF]" : "bg-[#F7F7F5] text-[#6B7280] border-[#E4E4E4]"
                )}
              >
                {oneClickEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setReviewActive(false)}
                className="py-2.5 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecute()}
                className={cn(
                  "py-2.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center space-x-1.5",
                  direction === 'CALL' ? "bg-[#16835B] hover:bg-[#16835B]/90" : "bg-[#0055FF] hover:bg-[#0055FF]/90"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Execute</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE OPEN POSITIONS BOTTOM DRAWER */}
      {isMobilePositionsOpen && (
        <div className="fixed inset-0 z-[220] lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobilePositionsOpen(false)}></div>
          <div className="relative bg-white border-t border-[#E4E4E4] max-h-[75vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-3 border-b border-[#E4E4E4] flex items-center justify-between bg-[#F7F7F5]">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#0055FF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                  Open Positions ({activePositions.length})
                </span>
              </div>
              <button onClick={() => setIsMobilePositionsOpen(false)} className="p-1 text-[#6B7280] hover:text-[#0A0A0A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2">
              {activePositions.length === 0 ? (
                <div className="p-6 text-center text-[10px] font-bold uppercase text-[#6B7280]">
                  No active positions
                </div>
              ) : (
                activePositions.map((pos: any) => (
                  <div key={pos.id} className="p-3 border border-[#E4E4E4] bg-white rounded space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs">{pos.instrument}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 text-[8px] font-bold uppercase border rounded",
                        pos.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#0055FF] text-[#0055FF]'
                      )}>
                        {pos.vector === 'CALL' ? 'Higher' : 'Lower'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 text-[10px] text-[#6B7280]">
                      <div>Stake: <span className="font-mono font-bold text-[#0A0A0A]">${formatNumber(pos.stake, { minimumFractionDigits: 2 })}</span></div>
                      <div className="text-right">Entry: <span className="font-mono font-bold text-[#0A0A0A]">${formatNumber(pos.entryPrice, { minimumFractionDigits: 2 })}</span></div>
                    </div>
                    <div className="pt-2 border-t border-[#E4E4E4] flex items-center justify-between">
                      <span className="text-[9px] text-[#6B7280]">
                        Cashout (35%): <span className="font-mono font-bold text-amber-600">${formatNumber(pos.stake * 0.35, { minimumFractionDigits: 2 })}</span>
                      </span>
                      <button
                        onClick={() => handleEarlyCashout(pos)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider rounded transition-colors shadow-sm"
                      >
                        Cashout 35%
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-[250] lg:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white text-[#0A0A0A] animate-in slide-in-from-left duration-300 shadow-2xl">
             <AuthedSidebar isMobile onLinkClick={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* COMPACT MOBILE HEADER */}
      <header className="relative h-10 md:h-16 border-b flex items-center justify-between px-3 md:px-6 shrink-0 z-50 shadow-sm transition-colors bg-white border-[#E4E4E4]">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={() => setIsMobileNavOpen(true)} className="p-1 hover:bg-[#F7F7F5] transition-colors lg:hidden">
            <Menu className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center">
            <Image src="/assets/logo2.png" alt="Varban" width={75} height={18} style={{ height: 'auto' }} className="w-auto object-contain" priority />
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            id="tour-mode"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="hidden md:flex items-center space-x-1.5 border px-1.5 md:px-3 py-0.5 md:py-1 transition-colors shadow-sm select-none bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
          >
            <div className="text-right">
              <span className="text-[6px] md:text-[8px] text-[#6B7280] uppercase tracking-widest font-bold block">
                {accountMode === 'REAL' ? 'Real' : 'Demo'}
              </span>
              <span className={cn(
                "text-[8px] md:text-[10px] font-mono font-bold block",
                accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]"
              )}>
                ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <ChevronDown className="w-2.5 h-2.5 text-[#6B7280]" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
              className="flex items-center space-x-2 group focus:outline-none"
            >
              <div className={cn(
                "w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-[10px] md:text-xs transition-colors shadow-sm",
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
        <AuthedSidebar className="hidden lg:flex" />
        
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden lg:ml-16">
          
          {/* LEFT SIDE PANEL */}
          <div id="tour-settings" className={cn(
            "fixed inset-0 z-[200] lg:relative lg:inset-auto lg:z-0 lg:flex flex-col w-full lg:w-80 border-r shrink-0 transition-transform duration-300 ease-in-out bg-white border-[#E4E4E4]",
            isMobileTradeMenuOpen || isMobileMarketMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 hidden lg:flex"
          )}>
            
            <div className="flex border-b shrink-0 border-[#E4E4E4] bg-[#F7F7F5] items-center justify-between pr-2">
              <div className="flex flex-1">
                <button
                  onClick={() => setLeftTab('TICKET')}
                  className={cn(
                    "flex-1 py-3 px-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors border-b-2",
                    leftTab === 'TICKET' 
                      ? "border-[#0055FF] text-[#0055FF] bg-white" 
                      : "border-transparent text-[#6B7280] hover:text-[#0A0A0A]"
                  )}
                >
                  <Sliders className="w-3.5 h-3.5 text-[#0055FF]" />
                  <span>Trade Settings</span>
                </button>
                
                <button
                  onClick={() => setLeftTab('MARKETS')}
                  className={cn(
                    "flex-1 py-3 px-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors border-b-2",
                    leftTab === 'MARKETS' 
                      ? "border-[#0055FF] text-[#0055FF] bg-white" 
                      : "border-transparent text-[#6B7280] hover:text-[#0A0A0A]"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#16835B]" />
                  <span>Market List</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setOneClickEnabled(!oneClickEnabled)}
                className={cn(
                  "px-2 py-1 text-[8px] font-bold uppercase tracking-wider border rounded transition-all flex items-center space-x-1 shrink-0 ml-1",
                  oneClickEnabled 
                    ? "bg-[#0055FF] text-white border-[#0055FF] shadow-sm" 
                    : "bg-white text-[#6B7280] border-[#E4E4E4] hover:text-[#0A0A0A]"
                )}
                title={oneClickEnabled ? "One-Click Trading is ON" : "One-Click Trading is OFF"}
              >
                <Zap className={cn("w-2.5 h-2.5", oneClickEnabled ? "text-white" : "text-[#6B7280]")} />
                <span>ONE-CLICK</span>
              </button>

              <button
                onClick={() => { setIsMobileTradeMenuOpen(false); setIsMobileMarketMenuOpen(false); }}
                className="lg:hidden p-1 text-[#6B7280] hover:text-[#0A0A0A] ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {leftTab === 'TICKET' && (
              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-grow">
                {successMessage && (
                  <div className="p-3 bg-[#16835B]/10 border border-[#16835B] text-[10px] font-bold text-[#16835B] uppercase tracking-wide">
                    {successMessage}
                  </div>
                )}

                <div className="p-3 border flex justify-between items-center bg-[#F7F7F5] border-[#E4E4E4]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#6B7280] block">Market</span>
                    <span className="text-xs font-mono font-bold text-[#0A0A0A]">{activeInst.symbol}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold block">{livePrice !== null ? `$${livePrice.toFixed(2)}` : "---"}</span>
                    <span className={cn("text-[9px]", liveMetrics.percent !== null && liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#0055FF]")}>
                      {liveMetrics.percent !== null ? (liveMetrics.percent >= 0 ? "+" : "") + liveMetrics.percent + "%" : "---"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Choose Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleVectorClick("CALL")} className={cn("py-3 text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center space-x-1.5 transition-all shadow-sm", direction === "CALL" ? "bg-[#16835B] text-white border-[#16835B]" : "bg-white text-[#16835B] border-[#E4E4E4]")}>
                      <TrendingUp className="w-4 h-4" /> <span>Higher</span>
                    </button>
                    <button onClick={() => handleVectorClick("PUT")} className={cn("py-3 text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center space-x-1.5 transition-all shadow-sm", direction === "PUT" ? "bg-[#0055FF] text-white border-[#0055FF]" : "bg-white text-[#0055FF] border-[#E4E4E4]")}>
                      <TrendingDown className="w-4 h-4" /> <span>Lower</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1.5">Trade Duration</label>
                  <div className="grid grid-cols-4 gap-1">
                    {["1m", "5m", "15m", "1h"].map((d) => (
                      <button key={d} onClick={() => setDuration(d)} className={cn("py-2 text-[10px] font-bold border transition-all", duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4]")}>{d}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">Trade Amount (USD)</label>
                  <input type="number" min={activeInst.minStake} max={activeInst.maxStake} value={stake} onChange={(e) => setStake(Number(e.target.value))} className="w-full p-2.5 border text-sm font-mono font-bold focus:border-[#0A0A0A] outline-none bg-white border-[#E4E4E4]" />
                </div>

                <div className="p-3 border flex items-center justify-between bg-[#F7F7F5] border-[#E4E4E4]">
                  <div className="flex items-center space-x-2">
                    <Zap className={cn("w-4 h-4", oneClickEnabled ? "text-[#0055FF]" : "text-[#6B7280]")} />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider block">One-Click Trading</span>
                      <span className="text-[8px] text-[#6B7280] block">Bypass confirmation dialog</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setOneClickEnabled(!oneClickEnabled)} 
                    className={cn(
                      "px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border rounded transition-all shadow-sm",
                      oneClickEnabled 
                        ? "bg-[#0055FF] text-white border-[#0055FF]" 
                        : "bg-white text-[#6B7280] border-[#E4E4E4] hover:text-[#0A0A0A]"
                    )}
                  >
                    ONE-CLICK
                  </button>
                </div>

                <div className="p-3 border space-y-2 text-[10px] bg-[#F7F7F5] border-[#E4E4E4]">
                  <div className="flex justify-between"><span className="text-[#6B7280] uppercase font-bold">Potential Profit</span><span className="font-mono font-bold text-[#16835B]">+${(stake * 0.85).toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-dashed border-[#E4E4E4] pt-1.5"><span className="text-[#6B7280] uppercase font-bold">Total Payout</span><span className="font-mono font-bold text-[#16835B]">${(stake * 1.85).toFixed(2)}</span></div>
                </div>

                <button 
                  onClick={() => {
                    if (oneClickEnabled) {
                      handleExecute();
                    } else {
                      setReviewActive(true);
                    }
                  }} 
                  disabled={!direction || livePrice === null} 
                  className={cn(
                    "w-full py-3 text-xs font-bold uppercase tracking-widest border flex items-center justify-center space-x-2 transition-all shadow-md", 
                    direction === "CALL" ? "bg-[#16835B] text-white border-[#16835B]" : direction === "PUT" ? "bg-[#0055FF] text-white border-[#0055FF]" : "bg-[#E4E4E4] text-[#6B7280]"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" /> <span>{livePrice === null ? "SYNCING..." : `PLACE ${direction || ''} TRADE`}</span>
                </button>
              </div>
            )}

            {leftTab === 'MARKETS' && (
              <div className="flex-grow overflow-y-auto no-scrollbar divide-y divide-[#E4E4E4]">
                {AVAILABLE_INSTRUMENTS.map((inst) => (
                  <button key={inst.symbol} onClick={() => handleSymbolChange(inst.symbol)} className={cn("w-full p-3.5 text-left transition-colors flex justify-between items-center group", activeInst.symbol === inst.symbol ? "bg-[#0055FF]/5 border-l-4 border-l-[#0055FF]" : "hover:bg-[#F7F7F5]")}>
                    <div><span className={cn("text-xs font-mono font-bold block", activeInst.symbol === inst.symbol ? "text-[#0055FF]" : "")}>{inst.symbol}</span><span className="text-[9px] text-[#6B7280] uppercase tracking-tighter">{inst.category}</span></div>
                    <div className="text-right"><span className="text-[10px] font-mono font-bold block">---</span><span className="text-[9px] font-mono">---%</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MAIN CHART AREA */}
          <main className={`flex-grow flex flex-col overflow-hidden relative shrink-0 ${isResizing ? 'select-none' : ''}`}>
            
            <div id="tour-market-select" className="flex items-center justify-between p-1 md:p-2 border-b z-40 shrink-0 transition-colors bg-white border-[#E4E4E4]">
              <div className="flex items-center space-x-2">
                <button onClick={() => { setLeftTab('MARKETS'); setIsMobileMarketMenuOpen(true); }} className="flex items-center space-x-1 text-[8px] md:text-[10px] font-bold uppercase tracking-wider border px-1.5 py-0.5 transition-colors border-[#E4E4E4] bg-white hover:bg-[#F7F7F5]">
                  <BarChart3 className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 text-[#0055FF]" /> <span>{activeInst.symbol}</span> <ChevronDown className="w-2 md:w-3 h-2 md:h-3 text-[#6B7280]" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-right">
                <div>
                  <span className="text-[9px] md:text-sm font-mono font-bold block leading-none">
                    {livePrice !== null ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}
                  </span>
                  <span className={cn("text-[7px] md:text-[9px] font-mono font-bold block mt-0.5", liveMetrics.percent !== null && liveMetrics.percent >= 0 ? "text-[#16835B]" : "text-[#0055FF]")}>
                    {liveMetrics.percent !== null ? (liveMetrics.percent >= 0 ? "+" : "") + liveMetrics.percent + "%" : "---"}
                  </span>
                </div>
                <button onClick={() => setIsMobilePositionsOpen(!isMobilePositionsOpen)} className="lg:hidden p-0.5 border text-[7px] font-bold uppercase tracking-wider flex items-center gap-0.5 border-[#E4E4E4] bg-white rounded">
                  <Layers className="w-2.5 h-2.5 text-[#0055FF]" /> <span>({activePositions.length})</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 py-0 md:py-1 border-b shrink-0 z-30 transition-colors bg-[#F7F7F5] border-[#E4E4E4] overflow-x-auto no-scrollbar">
              <div className="flex items-center space-x-1 md:space-x-1.5 shrink-0">
                <div className="flex bg-white border border-[#E4E4E4] rounded overflow-hidden">
                  {['1m', '5m', '15m', '1h', '1D'].map(tf => (
                    <button 
                      key={tf} 
                      onClick={() => setTimeframe(tf)}
                      className={cn("px-1 md:px-2 py-0.5 md:py-1 text-[7px] md:text-[9px] font-bold border-r last:border-r-0 transition-colors", timeframe === tf ? "bg-[#0055FF] text-white" : "text-[#6B7280] hover:text-[#0A0A0A]")}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="w-px h-3 md:h-4 bg-[#E4E4E4] mx-0.5"></div>

                <div className="flex bg-white border border-[#E4E4E4] rounded overflow-hidden">
                  <button onClick={() => setChartMode('Candlestick')} className={cn("p-0.5 md:p-1.5 border-r transition-colors", chartMode === 'Candlestick' ? "bg-[#0055FF] text-white" : "text-[#6B7280]")}>
                    <BarChart3 className="w-2 md:w-3 h-2 md:h-3" />
                  </button>
                  <button onClick={() => setChartMode('Line')} className={cn("p-0.5 md:p-1.5 border-r transition-colors", chartMode === 'Line' ? "bg-[#0055FF] text-white" : "text-[#6B7280]")}>
                    <LineChart className="w-2 md:w-3 h-2 md:h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-1 md:space-x-1.5 shrink-0 ml-1">
                <button 
                  onClick={() => setShowSMA(!showSMA)}
                  className={cn("px-1 py-0.5 md:py-1 border text-[7px] md:text-[9px] font-bold uppercase rounded transition-all whitespace-nowrap", showSMA ? "bg-[#F59E0B] border-[#F59E0B] text-white" : "bg-white border-[#E4E4E4] text-[#6B7280]")}
                >
                  SMA
                </button>
                <button 
                  onClick={() => setShowEMA(!showEMA)}
                  className={cn("px-1 py-0.5 md:py-1 border text-[7px] md:text-[9px] font-bold uppercase rounded transition-all whitespace-nowrap", showEMA ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-white border-[#E4E4E4] text-[#6B7280]")}
                >
                  EMA
                </button>
              </div>
            </div>

            <div id="tour-chart" className="flex-grow relative w-full min-h-0 bg-transparent overflow-hidden">
              <TradingViewChart 
                symbol={activeInst.symbol} 
                chartMode={chartMode}
                showSMA={showSMA}
                showEMA={showEMA}
                isDarkTheme={false}
              />
            </div>

            {/* Desktop Open Trades Tray / Active Positions Panel */}
            <div onMouseDown={startResizing} className="hidden lg:flex h-1 bg-[#E4E4E4] hover:bg-[#0055FF] cursor-row-resize items-center justify-center z-[60]"><div className="w-12 h-0.5 bg-[#6B7280] rounded-full"></div></div>
            <div style={{ height: `${trayHeight}px` }} className="hidden lg:block border-t shrink-0 overflow-y-auto no-scrollbar transition-colors bg-white border-[#E4E4E4]">
              <div className="px-4 py-1.5 border-b flex justify-between items-center sticky top-0 z-10 bg-inherit">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">
                  Current Trades ({activePositions.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="uppercase border-b text-[#6B7280]">
                      <th className="p-2 font-bold">Market</th>
                      <th className="p-2 font-bold">Side</th>
                      <th className="p-2 font-bold text-right">Amount</th>
                      <th className="p-2 font-bold text-right">Entry</th>
                      <th className="p-2 font-bold text-center">Status</th>
                      <th className="p-2 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E4]">
                    {activePositions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center uppercase font-bold text-[9px] text-[#6B7280]">
                          No open trades
                        </td>
                      </tr>
                    ) : (
                      activePositions.map((pos: any) => (
                        <tr key={pos.id} className="hover:bg-[#F7F7F5]">
                          <td className="p-2 font-mono font-bold">{pos.instrument}</td>
                          <td className="p-2">
                            <span className={cn(
                              "px-1.5 py-0.5 border text-[9px] font-bold", 
                              pos.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#0055FF] text-[#0055FF]'
                            )}>
                              {pos.vector === 'CALL' ? 'Higher' : 'Lower'}
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
                              className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors shadow-sm whitespace-nowrap"
                              title={`Cash out 35% early: $${(pos.stake * 0.35).toFixed(2)}`}
                            >
                              Cashout 35%
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE ACTION BUTTONS */}
            <div className="lg:hidden p-1 border-t grid grid-cols-2 gap-1 z-40 shadow-lg shrink-0 transition-colors bg-white border-[#E4E4E4]">
              <button onClick={() => handleVectorClick("CALL")} className="py-2 bg-[#16835B] text-white text-[9px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 rounded active:scale-[0.98]">
                <TrendingUp className="w-3.5 h-3.5" /> <span>Higher</span>
              </button>
              <button onClick={() => handleVectorClick("PUT")} className="py-2 bg-[#0055FF] text-white text-[9px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 rounded active:scale-[0.98]">
                <TrendingDown className="w-3.5 h-3.5" /> <span>Lower</span>
              </button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
