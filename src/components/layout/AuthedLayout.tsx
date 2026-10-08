
'use client';

import AuthedSidebar from "./AuthedSidebar";
import AdminSidebar from "./AdminSidebar";
import ProfileDropdown from "./ProfileDropdown";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/app/lib/utils";
import { useSupabaseAuth } from "@/app/lib/supabase/auth-context";

/**
 * @fileOverview Authenticated Workspace Layout.
 * Manages the trader and admin sidebar/header context.
 * Strict paths force redirection to login if no session is detected.
 */

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences',
  '/referral', '/admin'
];

const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

interface AuthedLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isTerminal?: boolean;
}

export default function AuthedLayout({ children, title, subtitle, isTerminal = false }: AuthedLayoutProps) {
  const { user, loading } = useUser();
  const { signOut } = useSupabaseAuth();
  const db = useFirestore();
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
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

  const isStrict = useMemo(() => {
    return STRICT_PATHS.some(path => pathname === path || pathname?.startsWith(path + '/'));
  }, [pathname]);

  const isAdminPath = useMemo(() => {
    return pathname?.startsWith('/admin');
  }, [pathname]);
  
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const isSuper = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
    const hasAdminRole = profile?.status?.role === 'Admin' || profile?.role === 'Admin';
    return isSuper || hasAdminRole;
  }, [user, profile]);

  // REDIRECTION LOGIC: Core Security Protocol
  useEffect(() => {
    if (loading) return;

    // 1. Unauthenticated users trying to access strict paths
    if (!user && isStrict) {
      router.replace('/login');
      return;
    }
    
    // 2. Authenticated users trying to access admin paths without authority
    if (user && isAdminPath && !isAdmin && !profileLoading) {
      router.replace('/dashboard');
      return;
    }

    // 3. Dedicated Terminal Guard
    if (isTerminal && !user) {
      router.replace('/login');
      return;
    }
  }, [user, loading, profileLoading, isStrict, isAdminPath, isAdmin, isTerminal, router]);

  // If loading or redirection is pending, show high-fidelity loading reveal
  if (loading || (isStrict && !user)) {
    return <LoadingOverlay />;
  }

  // If not a strict path and not logged in, render as public page (no sidebar/header)
  if (!isStrict && !user) return <>{children}</>;
  
  // Terminal workspace handling (no standard layout wrappers)
  if (isTerminal) return <>{children}</>;

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <header className="relative h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-3 md:px-6 shrink-0 z-[150] shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1.5 lg:hidden text-[#0A0A0A]"><Menu className="w-5 h-5" /></button>
          <Link href="/dashboard" className="flex items-center"><Image src="/assets/logo2.png" alt="Varban" width={95} height={22} className="w-auto object-contain" priority /></Link>
          <div className="h-6 w-px bg-[#E4E4E4] hidden lg:block"></div>
          <div className="hidden lg:block">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.1em]">{title}</h1>
            {subtitle && <p className="text-[9px] text-[#6B7280] uppercase tracking-wider mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="hidden md:flex items-center space-x-2 border border-[#E4E4E4] px-3 py-1 bg-white">
            <div className="text-right">
              <span className="text-[7px] text-[#6B7280] uppercase font-bold block">{accountMode}</span>
              <span className={cn("text-[9px] font-mono font-bold block", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>${formatNumber(activeBalance, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
            className="w-8 h-8 rounded-full border border-[#E4E4E4] overflow-hidden bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:border-[#0055FF] transition-all"
          >
            {profile?.profile?.photoUrl ? (
              <img src={profile.profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.email?.substring(0, 2).toUpperCase()
            )}
          </button>
          <ProfileDropdown 
            user={user} 
            profile={profile} 
            accountMode={accountMode} 
            demoBalance={demoBalance} 
            isOpen={isProfileDropdownOpen} 
            onClose={() => setIsProfileDropdownOpen(false)} 
            onSelectMode={(m) => { 
              setAccountMode(m); 
              localStorage.setItem('varban_account_mode', m); 
              window.dispatchEvent(new Event('varban_account_mode_changed')); 
            }} 
            onSignOut={async () => {
              await signOut();
              router.replace('/');
            }}
          />
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden relative">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[250] lg:hidden">
            <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white text-[#0A0A0A] animate-in slide-in-from-left duration-300 shadow-2xl">
               {isAdminPath ? (
                 <AdminSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
               ) : (
                 <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
               )}
            </div>
          </div>
        )}
        {isAdminPath ? <AdminSidebar className="hidden lg:flex" /> : <AuthedSidebar className="hidden lg:flex" />}
        <main className="flex-grow overflow-y-auto bg-[#F7F7F5] p-4 md:p-8 lg:ml-16 no-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
