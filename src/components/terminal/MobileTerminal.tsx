
'use client';

/**
 * @fileOverview Institutional Mobile Terminal.
 * Optimized for mobile-first interaction with Bottom Navigation.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Globe, 
  TrendingUp, 
  Zap, 
  History, 
  User, 
  Menu, 
  ChevronDown,
  Search,
  Activity,
  ShieldCheck,
  BarChart2,
  Layout
} from 'lucide-react';
import { Instrument, AVAILABLE_INSTRUMENTS } from '@/app/lib/instruments';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { useTranslation } from '@/app/lib/i18n-context';
import { cn } from '@/app/lib/utils';
import { MarketIcon } from '@/components/MarketIcon';
import { TradingViewChart } from './TradingViewChart';
import ExecutionTicket from './ExecutionTicket';
import DigitStats from './DigitStats';
import ProfileDropdown from '@/components/layout/ProfileDropdown';
import AuthedSidebar from '@/components/layout/AuthedSidebar';

type MobileView = 'MARKETS' | 'CHART' | 'TRADE' | 'POSITIONS';

interface MobileTerminalProps {
  activeInst: Instrument;
  onSelect: (inst: Instrument) => void;
  livePrices: Record<string, { price: number; percent: number }>;
  positions: any[];
}

export default function MobileTerminal({ activeInst, onSelect, livePrices, positions }: MobileTerminalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { formatNumber, t } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [activeView, setActiveView] = useState<MobileView>('CHART');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const isDerived = activeInst.category === 'Synthetic Indices';

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
  }, []);

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  const filteredInstruments = AVAILABLE_INSTRUMENTS.filter(i => {
    const catMatch = selectedCat === "All" || i.category === selectedCat;
    const searchMatch = i.symbol.toLowerCase().includes(search.toLowerCase()) || 
                        i.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden text-[#0A0A0A] z-[200]">
      {/* 1. MOBILE TOP BAR */}
      <header className="h-14 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsMenuOpen(true)} className="p-1">
            <Menu className="w-6 h-6 text-[#0A0A0A]" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-[#0A0A0A] leading-none uppercase">{activeInst.symbol}</span>
            <span className={cn(
              "text-[10px] font-mono font-bold transition-colors",
              (livePrices[activeInst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]"
            )}>
              {livePrices[activeInst.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "---"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[7px] font-bold text-[#6B7280] uppercase block">{accountMode}</span>
            <span className={cn("text-[10px] font-mono font-bold block leading-none", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs"
          >
            {profile?.profile?.photoUrl ? <img src={profile.profile.photoUrl} className="w-full h-full object-cover rounded-full" /> : user?.email?.substring(0,2).toUpperCase()}
          </button>
        </div>
      </header>

      {/* 2. MAIN VIEW AREA */}
      <main className="flex-grow overflow-hidden relative">
        {/* Markets View */}
        {activeView === 'MARKETS' && (
          <div className="h-full flex flex-col bg-[#F7F7F5] animate-in fade-in duration-300">
            <div className="p-4 bg-white border-b border-[#E4E4E4] space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search instruments..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F5] border border-[#E4E4E4] text-sm focus:outline-none"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {["All", "Crypto", "Forex", "Indices"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={cn(
                      "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                      selectedCat === cat ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-grow overflow-y-auto no-scrollbar divide-y divide-[#E4E4E4]">
              {filteredInstruments.map(inst => (
                <button
                  key={inst.symbol}
                  onClick={() => { onSelect(inst); setActiveView('CHART'); }}
                  className="w-full p-4 bg-white flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <MarketIcon symbol={inst.symbol} size="sm" />
                    <div className="text-left">
                      <span className="text-xs font-mono font-bold block uppercase">{inst.symbol}</span>
                      <span className="text-[9px] text-[#6B7280] uppercase block">{inst.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold block">
                      {livePrices[inst.symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "---"}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold",
                      (livePrices[inst.symbol]?.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]"
                    )}>
                      {livePrices[inst.symbol]?.percent !== undefined ? (livePrices[inst.symbol].percent >= 0 ? '+' : '') + livePrices[inst.symbol].percent + '%' : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart View */}
        {activeView === 'CHART' && (
          <div className="h-full w-full bg-white relative animate-in fade-in duration-300">
            <TradingViewChart symbol={activeInst.symbol} />
          </div>
        )}

        {/* Trade View */}
        {activeView === 'TRADE' && (
          <div className="h-full flex flex-col bg-[#F7F7F5] animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex-grow overflow-y-auto no-scrollbar">
               <ExecutionTicket 
                 instrument={activeInst} 
                 livePrice={livePrices[activeInst.symbol]?.price}
                 balance={activeBalance}
                 onExecute={(p) => { console.log(p); setActiveView('POSITIONS'); }}
                 accountMode={accountMode}
               />
            </div>
          </div>
        )}

        {/* Positions View */}
        {activeView === 'POSITIONS' && (
          <div className="h-full flex flex-col bg-[#F7F7F5] animate-in fade-in duration-300">
            <div className="p-6 bg-white border-b border-[#E4E4E4] flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Live Exposure</h2>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase bg-[#F7F7F5] px-2 py-1 border border-[#E4E4E4]">
                {positions.length} Active
              </span>
            </div>
            <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-3">
              {positions.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-30 grayscale">
                   <History className="w-12 h-12 mx-auto text-[#6B7280]" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Registry Clear</p>
                </div>
              ) : (
                positions.map(pos => (
                  <Card key={pos.id} className="p-4 bg-white border-[#E4E4E4] space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <MarketIcon symbol={pos.instrument} size="sm" />
                        <div>
                          <span className="text-xs font-mono font-bold block">{pos.instrument}</span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase",
                            pos.vector === 'BUY' ? "text-[#16835B]" : "text-[#C43D3D]"
                          )}>{pos.vector} CONTRACT</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-[#6B7280] uppercase">ID: {pos.id.slice(0,8)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-[#F7F7F5] pt-4">
                      <div>
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase block">Entry</span>
                        <span className="text-[10px] font-mono font-bold">${pos.entryPrice.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase block">Stake</span>
                        <span className="text-[10px] font-mono font-bold text-[#0A0A0A]">${pos.stake.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <footer className="h-16 border-t border-[#E4E4E4] bg-white flex items-center justify-around px-2 shrink-0 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => setActiveView('MARKETS')}
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 transition-all",
            activeView === 'MARKETS' ? "text-[#0055FF]" : "text-[#6B7280]"
          )}
        >
          <Globe className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Markets</span>
        </button>
        
        <button 
          onClick={() => setActiveView('CHART')}
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 transition-all",
            activeView === 'CHART' ? "text-[#0055FF]" : "text-[#6B7280]"
          )}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Chart</span>
        </button>

        <button 
          onClick={() => setActiveView('TRADE')}
          className={cn(
            "flex flex-col items-center justify-center -mt-8 w-14 h-14 rounded-full bg-[#0A0A0A] text-white shadow-2xl transition-all active:scale-90",
            activeView === 'TRADE' && "bg-[#0055FF]"
          )}
        >
          <Zap className="w-6 h-6" />
        </button>

        <button 
          onClick={() => setActiveView('POSITIONS')}
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-16 transition-all",
            activeView === 'POSITIONS' ? "text-[#0055FF]" : "text-[#6B7280]"
          )}
        >
          <History className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Orders</span>
        </button>

        <button 
          onClick={() => setIsProfileOpen(true)}
          className="flex flex-col items-center justify-center gap-1 w-16 text-[#6B7280]"
        >
          <User className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </footer>

      {/* 4. MODALS & DRAWERS */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[600]">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300">
            <AuthedSidebar isMobile onLinkClick={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className="fixed inset-0 z-[600]">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white animate-in slide-in-from-right duration-300">
             <div className="p-4 border-b border-[#E4E4E4] flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Account Hub</h3>
                <button onClick={() => setIsProfileOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
             </div>
             <div className="p-2 h-full overflow-y-auto no-scrollbar">
                <ProfileDropdown 
                  user={user} 
                  profile={profile} 
                  accountMode={accountMode} 
                  demoBalance={demoBalance} 
                  isOpen={true} 
                  onClose={() => setIsProfileOpen(false)} 
                  onSelectMode={m => { setAccountMode(m); localStorage.setItem('varban_account_mode', m); window.dispatchEvent(new Event('varban_account_mode_changed')); }}
                />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
