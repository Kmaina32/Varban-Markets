'use client';

/**
 * @fileOverview Institutional Multi-Asset Trading Terminal.
 * Dedicated workspace for Forex, Crypto and Equities.
 */

import { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Menu, 
  ChevronDown,
  Clock as ClockIcon,
  MousePointer2,
  Layout,
  Globe,
  BarChart2
} from "lucide-react";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import { LANGUAGE_LABELS, LocaleCode } from "@/app/lib/i18n-dictionary";

// Terminal Components
import AuthedSidebar from "@/components/layout/AuthedSidebar";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import MarketSelector from "@/components/terminal/MarketSelector";
import ExecutionTicket from "@/components/terminal/ExecutionTicket";
import PortfolioManager from "@/components/terminal/PortfolioManager";
import MobileTerminal from "@/components/terminal/MobileTerminal";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

function TerminalContent() {
  const searchParams = useSearchParams();
  const symbolParam = searchParams.get('symbol');
  const { user } = useUser();
  const db = useFirestore();
  const { formatNumber, locale, setLocale } = useTranslation();

  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [activeRightTab, setActiveRightTab] = useState<'TRADE' | 'STATS'>('TRADE');
  // null until we know the screen size, so the desktop layout never flashes up on a phone
  const [isMobileViewport, setIsMobileViewport] = useState<boolean | null>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  const [currentTime, setCurrentTime] = useState("");
  const activeTimezone = profile?.preferences?.timezone || "UTC+0";

  // Filter out synthetic markets from the standard terminal
  const standardInstruments = useMemo(() => 
    AVAILABLE_INSTRUMENTS.filter(i => i.category !== 'Synthetic Indices')
  , []);

  const [activeInst, setActiveInst] = useState<Instrument>(() => {
    if (symbolParam) {
      const found = standardInstruments.find(i => i.symbol === symbolParam);
      if (found) return found;
    }
    return standardInstruments[0]; // BTC/USD is primary
  });

  const [marketData, setMarketData] = useState<Record<string, { price: number; percent: number }>>({});
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth < 1280);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    
    const handleBalanceUpdate = () => {
      const saved = localStorage.getItem('varban_practice_balance');
      if (saved) setDemoBalance(parseFloat(saved));
    };
    window.addEventListener('varban_balance_update', handleBalanceUpdate);
    handleBalanceUpdate();
    return () => window.removeEventListener('varban_balance_update', handleBalanceUpdate);
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

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const data = await fetchLivePrice(activeInst.symbol);
        if (!active) return;
        // A failed lookup comes back as 0; keep the last good price instead of showing 0.00.
        if (!data.price || data.price <= 0) return;
        setMarketData(prev => ({
          ...prev,
          [activeInst.symbol]: { price: data.price, percent: data.changePercent }
        }));
      } catch (err) {}
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => { active = false; clearInterval(interval); };
  }, [activeInst.symbol]);

  const handleExecution = (params: any) => {
    const live = marketData[activeInst.symbol];
    if (!live) return;
    const order = {
      id: `VRB-${Math.random().toString(36).substring(7).toUpperCase()}`,
      instrument: activeInst.symbol,
      vector: params.side,
      stake: params.amount,
      timestamp: Date.now(),
      isDemo: accountMode === 'DEMO',
      ...params,
      // Buy fills at the ask and Sell at the bid; the ticket works that out.
      entryPrice: params.entryPrice ?? live.price,
    };
    if (params.orderType && params.orderType !== 'MARKET') {
      setPendingOrders(prev => [{ ...order, status: "Pending" }, ...prev]);
    } else {
      setPositions(prev => [{ ...order, status: "Open" }, ...prev]);
    }
  };

  if (isMobileViewport === null) {
    return <LoadingOverlay message="Opening the terminal" />;
  }

  if (isMobileViewport) {
    return (
      <MobileTerminal 
        activeInst={activeInst} 
        onSelect={setActiveInst} 
        livePrices={marketData} 
        positions={positions} 
        onExecute={handleExecution}
      />
    );
  }

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <header className="h-14 border-b border-[#E4E4E4] bg-white flex items-center justify-between shrink-0 z-[100] px-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 xl:hidden text-[#0A0A0A]"><Menu className="w-5 h-5" /></button>
          <Link href="/client/dashboard" className="shrink-0">
            <Image src="/assets/logo2.png" alt="Varban" width={80} height={20} className="w-auto object-contain" priority />
          </Link>
          <div className="h-6 w-px bg-[#E4E4E4]"></div>
          <span className="hidden md:block text-xs font-bold text-[#0055FF] whitespace-nowrap">Forex / CFDs / Crypto</span>
          <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
          
          <MarketSelector 
            activeSymbol={activeInst.symbol} 
            onSelect={setActiveInst} 
            livePrices={marketData} 
          />

          <div className="hidden lg:flex items-center space-x-6 px-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#6B7280]">Price</span>
              <span className={cn("text-xs font-mono font-bold transition-colors", (marketData[activeInst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                {marketData[activeInst.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "Loading…"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden xl:flex items-center bg-[#F7F7F5] border border-[#E4E4E4] p-1.5 pr-4 space-x-4">
            <div className="flex items-center bg-white border border-[#E4E4E4] px-3 py-1 shadow-sm">
               <ClockIcon className="w-3 h-3 text-[#0055FF] mr-2" />
               <span className="text-sm font-mono font-bold text-[#0A0A0A] tracking-tighter">{currentTime}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center group">
                <select 
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as LocaleCode)}
                  className="appearance-none bg-transparent text-[8px] font-bold uppercase tracking-widest text-[#0055FF] outline-none cursor-pointer pr-3"
                >
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <option key={code} value={code} className="bg-white text-[#0A0A0A]">{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 w-2.5 h-2.5 text-[#0055FF] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[8px] font-bold uppercase text-[#6B7280]">{accountMode} BALANCE</span>
            <span className={cn("text-xs font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <button 
            data-profile-trigger
            aria-label="Account menu"
            onClick={() => setIsProfileDropdownOpen(v => !v)}
            className="w-8 h-8 rounded-full bg-[#0055FF] text-white flex items-center justify-center font-bold text-xs overflow-hidden"
          >
            {profile?.profile?.photoUrl ? <img src={profile.profile.photoUrl} className="w-full h-full object-cover" /> : user?.email?.substring(0,2).toUpperCase()}
          </button>
          
          <ProfileDropdown 
            user={user} 
            profile={profile} 
            accountMode={accountMode} 
            demoBalance={demoBalance} 
            isOpen={isProfileDropdownOpen} 
            onClose={() => setIsProfileDropdownOpen(false)} 
            onSelectMode={m => { setAccountMode(m); localStorage.setItem('varban_account_mode', m); window.dispatchEvent(new Event('varban_account_mode_changed')); }}
          />
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden relative">
        <AuthedSidebar className="hidden xl:flex" />
        <main className="flex-grow flex xl:ml-16 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-grow overflow-hidden">
            <ResizablePanel defaultSize={75} minSize={40}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full w-full bg-[#F7F7F5] relative">
                    <TradingViewChart symbol={activeInst.symbol} />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={10}>
                  <div className="h-full w-full flex flex-col shrink-0 relative">
                    <PortfolioManager 
                      positions={positions.filter(p => p.status === 'Open')}
                      orders={pendingOrders}
                      history={positions.filter(p => p.status === 'Closed')}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full w-full border-l border-[#E4E4E4] bg-white flex flex-col overflow-hidden">
                <div className="flex border-b border-[#E4E4E4] shrink-0">
                   {[
                     { id: 'TRADE', label: 'Order Ticket', icon: MousePointer2 },
                     { id: 'STATS', label: 'Market Data', icon: Layout }
                   ].map(tab => (
                     <button 
                      key={tab.id}
                      onClick={() => setActiveRightTab(tab.id as any)}
                      className={cn(
                        "flex-1 py-3 text-[8px] font-bold uppercase tracking-widest border-b-2 transition-all flex flex-col items-center gap-1",
                        activeRightTab === tab.id ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]"
                      )}
                     >
                       <tab.icon className="w-3.5 h-3.5" />
                       <span>{tab.label}</span>
                     </button>
                   ))}
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar">
                   {activeRightTab === 'TRADE' ? (
                      <ExecutionTicket 
                        instrument={activeInst} 
                        livePrice={marketData[activeInst.symbol]?.price}
                        balance={activeBalance}
                        onExecute={handleExecution}
                        accountMode={accountMode}
                      />
                   ) : (
                      <div className="p-6 space-y-6">
                         <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#F7F7F5] pb-2">Technical Analysis</h3>
                         <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] text-[9px] uppercase font-bold text-[#6B7280]">
                            Live market telemetry is synchronized with the Varban global relay.
                         </div>
                      </div>
                   )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[400] xl:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300">
            <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TerminalWorkspace() {
  return (
    <Suspense fallback={<LoadingOverlay message="Synchronizing High-Speed Trading Node" />}>
      <TerminalContent />
    </Suspense>
  );
}
