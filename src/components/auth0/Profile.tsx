
"use client";

/**
 * @fileOverview Auth0 Profile Component.
 * Displays user identity from the Auth0 session.
 */

import { useUser } from "@auth0/nextjs-auth0/client";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) return <p className="text-[10px] text-[#6B7280] uppercase font-bold animate-pulse">Loading Identity...</p>;
  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-[#16835B] text-[10px] font-bold uppercase tracking-widest">
        <span className="w-4 h-4 bg-[#16835B] rounded-full flex items-center justify-center shrink-0">
          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        Auth0 Verified
      </div>
      <div className="flex items-center gap-3 bg-[#F7F7F5] border border-[#E4E4E4] py-2 pl-2 pr-4 shadow-inner">
        <span className="w-8 h-8 bg-[#0A0A0A] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {getInitials(user.name, user.email)}
        </span>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#0A0A0A] truncate max-w-[150px]">{user.name}</span>
          <span className="text-[9px] text-[#6B7280] font-mono">{user.email}</span>
        </div>
      </div>
    </div>
  );
}
