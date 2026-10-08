'use client';

import AuthedSidebar from "./AuthedSidebar";
import AdminSidebar from "./AdminSidebar";
import ProfileDropdown from "./ProfileDropdown";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { Menu, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/app/lib/utils";
import { useSupabaseAuth } from "@/app/lib/supabase/auth-context";
import { createClient } from "@/app/lib/supabase/client";

/**
 * @fileOverview Authenticated Workspace Layout.
 * Manages the trader and admin sidebar/header context.
 * Strict paths force redirection to login if no session is detected.
 * Added: Profile completion enforcement for trading and deposits.
 */

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences',
  '/referral', '/admin', '/news'
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
  const supabase = createClient();
  const { formatNumber, t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    const savedDemo = localStorage.getItem('varban_demo_balance');
    if (savedDemo) setDemoBalance(parseFloat(savedDemo));

    async function loadProfile() {
      if (!user?.uid) {
        setProfileLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.uid).maybeSingle();
        if (data) setProfile(data);
      } catch (err) {
        console.error("Profile load failure");
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, [user?.uid, supabase]);

  const isStrict = useMemo(() => {
    return STRICT_PATHS.some(path => pathname === path || pathname?.startsWith(path + '/'));
  }, [pathname]);

  const isAdminPath = useMemo(() => {
    return pathname?.startsWith('/admin');
  }, [pathname]);
  
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const isSuper = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
    const hasAdminRole = profile?.role === 'Admin';
    return isSuper || hasAdminRole;
  }, [user, profile]);

  const isProfileIncomplete = useMemo(() => {
    if (profileLoading) return false;
    if (!user) return false;
    return profile?.profile_completed === false;
  }, [profile, profileLoading, user]);

  const enforcementRequired = useMemo(() => {
    // Only enforce on terminal and wallet (trading and money)
    return isProfileIncomplete && (pathname?.startsWith('/terminal') || pathname?.startsWith('/wallet'));
  }, [isProfileIncomplete, pathname]);

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

    // 3. Profile Completion Enforcement
    if (enforcementRequired) {
      router.replace('/account?tab=profile');
      return;
    }

    // 4. Dedicated Terminal Guard
    if (isTerminal && !user) {
      router.replace('/login');
      return;
    }
  }, [user, loading, profileLoading, isStrict, isAdminPath, isAdmin, enforcementRequired, isTerminal, router]);

  // If loading or redirection is pending, show high-fidelity loading reveal
  if (loading || (isStrict && !user) || (enforcementRequired)) {
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
          {isProfileIncomplete && pathname !== '/account' && (
             <Link href="/account?tab=profile" className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[#C43D3D] text-[9px] font-bold uppercase animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                Finish Registration
             </Link>
          )}
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
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="Avatar" className="w-full h-full object-cover" />
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
          <div className="max-w-7xl mx-auto">
             {isProfileIncomplete && pathname === '/account' && (
               <div className="mb-6 p-6 bg-[#0055FF] text-white shadow-lg flex items-center justify-between gap-6 border-b-4 border-[#0A0A0A]">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 flex items-center justify-center">
                        <Info className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest">Complete Your Investor Profile</h2>
                        <p className="text-[10px] text-white/80 uppercase font-bold mt-1">Required for trading terminal and vault access.</p>
                     </div>
                  </div>
                  <span className="hidden md:block text-[9px] font-mono font-bold text-white/50 uppercase tracking-[0.2em]">Compliance Step 1 of 2</span>
               </div>
             )}
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
