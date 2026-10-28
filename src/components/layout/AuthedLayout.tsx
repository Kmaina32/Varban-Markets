'use client';

/**
 * @fileOverview Institutional Workspace Layout.
 * Provides the core shell for authenticated users with a branded header and sidebar.
 */

import AuthedSidebar from "./AuthedSidebar";
import AdminSidebar from "./AdminSidebar";
import ProfileDropdown from "./ProfileDropdown";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { Menu, ChevronDown, Globe, Clock as ClockIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useDoc, useFirestore, initializeFirebase } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/app/lib/utils";
import { LANGUAGE_LABELS, LocaleCode } from "@/app/lib/i18n-dictionary";
import { doc, updateDoc } from "firebase/firestore";
import { getProfileGaps } from "@/app/lib/profile-completion";

const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

export default function AuthedLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const { user, loading } = useUser();
  const db = useFirestore();
  const { formatNumber, locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdminPath = pathname?.startsWith('/admin');
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) || profile?.status?.role === 'Admin';
  }, [user, profile]);

  if (loading || profileLoading) return <LoadingOverlay />;

  if (!user) {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <header className="h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-[150] shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 xl:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/client/dashboard" className="flex items-center gap-4">
            <Image src="/assets/logo2.png" alt="Varban Markets" width={95} height={22} className="w-auto h-5 object-contain" priority />
            <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
          </Link>
          <div className="hidden md:block">
            <h1 className="text-[10px] font-bold uppercase tracking-widest">{title}</h1>
            {subtitle && <p className="text-[8px] text-[#6B7280] uppercase tracking-wider">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center bg-[#F7F7F5] border border-[#E4E4E4] p-1.5 px-3 space-x-4">
            <div className="flex items-center text-xs font-mono font-bold text-[#0A0A0A]">
              <ClockIcon className="w-3 h-3 text-[#0055FF] mr-2" />
              {currentTime}
            </div>
            <div className="w-px h-3 bg-[#E4E4E4]"></div>
            <div className="flex items-center gap-2">
               <Globe className="w-3 h-3 text-[#6B7280]" />
               <select 
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as LocaleCode)}
                  className="bg-transparent text-[9px] font-bold uppercase outline-none cursor-pointer"
               >
                 {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                   <option key={code} value={code}>{label}</option>
                 ))}
               </select>
            </div>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[8px] font-bold text-[#6B7280] uppercase">{accountMode} BALANCE</span>
            <span className={cn("text-[11px] font-mono font-bold", accountMode === 'REAL' ? "text-[#16835B]" : "text-[#0055FF]")}>
              ${formatNumber(activeBalance, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button 
            data-profile-trigger
            aria-label="Account menu"
            onClick={() => setIsProfileDropdownOpen(v => !v)}
            className="w-9 h-9 rounded-full bg-[#0055FF] text-white flex items-center justify-center font-bold text-xs border border-[#E4E4E4] shadow-sm overflow-hidden"
          >
            {profile?.profile?.photoUrl ? <img src={profile.profile.photoUrl} className="w-full h-full object-cover" /> : user.email?.substring(0, 2).toUpperCase()}
          </button>
          
          <ProfileDropdown 
            user={user} 
            profile={profile} 
            accountMode={accountMode} 
            demoBalance={demoBalance} 
            isOpen={isProfileDropdownOpen} 
            onClose={() => setIsProfileDropdownOpen(false)} 
            onSelectMode={m => { setAccountMode(m); localStorage.setItem('varban_account_mode', m); window.dispatchEvent(new Event('varban_account_mode_changed')); }}
          />
        </div>
      </header>

      <div className="flex-grow flex overflow-hidden relative">
        {isAdminPath ? <AdminSidebar className="hidden xl:flex" /> : <AuthedSidebar className="hidden xl:flex" />}
        
        <main className="flex-grow overflow-y-auto bg-[#F7F7F5] p-4 md:p-8 xl:ml-16 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[400] xl:hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-300">
            {isAdminPath ? (
              <AdminSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
            ) : (
              <AuthedSidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}