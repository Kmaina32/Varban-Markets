'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
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
import placeholderImages from "@/app/lib/placeholder-images.json";

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
          
          <Link href="/dashboard" className="hidden md:flex items-center">
            <Image 
              src="/assets/logo.png"
              alt="Varban Terminal"
              width={130}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
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
          <Link href="/dashboard" className="flex items-center">
             <Image 
              src="/assets/logo.png"
              alt="Varban Terminal"
              width={120}
              height={28}
              className="h-6 w-auto object-contain"
              priority
            />
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
                  accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]"
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
                    accountMode === 'DEMO' ? "bg-[#F7F7F5] text-[#0055FF]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]"
                  )}
                >
                  <div className="flex flex-col">
                    <span>Demo Account</span>
                    <span className="text-[9px] font-mono font-normal text-[#6B7280]">
                      ${formatNumber(demoBalance, { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                  {accountMode === 'DEMO' && <Check className="w-3 h-3 text-[#0055FF]" />}
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
          {/* ... Rest of the component remains the same ... */}
        </div>
      </header>
      {/* ... Rest of file omitted for brevity ... */}
    </div>
  );
}
