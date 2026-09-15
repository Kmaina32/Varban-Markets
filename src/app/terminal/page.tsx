'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { CheckCircle2, ChevronDown, Bell, User, Globe, Menu, X, Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { TradingViewChart } from "@/components/terminal/TradingViewChart";
import AuthedSidebar from "@/components/layout/AuthedSidebar";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { LocaleCode, LANGUAGE_LABELS } from "@/app/lib/i18n-dictionary";
import { cn } from "@/app/lib/utils";

export default function TerminalWorkspace() {
  const { user } = useUser();
  const db = useFirestore();
  const { locale, setLocale, t, formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [activeInst, setActiveInst] = useState<Instrument>(AVAILABLE_INSTRUMENTS[0]);
  const [livePrice, setLivePrice] = useState<number>(activeInst.price);
  const [liveMetrics, setLiveMetrics] = useState({ change: activeInst.change, percent: activeInst.changePercent });
  const [direction, setDirection] = useState<"CALL" | "PUT" | null>(null);
  const [stake, setStake] = useState<number>(activeInst.minStake);
  const [duration, setDuration] = useState<string>("5m");
  const [reviewActive, setReviewActive] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTradePanelOpen, setIsTradePanelOpen] = useState(false);
  const [isAmountDropdownOpen, setIsAmountDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    const savedDemo = localStorage.getItem('varban_demo_balance');
    if (savedDemo) setDemoBalance(parseFloat(savedDemo));
  }, []);

  useEffect(() => {
    const handleGlobalChange = () => {
      const mode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
      if (mode) setAccountMode(mode);
      const savedDemo = localStorage.getItem('varban_demo_balance');
      if (savedDemo) setDemoBalance(parseFloat(savedDemo));
    };
    window.addEventListener('varban_account_mode_changed', handleGlobalChange);
    return () => window.removeEventListener('varban_account_mode_changed', handleGlobalChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAmountDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectAccountMode = (mode: 'REAL' | 'DEMO') => {
    setAccountMode(mode);
    localStorage.setItem('varban_account_mode', mode);
    window.dispatchEvent(new Event('varban_account_mode_changed'));
    setIsAmountDropdownOpen(false);
  };

  const activePositionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, `users/${user.uid}/positions`),
      where("status", "==", "Open"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: activePositions, loading: positionsLoading } = useCollection<any>(activePositionsQuery);

  useEffect(() => {
    let active = true;
    const updatePrice = async () => {
      try {
        const data = await fetchLivePrice(activeInst.symbol);
        if (!active) return;
        setLivePrice(data.price);
        setLiveMetrics({ change: data.change, percent: data.changePercent });
        setErrorStatus(null);
      } catch (err) {
        if (!active) return;
        setErrorStatus("Market data is temporarily unavailable.");
      }
    };

    updatePrice();
    const interval = setInterval(updatePrice, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeInst.symbol]);

  const handleSymbolChange = (newSymbol: string) => {
    const nextInst = AVAILABLE_INSTRUMENTS.find(i => i.symbol === newSymbol);
    if (nextInst) {
      setActiveInst(nextInst);
      setStake(nextInst.minStake);
      setDirection(null);
      setReviewActive(false);
    }
  };

  const handleExecute = () => {
    if (accountMode === 'DEMO') {
      const currentDemoBal = demoBalance - stake;
      setDemoBalance(currentDemoBal);
      localStorage.setItem('varban_demo_balance', currentDemoBal.toString());
      window.dispatchEvent(new Event('varban_account_mode_changed'));
      
      setSuccessMessage(`${activeInst.symbol} @ ${livePrice.toFixed(4)}`);
      setReviewActive(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setIsTradePanelOpen(false);
      }, 4000);
      return;
    }

    if (!user || !db || !direction) return;
    setReviewActive(false);
    
    addDoc(collection(db, `users/${user.uid}/positions`), {
      instrument: activeInst.symbol,
      vector: direction,
      entryPrice: livePrice,
      stake: stake,
      duration: duration,
      status: "Open",
      profit: 0,
      timestamp: serverTimestamp()
    }).catch(() => {});

    setSuccessMessage(`${activeInst.symbol} @ ${livePrice.toFixed(4)}`);
    setTimeout(() => {
      setSuccessMessage(null);
      setIsTradePanelOpen(false);
    }, 4000);
  };

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="bg-white text-[#0A0A0A] h-screen flex flex-col overflow-hidden font-sans">
      <header className="relative h-16 border-b border-[#E4E4E4] flex items-center justify-between px-4 md:px-6 bg-white shrink-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-6">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden hover:bg-[#F7F7F5] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link href="/dashboard" className="hidden md:flex items-center space-x-2.5">
            <span className="text-[#0A0A0A] font-bold tracking-[0.2em] text-[10px] uppercase font-display whitespace-nowrap">
              VARBAN <span className="text-[#C9A227]">TERMINAL</span>
            </span>
          </Link>
          
          <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
          
          <nav className="hidden md:flex space-x-6 text-[9px] font-bold uppercase tracking-[0.1em]">
            <div className="relative group">
              <div className="flex items-center space-x-2 text-[#0A0A0A] cursor-pointer hover:bg-[#F7F7F5] px-2 py-1 transition-colors border border-[#E4E4E4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16835B]"></span>
                <span>{activeInst.symbol}</span>
                <ChevronDown className="w-3 h-3 text-[#6B7280]" />
              </div>
              <div className="absolute left-0 mt-1 w-48 bg-white border border-[#E4E4E4] hidden group-hover:block z-50 shadow-lg">
                {AVAILABLE_INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.symbol}
                    onClick={() => handleSymbolChange(inst.symbol)}
                    className="w-full text-left px-3 py-2 text-[10px] uppercase hover:bg-[#F7F7F5] block font-mono border-b border-[#F7F7F5] last:border-0"
                  >
                    {inst.symbol} - {inst.name}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/markets" className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors flex items-center">{t('nav.markets')}</Link>
            <Link href="/portfolio" className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors flex items-center">{t('nav.portfolio')}</Link>
          </nav>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <span className="text-[#0A0A0A] font-bold tracking-[0.2em] text-[10px] uppercase font-display whitespace-nowrap">
              VARBAN <span className="text-[#C9A227]">TERMINAL</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAmountDropdownOpen(!isAmountDropdownOpen)}
              className="flex items-center space-x-2 border border-[#E4E4E4] px-3 py-1.5 bg-white text-right hover:bg-[#F7F7F5] transition-colors shadow-sm select-none"
            >
              <div className="text-right">
                <span className="text-[8px] text-[#6B7280] uppercase tracking-widest font-bold block">
                  {accountMode === 'REAL' ? 'Real Account' : 'Demo Account'}
                </span>
                <span className={cn(
                  "text-[10px] font-mono font-bold block",
                  accountMode === 'REAL' ? "text-[#16835B]" : "text-[#C9A227]"
                )}>
                  ${formatNumber(activeBalance, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>

            {isAmountDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E4E4E4] shadow-lg z-50 p-1 flex flex-col space-y-0.5">
                <button
                  onClick={() => selectAccountMode('REAL')}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center justify-between",
                    accountMode === 'REAL' ? "bg-[#F7F7F5] text-[#16835B]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]"
                  )}
                >
                  <div className="flex flex-col">
                    <span>Real Account</span>
                    <span className="text-[9px] font-mono font-normal text-[#6B7280]">
                      ${formatNumber(profile?.balance || 0, { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                  {accountMode === 'REAL' && <Check className="w-3 h-3 text-[#16835B]" />}
                </button>

                <button
                  onClick={() => selectAccountMode('DEMO')}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center justify-between",
                    accountMode === 'DEMO' ? "bg-[#F7F7F5] text-[#C9A227]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]"
                  )}
                >
                  <div className="flex flex-col">
                    <span>Demo Account</span>
                    <span className="text-[9px] font-mono font-normal text-[#6B7280]">
                      ${formatNumber(demoBalance, { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                  {accountMode === 'DEMO' && <Check className="w-3 h-3 text-[#C9A227]" />}
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-1 border border-[#E4E4E4] px-2 py-1 bg-[#F7F7F5]">
            <Globe className="w-3 h-3 text-[#6B7280]" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as LocaleCode)}
              className="text-[9px] font-bold uppercase tracking-wider bg-transparent text-[#0A0A0A] focus:outline-none appearance-none cursor-pointer pr-1"
            >
              {Object.entries(LANGUAGE_LABELS).map(([code, name]) => (
                <option key={code} value={code} className="bg-white text-[#0A0A0A]">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <Link href="/notifications" className="relative group p-2">
              <Bell className="w-4 h-4 text-[#6B7280] group-hover:text-[#0A0A0A] transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A227] rounded-full border border-white"></span>
            </Link>
            
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center transition-colors hover:border-[#C9A227] focus:outline-none"
              >
                <User className="w-4 h-4 text-[#6B7280]" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4E4E4] shadow-lg z-50 py-1 flex flex-col">
                  <div className="px-4 py-2 border-b border-[#F7F7F5] bg-[#F7F7F5]">
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Account</span>
                    <span className="text-[10px] font-bold text-[#0A0A0A] truncate block">{user?.email}</span>
                  </div>
                  <Link 
                    href="/account" 
                    className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t('nav.account')}</span>
                  </Link>
                  <Link 
                    href="/notifications" 
                    className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{t('nav.notifications')}</span>
                  </Link>
                  <div className="h-px bg-[#F7F7F5]"></div>
                  <Link 
                    href="/" 
                    className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#C43D3D] hover:bg-[#F7F7F5] transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav.exit')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden relative">
        <AuthedSidebar className="hidden md:flex" />

        <div className={cn(
          "fixed inset-0 z-[60] md:hidden transition-all duration-300",
          isMobileMenuOpen ? "bg-[#0A0A0A]/40 backdrop-blur-sm pointer-events-auto" : "bg-transparent pointer-events-none"
        )} onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className={cn(
              "absolute left-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        <div className="flex-grow flex flex-col overflow-hidden bg-[#F7F7F5] md:ml-16">
          <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
            <section className="flex-grow flex flex-col bg-white overflow-visible">
              <div className="flex-grow relative border-r border-[#E4E4E4] overflow-visible">
                <TradingViewChart symbol={activeInst.symbol} onSymbolChange={handleSymbolChange} />
                
                {successMessage && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#16835B] p-6 text-center space-y-3 z-[60] shadow-2xl min-w-[300px] w-[90%] md:w-auto">
                    <CheckCircle2 className="w-8 h-8 text-[#16835B] mx-auto" />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A]">{t('trading.orderConfirmed')}</h4>
                    <p className="text-[9px] text-[#6B7280] font-mono leading-relaxed">{t('trading.confirmedRef')} {successMessage}</p>
                    <Button variant="outline" size="sm" onClick={() => setSuccessMessage(null)} className="h-8 text-[9px] uppercase tracking-widest border-[#E4E4E4]">{t('common.dismiss')}</Button>
                  </div>
                )}
              </div>

              <div className="h-48 border-t border-[#E4E4E4] bg-white flex flex-col shrink-0">
                <div className="h-9 border-b border-[#E4E4E4] px-4 flex items-center space-x-6 bg-[#F7F7F5]">
                  <button className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] border-b-2 border-[#C9A227] h-full px-2">
                    {accountMode === 'REAL' ? `${t('trading.openPositions')} (${activePositions?.length || 0})` : 'Demo Practice Mode'}
                  </button>
                  <button className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B7280] hover:text-[#0A0A0A]">
                    {t('trading.historyTab')}
                  </button>
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white border-b border-[#E4E4E4] z-10">
                      <tr>
                        <th className="px-2 md:px-4 py-2 text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">ID</th>
                        <th className="px-2 md:px-4 py-2 text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.instrument')}</th>
                        <th className="px-2 md:px-4 py-2 text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">{t('tables.vector')}</th>
                        <th className="px-2 md:px-4 py-2 text-[8px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('trading.entryLive')}</th>
                        <th className="px-2 md:px-4 py-2 text-[8px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('tables.stake')}</th>
                        <th className="px-2 md:px-4 py-2 text-[8px] font-bold text-[#6B7280] uppercase tracking-widest text-right">{t('trading.plTarget')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E4]">
                      {accountMode === 'DEMO' ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-[9px] text-[#C9A227] font-mono uppercase tracking-wider">
                            Demo Environment Active. Practice simulations are not recorded to live ledger.
                          </td>
                        </tr>
                      ) : positionsLoading ? (
                        <tr><td colSpan={6} className="p-4 text-center text-[9px] text-[#6B7280] font-mono">{t('trading.loadingExposure')}</td></tr>
                      ) : activePositions?.length === 0 ? (
                        <tr><td colSpan={6} className="p-4 text-center text-[9px] text-[#6B7280] font-mono">{t('trading.noPositions')}</td></tr>
                      ) : activePositions?.map((pos: any) => (
                        <tr key={pos.id} className="hover:bg-[#F7F7F5] transition-colors">
                          <td className="px-2 md:px-4 py-2.5 text-[9px] font-mono text-[#6B7280]">{pos.id.slice(0, 8).toUpperCase()}</td>
                          <td className="px-2 md:px-4 py-2.5 text-[10px] font-bold text-[#0A0A0A]">{pos.instrument}</td>
                          <td className="px-2 md:px-4 py-2.5">
                            <span className={`text-[9px] font-bold uppercase px-1 py-0.5 border ${pos.vector === 'CALL' ? 'border-[#16835B] text-[#16835B]' : 'border-[#C43D3D] text-[#C43D3D]'}`}>
                              {pos.vector}
                            </span>
                          </td>
                          <td className="px-2 md:px-4 py-2.5 text-[10px] font-mono text-right">
                            <div className="text-[#0A0A0A] font-bold">{formatNumber(livePrice, { minimumFractionDigits: 2 })}</div>
                          </td>
                          <td className="px-2 md:px-4 py-2.5 text-[10px] font-mono text-[#0A0A0A] text-right">${formatNumber(pos.stake, { minimumFractionDigits: 2 })}</td>
                          <td className={`px-2 md:px-4 py-2.5 text-[10px] font-mono font-bold text-right ${pos.profit >= 0 ? 'text-[#16835B]' : 'text-[#C43D3D]'}`}>
                            ${formatNumber(pos.profit || 0, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <div className="md:hidden fixed bottom-12 left-0 right-0 p-4 z-40">
              <Button 
                onClick={() => setIsTradePanelOpen(true)}
                className="w-full h-14 bg-[#0A0A0A] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-2xl border-t-2 border-[#C9A227]"
              >
                {t('trading.setup')}
              </Button>
            </div>

            <aside className={cn(
              "fixed inset-0 w-full md:w-80 bg-white flex flex-col shrink-0 border-l border-[#E4E4E4] z-[70] transition-transform duration-300 md:translate-y-0 md:relative md:flex",
              isTradePanelOpen ? "translate-y-0" : "translate-y-full"
            )}>
              <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227] block mb-1">
                    {accountMode === 'REAL' ? t('trading.setup') : 'DEMO EXECUTION'}
                  </span>
                  <h2 className="text-sm font-bold uppercase text-[#0A0A0A] tracking-tight">{activeInst.symbol}</h2>
                </div>
                <button onClick={() => setIsTradePanelOpen(false)} className="md:hidden p-2 text-[#6B7280]">
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 space-y-6 flex-grow overflow-y-auto no-scrollbar pb-24 md:pb-4">
                <div>
                  <label className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em] block mb-2">{t('trading.direction')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDirection("CALL")}
                      className={`h-11 text-[10px] font-bold uppercase tracking-widest border transition-all ${direction === 'CALL' ? 'bg-[#16835B] border-[#16835B] text-white' : 'bg-white border-[#E4E4E4] text-[#16835B] hover:bg-[#F7F7F5]'}`}
                    >
                      CALL
                    </button>
                    <button
                      onClick={() => setDirection("PUT")}
                      className={`h-11 text-[10px] font-bold uppercase tracking-widest border transition-all ${direction === 'PUT' ? 'bg-[#C43D3D] border-[#C43D3D] text-white' : 'bg-white border-[#E4E4E4] text-[#C43D3D] hover:bg-[#F7F7F5]'}`}
                    >
                      PUT
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em] block">{t('trading.stake')}</label>
                  <input
                    type="number"
                    min={activeInst.minStake}
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value))}
                    className="w-full bg-[#F7F7F5] border border-[#E4E4E4] h-11 px-3 text-[11px] font-mono text-[#0A0A0A] focus:outline-none focus:border-[#C9A227] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em] block">{t('trading.duration')}</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-[#E4E4E4] h-11 px-3 text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] focus:outline-none focus:border-[#C9A227] appearance-none cursor-pointer"
                  >
                    {activeInst.durationOptions.map(opt => (
                      <option key={opt} value={opt} className="bg-white">{opt}</option>
                    ))}
                  </select>
                </div>

                <Card className="bg-[#F7F7F5] border-[#E4E4E4] p-5 rounded-none space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#6B7280] font-bold uppercase tracking-wider">{t('trading.return')}</span>
                    <span className="text-[12px] font-mono font-bold text-[#16835B]">+${formatNumber(stake * 1.85, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-px bg-[#E4E4E4]"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#6B7280] font-bold uppercase tracking-wider">{t('trading.loss')}</span>
                    <span className="text-[12px] font-mono font-bold text-[#C43D3D] text-right">-${formatNumber(stake, { minimumFractionDigits: 2 })}</span>
                  </div>
                </Card>
              </div>

              <div className="p-4 border-t border-[#E4E4E4] space-y-3 bg-white shrink-0 pb-8 md:pb-4">
                <Button
                  variant="brand"
                  disabled={!direction || reviewActive}
                  onClick={() => setReviewActive(true)}
                  className="w-full h-12 text-[10px] font-bold tracking-[0.2em] uppercase shadow-sm"
                >
                  {direction ? t('trading.review') : t('trading.direction')}
                </Button>

                {reviewActive && (
                  <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-3 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[9px] text-[#C9A227] font-bold uppercase tracking-wider text-center">
                      {t('trading.confirm')} ${stake} {direction} {activeInst.symbol}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleExecute} className="bg-[#16835B] h-10 text-[9px] uppercase tracking-widest text-white">{t('trading.confirm')}</Button>
                      <Button onClick={() => setReviewActive(false)} variant="outline" className="h-10 text-[9px] uppercase tracking-widest border-[#E4E4E4] text-[#0A0A0A]">{t('trading.cancel')}</Button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </main>

          <footer className="h-12 md:h-8 border-t border-[#E4E4E4] bg-white px-4 flex items-center justify-between shrink-0 text-[10px]">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">Feed:</span>
                <span className="text-[8px] font-bold text-[#16835B] uppercase">{t('common.active')}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#16835B]"></div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">© 2026 Varban Markets</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
