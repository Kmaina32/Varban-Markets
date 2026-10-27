'use client';

/**
 * @fileOverview Institutional Derived Markets Terminal (Dark Mode).
 * High-fidelity workspace for specialized synthetic markets.
 */

import { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/image";
import { useSearchParams } from "next/navigation";
import { 
  Menu, 
  ChevronDown,
  Clock as ClockIcon,
  BarChart2,
  MousePointer2,
  Settings2,
  X,
  Target,
  Plus,
  Minus,
  Activity,
  History,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import { useSyntheticFeed } from "@/app/lib/synthetic/use-synthetic-feed";

// Components
import AuthedSidebar from "@/components/layout/AuthedSidebar";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import SyntheticChart from "@/components/terminal/SyntheticChart";
import MarketSelector from "@/components/terminal/MarketSelector";
import DerivedTradeControls from "@/components/terminal/DerivedTradeControls";
import DigitStats from "@/components/terminal/DigitStats";
import PortfolioManager from "@/components/terminal/PortfolioManager";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

function DerivedTerminalContent() {
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

  const [currentTime, setCurrentTime] = useState("");
  const activeTimezone = profile?.preferences?.timezone || "UTC+0";

  const derivedInstruments = useMemo(() => 
    AVAILABLE_INSTRUMENTS.filter(i => i.category === 'Synthetic Indices')
  , []);

  const [activeInst, setActiveInst] = useState<Instrument>(() => {
    if (symbolParam) {
      const found = derivedInstruments.find(i => i.symbol === symbolParam);
      if (found) return found;
    }
    return derivedInstruments[0];
  });

  const { ticks, lastTick, loading: syntheticLoading } = useSyntheticFeed(activeInst.symbol, 1000);

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

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-[#0B0E11] overflow-hidden text-white">
      {/* Dark Institutional Header */}
      <header className="h-16 border-b border-[#1E222D] bg-[#131722] flex items-center justify-between shrink-0 z-[100] px-6 shadow-2xl">
        <div className="flex items-center space-x-6">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 xl:hidden text-white hover:text-[#0055FF] transition-colors"><Menu className="w-6 h-6" /></button>
          
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-lg bg-[#00A015] flex items-center justify-center shadow-lg shadow-[#00A015]/20">
                <Zap className="w-5 h-5 text-white" />
             </div>
             <div className="flex flex-col">
                <div className="flex items-center gap-2 cursor-pointer group">
                   <span className="text-sm font-bold uppercase tracking-tight group-hover:text-[#0055FF] transition-colors">{activeInst.name}</span>
                   <ChevronDown className="w-4 h-4 text-[#6B7280] group-hover:text-white transition-transform" />
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#16835B] animate-pulse"></div>
                   <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Synthetic Node Active</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden xl:flex items-center bg-[#1E222D] border border-[#31363F] px-4 py-1.5 gap-4">
             <ClockIcon className="w-3.5 h-3.5 text-[#0055FF]" />
             <span className="text-sm font-mono font-bold text-white tracking-tighter">{currentTime}</span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">{accountMode} BALANCE</span>
            <span className={cn("text-sm font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })} USD
            </span>
          </div>
          
          <button 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-10 h-10 rounded-full bg-[#31363F] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-[#1E222D] shadow-xl hover:border-[#0055FF] transition-all"
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
        <AuthedSidebar className="hidden xl:flex border-[#1E222D] bg-[#131722]" />
        
        <main className="flex-grow flex xl:ml-16 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-grow overflow-hidden">
            <ResizablePanel defaultSize={75} minSize={40}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full w-full bg-[#131722] relative">
                    <SyntheticChart ticks={ticks} loading={syntheticLoading} />
                    
                    {/* Floating Zoom Node */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-[#1E222D]/90 backdrop-blur-md border border-[#31363F] rounded-full px-3 py-1.5 gap-4 shadow-2xl z-50">
                       <button className="p-2 text-[#D1D4DC] hover:text-[#0055FF] transition-colors"><Minus className="w-5 h-5" /></button>
                       <div className="w-px h-4 bg-[#31363F]"></div>
                       <button className="p-2 text-[#D1D4DC] hover:text-[#0055FF] transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>

                    <div className="absolute top-8 left-8 pointer-events-none opacity-20 select-none">
                       <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white">Matching Node Operational &bull; Varban Algorithm v4.2</span>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle className="bg-[#1E222D] h-1.5" />
                <ResizablePanel defaultSize={30} minSize={10}>
                  <div className="h-full bg-[#0B0E11] border-t border-[#1E222D]">
                    <PortfolioManager positions={[]} orders={[]} history={[]} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle className="bg-[#1E222D] w-1.5" />
            
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full w-full border-l border-[#1E222D] bg-[#131722] flex flex-col overflow-hidden">
                <div className="flex border-b border-[#1E222D] shrink-0">
                   {[
                     { id: 'TRADE', label: 'Order Ticket', icon: MousePointer2 },
                     { id: 'STATS', label: 'Digit Stats', icon: BarChart2 }
                   ].map(tab => (
                     <button 
                      key={tab.id}
                      onClick={() => setActiveRightTab(tab.id as any)}
                      className={cn(
                        "flex-1 py-5 text-[10px] font-bold uppercase tracking-[0.25em] border-b-2 transition-all flex items-center justify-center gap-2",
                        activeRightTab === tab.id ? "border-white text-white bg-white/5" : "border-transparent text-[#6B7280] hover:bg-[#1E222D]"
                      )}
                     >
                       <tab.icon className="w-4 h-4" />
                       <span>{tab.label}</span>
                     </button>
                   ))}
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar">
                   {activeRightTab === 'TRADE' ? (
                      <DerivedTradeControls 
                        instrument={activeInst} 
                        livePrice={lastTick?.price || null}
                        balance={activeBalance}
                        onExecute={(p) => console.log("Execute Derived:", p)}
                      />
                   ) : (
                      <DigitStats symbol={activeInst.symbol} livePrice={lastTick?.price || null} />
                   )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[400] xl:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-[#131722] animate-in slide-in-from-left duration-300 shadow-2xl">
            <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DerivedTerminalPage() {
  return (
    <Suspense fallback={<LoadingOverlay message="Synchronizing Derived Matching Engine" />}>
      <DerivedTerminalContent />
    </Suspense>
  );
}
