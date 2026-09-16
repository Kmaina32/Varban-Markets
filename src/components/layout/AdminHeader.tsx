'use client';

import { ShieldAlert, User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useState, useRef, useEffect } from "react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative h-16 border-b border-[#E4E4E4] bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-[150] shadow-sm">
      <div className="flex items-center space-x-4">
        <Link href="/admin" className="flex items-center space-x-2">
          <Image src="/assets/logo.png" alt="Varban Corporate" width={110} height={26} className="h-6 w-auto object-contain" priority />
          <span className="text-[8px] font-bold bg-[#0055FF] text-white px-1.5 py-0.5 tracking-widest uppercase">
            Admin
          </span>
        </Link>
        
        <div className="h-6 w-px bg-[#E4E4E4] hidden md:block"></div>
        
        <div className="hidden md:block">
          <h1 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0055FF] flex items-center space-x-1.5">
            <ShieldAlert className="w-3 h-3" />
            <span>{title}</span>
          </h1>
          {subtitle && <p className="text-[9px] text-[#6B7280] uppercase tracking-wider mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 group focus:outline-none"
          >
            <div className="text-right hidden md:block">
              <span className="text-[9px] font-bold text-[#0A0A0A] block uppercase max-w-[150px] truncate">
                {user?.email}
              </span>
              <span className="text-[8px] text-[#6B7280] uppercase tracking-wider block font-mono">
                Root Authority
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-center justify-center transition-colors group-hover:border-[#0055FF]">
              <User className="w-4 h-4 text-[#0055FF]" />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4E4E4] shadow-lg z-[200] py-1 flex flex-col">
              <div className="px-4 py-2 border-b border-[#E4E4E4] md:hidden">
                <p className="text-[9px] font-bold text-[#0A0A0A] uppercase truncate">{user?.email}</p>
                <p className="text-[8px] text-[#6B7280] uppercase tracking-wider font-mono">Authority</p>
              </div>
              <Link 
                href="/dashboard" 
                className="px-4 py-2.5 text-[10px] font-bold uppercase text-[#0055FF] hover:bg-[#F7F7F5] flex items-center space-x-2"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Trader Workspace</span>
              </Link>
              <button 
                onClick={() => router.push('/')} 
                className="px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#0055FF] hover:bg-[#F7F7F5] border-t border-[#E4E4E4] flex items-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Terminal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
