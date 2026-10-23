'use client';

/**
 * @fileOverview Institutional Multi-Asset Trading Terminal.
 * 4-Panel Grid Architecture with Resizable Panels and full TradingView feature parity.
 * Updated: Replaced native selects with professional DropdownMenu components.
 */

import { useState, useEffect, useCallback, Suspense, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Menu, 
  X,
  ChevronDown,
  Clock as ClockIcon,
  MousePointer2,
  TrendingUp,
  Newspaper,
  Layout,
  Globe,
  Settings,
  ShieldCheck,
  Check
} from "lucide-react";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
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
import TerminalTutorial from "@/components/terminal/TerminalTutorial";
import MarketNewsFeed from "@/components/dashboard/MarketNewsFeed";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function TerminalContent() {
  const searchParams = useSearchParams();
  const symbolParam = searchParams.get('symbol');
  const { user } = useUser();
  const db = useFirestore();
  const { formatNumber, locale, setLocale } = useTranslation();

  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTradeDrawerOpen, setIsTradeDrawerOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  
  const [activeRightTab, setActiveRightTab] = useState<'TRADE' | 'MARKET' | 'NEWS'>('TRADE');

  const [currentTime, setCurrentTime] = useState("");
  const [activeTimezone, setActiveTimezone] = useState("UTC+0");

  const [activeInst, setActiveInst] = useState<Instrument>(
    AVAILABLE_INSTRUMENTS.find(i => i.symbol === symbolParam) || AVAILABLE_INSTRUMENTS[0]
  );
  const [marketData, setMarketData] = useState<Record<string, { price: number; percent: number }>>({});
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    if (profile?.preferences?.timezone) setActiveTimezone(profile.preferences.timezone);
  }, [profile]);

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
    setActiveTimezone(val);
    if (user?.uid && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), { "preferences.timezone": val });
      } catch (e) {}
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
    const interval = setInterval(poll, 4000);
    return () => { active = false; clearInterval(interval); };
  }, [activeInst.symbol]);

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

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <TerminalTutorial />

      <header className="h-14 border-b border-[#E4E4E4] bg-white flex items-center justify-between shrink-0 z-[100] px-2 lg:px-4">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 lg:hidden text-[#0A0A0A]"><Menu className="w-5 h-5" /></button>
          <Link href="/client/dashboard" className="hidden sm:block shrink-0">
            <Image src="/assets/logo2.png" alt="Varban" width={80} height={20} className="w-auto object-contain" priority />
          </Link>
          <div className="h-6 w-px bg-[#E4E4E4] hidden sm:block"></div>
          
          <div id="tour-market-select">
            <MarketSelector 
              activeSymbol={activeInst.symbol} 
              onSelect={setActiveInst} 
              livePrices={marketData} 
            />
          </div>

          <div className="hidden lg:flex items-center space-x-6 px-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase text-[#6B7280]">Price Factor</span>
              <span className={cn(
                "text-xs font-mono font-bold transition-colors",
                (marketData[activeInst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]"
              )}>
                {marketData[activeInst.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "---"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase text-[#6B7280]">24h Relative</span>
              <span className={cn(
                "text-xs font-mono font-bold transition-colors",
                (marketData[activeInst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]"
              )}>
                {marketData[activeInst.symbol]?.percent !== undefined ? (marketData[activeInst.symbol].percent >= 0 ? '+' : '') + marketData[activeInst.symbol].percent + '%' : "---"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 lg:space-x-8">
          <div className="hidden xl:flex items-center bg-[#F7F7F5] border border-[#E4E4E4] p-1.5 pr-4 space-x-4">
            <div className="flex items-center bg-white border border-[#E4E4E4] px-3 py-1 shadow-sm">
               <ClockIcon className="w-3 h-3 text-[#0055FF] mr-2" />
               <span className="text-sm font-mono font-bold text-[#0A0A0A] tracking-tighter">{currentTime}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* PROFESSIONAL LANGUAGE DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-[#0055FF] outline-none hover:opacity-70 transition-opacity">
                  <span>{LANGUAGE_LABELS[locale]}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <DropdownMenuItem 
                      key={code} 
                      onClick={() => setLocale(code as LocaleCode)}
                      className="flex items-center justify-between"
                    >
                      <span>{label}</span>
                      {locale === code && <Check className="w-3 h-3 text-[#0055FF]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="w-px h-3 bg-[#E4E4E4]"></div>

              {/* PROFESSIONAL TIMEZONE DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-[#6B7280] outline-none hover:text-[#0A0A0A] transition-colors">
                  <span>{TIMEZONES.find(t => t.value === activeTimezone)?.label || activeTimezone}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  {TIMEZONES.map(tz => (
                    <DropdownMenuItem 
                      key={tz.value} 
                      onClick={() => handleTimezoneChange(tz.value)}
                      className="flex items-center justify-between"
                    >
                      <span>{tz.label}</span>
                      {activeTimezone === tz.value && <Check className="w-3 h-3 text-[#0055FF]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div id="tour-mode" className="flex flex-col text-right">
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
                  onSelectMode={m => { setAccountMode(m); localStorage.setItem('varban_account_mode', m); window.dispatchEvent(new Event('varban_account_mode_changed')); }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden relative">
        <AuthedSidebar className="hidden lg:flex" />

        <main className="flex-grow flex lg:ml-16 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="hidden lg:flex flex-grow overflow-hidden">
            <ResizablePanel defaultSize={75} minSize={40}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={40}>
                  <div id="tour-chart" className="h-full w-full bg-[#F7F7F5] relative">
                    <TradingViewChart symbol={activeInst.symbol} />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={15}>
                  <div className="h-full w-full flex flex-col shrink-0 relative">
                    <PortfolioManager 
                      positions={positions.filter(p => p.status === 'Open')}
                      orders={[]}
                      history={positions.filter(p => p.status === 'Closed')}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full w-full border-l border-[#E4E4E4] shrink-0 bg-white shadow-xl relative z-40 flex flex-col overflow-hidden">
                <div className="flex border-b border-[#E4E4E4] shrink-0">
                   {[
                     { id: 'TRADE', label: 'Order Ticket', icon: MousePointer2 },
                     { id: 'MARKET', label: 'Market Data', icon: Layout },
                     { id: 'NEWS', label: 'News Feed', icon: Newspaper }
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

                <div className="flex-grow overflow-y-auto no-scrollbar p-0">
                   {activeRightTab === 'TRADE' && (
                     <div id="tour-settings" className="h-full">
                        <ExecutionTicket 
                          instrument={activeInst} 
                          livePrice={marketData[activeInst.symbol]?.price}
                          balance={activeBalance}
                          accountMode={accountMode}
                          onExecute={handleExecution}
                        />
                     </div>
                   )}
                   {activeRightTab === 'MARKET' && (
                     <div className="p-6 space-y-8 animate-in fade-in duration-300">
                        <section className="space-y-4">
                           <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#F7F7F5] pb-2">Instrument Details</h3>
                           <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase text-[#6B7280]">
                              <div><span className="block opacity-50 mb-1">Exchange</span> <span className="text-[#0A0A0A]">Varban Synthetic</span></div>
                              <div><span className="block opacity-50 mb-1">Settlement</span> <span className="text-[#16835B]">Instant</span></div>
                              <div><span className="block opacity-50 mb-1">Leverage</span> <span className="text-[#0A0A0A]">1:400</span></div>
                              <div><span className="block opacity-50 mb-1">Market State</span> <span className="text-[#16835B]">Active</span></div>
                           </div>
                        </section>
                        <section className="space-y-4 pt-4 border-t border-[#F7F7F5]">
                           <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Technical Scorecard</h3>
                           <div className="p-5 bg-white border border-[#E4E4E4] text-center space-y-3 shadow-sm">
                              <div className="flex justify-between items-center text-[9px] font-bold text-[#6B7280]">
                                 <span>OSCILLATORS</span>
                                 <span className="text-[#0055FF]">BUY</span>
                              </div>
                              <div className="h-1.5 w-full bg-[#F7F7F5] relative overflow-hidden">
                                 <div className="absolute inset-y-0 left-0 bg-[#0055FF] w-[75%]"></div>
                              </div>
                              <p className="text-[10px] font-bold uppercase text-[#0A0A0A]">Strong Momentum Detected</p>
                           </div>
                        </section>
                     </div>
                   )}
                   {activeRightTab === 'NEWS' && (
                     <div className="h-full">
                        <MarketNewsFeed />
                     </div>
                   )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>

          <div className="flex lg:hidden flex-grow flex-col overflow-hidden">
            <div id="tour-chart-mobile" className="flex-grow min-h-0 bg-[#F7F7F5] relative">
              <TradingViewChart symbol={activeInst.symbol} />
            </div>
          </div>
        </main>
      </div>

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
          Execute <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

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

export default function TerminalWorkspace(props: { params: Promise<any>; searchParams: Promise<any> }) {
  // unwrap Promises for Next.js 15 proxy satisfaction
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  
  return (
    <Suspense fallback={<LoadingOverlay message="Synchronizing High-Speed Trading Node" />}>
      <TerminalContent />
    </Suspense>
  );
}
