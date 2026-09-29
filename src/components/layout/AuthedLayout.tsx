
'use client';

import AuthedSidebar from "./AuthedSidebar";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ProfileDropdown from "./ProfileDropdown";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { Bell, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/app/lib/utils";

const STRICT_PATHS = [
  '/terminal', '/dashboard', '/portfolio', '/positions', 
  '/orders', '/history', '/watchlist', '/wallet', 
  '/deposit', '/withdraw', '/transactions', '/account', 
  '/verification', '/security', '/notifications', '/preferences',
  '/referral', '/admin', '/markets', '/news'
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

  const isStrict = STRICT_PATHS.some(path => pathname === path || pathname?.startsWith(path + '/'));
  const isAdminPath = pathname?.startsWith('/admin');
  
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const isSuper = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
    const hasAdminRole = profile?.status?.role === 'Admin';
    return isSuper || hasAdminRole;
  }, [user, profile]);

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (!user && isStrict) {
        router.push('/login');
        return;
      }
      if (user && isAdminPath && !isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, profileLoading, isStrict, isAdminPath, isAdmin, router]);

  if (isTerminal || !isStrict) return <>{children}</>;
  if (loading || profileLoading) return <LoadingOverlay />;
  if (!user) return null;

  const activeBalance = accountMode === 'REAL' ? (profile?.balance || 0) : demoBalance;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-[#0A0A0A]">
      <header className="relative h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-3 md:px-6 shrink-0 z-[150] shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1.5 lg:hidden"><Menu className="w-5 h-5" /></button>
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
          <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs">{user?.email?.substring(0, 2).toUpperCase()}</button>
          <ProfileDropdown user={user} profile={profile} accountMode={accountMode} demoBalance={demoBalance} isOpen={isProfileDropdownOpen} onClose={() => setIsProfileDropdownOpen(false)} onSelectMode={(m) => { setAccountMode(m); localStorage.setItem('varban_account_mode', m); window.dispatchEvent(new Event('varban_account_mode_changed')); }} />
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden relative">
        {isAdminPath ? <AdminSidebar className="hidden lg:flex" /> : <AuthedSidebar className="hidden lg:flex" />}
        <main className="flex-grow overflow-y-auto bg-[#F7F7F5] p-4 md:p-8 lg:ml-16 no-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
