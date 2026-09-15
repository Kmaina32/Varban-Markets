'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Monitor, Globe, Briefcase, Target, 
  FileText, Clock, Star, Wallet, ArrowDownCircle, 
  ArrowUpCircle, Activity, User, ShieldCheck, Lock, 
  Bell, Settings, HelpCircle, Mail, LogOut
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useTranslation } from "@/app/lib/i18n-context";

interface AuthedSidebarProps {
  onLinkClick?: () => void;
  className?: string;
  isMobile?: boolean;
}

export default function AuthedSidebar({ onLinkClick, className, isMobile = false }: AuthedSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

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
    },
    {
      title: "SUPPORT",
      items: [
        { label: t('nav.help'), href: "/help", icon: HelpCircle },
        { label: t('nav.contact'), href: "/contact", icon: Mail },
      ]
    }
  ];

  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full bg-white", className)}>
        <nav className="flex-grow space-y-6 px-6 py-8 overflow-y-auto no-scrollbar">
          {sections.map((section) => (
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
                          ? "text-[#C9A227] bg-[#C9A227]/5 border-[#C9A227]" 
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
        <div className="p-6 border-t border-[#E4E4E4]">
          <Link 
            href="/" 
            onClick={onLinkClick}
            className="flex items-center h-12 px-4 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#C43D3D] bg-[#F7F7F5] border border-[#E4E4E4] transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0 mr-4" />
            <span>{t('nav.exit')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <aside className={cn("group absolute left-0 top-0 h-full w-16 hover:w-64 bg-white border-r border-[#E4E4E4] flex flex-col transition-all duration-300 z-[40] overflow-hidden no-scrollbar hidden md:flex", className)}>
      <div className="pt-4"></div>
      <nav className="flex-grow space-y-4 px-4 pb-6 overflow-y-auto no-scrollbar">
        {sections.map((section) => (
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
                    onClick={onLinkClick}
                    className={cn(
                      "flex items-center h-8 px-2 text-[10px] font-bold uppercase tracking-wider transition-all group/item whitespace-nowrap",
                      isActive ? "text-[#C9A227] bg-[#C9A227]/5" : "text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]"
                    )}
                  >
                    <item.icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-[#C9A227]" : "text-[#6B7280] group-hover/item:text-[#0A0A0A]")} />
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
      <div className="p-3 border-t border-[#E4E4E4] shrink-0">
        <Link 
          href="/" 
          onClick={onLinkClick}
          className="flex items-center h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#C43D3D] hover:bg-[#F7F7F5] transition-all group/item whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t('nav.exit')}
          </span>
        </Link>
      </div>
    </aside>
  );
}
