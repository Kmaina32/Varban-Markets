
'use client';

/**
 * @fileOverview Institutional Cookie Consent Module.
 * Provides a professional, non-intrusive way to handle website settings and data privacy.
 * Choices are registered in the database for authenticated users.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  useEffect(() => {
    // 1. Priority check: Database Record (for cross-device consistency)
    if (user && profile) {
      if (profile.cookieConsent) {
        setIsVisible(false);
        return;
      }
    }

    // 2. Secondary check: Local Storage (for guest/new users)
    const consent = localStorage.getItem('varban_cookie_consent');
    if (!consent) {
      // Delay appearance for better UX
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  const handleConsent = async (choice: 'accepted' | 'declined') => {
    // Persist locally for instant closure
    localStorage.setItem('varban_cookie_consent', choice);
    
    // Persist to Database if authenticated (for compliance ledger)
    if (user && db) {
      try {
        updateDoc(doc(db, "users", user.uid), {
          cookieConsent: choice === 'accepted' ? 'Accepted' : 'Declined',
          cookieConsentAt: serverTimestamp()
        });
      } catch (err) {
        // Fail silently - non-critical background operation
      }
    }

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 md:p-6 pointer-events-none">
      <div className={cn(
        "max-w-4xl mx-auto bg-white border border-[#E4E4E4] shadow-2xl p-6 md:p-8 pointer-events-auto",
        "animate-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row items-start md:items-center gap-6 relative"
      )}>
        {/* Message Area */}
        <div className="flex-grow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em] block mb-1">
              Cookies & Privacy
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
              Personalize Your Experience
            </h3>
            <p className="text-[11px] text-[#6B7280] leading-relaxed max-w-2xl mt-2">
              We use cookies to ensure our systems work reliably, analyze performance, and provide a professional trading environment. By choosing "Accept All," you help us improve the platform for everyone.
            </p>
            <div className="mt-3">
              <Link 
                href="/terms/privacy" 
                className="inline-flex items-center text-[9px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline"
              >
                Read our Privacy Rules
              </Link>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
          <button 
            onClick={() => handleConsent('accepted')}
            className="flex-1 md:w-40 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest py-3 hover:bg-[#0055FF] transition-colors shadow-sm"
          >
            Accept All
          </button>
          <button 
            onClick={() => handleConsent('declined')}
            className="flex-1 md:w-40 bg-white border border-[#E4E4E4] text-[#6B7280] text-[10px] font-bold uppercase tracking-widest py-3 hover:bg-[#F7F7F5] hover:text-[#0A0A0A] transition-colors"
          >
            Necessary Only
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-4 text-[10px] font-bold uppercase text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          aria-label="Close"
        >
          Close
        </button>
      </div>
    </div>
  );
}
