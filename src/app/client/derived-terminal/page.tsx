'use client';

/**
 * @fileOverview Institutional Derived Markets Terminal (White Theme).
 * Synchronized with standard terminal design architecture.
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
  Globe,
  Zap,
  Plus,
  Minus,
  Layout as LayoutIcon,
  ShieldCheck
} from "lucide-react";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import { useSyntheticFeed } from "@/app/lib/synthetic/use-synthetic-feed";
import { LANGUAGE_LABELS, LocaleCode } from "@/app/lib/i18n-dictionary";

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
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      {/* Standard Branded Header */}
      <header className="h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between shrink-0 z-[100] px-4 md:px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 xl:hidden text-[#0A0A0A]"><Menu className="w-6 h-6" /></button>
          
          <Link href="/client/dashboard" className="shrink-0 flex items-center gap-4">
            <Image src="/assets/logo2.png" alt="Varban" width={95} height={22} className="w-auto object-contain" priority />
            <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#16835B] flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white" />
             </div>
             <div className="flex flex-col">
                <div className="flex items-center gap-2 cursor-pointer group">
                   <span className="text-[11px] font-bold uppercase tracking-widest group-hover:text-[#0055FF] transition-colors">{activeInst.name}</span>
                   <ChevronDown className="w-3 h-3 text-[#6B7280]" />
                </div>
                <span className="text-[8px] font-bold text-[#16835B] uppercase tracking-widest">Synthetic Node v4.2</span>
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden xl:flex items-center bg-[#F7F7F5] border border-[#E4E4E4] px-4 py-1.5 gap-4">
             <ClockIcon className="w-3.5 h-3.5 text-[#0055FF]" />
             <span className="text-sm font-mono font-bold text-[#0A0A0A] tracking-tighter">{currentTime}</span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">{accountMode} BALANCE</span>
            <span className={cn("text-sm font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })} USD
            </span>
          </div>
          
          <button 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-9 h-9 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-[#E4E4E4] shadow-sm hover:border-[#0055FF] transition-all"
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
        
        <main className="flex-grow flex xl:ml-16 overflow-hidden bg-[#F7F7F5]">
          <ResizablePanelGroup direction="horizontal" className="flex-grow overflow-hidden">
            <ResizablePanel defaultSize={75} minSize={40}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full w-full bg-[#131722] relative border-b border-[#E4E4E4]">
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
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={10}>
                  <div className="h-full bg-white">
                    <PortfolioManager positions={[]} orders={[]} history={[]} />
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
                     { id: 'STATS', label: 'Digit Stats', icon: BarChart2 }
                   ].map(tab => (
                     <button 
                      key={tab.id}
                      onClick={() => setActiveRightTab(tab.id as any)}
                      className={cn(
                        "flex-1 py-4 text-[9px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all flex flex-col items-center gap-1",
                        activeRightTab === tab.id ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]"
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
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300 shadow-2xl">
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
