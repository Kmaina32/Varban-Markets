
'use client';

/**
 * @fileOverview High-Performance Electronic Trading Terminal Workspace.
 * Optimized with side-opening mobile drawers and resizable desktop panels.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { 
  CheckCircle2, 
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  Menu,
  X,
  GripHorizontal,
  Globe,
  Activity,
  BarChart2,
  FileText,
  Search
} from "lucide-react";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import { useUser } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import AuthedSidebar from "@/components/layout/AuthedSidebar";
import AuthedLayout from "@/components/layout/AuthedLayout";
import TerminalTutorial from "@/components/terminal/TerminalTutorial";
import TickerTape from "@/components/tradingview/TickerTape";
import TechnicalAnalysis from "@/components/tradingview/TechnicalAnalysis";

interface Position {
  id: string;
  instrument: string;
  vector: "BUY" | "SELL";
  entryPrice: number;
  stake: number;
  duration: string;
  status: "Open" | "Closed";
  timestamp: number;
  isDemo: boolean;
}

export default function TerminalWorkspace() {
  const { user } = useUser();
  const { t, formatNumber } = useTranslation();

  // APP STATE
  const [activeInst, setActiveInst] = useState<Instrument>(AVAILABLE_INSTRUMENTS[0]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<{ change: number | null, percent: number | null }>({ change: null, percent: null });
  const [stake, setStake] = useState<number>(activeInst.minStake);
  const [duration, setDuration] = useState<string>("5m");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'TICKET' | 'MARKETS' | 'ANALYSIS'>('TICKET');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // MOBILE DRAWER STATE
  const [activeMobileDrawer, setActiveMobileDrawer] = useState<'MARKETS' | 'ANALYSIS' | 'POSITIONS' | null>(null);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [realBalance, setRealBalance] = useState<number>(5420.50);

  const [positions, setPositions] = useState<Position[]>([]);

  // RESIZABLE PANEL LOGIC (DESKTOP ONLY)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 120 && newHeight <= 600) {
        setBottomPanelHeight(newHeight);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const activePositions = useMemo(() => {
    return positions.filter(p => p.status === 'Open' && p.isDemo === (accountMode === 'DEMO'));
  }, [positions, accountMode]);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    const savedDemo = localStorage.getItem('varban_demo_balance');
    if (savedDemo) setDemoBalance(parseFloat(savedDemo));
  }, []);

  useEffect(() => {
    let active = true;
    const updatePrice = async () => {
      try {
        const data = await fetchLivePrice(activeInst.symbol);
        if (!active) return;
        setLivePrice(data.price);
        setLiveMetrics({ change: data.change, percent: data.changePercent });
      } catch (err) {}
    };

    updatePrice();
    const interval = setInterval(updatePrice, 3000);
    return () => { active = false; clearInterval(interval); };
  }, [activeInst.symbol]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setPositions(prev => prev.map(p => {
        if (p.status === 'Open' && now - p.timestamp > 18000) {
          return { ...p, status: 'Closed' };
        }
        return p;
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleExecute = (overrideDirection: "BUY" | "SELL") => {
    if (livePrice === null || !user) return;

    const newPos: Position = {
      id: `VRB-${Math.random().toString(36).substring(7).toUpperCase()}`,
      instrument: activeInst.symbol,
      vector: overrideDirection,
      entryPrice: livePrice,
      stake: stake,
      duration: duration,
      status: "Open",
      timestamp: Date.now(),
      isDemo: accountMode === 'DEMO'
    };

    if (accountMode === 'DEMO') {
      if (stake > demoBalance) return alert("Practice Balance Exhausted.");
      setDemoBalance(prev => prev - stake);
    } else {
      if (stake > realBalance) return alert("Insufficient Capital.");
      setRealBalance(prev => prev - stake);
    }

    setPositions(prev => [newPos, ...prev]);
    setSuccessMessage(`${activeInst.symbol} ${overrideDirection} Executed`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const activeBalance = accountMode === 'REAL' ? realBalance : demoBalance;

  return (
    <AuthedLayout title="Terminal" isTerminal={true}>
      <div className="h-screen flex flex-col overflow-hidden bg-white text-[#0A0A0A]">
        <TerminalTutorial />

        {/* Mobile Navigation Drawer (Sidebar) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[400] lg:hidden">
            <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white text-[#0A0A0A] animate-in slide-in-from-left duration-300 shadow-2xl">
              <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* TERMINAL SIDE-OPENING DRAWERS (MOBILE ONLY) */}
        {activeMobileDrawer && (
          <div className="fixed inset-0 z-[350] lg:hidden flex justify-end">
            <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setActiveMobileDrawer(null)}></div>
            <div className="relative w-full max-w-[90%] h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="p-4 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5]">
                <div className="flex items-center gap-2">
                  {activeMobileDrawer === 'MARKETS' && <Globe className="w-4 h-4 text-[#0055FF]" />}
                  {activeMobileDrawer === 'ANALYSIS' && <BarChart2 className="w-4 h-4 text-[#0055FF]" />}
                  {activeMobileDrawer === 'POSITIONS' && <Activity className="w-4 h-4 text-[#16835B]" />}
                  <span className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
                    {activeMobileDrawer === 'MARKETS' ? 'Market Registry' : activeMobileDrawer === 'ANALYSIS' ? 'Market Insights' : 'Live Positions'}
                  </span>
                </div>
                <button onClick={() => setActiveMobileDrawer(null)} className="p-2 hover:bg-[#E4E4E4] rounded-full transition-colors">
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 no-scrollbar">
                {activeMobileDrawer === 'MARKETS' && (
                  <div className="space-y-1 divide-y divide-[#F7F7F5]">
                    {AVAILABLE_INSTRUMENTS.map(inst => (
                      <button 
                        key={inst.symbol} 
                        onClick={() => { setActiveInst(inst); setActiveMobileDrawer(null); }} 
                        className={cn(
                          "w-full p-4 text-left flex justify-between items-center transition-all",
                          activeInst.symbol === inst.symbol ? "bg-[#0055FF]/5 border-l-4 border-l-[#0055FF]" : "border-l-4 border-l-transparent"
                        )}
                      >
                        <div>
                          <span className="text-sm font-mono font-bold block text-[#0A0A0A]">{inst.symbol}</span>
                          <span className="text-[10px] text-[#6B7280] uppercase font-medium">{inst.category}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#16835B] font-bold">ONLINE</span>
                      </button>
                    ))}
                  </div>
                )}
                {activeMobileDrawer === 'ANALYSIS' && <TechnicalAnalysis symbol={activeInst.symbol} />}
                {activeMobileDrawer === 'POSITIONS' && (
                   <div className="space-y-4">
                     {activePositions.length === 0 ? (
                       <div className="py-20 text-center space-y-3">
                         <Activity className="w-12 h-12 text-[#E4E4E4] mx-auto opacity-30" />
                         <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">No active contracts detected.</p>
                       </div>
                     ) : activePositions.map(pos => (
                       <Card key={pos.id} className="p-4 border-[#E4E4E4] shadow-sm space-y-3">
                         <div className="flex justify-between items-start">
                           <div>
                             <span className="text-[11px] font-mono font-bold text-[#0A0A0A] block">{pos.instrument}</span>
                             <span className="text-[9px] text-[#6B7280] uppercase">{pos.id.slice(0, 10)}</span>
                           </div>
                           <span className={cn("px-2 py-0.5 border text-[9px] font-bold", pos.vector === 'BUY' ? 'border-[#16835B] text-[#16835B]' : 'border-[#0055FF] text-[#0055FF]')}>
                             {pos.vector}
                           </span>
                         </div>
                         <div className="flex justify-between items-end border-t border-[#F7F7F5] pt-3">
                            <div>
                               <span className="text-[8px] text-[#6B7280] uppercase block">Stake</span>
                               <span className="text-xs font-mono font-bold">${pos.stake.toFixed(2)}</span>
                            </div>
                            <div className="text-right">
                               <span className="text-[8px] text-[#6B7280] uppercase block">Entry</span>
                               <span className="text-xs font-mono font-bold">${pos.entryPrice.toLocaleString()}</span>
                            </div>
                         </div>
                       </Card>
                     ))}
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="fixed top-20 right-4 z-[260] bg-white border-2 border-[#16835B] text-[#16835B] px-4 py-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 mr-2 inline-block" />
            <span className="text-[11px] font-bold uppercase">{successMessage}</span>
          </div>
        )}

        <div className="hidden lg:block shrink-0 border-b border-[#E4E4E4] bg-white">
          <TickerTape />
        </div>

        <header className="relative h-14 border-b flex items-center justify-between px-4 shrink-0 z-50 bg-white border-[#E4E4E4]">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 lg:hidden text-[#0A0A0A]">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard"><Image src="/assets/logo2.png" alt="Varban" width={80} height={20} className="w-auto object-contain" priority /></Link>
            <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
            <div className="hidden md:flex items-center space-x-2 text-[10px] font-bold uppercase text-[#6B7280]">
              <span>Deterministic Execution Layer</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-bold uppercase text-[#6B7280]">{accountMode} BALANCE</span>
              <span className={cn("text-xs font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
                ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs uppercase">
              {user?.email?.substring(0,2)}
            </div>
          </div>
        </header>

        <div className="flex-grow flex overflow-hidden relative">
          <AuthedSidebar className="hidden lg:flex" />
          
          {/* Workspace Root */}
          <div className="flex-grow flex flex-col lg:flex-row lg:ml-16 overflow-hidden">
            
            {/* Chart Module (Main focus on mobile) */}
            <div className="flex-grow flex flex-col overflow-hidden relative h-full order-1 lg:order-2">
              <div id="tour-chart" className="flex-grow min-h-0 bg-[#F7F7F5]">
                <TradingViewChart symbol={activeInst.symbol} />
              </div>

              {/* RESIZABLE BOTTOM PANEL (DESKTOP ONLY) */}
              <div 
                ref={resizeRef}
                style={{ height: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${bottomPanelHeight}px` : undefined }}
                className="hidden lg:flex border-t border-[#E4E4E4] bg-white overflow-hidden flex-col shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
              >
                <div 
                  onMouseDown={startResizing}
                  className="px-4 py-2 border-b bg-[#F7F7F5] flex justify-between items-center sticky top-0 z-10 border-[#E4E4E4] cursor-row-resize select-none active:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#0A0A0A]">Live Positions ({activePositions.length})</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <GripHorizontal className="w-4 h-4 text-[#D1D5DB]" />
                  </div>
                  <span className="text-[8px] font-bold uppercase text-[#6B7280] tracking-widest">Node ID: VRB-AGG-04</span>
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead className="text-[#6B7280] uppercase font-bold border-b border-[#E4E4E4] bg-white sticky top-0">
                      <tr>
                        <th className="p-3">Reference</th>
                        <th className="p-3">Market</th>
                        <th className="p-3">Vector</th>
                        <th className="p-3 text-right">Stake</th>
                        <th className="p-3 text-right">Entry</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E4]">
                      {activePositions.length === 0 ? (
                        <tr><td colSpan={6} className="p-10 text-center text-[#D1D5DB] font-bold uppercase italic text-[9px]">Awaiting trades in the current domain...</td></tr>
                      ) : activePositions.map(pos => (
                        <tr key={pos.id} className="hover:bg-[#F7F7F5] transition-colors">
                          <td className="p-3 font-mono text-[#6B7280]">{pos.id.slice(0, 10)}</td>
                          <td className="p-3 font-mono font-bold">{pos.instrument}</td>
                          <td className="p-3"><span className={cn("px-2 py-0.5 border text-[9px] font-bold", pos.vector === 'BUY' ? 'border-[#16835B] text-[#16835B] bg-[#16835B]/5' : 'border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5')}>{pos.vector}</span></td>
                          <td className="p-3 text-right font-mono font-bold">${pos.stake.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-center"><span className="text-[9px] font-bold uppercase text-[#0055FF] animate-pulse bg-[#0055FF]/5 px-2 py-0.5 border border-[#0055FF]/20">ACTIVE</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Execution Sidebar (Desktop) / Ticket Panel (Mobile) */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-r border-[#E4E4E4] flex flex-col shrink-0 bg-white order-2 lg:order-1 overflow-hidden">
              {/* Tabs only visible on Desktop */}
              <div className="hidden lg:flex border-b bg-[#F7F7F5] border-[#E4E4E4]">
                {['TICKET', 'MARKETS', 'ANALYSIS'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setLeftTab(tab as any)} 
                    className={cn(
                      "flex-1 py-3 text-[9px] font-bold uppercase tracking-widest border-b-2 transition-all", 
                      leftTab === tab ? "border-[#0055FF] text-[#0055FF] bg-white" : "border-transparent text-[#6B7280]"
                    )}
                  >
                    {tab === 'TICKET' ? 'Order' : tab === 'MARKETS' ? 'Registry' : 'Insights'}
                  </button>
                ))}
              </div>

              {/* TICKET CONTENT (The primary interaction node) */}
              <div className="p-4 flex-grow overflow-y-auto no-scrollbar space-y-4">
                {(leftTab === 'TICKET' || typeof window !== 'undefined' && window.innerWidth < 1024) && (
                  <div id="tour-settings" className="space-y-4">
                    <div className="p-3 border bg-[#F7F7F5] border-[#E4E4E4] flex justify-between items-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#6B7280] block">Active Terminal</span>
                        <span className="text-xs font-mono font-bold text-[#0A0A0A]">{activeInst.symbol}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold block">${livePrice?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---'}</span>
                        <span className={cn("text-[9px] font-bold", (liveMetrics.percent || 0) >= 0 ? "text-[#16835B]" : "text-[#C43D3D]")}>
                          {liveMetrics.percent ? `${liveMetrics.percent >= 0 ? '+' : ''}${liveMetrics.percent}%` : '---'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleExecute('BUY')} className="py-5 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 shadow-md hover:opacity-90 active:scale-[0.98] transition-all">
                        <TrendingUp className="w-5 h-5" />
                        <span>Buy</span>
                      </button>
                      <button onClick={() => handleExecute('SELL')} className="py-5 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 shadow-md hover:opacity-90 active:scale-[0.98] transition-all">
                        <TrendingDown className="w-5 h-5" />
                        <span>Sell</span>
                      </button>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Duration Block</label>
                          <div className="grid grid-cols-4 gap-1">
                            {['1m', '5m', '15m', '1h'].map(d => (
                              <button key={d} onClick={() => setDuration(d)} className={cn("py-2 text-[10px] font-bold border", duration === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4]")}>{d}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#6B7280] uppercase block mb-1">Stake (USD)</label>
                          <input type="number" value={stake} onChange={e => setStake(Number(e.target.value))} className="w-full p-2.5 border border-[#E4E4E4] font-mono text-sm font-bold bg-[#F7F7F5] focus:outline-none focus:border-[#0055FF]" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase text-[#6B7280]">Contract Payout (85%)</span>
                        <span className="text-xs font-mono font-bold text-[#16835B]">+$${(stake * 0.85).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#E4E4E4] pt-2">
                        <span className="text-[9px] font-bold uppercase text-[#6B7280]">Total Return</span>
                        <span className="text-xs font-mono font-bold text-[#0A0A0A]">${(stake * 1.85).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DESKTOP ONLY REGISTRY/INSIGHTS VIEW */}
                <div className="hidden lg:block">
                  {leftTab === 'MARKETS' && (
                    <div id="tour-market-select" className="divide-y divide-[#E4E4E4]">
                      {AVAILABLE_INSTRUMENTS.map(inst => (
                        <button key={inst.symbol} onClick={() => setActiveInst(inst)} className={cn("w-full p-3 text-left hover:bg-[#F7F7F5] transition-colors flex justify-between items-center group", activeInst.symbol === inst.symbol ? "bg-[#0055FF]/5 border-l-4 border-l-[#0055FF]" : "border-l-4 border-l-transparent")}>
                          <div><span className="text-xs font-mono font-bold block group-hover:text-[#0055FF] transition-colors">{inst.symbol}</span><span className="text-[9px] text-[#6B7280] uppercase">{inst.category}</span></div>
                          <span className="text-[10px] font-mono text-[#16835B] font-bold">ONLINE</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {leftTab === 'ANALYSIS' && (
                    <div className="animate-in fade-in duration-300">
                      <TechnicalAnalysis symbol={activeInst.symbol} />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MOBILE TERMINAL FOOTER NAVIGATION */}
        <div className="lg:hidden h-16 border-t border-[#E4E4E4] bg-white flex items-center shrink-0 z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <button 
            onClick={() => setActiveMobileDrawer('MARKETS')}
            className={cn("flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors", activeMobileDrawer === 'MARKETS' ? "text-[#0055FF]" : "text-[#6B7280]")}
          >
            <Globe className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Market</span>
          </button>
          <button 
            onClick={() => setActiveMobileDrawer('POSITIONS')}
            className={cn("flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors", activeMobileDrawer === 'POSITIONS' ? "text-[#16835B]" : "text-[#6B7280]")}
          >
            <div className="relative">
              <Activity className="w-5 h-5" />
              {activePositions.length > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#16835B] text-white text-[7px] flex items-center justify-center rounded-full font-bold">
                  {activePositions.length}
                </span>
              )}
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest">Trades</span>
          </button>
          <button 
            onClick={() => setActiveMobileDrawer(null)}
            className={cn("flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors", activeMobileDrawer === null ? "text-[#0055FF]" : "text-[#6B7280]")}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Order</span>
          </button>
          <button 
            onClick={() => setActiveMobileDrawer('ANALYSIS')}
            className={cn("flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors", activeMobileDrawer === 'ANALYSIS' ? "text-[#0055FF]" : "text-[#6B7280]")}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Insights</span>
          </button>
        </div>
      </div>
    </AuthedLayout>
  );
}

