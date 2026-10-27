'use client';

/**
 * @fileOverview Institutional Phone Verification Module.
 * Interfaces with Twilio OTP service for secure identity validation.
 */

import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2, ShieldCheck, Loader2, Smartphone, ArrowRight, AlertTriangle } from 'lucide-react';
import { useUser } from '@/firebase';
import { authFetch } from '@/app/lib/auth-fetch';
import { cn } from '@/app/lib/utils';

interface PhoneVerificationProps {
  currentPhone?: string;
  isVerified?: boolean;
}

export default function PhoneVerification({ currentPhone, isVerified: initialVerified }: PhoneVerificationProps) {
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || '');
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!phoneNumber || loading) return;
    setLoading(true);
    setError(null);

    try {
      const resp = await authFetch(user, '/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      setOtpSent(true);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || loading) return;
    setLoading(true);
    setError(null);

    try {
      const resp = await authFetch(user, '/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, code: otpCode })
      });
      
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      setIsVerified(true);
      setOtpSent(false);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="p-5 border border-[#16835B] bg-[#16835B]/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#16835B] flex items-center justify-center text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#16835B] uppercase tracking-widest block">Phone Verified</span>
            <span className="text-xs font-mono font-bold text-[#0A0A0A]">{phoneNumber}</span>
          </div>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-widest text-[#16835B] bg-white border border-[#16835B] px-2 py-1">Secure Node Active</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!otpSent ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Registered Phone (E.164)</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+44 7000 000000"
                  className="w-full p-3 pl-10 border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF] bg-white"
                />
              </div>
              <button 
                onClick={handleSendOtp}
                disabled={loading || !phoneNumber}
                className="px-6 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] disabled:opacity-40 transition-all shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </button>
            </div>
          </div>
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            We will transmit a 6-digit verification token to this number via Twilio Secure SMS.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase">Token sent to {phoneNumber}</span>
            <button 
              onClick={() => setOtpSent(false)} 
              className="text-[9px] font-bold uppercase underline text-[#6B7280] hover:text-[#0A0A0A]"
            >
              Change Number
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Enter 6-Digit Code</label>
            <div className="flex gap-2">
              <input 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="flex-grow p-4 border-2 border-[#0A0A0A] text-2xl font-mono font-bold tracking-[0.5em] text-center outline-none"
                maxLength={6}
              />
              <button 
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length < 6}
                className="px-8 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] disabled:opacity-40 transition-all shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-[9px] text-[#6B7280] uppercase font-bold">Expires in 10 minutes</p>
            <button 
              disabled={resendTimer > 0 || loading}
              onClick={handleSendOtp}
              className="text-[9px] font-bold uppercase text-[#0055FF] disabled:text-[#6B7280]"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Token"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[9px] font-bold text-[#C43D3D] uppercase flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
