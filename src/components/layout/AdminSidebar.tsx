'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Users, FileSpreadsheet, Database, ArrowLeftRight, Settings } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface AdminSidebarProps {
  onLinkClick?: () => void;
  className?: string;
  isMobile?: boolean;
}

export default function AdminSidebar({ onLinkClick, className, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();

  const items = [
    { label: "Oversight Node", href: "/admin", icon: ShieldAlert },
    { label: "User Directory", href: "/admin/users", icon: Users },
    { label: "Platform Ledger", href: "/admin/transactions", icon: FileSpreadsheet },
    { label: "Market Switches", href: "/admin/markets", icon: Database },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div>
          <h3 className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-3 px-2 whitespace-nowrap block">
            Core Governance
          </h3>
          <div className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "flex items-center h-9 px-2 text-[10px] font-bold uppercase tracking-wider transition-all border-l-2 whitespace-nowrap group/item",
                    isActive 
                      ? "text-[#C43D3D] bg-[#C43D3D]/5 border-[#C43D3D]" 
                      : "text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5] border-transparent"
                  )}
                >
                  <item.icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-[#C43D3D]" : "text-[#6B7280] group-hover/item:text-[#0A0A0A]")} />
                  <span className={cn("ml-4 transition-opacity", !isMobile && "opacity-0 group-hover:opacity-100 duration-300")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
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
    <aside className={cn("group absolute left-0 top-0 h-full w-16 hover:w-64 bg-white border-r border-[#E4E4E4] flex flex-col transition-all duration-300 z-[40] overflow-hidden no-scrollbar py-6 px-4 hidden md:flex", className)}>
      {content}
    </aside>
  );
}
