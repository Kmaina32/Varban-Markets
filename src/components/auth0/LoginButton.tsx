
"use client";

/**
 * @fileOverview Auth0 Login Button Component.
 * Triggers the /auth/login route mounted by the proxy.
 */

export default function LoginButton() {
  return (
    <a
      href="/auth/login"
      className="inline-block px-6 py-3 bg-[#0055FF] hover:bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
    >
      Auth0 Login
    </a>
  );
}
