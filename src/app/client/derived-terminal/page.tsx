'use client';

/**
 * @fileOverview Institutional Derived Markets Terminal (Dark Mode).
 * Matched to high-fidelity reference screenshot for synthetic markets.
 */

import { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Menu, 
  ChevronDown,
  Clock as ClockIcon,
  BarChart2,
  MousePointer2,
  Settings2,
  X,
  Target
} from "lucide-react";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import { LANGUAGE_LABELS, LocaleCode } from "@/app/lib/i18n-dictionary";
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

  const { ticks, lastTick, loading: syntheticLoading } = useSyntheticFeed(activeInst.symbol, activeInst.tickMs);

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
      {/* Dark Header */}
      <header className="h-14 border-b border-[#1E222D] bg-[#131722] flex items-center justify-between shrink-0 z-[100] px-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 xl:hidden text-white"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#00A015] flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
             </div>
             <div className="flex flex-col">
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold uppercase tracking-tight">{activeInst.name}</span>
                   <ChevronDown className="w-3 h-3 text-[#6B7280]" />
                </div>
                <span className="text-[10px] font-mono text-[#6B7280]">Rise/Fall</span>
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden xl:flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-bold uppercase text-[#6B7280]">{accountMode} account</span>
              <span className={cn("text-xs font-mono font-bold", accountMode === 'REAL' ? "text-[#00A015]" : "text-white")}>
                {formatNumber(activeBalance, { minimumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-8 h-8 rounded-full bg-[#31363F] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-[#1E222D]"
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
                    
                    {/* Floating Zoom Controls as seen in image */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-[#1E222D] border border-[#31363F] rounded-full px-2 py-1 gap-2 shadow-2xl">
                       <button className="p-1 hover:text-[#00A015] transition-colors"><Minus className="w-4 h-4" /></button>
                       <div className="w-px h-3 bg-[#31363F]"></div>
                       <button className="p-1 hover:text-[#00A015] transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle className="bg-[#1E222D]" />
                <ResizablePanel defaultSize={30} minSize={10}>
                  <div className="h-full bg-[#0B0E11] border-t border-[#1E222D]">
                    <PortfolioManager positions={[]} orders={[]} history={[]} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle className="bg-[#1E222D]" />
            
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
                        "flex-1 py-3 text-[9px] font-bold uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2",
                        activeRightTab === tab.id ? "border-white text-white" : "border-transparent text-[#6B7280] hover:bg-[#1E222D]"
                      )}
                     >
                       <tab.icon className="w-3.5 h-3.5" />
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
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#131722] animate-in slide-in-from-left duration-300">
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

import { Plus, Minus } from "lucide-react";
