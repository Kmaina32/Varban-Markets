'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Monitor, Globe, Briefcase, Target, 
  FileText, Clock, Star, Wallet, ArrowDownCircle, 
  ArrowUpCircle, Activity, User, ShieldCheck, Lock, 
  Bell, Settings, HelpCircle, Mail, ShieldAlert,
  Users, Database, FileSpreadsheet
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useTranslation } from "@/app/lib/i18n-context";
import { useUser, useDoc, useFirestore } from "@/firebase";

interface AuthedSidebarProps {
  onLinkClick?: () => void;
  className?: string;
  isMobile?: boolean;
}

export default function AuthedSidebar({ onLinkClick, className, isMobile = false }: AuthedSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const sections = [
    {
      title: "OVERVIEW",
      items: [
        { label: t('nav.dashboard'), href: "/dashboard", icon: LayoutDashboard },
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
      title: "FUNDS",
      items: [
        { label: t('nav.wallet'), href: "/wallet", icon: Wallet },
        { label: t('nav.deposit'), href: "/deposit", icon: ArrowDownCircle },
        { label: t('nav.withdraw'), href: "/withdraw", icon: ArrowUpCircle },
        { label: t('nav.transactions'), href: "/transactions", icon: Activity },
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { label: t('nav.account'), href: "/account", icon: User },
        { label: t('nav.verification'), href: "/verification", icon: ShieldCheck },
        { label: t('nav.security'), href: "/security", icon: Lock },
        { label: t('nav.notifications'), href: "/notifications", icon: Bell },
        { label: t('nav.preferences'), href: "/preferences", icon: Settings },
      ]
    }
  ];

  // Admin access layer - always visible for prototype demonstration
  const adminSection = {
    title: "ADMINISTRATION",
    items: [
      { label: t('nav.adminOverview'), href: "/admin", icon: ShieldAlert },
      { label: t('nav.adminUsers'), href: "/admin/users", icon: Users },
      { label: t('nav.adminLedger'), href: "/admin/transactions", icon: FileSpreadsheet },
      { label: t('nav.adminMarkets'), href: "/admin/markets", icon: Database },
    ]
  };

  const finalSections = [...sections, adminSection, {
    title: "SUPPORT",
    items: [
      { label: t('nav.help'), href: "/help", icon: HelpCircle },
      { label: t('nav.contact'), href: "/contact", icon: Mail },
    ]
  }];

  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full bg-white", className)}>
        <nav className="flex-grow space-y-6 px-6 py-8 overflow-y-auto no-scrollbar">
          {finalSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onLinkClick}
                      className={cn(
                        "flex items-center h-10 px-2 text-[11px] font-bold uppercase tracking-wider transition-all border-l-2",
                        isActive 
                          ? "text-[#0055FF] bg-[#0055FF]/5 border-[#0055FF]" 
                          : "text-[#6B7280] hover:text-[#0A0A0A] border-transparent"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0 mr-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <aside className={cn("group absolute left-0 top-0 h-full w-16 hover:w-64 bg-white border-r border-[#E4E4E4] flex flex-col transition-all duration-300 z-[40] overflow-hidden no-scrollbar hidden md:flex", className)}>
      <div className="pt-4"></div>
      <nav className="flex-grow space-y-4 px-4 pb-6 overflow-y-auto no-scrollbar">
        {finalSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center h-8 px-2 text-[10px] font-bold uppercase tracking-wider transition-all group/item whitespace-nowrap",
                      isActive ? "text-[#0055FF] bg-[#0055FF]/5" : "text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]"
                    )}
                  >
                    <item.icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-[#0055FF]" : "text-[#6B7280] group-hover/item:text-[#0A0A0A]")} />
                    <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
