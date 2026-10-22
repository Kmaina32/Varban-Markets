'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Users, FileSpreadsheet, Database, ArrowLeftRight, Settings, Inbox, ArrowDownCircle, ArrowUpCircle, ShieldCheck, Newspaper, Shield, Server } from "lucide-react";
import { cn } from "@/app/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface AdminSidebarProps {
  onLinkClick?: () => void;
  className?: string;
  isMobile?: boolean;
}

export default function AdminSidebar({ onLinkClick, className, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();

  const items = [
    { label: "Oversight Node", href: "/admin", icon: ShieldAlert, description: "Global platform metrics and registration feed." },
    { label: "User Directory", href: "/admin/users", icon: Users, description: "Entity directory and role authority management." },
    { label: "KYC Approvals", href: "/admin/kyc-approvals", icon: ShieldCheck, description: "Manual audit desk for verification evidence." },
    { label: "Intelligence Desk", href: "/admin/articles", icon: Newspaper, description: "Author proprietary briefings and market strategies." },
    { label: "Deposit Queue", href: "/admin/deposits", icon: ArrowDownCircle, description: "TxHash verification and capital provisioning queue." },
    { label: "Withdrawal Queue", href: "/admin/withdrawals", icon: ArrowUpCircle, description: "Remittance review and dispatch queue." },
    { label: "Storage Node", href: "/admin/storage", icon: Server, description: "Root access to decentralized R2 infrastructure." },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: Shield, description: "Append-only security event log." },
    { label: "Support Inbox", href: "/admin/inbox", icon: Inbox, description: "Institutional inquiry management and user assistance." },
    { label: "Platform Ledger", href: "/admin/transactions", icon: FileSpreadsheet, description: "Global immutable transaction ledger." },
    { label: "Market Switches", href: "/admin/markets", icon: Database, description: "Instrument halt switches and feed status control." },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings, description: "System-wide configuration (API keys, Payout rates)." },
  ];

  const renderItems = () => items.map((item) => {
    const isActive = pathname === item.href;
    const linkContent = (
      <Link
        key={item.href}
        href={item.href}
        onClick={onLinkClick}
        className={cn(
          "flex items-center h-9 px-2 text-[10px] font-bold uppercase tracking-wider transition-all border-l-2 whitespace-nowrap group/item",
          isActive 
            ? "text-[#0055FF] bg-[#0055FF]/5 border-[#0055FF]" 
            : "text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5] border-transparent"
        )}
      >
        <item.icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-[#0055FF]" : "text-[#6B7280] group-hover/item:text-[#0A0A0A]")} />
        <span className={cn("ml-4 transition-opacity", !isMobile && "opacity-0 group-hover:opacity-100 duration-300")}>
          {item.label}
        </span>
      </Link>
    );

    if (isMobile) return linkContent;

    return (
      <HoverCard key={item.href}>
        <HoverCardTrigger asChild>
          {linkContent}
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#0055FF]">{item.label}</h4>
            <p className="text-[10px] text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">
              {item.description}
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  });

  const content = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div>
          <div className="space-y-1">
            {renderItems()}
          </div>
        </div>
      </div>

      <div className="space-y-1 pt-4 border-t border-[#E4E4E4]">
        <Link
          href="/dashboard"
          onClick={onLinkClick}
          className="flex items-center h-9 px-2 text-[10px] font-bold uppercase tracking-wider text-[#0055FF] hover:bg-[#0055FF]/5 transition-all whitespace-nowrap"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
          <span className={cn("ml-4 transition-opacity", !isMobile && "opacity-0 group-hover:opacity-100 duration-300")}>
            Trader Mode
          </span>
        </Link>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full bg-white px-4 py-6", className)}>
        {content}
      </div>
    );
  }

  return (
    <aside className={cn("group absolute left-0 top-0 h-full w-16 hover:w-64 bg-white border-r border-[#E4E4E4] flex flex-col transition-all duration-300 z-[40] overflow-hidden no-scrollbar py-6 px-4 hidden lg:flex", className)}>
      {content}
    </aside>
  );
}
