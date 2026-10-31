
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Monitor, Globe, Briefcase, Target, 
  FileText, Clock, Star, Wallet, User, Bell, ShieldAlert,
  Share2, Newspaper, HelpCircle, Mail, LogOut, Cpu,
  BarChart4, Calendar, Layers, Zap, ArrowLeftRight, RefreshCcw,
  Server
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useTranslation } from "@/app/lib/i18n-context";
import { useUser, useDoc, useFirestore, initializeFirebase } from "@/firebase";
import { useMemo } from "react";

interface AuthedSidebarProps {
  onLinkClick?: () => void;
  className?: string;
  isMobile?: boolean;
}

const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

export default function AuthedSidebar({ onLinkClick, className, isMobile = false }: AuthedSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    return SUPER_ADMIN_EMAILS.includes(email) || profile?.status?.role === 'Admin';
  }, [user, profile]);

  const handleLogout = async () => {
    try { await initializeFirebase().auth.signOut(); } catch (e) { console.error("Sign out failed:", e); }
    onLinkClick?.();
    router.push('/');
  };

  const sections = [
    {
      title: "OVERVIEW",
      items: [
        { label: t('nav.dashboard'), href: "/client/dashboard", icon: LayoutDashboard, description: "Portfolio snapshot and real-time metrics." },
        { label: "Wallet", href: "/client/wallet", icon: Wallet, description: "Deposit, withdraw and view your balance." },
        { label: t('nav.news'), href: "/client/news", icon: Newspaper, description: "Real-time global market intelligence feed." },
        { label: "Calendar", href: "/client/calendar", icon: Calendar, description: "Upcoming economic events." },
      ]
    },
    {
      title: "TRADE",
      items: [
        { label: "Exchange", href: "/client/exchange", icon: RefreshCcw, description: "Direct asset conversion and swaps." },
        { label: "Forex / CFDs / Crypto", href: "/client/terminal", icon: Monitor, description: "Trade forex, CFDs, indices and crypto." },
        { label: "Derived", href: "/client/derived-terminal", icon: Zap, description: "Volatility indices and derived contracts." },
        { label: t('nav.bots'), href: "/client/bots", icon: Cpu, description: "Automated trading tools and algorithms." },
        { label: "Vps (Virtual private server )", href: "/client/vps", icon: Server, description: "Low-latency dedicated hosting." },
        { label: "Positions", href: "/client/positions", icon: Target, description: "Your open trades right now." },
        { label: "Orders", href: "/client/orders", icon: FileText, description: "Pending and recent orders." },
        { label: t('nav.portfolio'), href: "/client/portfolio", icon: Briefcase, description: "Performance curve and asset allocation." },
        { label: t('nav.history'), href: "/client/history", icon: Clock, description: "Archive of closed execution records." },
        { label: t('nav.watchlist'), href: "/client/watchlist", icon: Star, description: "Prioritized registry of instruments." },
      ]
    },
    {
      title: "ANALYSIS",
      items: [
        { label: "Markets", href: "/client/markets", icon: Globe, description: "Browse every tradable market." },
        { label: "Heatmaps", href: "/client/markets/heatmaps", icon: Layers, description: "Visual sector performance comparison." },
        { label: "Screener", href: "/client/markets/screener", icon: BarChart4, description: "Advanced technical instrument discovery." },
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { label: "Account Hub", href: "/client/account", icon: User, description: "Identity management and personalization." },
        { label: "Referral", href: "/client/referral", icon: Share2, description: "Partner network growth portal." },
      ]
    }
  ];

  if (isAdmin) {
    sections.push({
      title: "ADMINISTRATION",
      items: [
        { label: "Oversight", href: "/admin", icon: ShieldAlert, description: "Root authority and platform monitoring." },
      ]
    });
  }

  const renderItem = (item: any) => {
    const isActive = pathname === item.href || (item.href !== '/client/dashboard' && item.href !== '/client/markets' && pathname?.startsWith(item.href));
    
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onLinkClick}
        className={cn(
          "flex items-center px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-l-2 whitespace-nowrap group/item",
          isActive 
            ? "text-[#0055FF] bg-[#0055FF]/5 border-[#0055FF]" 
            : "text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5] border-transparent"
        )}
      >
        <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#0055FF]" : "text-[#6B7280]")} />
        <div className={cn(
          "ml-6 flex flex-col transition-all duration-300 overflow-hidden",
          !isMobile && "opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto"
        )}>
          <span>{item.label}</span>
          <span className="text-[8px] font-bold text-[#6B7280] opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 lowercase leading-tight mt-0.5 max-w-[180px]">
            {item.description}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <aside className={cn(
      isMobile ? "flex flex-col h-full bg-white" : "group absolute left-0 top-0 h-full w-16 hover:w-64 bg-white border-r border-[#E4E4E4] flex flex-col transition-all duration-300 z-[200] overflow-hidden no-scrollbar",
      className
    )}>
      <nav className="flex-grow py-6 space-y-6 overflow-y-auto no-scrollbar">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className={cn(
              "text-[9px] font-bold text-[#D1D5DB] uppercase tracking-[0.2em] mb-2 px-6 transition-opacity",
              !isMobile && "opacity-0 group-hover:opacity-100"
            )}>
              {section.title}
            </h3>
            {section.items.map(renderItem)}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#E4E4E4] bg-[#F7F7F5]/50">
        <button 
          onClick={handleLogout}
          className="flex items-center h-14 px-5 text-[10px] font-bold uppercase tracking-widest text-[#C43D3D] hover:bg-[#C43D3D]/5 w-full transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={cn(
            "ml-6 transition-all",
            !isMobile && "opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto"
          )}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
