'use client';

/**
 * @fileOverview Universal Profile Dropdown Component with Account Balances & Demo Switcher.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Wallet, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield, 
  ShieldCheck, 
  Settings, 
  Lock, 
  Bell, 
  LogOut, 
  Sparkles,
  ChevronRight,
  Bitcoin,
  LayoutDashboard,
  BarChart3
} from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

interface ProfileDropdownProps {
  user: any;
  profile: any;
  accountMode: 'REAL' | 'DEMO';
  demoBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'REAL' | 'DEMO') => void;
}

const ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

export default function ProfileDropdown({
  user,
  profile,
  accountMode,
  demoBalance,
  isOpen,
  onClose,
  onSelectMode
}: ProfileDropdownProps) {
  const router = useRouter();
  const { formatNumber } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const realBalance = profile?.balance || 0;
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E4E4E4] shadow-2xl z-[300] overflow-hidden text-[#0A0A0A] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Profile Header Banner */}
      <div className="bg-[#F7F7F5] p-4 border-b border-[#E4E4E4] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.email ? user.email.substring(0, 2).toUpperCase() : 'VM'}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-[#0A0A0A] block truncate max-w-[170px]">
              {profile?.displayName || user?.email?.split('@')[0] || "Trader"}
            </span>
            <span className="text-[9px] text-[#6B7280] block truncate max-w-[170px]">
              {user?.email || "trader@varbanmarkets.com"}
            </span>
          </div>
        </div>

        <span className={cn(
          "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border",
          accountMode === 'REAL' 
            ? "bg-[#16835B]/10 text-[#16835B] border-[#16835B]" 
            : "bg-[#0055FF]/10 text-[#0055FF] border-[#0055FF]"
        )}>
          {accountMode === 'REAL' ? 'LIVE' : 'DEMO'}
        </span>
      </div>

      {/* Account Balances & Mode Switcher Section */}
      <div className="p-4 bg-white border-b border-[#E4E4E4] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Account Domain Balances
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-[#0055FF]">
            Select Mode
          </span>
        </div>

        {/* Mode Options Cards */}
        <div className="grid grid-cols-1 gap-2">
          {/* Real Account Selection Option */}
          <button
            onClick={() => {
              onSelectMode('REAL');
              onClose();
            }}
            className={cn(
              "w-full p-3 border text-left flex items-center justify-between transition-all group",
              accountMode === 'REAL' 
                ? "bg-[#16835B]/5 border-[#16835B] shadow-sm" 
                : "bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
            )}
          >
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16835B]"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">Real Capital</span>
              </div>
              <span className="text-sm font-mono font-bold text-[#16835B] block mt-0.5">
                ${formatNumber(realBalance, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            {accountMode === 'REAL' ? (
              <div className="w-5 h-5 rounded-full bg-[#16835B] text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
            ) : (
              <span className="text-[9px] font-bold uppercase text-[#6B7280] group-hover:text-[#0A0A0A]">Switch</span>
            )}
          </button>

          {/* Demo Account Selection Option */}
          <button
            onClick={() => {
              onSelectMode('DEMO');
              onClose();
            }}
            className={cn(
              "w-full p-3 border text-left flex items-center justify-between transition-all group",
              accountMode === 'DEMO' 
                ? "bg-[#0055FF]/5 border-[#0055FF] shadow-sm" 
                : "bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
            )}
          >
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0055FF]"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">Demo Sandbox</span>
              </div>
              <span className="text-sm font-mono font-bold text-[#0055FF] block mt-0.5">
                ${formatNumber(demoBalance, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            {accountMode === 'DEMO' ? (
              <div className="w-5 h-5 rounded-full bg-[#0055FF] text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
            ) : (
              <span className="text-[9px] font-bold uppercase text-[#6B7280] group-hover:text-[#0A0A0A]">Switch</span>
            )}
          </button>
        </div>

        {/* Quick Deposit & Withdraw Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href="/deposit"
            onClick={onClose}
            className="py-2 px-3 bg-[#0A0A0A] text-white text-[9px] font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5 hover:bg-[#0055FF] transition-colors"
          >
            <ArrowDownLeft className="w-3 h-3 text-[#16835B]" />
            <span>Deposit</span>
          </Link>
          <Link
            href="/withdraw"
            onClick={onClose}
            className="py-2 px-3 bg-[#F7F7F5] border border-[#E4E4E4] text-[#0A0A0A] text-[9px] font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5 hover:bg-[#E4E4E4] transition-colors"
          >
            <ArrowUpRight className="w-3 h-3 text-[#0055FF]" />
            <span>Withdraw</span>
          </Link>
        </div>
      </div>

      {/* Navigation Menu Options - Streamlined to remove redundant sidebar links */}
      <div className="p-1 space-y-0.5 divide-y divide-[#F7F7F5]">
        <div className="py-1">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#0055FF] hover:bg-[#0055FF]/5 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Admin Portal
              </span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        <div className="pt-1">
          <button
            onClick={() => {
              onClose();
              router.push('/login');
            }}
            className="w-full px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#C43D3D] hover:bg-[#C43D3D]/5 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
