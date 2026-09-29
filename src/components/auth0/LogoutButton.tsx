
"use client";

/**
 * @fileOverview Auth0 Logout Button Component.
 */

export default function LogoutButton() {
  return (
    <a
      href="/auth/logout"
      className="inline-block px-6 py-3 bg-[#F7F7F5] hover:bg-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest transition-colors border border-[#E4E4E4]"
    >
      Auth0 Logout
    </a>
  );
}
