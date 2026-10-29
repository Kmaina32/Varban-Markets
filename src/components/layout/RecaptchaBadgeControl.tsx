
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** 
 * Routes where the floating reCAPTCHA badge is hidden.
 * Now includes all workspace and administrative domains to maintain clean institutional aesthetics.
 */
const HIDDEN_PREFIXES = [
  '/login', 
  '/register', 
  '/forgot-password', 
  '/reset-password', 
  '/complete-profile',
  '/client', 
  '/admin',
];

export function isBadgeHidden(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export default function RecaptchaBadgeControl() {
  const pathname = usePathname();
  
  useEffect(() => {
    const root = document.documentElement;
    const shouldHide = isBadgeHidden(pathname);
    
    if (shouldHide) {
      root.setAttribute('data-hide-recaptcha', '');
      const style = document.createElement('style');
      style.id = 'recaptcha-stealth-mode';
      style.innerHTML = '.grecaptcha-badge { visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }';
      if (!document.getElementById('recaptcha-stealth-mode')) {
        document.head.appendChild(style);
      }
    } else {
      root.removeAttribute('data-hide-recaptcha');
      document.getElementById('recaptcha-stealth-mode')?.remove();
    }
  }, [pathname]);

  return null;
}
