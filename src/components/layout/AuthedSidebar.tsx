
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Monitor, Globe, Briefcase, Target, 
  FileText, Clock, Star, Wallet, Activity, User, ShieldCheck, Lock, 
  Bell, Settings, HelpCircle, Mail, ShieldAlert,
  Share2, Newspaper, ArrowDownCircle, ArrowUpCircle, Inbox, FileSpreadsheet, Database, Shield, LogOut
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useTranslation } from "@/app/lib/i18n-context";
import { useUser, useDoc, useFirestore, useAuth } from "@/firebase";
import { useMemo } from "react";
import { signOut } from "firebase/auth";

interface AuthedSidebarProps {
  onLinkClick?: () => void;
  className?: string;
  isMobile?: boolean;
}

// Defined Super Admin Accounts with Root Authority
const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

export default function AuthedSidebar({ onLinkClick, className, isMobile = false }: AuthedSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { t } = useTranslation();
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  // Authority Verification: Super Admin (Hardcoded) OR Admin Role (Firestore)
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    return SUPER_ADMIN_EMAILS.includes(email) || profile?.role === 'Admin';
  }, [user, profile]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (e) {}
  };

  const sections = [
    {
      title: "OVERVIEW",
      items: [
        { label: t('nav.dashboard'), href: "/dashboard", icon: LayoutDashboard },
        { label: t('nav.news'), href: "/news", icon: Newspaper },
      ]
    },
    {
      title: "TRADE",
      items: [
        { label: t('nav.terminal'), href: "/terminal", icon: Monitor },
        { label: t('nav.markets'), href: "/markets", icon: Globe },
        { label: t('nav.portfolio'), href: "/portfolio", icon: Briefcase },
        { label: t('nav.positions'), href: "/positions", icon: Target },
        { label: t('nav.orders'), href: "/orders", icon: FileText },
        { label: t('nav.history'), href: "/history", icon: Clock },
        { label: t('nav.watchlist'), href: "/watchlist", icon: Star },
      ]
    },
    {
      title: "MONEY",
      items: [
        { label: "Wallet Hub", href: "/wallet", icon: Wallet },
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "Account Hub", href: "/account", icon: User },
        { label: "Alerts", href: "/notifications", icon: Bell },
        { label: "Referral Program", href: "/referral", icon: Share2 },
      ]
    }
  ];

  // Consolidated Administration Node for standard trader view
  const adminSection = {
    title: "ADMINISTRATION",
    items: [
      { label: "Admin Oversight", href: "/admin", icon: ShieldAlert },
    ]
  };

  const finalSections = [...sections];
  if (isAdmin) {
    finalSections.push(adminSection);
  }
  
  finalSections.push({
    title: "SUPPORT",
    items: [
      { label: "Help Center", href: "/help", icon: HelpCircle },
      { label: "Contact Support", href: "/about/contact", icon: Mail },
    ]
  });

  const renderItems = (items: any[]) => items.map((item) => {
    const isActive = pathname === item.href || 
      (item.href === '/admin' && pathname?.startsWith('/admin')) ||
      (item.href === '/wallet' && pathname?.startsWith('/wallet')) ||
      (item.href === '/account' && pathname?.startsWith('/account'));
    
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onLinkClick}
        className={cn(
          "flex items-center h-10 lg:h-8 px-2 text-[11px] lg:text-[10px] font-bold uppercase tracking-widest transition-all border-l-2 lg:border-l-0 lg:group-hover:border-l-2",
          isActive 
            ? "text-[#0055FF] bg-[#0055FF]/5 border-[#0055FF]" 
            : "text-[#6B7280] hover:text-[#0A0A0A] border-transparent"
        )}
      >
        <item.icon className={cn("w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0 transition-colors", isActive ? "text-[#0055FF]" : "text-[#6B7280]")} />
        <span className={cn("ml-4 transition-opacity duration-300", !isMobile && "opacity-0 group-hover:opacity-100 whitespace-nowrap")}>
          {item.label}
        </span>
      </Link>
    );
  });

  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full bg-white", className)}>
        <nav className="flex-grow space-y-8 px-6 py-8 overflow-y-auto no-scrollbar pb-32">
          {finalSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-[10px] font-bold text-[#D1D5DB] uppercase tracking-[0.2em] px-2 mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {renderItems(section.items)}
              </div>
            </div>
          ))}
          <div className="pt-6 border-t border-[#F7F7F5]">
             <button 
                onClick={handleLogout}
                className="flex items-center h-10 px-2 text-[11px] font-bold uppercase tracking-widest text-[#C43D3D] w-full"
              >
                <LogOut className="w-4 h-4 shrink-0 mr-4" />
                <span>End Session</span>
              </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <aside className={cn("group absolute left-0 top-0 h-full w-16 hover:w-64 bg-white border-r border-[#E4E4E4] flex flex-col transition-all duration-300 z-[40] overflow-hidden no-scrollbar hidden lg:flex", className)}>
      <div className="pt-4"></div>
      <nav className="flex-grow space-y-6 px-4 pb-6 overflow-y-auto no-scrollbar">
        {finalSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="text-[9px] font-bold text-[#D1D5DB] uppercase tracking-[0.2em] mb-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {renderItems(section.items)}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-[#F7F7F5] bg-[#F7F7F5]/30">
        <button 
          onClick={handleLogout}
          className="flex items-center h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-[#C43D3D] hover:bg-[#C43D3D]/5 transition-all w-full group/logout"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            End Session
          </span>
        </button>
      </div>
    </aside>
  );
}
