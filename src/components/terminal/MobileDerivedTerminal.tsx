'use client';

/**
 * @fileOverview Institutional Mobile Terminal for Derived Markets.
 * Specialized for Synthetic Indices with 5-column navigation and Rise/Fall triggers.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  TrendingUp, 
  History, 
  Menu, 
  X,
  Search,
  Zap,
  ShieldCheck,
  Activity,
  Binary,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Instrument, AVAILABLE_INSTRUMENTS } from '@/app/lib/instruments';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { useTranslation } from '@/app/lib/i18n-context';
import { cn } from '@/app/lib/utils';
import { MarketIcon } from '@/components/MarketIcon';
import SyntheticChart from './SyntheticChart';
import DerivedTradeControls from './DerivedTradeControls';
import DigitStats from './DigitStats';
import BottomSheet from './BottomSheet';
import { Card } from '@/components/ui/card';
import ProfileDropdown from '@/components/layout/ProfileDropdown';
import AuthedSidebar from '@/components/layout/AuthedSidebar';

type MobileView = 'MARKETS' | 'CHART' | 'POSITIONS';

interface MobileDerivedTerminalProps {
  activeInst: Instrument;
  onSelect: (inst: Instrument) => void;
  ticks: any[];
  lastTick: any;
  loading: boolean;
  onExecute: (params: any) => void;
}

export default function MobileDerivedTerminal({ 
  activeInst, 
  onSelect, 
  ticks, 
  lastTick, 
  loading,
  onExecute 
}: MobileDerivedTerminalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { formatNumber, t } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [activeView, setActiveView] = useState<MobileView>('CHART');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Synthetic Indices");

  const [placed, setPlaced] = useState<any[]>([]);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    
    const handleBalanceUpdate = () => {
      const saved = localStorage.getItem('varban_practice_balance');
      if (saved) setDemoBalance(parseFloat(saved));
    };
    window.addEventListener('varban_balance_update', handleBalanceUpdate);
    return () => window.removeEventListener('varban_balance_update', handleBalanceUpdate);
  }, []);

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  const filteredInstruments = AVAILABLE_INSTRUMENTS.filter(i => {
    return i.category === 'Synthetic Indices' && 
           (i.symbol.toLowerCase().includes(search.toLowerCase()) || 
            i.name.toLowerCase().includes(search.toLowerCase()));
  });

  const handleLocalExecute = (p: any) => {
    onExecute(p);
    setPlaced(prev => [{
      id: `VRB-${Math.random().toString(36).substring(7).toUpperCase()}`,
      symbol: activeInst.symbol,
      side: p.side || 'TRADE',
      amount: p.amount || 0,
      timestamp: Date.now(),
      status: 'Open'
    }, ...prev]);
    setIsDrawerOpen(false);
    setActiveView('POSITIONS');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden text-[#0A0A0A] z-[200]">
      {/* MOBILE TOP BAR */}
      <header className="h-14 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsMenuOpen(true)} className="p-1">
            <Menu className="w-6 h-6 text-[#0A0A0A]" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase leading-none tracking-widest">{activeInst.symbol}</span>
            <span className="text-[10px] font-mono font-bold mt-0.5">
              {lastTick ? formatNumber(lastTick.price, { minimumFractionDigits: 2 }) : '---'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[7px] font-bold text-[#6B7280] uppercase block">{accountMode} BALANCE</span>
            <span className={cn("text-[10px] font-mono font-bold block leading-none", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-[#0055FF] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-[#E4E4E4]"
          >
            {profile?.profile?.photoUrl ? <img src={profile.profile.photoUrl} className="w-full h-full object-cover" /> : user?.email?.substring(0,2).toUpperCase()}
          </button>
        </div>
      </header>

      {/* MAIN VIEW AREA */}
      <main className="flex-grow overflow-hidden relative bg-[#F7F7F5]">
        {/* Markets View */}
        {activeView === 'MARKETS' && (
          <div className="h-full flex flex-col bg-[#F7F7F5] animate-in fade-in duration-300">
            <div className="p-4 bg-white border-b border-[#E4E4E4] space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter indices..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">Synthetic Node operational</span>
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
                    <div className="w-8 h-8 rounded-full bg-[#16835B] flex items-center justify-center">
                       <span className="text-[10px] font-bold text-white font-mono">{inst.symbol.replace(/\D/g, '')}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-mono font-bold block uppercase">{inst.symbol} Index</span>
                      <span className="text-[9px] text-[#6B7280] uppercase block">Deterministic Walk</span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#E4E4E4] -rotate-90" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart View */}
        {activeView === 'CHART' && (
          <div className="h-full w-full bg-white relative animate-in fade-in duration-300">
            <SyntheticChart ticks={ticks} loading={loading} />
            <div className="absolute top-4 left-4 pointer-events-none opacity-20">
               <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#0A0A0A]">Varban Algorithm v4.2</span>
            </div>
          </div>
        )}

        {/* Positions View */}
        {activeView === 'POSITIONS' && (
          <div className="h-full flex flex-col bg-[#F7F7F5] animate-in fade-in duration-300">
            <div className="p-6 bg-white border-b border-[#E4E4E4] flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Contract Ledger</h2>
              <span className="text-[10px] font-bold text-[#0055FF] uppercase bg-[#0055FF]/5 px-2 py-1 border border-[#0055FF]">
                {placed.length} Contracts
              </span>
            </div>
            <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-3">
              {placed.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-30 grayscale">
                   <Activity className="w-12 h-12 mx-auto text-[#6B7280]" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No Active Contracts</p>
                </div>
              ) : (
                placed.map(pos => (
                  <Card key={pos.id} className="p-4 bg-white border border-[#E4E4E4] space-y-4 shadow-sm rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-[#0055FF]" />
                        <div>
                          <span className="text-xs font-mono font-bold block uppercase">{pos.symbol}</span>
                          <span className="text-[8px] font-bold uppercase text-[#16835B]">{pos.side}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-[#6B7280] uppercase">REF: {pos.id.slice(4)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-[#F7F7F5]">
                      <div>
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase block">Stake</span>
                        <span className="text-[10px] font-mono font-bold text-[#0A0A0A]">${pos.amount.toFixed(2)}</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase text-[#C9A227] animate-pulse">Waiting Tick...</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION (5 COLUMN) */}
      <footer className="h-16 border-t border-[#E4E4E4] bg-white flex items-center justify-between shrink-0 z-[100] shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]">
        {/* Markets */}
        <button 
          onClick={() => setActiveView('MARKETS')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all",
            activeView === 'MARKETS' ? "text-[#0055FF]" : "text-[#6B7280]"
          )}
        >
          <Globe className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Registry</span>
        </button>
        
        {/* Chart */}
        <button 
          onClick={() => setActiveView('CHART')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all",
            activeView === 'CHART' ? "text-[#0055FF]" : "text-[#6B7280]"
          )}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Visuals</span>
        </button>

        {/* RISE/EVEN ACTION */}
        <div className="flex-1 flex items-center justify-center h-full px-1">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-full h-12 bg-[#16835B] text-white flex flex-col items-center justify-center rounded-xl shadow-md active:scale-95 transition-transform"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Rise / Even</span>
            <span className="text-[8px] font-bold uppercase opacity-70">85% Yield</span>
          </button>
        </div>

        {/* FALL/ODD ACTION */}
        <div className="flex-1 flex items-center justify-center h-full px-1">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-full h-12 bg-[#C43D3D] text-white flex flex-col items-center justify-center rounded-xl shadow-md active:scale-95 transition-transform"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Fall / Odd</span>
            <span className="text-[8px] font-bold uppercase opacity-70">85% Yield</span>
          </button>
        </div>

        {/* Positions/History */}
        <button 
          onClick={() => setActiveView('POSITIONS')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all",
            activeView === 'POSITIONS' ? "text-[#0055FF]" : "text-[#6B7280]"
          )}
        >
          <History className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Ledger</span>
        </button>
      </footer>

      {/* EXECUTION DRAWER */}
      <BottomSheet
        open={isDrawerOpen}
        title={`Execute ${activeInst.symbol}`}
        onClose={() => setIsDrawerOpen(false)}
      >
        <div className="p-2">
          <DerivedTradeControls 
            instrument={activeInst} 
            livePrice={lastTick?.price || null} 
            balance={activeBalance} 
            onExecute={handleLocalExecute} 
          />
        </div>
      </BottomSheet>

      {/* SIDEBAR OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[600]">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300">
            <AuthedSidebar isMobile onLinkClick={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* PROFILE OVERLAY */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[600]">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white animate-in slide-in-from-right duration-300 shadow-2xl">
             <div className="p-4 border-b border-[#E4E4E4] flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Account Hub</h3>
                <button onClick={() => setIsProfileOpen(false)} className="p-1"><X className="w-5 h-5 text-[#6B7280]" /></button>
             </div>
             <div className="p-2 h-full overflow-y-auto no-scrollbar">
                <ProfileDropdown 
                  user={user} 
                  profile={profile} 
                  accountMode={accountMode} 
                  demoBalance={demoBalance} 
                  isOpen={true}
                  inline
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
