'use client';

/**
 * @fileOverview Overhauled Institutional Cookie Consent.
 * Rewired logic to persist data in the user's compliance ledger.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, Lock, Check } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  useEffect(() => {
    if (user && profile) {
      if (profile.compliance?.cookieConsent) {
        setIsVisible(false);
        return;
      }
    }

    const consent = localStorage.getItem('varban_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  const handleConsent = async (choice: 'accepted' | 'declined') => {
    localStorage.setItem('varban_cookie_consent', choice);
    
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          "compliance.cookieConsent": choice === 'accepted' ? 'Accepted' : 'Declined',
          "compliance.cookieConsentAt": serverTimestamp(),
          "compliance.ipAddress": "logged_per_session"
        });
      } catch (err) {
        console.warn("Compliance logging failure.");
      }
    }

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1100] p-4 md:p-10 pointer-events-none">
      <div className={cn(
        "max-w-5xl mx-auto bg-white border border-[#E4E4E4] shadow-2xl p-8 md:p-12 pointer-events-auto rounded-[2.5rem]",
        "animate-in slide-in-from-bottom-10 duration-700 flex flex-col md:flex-row items-center gap-10 relative"
      )}>
        {/* Visual Brand Indicator */}
        <div className="hidden md:flex w-20 h-20 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] items-center justify-center shrink-0">
          <ShieldCheck className="w-10 h-10 text-[#0055FF]" />
        </div>

        <div className="flex-grow space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block mb-2">
              Privacy Protocol
            </span>
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
              Data Collection Transparency
            </h3>
            <p className="text-xs md:text-sm text-[#6B7280] leading-relaxed max-w-3xl">
              We utilize cookies to maintain your secure session, analyze matching engine performance, and ensure our institutional systems operate with 99.98% uptime. Your choice is recorded in your account compliance ledger.
            </p>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-6">
            <Link href="/terms/privacy" className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest underline decoration-2 underline-offset-4">
              Review Privacy Rules
            </Link>
            <div className="flex items-center gap-2">
               <Lock className="w-3.5 h-3.5 text-[#16835B]" />
               <span className="text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">End-to-End Encrypted</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-56 shrink-0">
          <button 
            onClick={() => handleConsent('accepted')}
            className="w-full bg-[#0A0A0A] text-white text-[11px] font-bold uppercase tracking-[0.3em] py-5 rounded-2xl hover:bg-[#0055FF] transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Accept All
          </button>
          <button 
            onClick={() => handleConsent('declined')}
            className="w-full bg-[#F7F7F5] border border-[#E4E4E4] text-[#6B7280] text-[11px] font-bold uppercase tracking-[0.3em] py-5 rounded-2xl hover:bg-white hover:text-[#0A0A0A] transition-all"
          >
            Necessary
          </button>
        </div>
      </div>
    </div>
  );
}
