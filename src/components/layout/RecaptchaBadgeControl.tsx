'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Routes where the floating reCAPTCHA badge is hidden (auth, authed and admin areas). */
const HIDDEN_PREFIXES = [
  '/login', '/register', '/forgot-password', '/reset-password', '/complete-profile',
  '/client', '/admin',
];

export function isBadgeHidden(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export default function RecaptchaBadgeControl() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (isBadgeHidden(pathname)) root.setAttribute('data-hide-recaptcha', '');
    else root.removeAttribute('data-hide-recaptcha');
  }, [pathname]);
  return null;
}
