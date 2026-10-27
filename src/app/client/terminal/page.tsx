'use client';

/**
 * @fileOverview Institutional Multi-Asset Trading Terminal.
 * Refined 2-Panel Sidebar Architecture with high-fidelity execution node.
 * Optimization: Execution components hidden from main mobile screen; restricted to drawer.
 */

import { useState, useEffect, Suspense, useMemo } from "react";
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
  Layout,
  Globe,
  Settings,
  ShieldCheck,
  Zap,
  BarChart2,
  ListChecks
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
import TradingLock from "@/components/onboarding/TradingLock";
import { useOnboarding } from "@/app/lib/use-onboarding";
import PortfolioManager from "@/components/terminal/PortfolioManager";
import TerminalTutorial from "@/components/terminal/TerminalTutorial";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import DigitStats from "@/components/terminal/DigitStats";
import DerivedTradeControls from "@/components/terminal/DerivedTradeControls";
import SyntheticChart from "@/components/terminal/SyntheticChart";
import ContractsPanel from "@/components/terminal/ContractsPanel";
import BottomSheet from "@/components/terminal/BottomSheet";
import { useSyntheticFeed } from "@/app/lib/synthetic/use-synthetic-feed";
import { useDerivedContracts } from "@/app/lib/synthetic/contracts";
import { CONTRACT_LABELS, needsDigit } from "@/app/lib/synthetic/engine";
import { readDemoBalance, onDemoBalanceChange } from "@/app/lib/demo-wallet";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface Position {
  id: string;
  instrument: string;
  vector: string;
  entryPrice: number;
  stake: number;
  duration?: string;
  status: "Open" | "Closed";
  timestamp: number;
  isDemo: boolean;
  mode: string;
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
  const [isTradesDrawerOpen, setIsTradesDrawerOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  
  const [activeRightTab, setActiveRightTab] = useState<'TRADE' | 'STATS'>('TRADE');

  const [currentTime, setCurrentTime] = useState("");
  const activeTimezone = profile?.preferences?.timezone || "UTC+0";

  const [activeInst, setActiveInst] = useState<Instrument>(() => {
    if (symbolParam) {
      const found = AVAILABLE_INSTRUMENTS.find(i => i.symbol === symbolParam);
      if (found) return found;
    }
    return AVAILABLE_INSTRUMENTS[0]; // BTC/USD is first
  });

  const [marketData, setMarketData] = useState<Record<string, { price: number; percent: number }>>({});
  const [positions, setPositions] = useState<Position[]>([]);

  const isDerivedMarket = activeInst.category === 'Synthetic Indices';

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
  }, []);

  // Practice balance: shared with the rest of the app and updated when contracts are bought or settled.
  useEffect(() => {
    setDemoBalance(readDemoBalance());
    return onDemoBalanceChange(() => setDemoBalance(readDemoBalance()));
  }, []);

  // Our own indices: prices come from the server feed, contracts are kept for the practice account.
  const feed = useSyntheticFeed(activeInst.symbol, isDerivedMarket);
  const { contracts, buy: buyContract, settleDue } = useDerivedContracts();
  const symbolContracts = useMemo(() => contracts.filter((c) => c.symbol === activeInst.symbol), [contracts, activeInst.symbol]);
  const openContracts = useMemo(() => symbolContracts.filter((c) => c.status === 'open'), [symbolContracts]);
  const openCount = isDerivedMarket ? openContracts.length : positions.filter((p) => p.status === 'Open').length;

  useEffect(() => {
    if (!isDerivedMarket || !feed.latest) return;
    const { p } = feed.latest;
    setMarketData(prev => ({ ...prev, [activeInst.symbol]: { price: p, percent: Math.round(feed.changePercent * 100) / 100 } }));
    settleDue(feed.ticks, feed.latest.t);
  }, [isDerivedMarket, feed.latest?.t, activeInst.symbol]);

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
    if (user?.uid && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), { "preferences.timezone": val });
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (isDerivedMarket) return;
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
  }, [activeInst.symbol, isDerivedMarket]);

  const { canTrade } = useOnboarding();
  // Real-money trading needs a finished setup; the demo account stays open for practice.
  const tradingLocked = accountMode === 'REAL' && !canTrade;

  const handleExecution = (params: any) => {
    const live = marketData[activeInst.symbol];
    if (!live || !user || tradingLocked) return;

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
      isDemo: accountMode === 'DEMO',
    };

    setPositions(prev => [newPos, ...prev]);
    setIsTradeDrawerOpen(false);
  };

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  const handleBuyDerived = (req: { type: any; digit: number; stake: number; ticks: number; payoutMultiplier: number }) => {
    const cfg = feed.cfg;
    const latest = feed.latest;
    if (!cfg || !latest) return { ok: false, message: 'Prices are still loading. Try again in a moment.' };
    if (accountMode !== 'DEMO') return { ok: false, message: 'Switch to the practice account to trade this market.' };
    if (!feed.tradingOpen || !cfg.tradingEnabled) return { ok: false, message: 'Buying is paused on this market.' };
    if (req.stake > readDemoBalance()) return { ok: false, message: 'You do not have enough balance for this stake.' };
    const c = buyContract({
      symbol: activeInst.symbol, type: req.type, digit: req.digit, stake: req.stake,
      payoutMultiplier: req.payoutMultiplier, ticks: req.ticks, tickMs: cfg.tickMs,
      entryTick: latest.t, entryPrice: latest.p, exitTick: latest.t + req.ticks,
    });
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setTimeout(() => setIsTradeDrawerOpen(false), 900);
    const label = `${CONTRACT_LABELS[c.type as keyof typeof CONTRACT_LABELS]}${needsDigit(c.type) ? ' ' + c.digit : ''}`;
    return { ok: true, message: `Trade started: ${label} for $${c.stake.toFixed(2)}. The result comes in about ${Math.round((req.ticks * cfg.tickMs) / 1000)} seconds.` };
  };

  const switchToPractice = () => {
    setAccountMode('DEMO');
    localStorage.setItem('varban_account_mode', 'DEMO');
    window.dispatchEvent(new Event('varban_account_mode_changed'));
  };

  const livePrice = marketData[activeInst.symbol]?.price ?? null;

  /** The order ticket for whichever market is open (used by desktop panel and phone drawer). */
  const renderTicket = () => {
    if (tradingLocked) return <TradingLock compact />;
    if (isDerivedMarket) {
      if (!feed.cfg) return null;
      return (
        <DerivedTradeControls
          cfg={feed.cfg}
          livePrice={feed.latest?.p ?? null}
          balance={activeBalance}
          tradingOpen={feed.tradingOpen && feed.cfg.tradingEnabled}
          practiceOnly={accountMode === 'REAL'}
          onSwitchToPractice={switchToPractice}
          onBuy={handleBuyDerived}
        />
      );
    }
    return (
      <ExecutionTicket
        instrument={activeInst}
        livePrice={livePrice as any}
        balance={activeBalance}
        onExecute={handleExecution}
        accountMode={accountMode}
      />
    );
  };

  const renderStats = (padded: boolean) =>
    isDerivedMarket ? (
      <DigitStats ticks={feed.ticks} />
    ) : (
      <div className={cn("space-y-6 animate-in fade-in duration-300", padded ? "p-6" : "p-4")}>
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#F7F7F5] pb-2">About this market</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-[#6B7280]">
            <div><span className="block mb-1">Exchange</span><span className="font-bold text-[#0A0A0A]">Varban Markets</span></div>
            <div><span className="block mb-1">Settlement</span><span className="font-bold text-[#16835B]">Instant</span></div>
            <div><span className="block mb-1">Leverage</span><span className="font-bold text-[#0A0A0A]">1:400</span></div>
            <div><span className="block mb-1">Market</span><span className="font-bold text-[#16835B]">Open</span></div>
          </div>
        </section>
      </div>
    );

  const renderChart = () =>
    isDerivedMarket ? (
      <SyntheticChart symbol={activeInst.symbol} ticks={feed.ticks} tickMs={feed.cfg?.tickMs ?? 1000} openContracts={openContracts} error={feed.error} />
    ) : (
      <TradingViewChart symbol={activeInst.symbol} />
    );

  return (
    <div className="flex flex-col h-[100dvh] bg-white overflow-hidden text-[#0A0A0A]">
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
              <div className="relative flex items-center group">
                <select 
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as LocaleCode)}
                  className="appearance-none bg-transparent text-[8px] font-bold uppercase tracking-widest text-[#0A0A0A] outline-none cursor-pointer pr-3 z-10"
                >
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <option key={code} value={code} className="bg-white text-[#0A0A0A]">{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 w-2.5 h-2.5 text-[#6B7280] pointer-events-none" />
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

          <div id="tour-mode" className="flex flex-col text-right">
            <span className="text-[7px] lg:text-[8px] font-bold uppercase text-[#6B7280]">{accountMode} BALANCE</span>
            <span className={cn("text-[10px] lg:text-xs font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-[#0055FF] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 ring-[#0055FF]/30 overflow-hidden"
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
          {/* DESKTOP WORKSPACE */}
          <ResizablePanelGroup direction="horizontal" className="hidden lg:flex flex-grow overflow-hidden">
            <ResizablePanel defaultSize={75} minSize={40}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div id="tour-chart" className="h-full w-full bg-[#F7F7F5] relative">
                    {renderChart()}
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={30} minSize={10}>
                  <div className="h-full w-full flex flex-col shrink-0 relative">
                    {isDerivedMarket ? (
                      <ContractsPanel contracts={symbolContracts} nowTick={feed.latest?.t ?? null} className="h-full" />
                    ) : (
                      <PortfolioManager 
                        positions={positions.filter(p => p.status === 'Open')}
                        orders={[]}
                        history={positions.filter(p => p.status === 'Closed')}
                      />
                    )}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full w-full border-l border-[#E4E4E4] shrink-0 bg-white shadow-xl relative z-40 flex flex-col overflow-hidden">
                <div className="flex border-b border-[#E4E4E4] shrink-0">
                   {[
                     { id: 'TRADE', label: 'Trade', icon: MousePointer2 },
                     { id: 'STATS', label: isDerivedMarket ? 'Last digits' : 'Market info', icon: isDerivedMarket ? BarChart2 : Layout }
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
                   {activeRightTab === 'TRADE' && (
                     <div id="tour-settings" className="h-full">{renderTicket()}</div>
                   )}
                   {activeRightTab === 'STATS' && <div className="h-full">{renderStats(true)}</div>}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* PHONE / TABLET: chart only. Trading and trades live in drawers. */}
          <div className="flex lg:hidden flex-grow flex-col overflow-hidden">
            <div id="tour-chart-mobile" className="flex-grow min-h-0 bg-[#F7F7F5] relative">
              {renderChart()}
            </div>
          </div>
        </main>
      </div>

      {/* PHONE BOTTOM BAR */}
      <div className="lg:hidden shrink-0 z-[110] border-t border-[#E4E4E4] bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-[#6B7280] truncate">{activeInst.name}</p>
          <p className={cn("text-base font-bold font-mono leading-tight", (marketData[activeInst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
            {livePrice !== null ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "---"}
          </p>
        </div>
        <button
          onClick={() => setIsTradesDrawerOpen(true)}
          className="relative px-3 py-3 border border-[#E4E4E4] bg-white text-[#0A0A0A] text-xs font-bold flex items-center gap-1.5 hover:border-[#0055FF]"
        >
          <ListChecks className="w-4 h-4 text-[#0055FF]" /> Trades
          {openCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0055FF] text-white text-[10px] font-bold flex items-center justify-center">{openCount}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveRightTab('TRADE'); setIsTradeDrawerOpen(true); }}
          className="px-6 py-3 bg-[#0055FF] text-white text-sm font-bold hover:bg-[#0044cc] transition-colors"
        >
          Trade
        </button>
      </div>

      {/* PHONE DRAWER: ticket and market info (this replaces the old right sidebar on small screens) */}
      <BottomSheet
        open={isTradeDrawerOpen}
        title={activeInst.symbol}
        onClose={() => setIsTradeDrawerOpen(false)}
        header={
          <div className="flex border-b border-[#E4E4E4] shrink-0">
            {[
              { id: 'TRADE', label: 'Trade' },
              { id: 'STATS', label: isDerivedMarket ? 'Last digits' : 'Market info' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id as any)}
                className={cn(
                  "flex-1 py-3 text-sm font-bold border-b-2 transition-colors",
                  activeRightTab === tab.id ? "border-[#0055FF] text-[#0055FF]" : "border-transparent text-[#6B7280]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      >
        {activeRightTab === 'TRADE' ? renderTicket() : renderStats(false)}
      </BottomSheet>

      {/* PHONE DRAWER: running and finished trades */}
      <BottomSheet open={isTradesDrawerOpen} title="Your trades" onClose={() => setIsTradesDrawerOpen(false)}>
        {isDerivedMarket ? (
          <ContractsPanel contracts={symbolContracts} nowTick={feed.latest?.t ?? null} className="min-h-full" />
        ) : positions.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#6B7280]">No trades yet. Once you place one, it will show up here.</p>
        ) : (
          <ul className="p-3 space-y-2 bg-[#F7F7F5] min-h-full">
            {positions.map(p => (
              <li key={p.id} className="p-3 bg-white border border-[#E4E4E4] flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{p.instrument} · {p.vector === 'BUY' ? 'Buy' : 'Sell'}</p>
                  <p className="text-[11px] text-[#6B7280]">Opened at {p.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${p.stake.toFixed(2)}</p>
                  <p className="text-[11px] text-[#6B7280]">{p.status === 'Open' ? 'Running' : 'Closed'}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>

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

export default function TerminalWorkspace() {
  return (
    <Suspense fallback={<LoadingOverlay message="Synchronizing High-Speed Trading Node" />}>
      <TerminalContent />
    </Suspense>
  );
}