'use client';

/**
 * @fileOverview Institutional Multi-Asset Trading Terminal.
 * 4-Panel Grid Architecture with resizable portfolio manager.
 * Optimized for Mobile: Left-side side command drawer for trade execution.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Menu, 
  X,
  ChevronDown,
  Clock as ClockIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  Sliders
} from "lucide-react";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import { LANGUAGE_LABELS, LocaleCode } from "@/app/lib/i18n-dictionary";
import { doc, updateDoc } from "firebase/firestore";

// Terminal Components
import AuthedSidebar from "@/components/layout/AuthedSidebar";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import MarketSelector from "@/components/terminal/MarketSelector";
import ExecutionTicket from "@/components/terminal/ExecutionTicket";
import PortfolioManager from "@/components/terminal/PortfolioManager";
import TerminalTutorial from "@/components/terminal/TerminalTutorial";

interface Position {
  id: string;
  instrument: string;
  vector: "BUY" | "SELL";
  entryPrice: number;
  stake: number;
  duration?: string;
  status: "Open" | "Closed";
  timestamp: number;
  isDemo: boolean;
  mode: 'SPOT' | 'DURATION';
}

const TIMEZONES = [
  { label: "UTC +00:00 (GMT)", value: "UTC+0" },
  { label: "UTC -08:00 (PT)", value: "UTC-8" },
  { label: "UTC -05:00 (ET)", value: "UTC-5" },
  { label: "UTC +01:00 (CET)", value: "UTC+1" },
  { label: "UTC +08:00 (HKT)", value: "UTC+8" }
];

export default function TerminalWorkspace() {
  const { user } = useUser();
  const db = useFirestore();
  const { formatNumber, locale, setLocale } = useTranslation();

  // Profile data from Firestore
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTradeDrawerOpen, setIsTradeDrawerOpen] = useState(false);
  const [preselectedSide, setPreselectedSide] = useState<'BUY' | 'SELL'>('BUY');
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  const [currentTime, setCurrentTime] = useState("");
  const activeTimezone = profile?.preferences?.timezone || "UTC+0";

  const [activeInst, setActiveInst] = useState<Instrument>(AVAILABLE_INSTRUMENTS[0]);
  const [marketData, setMarketData] = useState<Record<string, { price: number; percent: number }>>({});
  const [positions, setPositions] = useState<Position[]>([]);
  
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let offset = 0;
      if (activeTimezone === "UTC-8") offset = -8;
      else if (activeTimezone === "UTC-5") offset = -5;
      else if (activeTimezone === "UTC+1") offset = 1;
      else if (activeTimezone === "UTC+8") offset = 8;
      
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nd = new Date(utc + (3600000 * offset));
      
      setCurrentTime(nd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeTimezone]);

  const handleTimezoneChange = async (val: string) => {
    if (user && db) {
      await updateDoc(doc(db, "users", user.uid), { "preferences.timezone": val });
    }
  };

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const data = await fetchLivePrice(activeInst.symbol);
        if (!active) return;
        setMarketData(prev => ({
          ...prev,
          [activeInst.symbol]: { price: data.price, percent: data.changePercent }
        }));
      } catch (err) {}
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => { active = false; clearInterval(interval); };
  }, [activeInst.symbol]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setPositions(prev => prev.map(p => {
        if (p.status === 'Open' && p.mode === 'DURATION' && now - p.timestamp > 18000) {
          return { ...p, status: 'Closed' };
        }
        return p;
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleExecution = (params: any) => {
    const live = marketData[activeInst.symbol];
    if (!live || !user) return;

    const newPos: Position = {
      id: `VRB-${Math.random().toString(36).substring(7).toUpperCase()}`,
      instrument: activeInst.symbol,
      vector: params.side,
      entryPrice: live.price,
      stake: params.amount,
      mode: params.mode,
      duration: params.duration,
      status: "Open",
      timestamp: Date.now(),
      isDemo: accountMode === 'DEMO'
    };

    setPositions(prev => [newPos, ...prev]);
    setIsTradeDrawerOpen(false);
  };

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 150 && newHeight <= 600) setBottomPanelHeight(newHeight);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => { window.removeEventListener('mousemove', resize); window.removeEventListener('mouseup', stopResizing); };
  }, [resize, stopResizing]);

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  const openDrawer = (side: 'BUY' | 'SELL') => {
    setPreselectedSide(side);
    setIsTradeDrawerOpen(true);
  };

  return (
    <div className="flex h-[100dvh] min-h-0 w-full max-w-full flex-col overflow-hidden bg-white text-[#0A0A0A]">
      <TerminalTutorial />

      <header className="h-14 border-b border-[#E4E4E4] bg-white flex items-center justify-between shrink-0 z-[100] px-2 lg:px-4">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 lg:hidden text-[#0A0A0A]"><Menu className="w-5 h-5" /></button>
          <Link href="/dashboard" className="hidden lg:block shrink-0"><Image src="/assets/logo2.png" alt="Varban" width={80} height={20} className="w-auto object-contain" priority /></Link>
          <div className="h-6 w-px bg-[#E4E4E4] hidden lg:block"></div>
          
          <MarketSelector 
            activeSymbol={activeInst.symbol} 
            onSelect={setActiveInst} 
            livePrices={marketData} 
          />

          <div className="hidden lg:flex items-center space-x-8 px-6">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase text-[#6B7280]">24h High</span>
              <span className="text-[11px] font-mono font-bold text-[#0A0A0A]">{(marketData[activeInst.symbol]?.price * 1.02).toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase text-[#6B7280]">24h Low</span>
              <span className="text-[11px] font-mono font-bold text-[#0A0A0A]">{(marketData[activeInst.symbol]?.price * 0.98).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 lg:space-x-8">
          <div className="hidden lg:flex items-center bg-[#F7F7F5] border border-[#E4E4E4] p-1.5 pr-4 space-x-4">
            <div className="flex items-center bg-white border border-[#E4E4E4] px-3 py-1 shadow-sm">
               <ClockIcon className="w-3 h-3 text-[#0055FF] mr-2" />
               <span className="text-sm font-mono font-bold text-[#0A0A0A] tracking-tighter">{currentTime}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center group">
                <select 
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as LocaleCode)}
                  className="appearance-none bg-transparent text-[8px] font-bold uppercase tracking-widest text-[#0055FF] outline-none cursor-pointer pr-3 z-10"
                >
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <option key={code} value={code} className="bg-white text-[#0A0A0A]">{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 w-2.5 h-2.5 text-[#0055FF] pointer-events-none" />
              </div>
              
              <div className="w-px h-3 bg-[#E4E4E4]"></div>

              <div className="relative flex items-center group">
                <select 
                  value={activeTimezone}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="appearance-none bg-transparent text-[8px] font-bold uppercase tracking-widest text-[#6B7280] outline-none cursor-pointer pr-3 z-10"
                >
                  {TIMEZONES.map(tz => <option key={tz.value} value={tz.value} className="bg-white text-[#0A0A0A]">{tz.label}</option>)}
                </select>
                <ChevronDown className="absolute right-0 w-2.5 h-2.5 text-[#6B7280] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[7px] lg:text-[8px] font-bold uppercase text-[#6B7280]">{accountMode} BALANCE</span>
            <span className={cn("text-[10px] lg:text-xs font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 ring-[#0055FF]/20 overflow-hidden"
            >
              {profile?.profile?.photoUrl ? <img src={profile.profile.photoUrl} className="w-full h-full object-cover" /> : user?.email?.substring(0,2).toUpperCase()}
            </button>
            
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full pt-2">
                <ProfileDropdown 
                  user={user} 
                  profile={profile} 
                  accountMode={accountMode} 
                  demoBalance={demoBalance} 
                  isOpen={isProfileDropdownOpen} 
                  onClose={() => setIsProfileDropdownOpen(false)} 
                  onSelectMode={m => { setAccountMode(m); localStorage.setItem('varban_account_mode', m); }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 min-w-0 w-full flex-1 overflow-hidden">
        <AuthedSidebar className="hidden lg:flex" />

        <main className="flex min-h-0 min-w-0 w-full flex-1 overflow-hidden lg:ml-16">
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Desktop Chart Area */}
            <div className="hidden lg:block flex-grow min-h-0 bg-[#F7F7F5] relative">
              <TradingViewChart symbol={activeInst.symbol} />
            </div>

            {/* Mobile Chart Area */}
            <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden lg:hidden">
              <div id="tour-chart-mobile" className="relative min-h-0 min-w-0 w-full flex-1 overflow-hidden bg-[#F7F7F5]">
                <TradingViewChart symbol={activeInst.symbol} />
              </div>
            </div>

            {/* Desktop Ledger */}
            <div 
              style={{ height: `${bottomPanelHeight}px` }}
              className="hidden lg:flex flex-col shrink-0 relative"
            >
              <div 
                onMouseDown={startResizing}
                className="absolute -top-1 left-0 right-0 h-1 cursor-row-resize z-50 hover:bg-[#0055FF]/40 transition-colors"
              />
              <PortfolioManager 
                positions={positions.filter(p => p.status === 'Open')}
                orders={[]}
                history={positions.filter(p => p.status === 'Closed')}
              />
            </div>
            
            {/* Mobile Ledger (Compact) */}
            <div className="lg:hidden h-24 shrink-0 bg-white border-t border-[#E4E4E4] overflow-hidden">
              <PortfolioManager 
                positions={positions.filter(p => p.status === 'Open')}
                orders={[]}
                history={positions.filter(p => p.status === 'Closed')}
              />
            </div>
          </div>

          {/* Desktop Execution Panel */}
          <div className="hidden lg:flex w-[340px] border-l border-[#E4E4E4] shrink-0 bg-white shadow-xl relative z-40">
            <ExecutionTicket 
              instrument={activeInst} 
              livePrice={marketData[activeInst.symbol]?.price}
              balance={activeBalance}
              accountMode={accountMode}
              onExecute={handleExecution}
            />
          </div>
        </main>
      </div>

      {/* MOBILE COMMAND BAR: BUY/SELL TRIGGERS */}
      <div className="relative z-[110] flex h-[76px] w-full shrink-0 items-center gap-3 border-t border-[#E4E4E4] bg-white px-3 shadow-[0_-2px_15px_rgba(0,0,0,0.08)] sm:px-4 lg:hidden">
        <div className="flex-grow flex flex-col justify-center min-w-0">
           <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#6B7280] truncate">{activeInst.symbol}</span>
              <span className={cn(
                "text-[8px] font-bold uppercase",
                (marketData[activeInst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]"
              )}>
                {(marketData[activeInst.symbol]?.percent || 0) >= 0 ? "+" : ""}{marketData[activeInst.symbol]?.percent || "0.00"}%
              </span>
           </div>
           <span className={cn("text-sm font-mono font-bold tracking-tight", (marketData[activeInst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
              {marketData[activeInst.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "---"}
           </span>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => openDrawer('SELL')}
            className="px-6 py-3 bg-[#C43D3D] text-white text-[10px] font-bold uppercase tracking-widest shadow-md flex flex-col items-center justify-center leading-none"
          >
            <span className="mb-0.5">SELL</span>
            <span className="text-[8px] opacity-60 font-mono">PUT</span>
          </button>
          <button 
            onClick={() => openDrawer('BUY')}
            className="px-6 py-3 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest shadow-md flex flex-col items-center justify-center leading-none"
          >
            <span className="mb-0.5">BUY</span>
            <span className="text-[8px] opacity-60 font-mono">CALL</span>
          </button>
        </div>
      </div>

      {/* MOBILE LEFT COMMAND DRAWER (SETTINGS) */}
      {isTradeDrawerOpen && (
        <div className="fixed inset-0 z-[600] lg:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsTradeDrawerOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-white animate-in slide-in-from-left duration-300 flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5] shrink-0">
               <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0055FF]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Order Config: {activeInst.symbol}</span>
               </div>
               <button onClick={() => setIsTradeDrawerOpen(false)} className="p-1 text-[#6B7280] hover:text-[#0A0A0A]"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-grow overflow-y-auto no-scrollbar">
              <ExecutionTicket 
                instrument={activeInst} 
                livePrice={marketData[activeInst.symbol]?.price}
                balance={activeBalance}
                accountMode={accountMode}
                onExecute={handleExecution}
              />
            </div>
            <div className="p-4 bg-[#F7F7F5] border-t border-[#E4E4E4] shrink-0">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase text-[#6B7280]">Risk Engine Verified</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR NAVIGATION */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[700] lg:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300 shadow-2xl">
            <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
