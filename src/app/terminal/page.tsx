'use client';

/**
 * @fileOverview Institutional Multi-Asset Trading Terminal.
 * 4-Panel Grid Architecture with resizable portfolio manager.
 * Updated: Mobile profile dropdown fix and Trade settings drawer.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Menu, 
  X,
  ChevronUp
} from "lucide-react";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { useUser } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { createClient } from "@/app/lib/supabase/client";
import { cn } from "@/app/lib/utils";

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

export default function TerminalWorkspace() {
  const { user } = useUser();
  const supabase = createClient();
  const { formatNumber } = useTranslation();

  // IDENTITY & UI STATE
  const [profile, setProfile] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTradeDrawerOpen, setIsTradeDrawerOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  // TRADING CONTEXT
  const [activeInst, setActiveInst] = useState<Instrument>(AVAILABLE_INSTRUMENTS[0]);
  const [marketData, setMarketData] = useState<Record<string, { price: number; percent: number }>>({});
  const [positions, setPositions] = useState<Position[]>([]);
  
  // LAYOUT STATE
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);

  // DATA HANDSHAKE
  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    
    async function init() {
      if (!user?.uid) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.uid).single();
      if (data) setProfile(data);
    }
    init();
  }, [user?.uid, supabase]);

  // PRICE FEED SYNC
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

  // POSITION SETTLEMENT (SIMULATED FOR PROTOTYPE)
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

  // RESIZE LOGIC
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

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <TerminalTutorial />

      {/* TOP HEADER BLOCK */}
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
          <div className="flex flex-col text-right">
            <span className="text-[7px] lg:text-[8px] font-bold uppercase text-[#6B7280]">{accountMode} BALANCE</span>
            <span className={cn("text-[10px] lg:text-xs font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 ring-[#0055FF]/20"
            >
              {profile?.photo_url ? <img src={profile.photo_url} className="w-full h-full object-cover rounded-full" /> : user?.email?.substring(0,2).toUpperCase()}
            </button>
            
            {/* Desktop & Mobile Integrated Dropdown */}
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

      {/* MAIN TERMINAL GRID */}
      <div className="flex-grow flex overflow-hidden relative">
        <AuthedSidebar className="hidden lg:flex" />

        <main className="flex-grow flex lg:ml-16 overflow-hidden">
          {/* LEFT: CHART & PORTFOLIO */}
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow min-h-0 bg-[#F7F7F5] relative">
              <TradingViewChart symbol={activeInst.symbol} />
            </div>

            {/* BOTTOM: PORTFOLIO */}
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
            
            {/* Mobile Portfolio (Static small height) */}
            <div className="lg:hidden h-24 shrink-0 bg-white border-t border-[#E4E4E4] overflow-hidden">
              <PortfolioManager 
                positions={positions.filter(p => p.status === 'Open')}
                orders={[]}
                history={positions.filter(p => p.status === 'Closed')}
              />
            </div>
          </div>

          {/* RIGHT: EXECUTION TICKET (Desktop Only) */}
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

      {/* MOBILE EXECUTION BAR */}
      <div className="lg:hidden h-16 border-t border-[#E4E4E4] bg-white flex items-center px-4 gap-3 shrink-0 z-[110]">
        <div className="flex-grow flex flex-col">
           <span className="text-[10px] font-mono font-bold text-[#6B7280]">{activeInst.symbol}</span>
           <span className={cn("text-xs font-mono font-bold", (marketData[activeInst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
              {marketData[activeInst.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "---"}
           </span>
        </div>
        <button 
          onClick={() => setIsTradeDrawerOpen(true)}
          className="px-8 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
        >
          Open Trade <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MOBILE TRADE DRAWER */}
      {isTradeDrawerOpen && (
        <div className="fixed inset-0 z-[500] lg:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsTradeDrawerOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white animate-in slide-in-from-bottom duration-300 rounded-t-xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5]">
               <span className="text-[10px] font-bold uppercase tracking-widest">Execute: {activeInst.symbol}</span>
               <button onClick={() => setIsTradeDrawerOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <ExecutionTicket 
                instrument={activeInst} 
                livePrice={marketData[activeInst.symbol]?.price}
                balance={activeBalance}
                accountMode={accountMode}
                onExecute={handleExecution}
              />
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[400] lg:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300">
            <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
