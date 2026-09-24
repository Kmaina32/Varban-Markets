'use client';

/**
 * @fileOverview Master Authenticated Layout with integrated Mobile Drawer, Balance Matrix & Profile Dropdown.
 * Refined to strictly only show Workspace UI for internal paths.
 */

import AuthedSidebar from "./AuthedSidebar";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ProfileDropdown from "./ProfileDropdown";
import { Bell, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/app/lib/utils";

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences',
  '/referral', '/admin'
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
  const { formatNumber } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
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

  const selectAccountMode = (mode: 'REAL' | 'DEMO') => {
    setAccountMode(mode);
    localStorage.setItem('varban_account_mode', mode);
    window.dispatchEvent(new Event('varban_account_mode_changed'));
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

  // Handle Terminal bypass or non-strict paths (like Help, Contact)
  if (isTerminal || !isStrict) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#F7F7F5] min-h-[400px]">
        <div className="w-5 h-5 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null; // Let the redirect logic handle it

  if (isAdminPath) {
    return (
      <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
        <AdminHeader title={title} subtitle={subtitle} />
        
        <div className="flex flex-grow overflow-hidden relative">
          <AdminSidebar className="hidden md:flex" />
          
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
      <header className="relative h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-3 md:px-6 shrink-0 z-[150] shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-1.5 md:hidden hover:bg-[#F7F7F5] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link href="/dashboard" className="flex items-center">
            <Image src="/assets/logo2.png" alt="Varban Workspace" width={110} height={26} className="h-6 md:h-7 w-auto object-contain" priority />
          </Link>
          
          <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
          
          <div className="hidden md:block">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A]">{title}</h1>
            {subtitle && <p className="text-[9px] text-[#6B7280] uppercase tracking-wider mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-6">
          <button 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-2 border border-[#E4E4E4] px-2 md:px-3 py-1 bg-white hover:bg-[#F7F7F5] transition-colors shadow-sm select-none"
          >
            <div className="text-right">
              <span className="text-[7px] md:text-[8px] text-[#6B7280] uppercase tracking-widest font-bold block">
                {accountMode === 'REAL' ? 'Real' : 'Demo'}
              </span>
              <span className={cn("text-[9px] md:text-[10px] font-mono font-bold block", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
                ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#6B7280]" />
          </button>

          <div className="flex items-center space-x-1 md:space-x-3">
            <Link href="/notifications" className="relative p-1.5 md:p-2 hover:bg-[#F7F7F5] transition-colors">
              <Bell className="w-4 h-4 text-[#6B7280]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#0055FF] rounded-full border border-white"></span>
            </Link>

            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
                className="flex items-center space-x-2 group focus:outline-none"
              >
                <div className={cn(
                  "w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs transition-colors shadow-sm",
                  isProfileDropdownOpen ? "ring-2 ring-[#0055FF]" : "group-hover:ring-2 group-hover:ring-[#0055FF]"
                )}>
                  {user?.email ? user.email.substring(0, 2).toUpperCase() : 'VM'}
                </div>
              </button>

              <ProfileDropdown 
                user={user}
                profile={profile}
                accountMode={accountMode}
                demoBalance={demoBalance}
                isOpen={isProfileDropdownOpen}
                onClose={() => setIsProfileDropdownOpen(false)}
                onSelectMode={selectAccountMode}
              />
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-grow overflow-hidden relative">
        <AuthedSidebar className="hidden md:flex" />
        
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[250] md:hidden">
            <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300 shadow-2xl">
              <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-grow overflow-y-auto bg-[#F7F7F5] p-3 md:p-8 no-scrollbar md:ml-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
