'use client';

import AuthedSidebar from "./AuthedSidebar";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Bell, User, Menu, X, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/app/lib/utils";

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences',
  '/admin', '/admin/users', '/admin/transactions', '/admin/markets'
];

const ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

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
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!loading) {
      if (!user && isStrict) {
        router.push('/login');
      } else if (user && isAdminPath && !isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, isStrict, isAdminPath, isAdmin, router]);

  if (isTerminal) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#F7F7F5] min-h-[400px]">
        <div className="w-5 h-5 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && isStrict) return null;
  if (user && isAdminPath && !isAdmin) return null;
  if (!user) return <>{children}</>;

  // Render isolated Admin layouts for administration sub-domains
  if (isAdminPath) {
    return (
      <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
        <AdminHeader title={title} subtitle={subtitle} />
        
        <div className="flex flex-grow overflow-hidden relative">
          <AdminSidebar className="hidden md:flex" />
          
          {/* Mobile Admin Nav Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[250] md:hidden">
              <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300 shadow-2xl">
                <AdminSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          )}

          <main className="flex-grow overflow-y-auto bg-[#F7F7F5] p-4 md:p-8 no-scrollbar md:ml-16">
            <div className="max-w-7xl mx-auto">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden mb-4 px-3 py-1.5 border border-[#E4E4E4] bg-white text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5"
              >
                <Menu className="w-3.5 h-3.5 text-[#0055FF]" />
                <span>Control Menu</span>
              </button>
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <header className="relative h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-[150] shadow-sm">
        <div className="flex items-center w-full md:w-auto justify-center md:justify-start">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="absolute left-4 md:relative p-2 md:hidden hover:bg-[#F7F7F5] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link href="/dashboard" className="flex items-center">
            <Image src="/assets/logo2.png" alt="Varban Workspace" width={120} height={28} className="h-7 w-auto object-contain" priority />
          </Link>
          
          <div className="h-6 w-px bg-[#E4E4E4] hidden md:block md:ml-6 md:mr-6"></div>
          
          <div className="hidden md:block">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A]">{title}</h1>
            {subtitle && <p className="text-[9px] text-[#6B7280] uppercase tracking-wider mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-8 absolute right-4 md:relative">
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsAmountDropdownOpen(!isAmountDropdownOpen)} className="flex items-center space-x-2 border border-[#E4E4E4] px-2 md:px-3 py-1 bg-white text-right hover:bg-[#F7F7F5] transition-colors shadow-sm select-none">
              <div className="text-right">
                <span className="text-[7px] md:text-[8px] text-[#6B7280] uppercase tracking-widest font-bold block">{accountMode === 'REAL' ? 'Real' : 'Demo'}</span>
                <span className={cn("text-[9px] md:text-[10px] font-mono font-bold block", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
                  ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>
            {isAmountDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E4E4E4] shadow-lg z-[200] p-1 flex flex-col space-y-0.5">
                <button onClick={() => selectAccountMode('REAL')} className={cn("w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-between", accountMode === 'REAL' ? "bg-[#F7F7F5] text-[#16835B]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]")}>
                  <span>Real Account</span>
                  {accountMode === 'REAL' && <Check className="w-3 h-3 text-[#16835B]" />}
                </button>
                <button onClick={() => selectAccountMode('DEMO')} className={cn("w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-between", accountMode === 'DEMO' ? "bg-[#F7F7F5] text-[#0055FF]" : "text-[#0A0A0A] hover:bg-[#F7F7F5]")}>
                  <span>Demo Account</span>
                  {accountMode === 'DEMO' && <Check className="w-3 h-3 text-[#0055FF]" />}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/notifications" className="relative group p-1.5 md:p-2">
              <Bell className="w-4 h-4 text-[#6B7280] group-hover:text-[#0A0A0A] transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#0055FF] rounded-full border border-white"></span>
            </Link>
            <div className="relative" ref={profileDropdownRef}>
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-2 group focus:outline-none">
                <div className={cn("w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center transition-colors", isProfileDropdownOpen ? "border-[#0055FF]" : "group-hover:border-[#0055FF]")}>
                  <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#6B7280]" />
                </div>
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4E4E4] shadow-lg z-[200] py-1 flex flex-col">
                  <Link href="/account" onClick={() => setIsProfileDropdownOpen(false)} className="px-4 py-2.5 text-[10px] font-bold uppercase text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]">Profile</Link>
                  <button onClick={() => router.push('/')} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#0055FF] hover:bg-[#F7F7F5]">Log Out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-grow overflow-hidden relative">
        <AuthedSidebar className="hidden md:flex" />
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[250] md:hidden">
            <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300 shadow-2xl">
              <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-grow overflow-y-auto bg-[#F7F7F5] p-4 md:p-8 no-scrollbar md:ml-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
