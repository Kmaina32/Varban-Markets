'use client';

/**
 * @fileOverview Universal Profile Dropdown Component.
 * Updated to handle Supabase SignOut.
 */

import { useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield, 
  Settings, 
  LogOut, 
  ChevronRight
} from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import { useSupabaseAuth } from "@/app/lib/supabase/auth-context";

interface ProfileDropdownProps {
  user: any;
  profile: any;
  accountMode: 'REAL' | 'DEMO';
  demoBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'REAL' | 'DEMO') => void;
  onSignOut?: () => void;
}

const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

export default function ProfileDropdown({
  user,
  profile,
  accountMode,
  demoBalance,
  isOpen,
  onClose,
  onSelectMode,
  onSignOut
}: ProfileDropdownProps) {
  const router = useRouter();
  const { signOut } = useSupabaseAuth();
  const { formatNumber } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const realBalance = profile?.balance || 0;

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) || profile?.status?.role === 'Admin';
  }, [user, profile]);

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

  const handleLogout = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await signOut();
      onClose();
      router.push('/');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E4E4E4] shadow-2xl z-[300] overflow-hidden text-[#0A0A0A] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="bg-[#F7F7F5] p-5 border-b border-[#E4E4E4] flex items-center justify-between">
        <div className="flex items-center space-x-4 overflow-hidden">
          <div className="w-12 h-12 border-2 border-[#E4E4E4] rounded-full bg-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden shrink-0">
            {profile?.profile?.photoUrl ? (
              <img src={profile.profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.email ? user.email.substring(0, 2).toUpperCase() : 'VM'
            )}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-[#0A0A0A] block truncate uppercase tracking-tight">
              {profile?.profile?.fullName || user?.email?.split('@')[0] || "Trader"}
            </span>
            <span className="text-[9px] text-[#6B7280] block truncate font-mono mt-0.5">
              {user?.email || "trader@varbanmarkets.com"}
            </span>
          </div>
        </div>

        <div className={cn(
          "px-2 py-1 text-[8px] font-bold uppercase tracking-widest border shrink-0 ml-2",
          accountMode === 'REAL' 
            ? "bg-[#16835B]/10 text-[#16835B] border-[#16835B]" 
            : "bg-[#0055FF]/10 text-[#0055FF] border-[#0055FF]"
        )}>
          {accountMode === 'REAL' ? 'LIVE' : 'DEMO'}
        </div>
      </div>

      <div className="p-5 bg-white border-b border-[#E4E4E4] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B7280] flex items-center gap-2">
            <Wallet className="w-3 h-3" /> Account Domain
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-[#0055FF] bg-[#0055FF]/5 px-2 py-0.5 border border-[#0055FF]/10">
            Switch Account
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => {
              onSelectMode('REAL');
              onClose();
            }}
            className={cn(
              "w-full p-4 border text-left flex items-center justify-between transition-all group",
              accountMode === 'REAL' 
                ? "bg-[#16835B]/5 border-[#16835B] shadow-sm ring-1 ring-[#16835B]/20" 
                : "bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
            )}
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className={cn("w-1.5 h-1.5 rounded-full", accountMode === 'REAL' ? "bg-[#16835B] animate-pulse" : "bg-[#6B7280]")}></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Real Capital</span>
              </div>
              <span className="text-base font-mono font-bold text-[#16835B] block mt-1">
                ${formatNumber(realBalance, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {accountMode === 'REAL' && (
              <div className="w-6 h-6 bg-[#16835B] text-white flex items-center justify-center rounded-none shadow-sm">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>

          <button
            onClick={() => {
              onSelectMode('DEMO');
              onClose();
            }}
            className={cn(
              "w-full p-4 border text-left flex items-center justify-between transition-all group",
              accountMode === 'DEMO' 
                ? "bg-[#0055FF]/5 border-[#0055FF] shadow-sm ring-1 ring-[#0055FF]/20" 
                : "bg-white border-[#E4E4E4] hover:bg-[#F7F7F5]"
            )}
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className={cn("w-1.5 h-1.5 rounded-full", accountMode === 'DEMO' ? "bg-[#0055FF] animate-pulse" : "bg-[#6B7280]")}></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Practice Sandbox</span>
              </div>
              <span className="text-base font-mono font-bold text-[#0055FF] block mt-1">
                ${formatNumber(demoBalance, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {accountMode === 'DEMO' && (
              <div className="w-6 h-6 bg-[#0055FF] text-white flex items-center justify-center rounded-none shadow-sm">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/wallet?tab=deposit"
            onClick={onClose}
            className="py-3 px-3 bg-[#0A0A0A] text-white text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-[#0055FF] transition-all shadow-md group"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#16835B] group-hover:text-white transition-colors" />
            <span>Deposit</span>
          </Link>
          <Link
            href="/wallet?tab=withdraw"
            onClick={onClose}
            className="py-3 px-3 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-[#F7F7F5] shadow-sm group"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#0055FF] transition-colors" />
            <span>Withdraw</span>
          </Link>
        </div>
      </div>

      <div className="p-2 space-y-1">
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onClose}
            className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#0055FF] hover:bg-[#0055FF]/5 transition-all flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-[#0055FF]" /> Admin Oversight
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )}
        
        <Link
          href="/account"
          onClick={onClose}
          className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] hover:bg-[#F7F7F5] transition-all flex items-center justify-between group"
        >
          <span className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-[#6B7280]" /> Workspace Settings
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#C43D3D] hover:bg-[#C43D3D]/5 transition-all flex items-center justify-between group border-t border-[#F7F7F5] mt-1"
        >
          <span className="flex items-center gap-3">
            <LogOut className="w-4 h-4" /> End Session
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}
