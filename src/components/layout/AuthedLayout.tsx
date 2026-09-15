'use client';

import AuthedSidebar from "./AuthedSidebar";
import { Bell, User, Globe, Menu, X, ChevronDown, Check, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { LocaleCode, LANGUAGE_LABELS } from "@/app/lib/i18n-dictionary";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/app/lib/utils";

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences'
];

interface AuthedLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isTerminal?: boolean;
}

export default function AuthedLayout({ children, title, subtitle, isTerminal = false }: AuthedLayoutProps) {
  const { user, loading } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const { locale, setLocale, t, formatNumber } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const isStrict = STRICT_PATHS.some(path => pathname === path || pathname?.startsWith(path + '/'));

  useEffect(() => {
    if (!loading && !user && isStrict) {
      router.push('/login');
    }
  }, [user, loading, isStrict, router]);

  if (isTerminal) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#F7F7F5] min-h-[400px]">
        <div className="w-5 h-5 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && isStrict) {
    return null;
  }

  if (!user) {
    return <>{children}</>;
  }

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <header className="relative h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-8">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden hover:bg-[#F7F7F5] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="hidden md:flex items-center space-x-2.5">
            <span className="text-[#0A0A0A] font-bold tracking-[0.2em] text-[10px] uppercase font-display whitespace-nowrap">
              VARBAN <span className="text-[#C9A227]">WORKSPACE</span>
            </span>
          </Link>

          <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
          
          <div className="hidden md:block">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A]">{title}</h1>
            {subtitle && <p className="text-[9px] text-[#6B7280] uppercase tracking-wider mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <span className="text-[#0A0A0A] font-bold tracking-[0.2em] text-[10px] uppercase font-display whitespace-nowrap">
              VARBAN <span className="text-[#C9A227]">WORKSPACE</span>
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

          <div className="hidden lg:flex items-center space-x-1.5 border border-[#E4E4E4] px-2 py-1 bg-[#F7F7F5]">
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

          <div className="h-6 w-px bg-[#E4E4E4] hidden sm:block"></div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/notifications" className="relative group p-2">
              <Bell className="w-4 h-4 text-[#6B7280] group-hover:text-[#0A0A0A] transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A227] rounded-full border border-white"></span>
            </Link>
            
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 group focus:outline-none"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center transition-colors",
                  isProfileDropdownOpen ? "border-[#C9A227]" : "group-hover:border-[#C9A227]"
                )}>
                  <User className="w-4 h-4 text-[#6B7280]" />
                </div>
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

        <main className="flex-grow overflow-y-auto bg-[#F7F7F5] p-4 md:p-8 no-scrollbar md:ml-16">
          <div className="md:hidden mb-6 px-1">
            <h1 className="text-sm font-bold uppercase tracking-[0.1em] text-[#0A0A0A]">{title}</h1>
            {subtitle && <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mt-1">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
