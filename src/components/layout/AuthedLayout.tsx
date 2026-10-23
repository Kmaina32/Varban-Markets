'use client';

import AuthedSidebar from "./AuthedSidebar";
import AdminSidebar from "./AdminSidebar";
import ProfileDropdown from "./ProfileDropdown";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { Menu, Info, ShieldAlert, ChevronDown, Globe, Clock as ClockIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useDoc, useFirestore, initializeFirebase } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/app/lib/utils";
import { LANGUAGE_LABELS, LocaleCode } from "@/app/lib/i18n-dictionary";
import { doc, updateDoc } from "firebase/firestore";

const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

const TIMEZONES = [
  { label: "UTC +00:00 (GMT)", value: "UTC+0" },
  { label: "UTC -08:00 (PT)", value: "UTC-8" },
  { label: "UTC -05:00 (ET)", value: "UTC-5" },
  { label: "UTC +01:00 (CET)", value: "UTC+1" },
  { label: "UTC +08:00 (HKT)", value: "UTC+8" }
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
  const { auth } = initializeFirebase();
  const { formatNumber, t, locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const [accountMode, setAccountMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [demoBalance, setDemoBalance] = useState<number>(10000);

  const [currentTime, setCurrentTime] = useState("");
  const activeTimezone = profile?.preferences?.timezone || "UTC+0";

  useEffect(() => {
    const savedMode = localStorage.getItem('varban_account_mode') as 'REAL' | 'DEMO';
    if (savedMode) setAccountMode(savedMode);
    const savedDemo = localStorage.getItem('varban_demo_balance');
    if (savedDemo) setDemoBalance(parseFloat(savedDemo));
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let offset = 0;
      if (activeTimezone === "UTC-8") offset = -8;
      else if (activeTimezone === "UTC-5") offset = -5;
      else if (activeTimezone === "UTC+1") offset = 1;
      else if (activeTimezone === "UTC+8") offset = 8;
      
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nd = new Date(utc + (3600000 * offset));
      
      setCurrentTime(nd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeTimezone]);

  // Hide reCAPTCHA on authed pages
  useEffect(() => {
    document.body.classList.add('hide-recaptcha');
    return () => {
      document.body.classList.remove('hide-recaptcha');
    };
  }, []);

  const handleTimezoneChange = async (val: string) => {
    if (user && db) {
      await updateDoc(doc(db, "users", user.uid), { "preferences.timezone": val });
    }
  };

  const isStrict = useMemo(() => {
    return pathname?.startsWith('/client') || pathname?.startsWith('/admin');
  }, [pathname]);

  const isAdminPath = useMemo(() => {
    return pathname?.startsWith('/admin');
  }, [pathname]);
  
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const isSuper = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
    const hasAdminRole = profile?.status?.role === 'Admin';
    return isSuper || hasAdminRole;
  }, [user, profile]);

  useEffect(() => {
    if (loading) return;
    if (!user && isStrict) {
      router.replace('/login');
    }
    if (user && isAdminPath && !isAdmin && !profileLoading) {
      router.replace('/client/dashboard');
    }
  }, [user, loading, profileLoading, isStrict, isAdminPath, isAdmin, router]);

  if (loading || (isStrict && !user)) {
    return <LoadingOverlay />;
  }

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <header className="relative h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-3 md:px-6 shrink-0 z-[150] shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1.5 lg:hidden text-[#0A0A0A]"><Menu className="w-5 h-5" /></button>
          <Link href="/client/dashboard" className="flex items-center"><Image src="/assets/logo2.png" alt="Varban" width={95} height={22} className="w-auto object-contain" priority /></Link>
          <div className="h-6 w-px bg-[#E4E4E4] hidden lg:block"></div>
          <div className="hidden lg:block">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.1em]">{title}</h1>
            {subtitle && <p className="text-[9px] text-[#6B7280] uppercase tracking-wider mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="hidden lg:flex items-center bg-[#F7F7F5] border border-[#E4E4E4] p-1.5 pr-4 space-x-4">
            <div className="flex items-center bg-white border border-[#E4E4E4] px-3 py-1.5 shadow-sm">
               <ClockIcon className="w-3 h-3 text-[#0055FF] mr-2" />
               <span className="text-sm font-mono font-bold text-[#0A0A0A] tracking-tighter">{currentTime}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center group">
                <select 
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as LocaleCode)}
                  className="appearance-none bg-transparent text-[8px] font-bold uppercase tracking-widest text-[#0055FF] outline-none cursor-pointer pr-3 z-10"
                >
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <option key={code} value={code} className="bg-white text-[#0A0A0A]">{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 w-2.5 h-2.5 text-[#0055FF] pointer-events-none" />
              </div>
              
              <div className="w-px h-3 bg-[#E4E4E4]"></div>

              <div className="relative flex items-center group">
                <select 
                  value={activeTimezone}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="appearance-none bg-transparent text-[8px] font-bold uppercase tracking-widest text-[#6B7280] outline-none cursor-pointer pr-3 z-10"
                >
                  {TIMEZONES.map(tz => <option key={tz.value} value={tz.value} className="bg-white text-[#0A0A0A]">{tz.label}</option>)}
                </select>
                <ChevronDown className="absolute right-0 w-2.5 h-2.5 text-[#6B7280] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 border border-[#E4E4E4] px-3 py-1 bg-white shadow-sm">
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
              await auth.signOut();
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
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}