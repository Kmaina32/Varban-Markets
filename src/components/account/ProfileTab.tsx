'use client';

/**
 * @fileOverview Profile Management Tab.
 * Enforces mandatory data fields and integrated SMS OTP verification.
 */

import React, { useState, useEffect } from 'react';
import { User, Loader2, Info, MapPin, Briefcase, Globe, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { COUNTRIES } from '@/app/lib/countries';
import { cn } from '@/app/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getProfileGaps, ageFromDate, isValidPhone, MIN_AGE_YEARS, ProfileGap } from '@/app/lib/profile-completion';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';
import { authFetch } from '@/app/lib/auth-fetch';

const todayMinusYears = (years: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

interface ProfileTabProps {
  showGateBanner?: boolean;
  onCompleted?: () => void;
}

export default function ProfileTab({ showGateBanner = false, onCompleted }: ProfileTabProps = {}) {
  const { user } = useUser();
  const db = useFirestore();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [storedGaps, setStoredGaps] = useState<ProfileGap[]>([]);
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const [form, setForm] = useState({
    firstName: "", 
    lastName: "", 
    phone: "", 
    dateOfBirth: "",
    country: "", 
    dialCode: "+44",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    accountPurpose: "",
    originFunds: "",
    netWorth: "",
    annualIncome: "",
    tradeForecast: "",
    education: "",
    employmentStatus: "",
    sourceWealth: ""
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid || !db) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data: any = snap.exists() ? snap.data() : null;
        setProfileData(data);
        setIsPhoneVerified(!!data?.status?.phoneVerified);
        setStoredGaps(getProfileGaps(data));
        
        if (data) {
          const p = data?.profile ?? {};
          const inv = data?.investor ?? {};
          const rawPhone: string = typeof p?.phone === 'string' ? p.phone : "";
          const phoneParts = rawPhone.split(' ');
          
          setForm({
            firstName: p?.firstName || "",
            lastName: p?.lastName || "",
            phone: phoneParts.length > 1 ? phoneParts.slice(1).join(' ') : rawPhone,
            dateOfBirth: typeof p?.dateOfBirth === 'string' ? p.dateOfBirth : "",
            country: p?.country || "",
            dialCode: phoneParts.length > 1 ? phoneParts[0] : "+44",
            addressLine1: p?.addressLine1 || "",
            addressLine2: p?.addressLine2 || "",
            city: p?.city || "",
            state: p?.state || "",
            zipCode: p?.zipCode || "",
            accountPurpose: inv?.accountPurpose || "",
            originFunds: inv?.originFunds || "",
            netWorth: inv?.netWorth || "",
            annualIncome: inv?.annualIncome || "",
            tradeForecast: inv?.tradeForecast || "",
            education: inv?.education || "",
            employmentStatus: inv?.employmentStatus || "",
            sourceWealth: inv?.sourceWealth || ""
          });
        }
      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user?.uid, db]);

  const cleanPhone = `${form.dialCode} ${form.phone}`.trim();
  
  const formDoc = {
    profile: {
      firstName: form.firstName, lastName: form.lastName, dateOfBirth: form.dateOfBirth,
      phone: cleanPhone, country: form.country, addressLine1: form.addressLine1,
      city: form.city, zipCode: form.zipCode,
    },
    status: {
      phoneVerified: isPhoneVerified
    },
    investor: {
      accountPurpose: form.accountPurpose, employmentStatus: form.employmentStatus,
      sourceWealth: form.sourceWealth, annualIncome: form.annualIncome,
      netWorth: form.netWorth, originFunds: form.originFunds,
    },
  };

  const formGaps = getProfileGaps(formDoc);
  const gapKeys = new Set(formGaps.map(g => g.key));
  const dobAge = ageFromDate(form.dateOfBirth);

  const fieldError = (key: string): string | null => {
    if (!submitted || !gapKeys.has(key)) return null;
    if (key === 'dateOfBirth') {
      if (dobAge === null) return 'Enter your date of birth';
      return `You must be at least ${MIN_AGE_YEARS} years old`;
    }
    if (key === 'phone') return isValidPhone(cleanPhone) ? null : 'Enter a valid phone number (7-14 digits)';
    if (key === 'phoneVerified') return isPhoneVerified ? null : 'SMS verification required';
    return 'This field is required';
  };

  const errText = (key: string) => {
    const msg = fieldError(key);
    return msg ? <p role="alert" className="text-[9px] font-bold uppercase text-[#C43D3D] mt-1">{msg}</p> : null;
  };

  const errBorder = (key: string) => (fieldError(key) ? ' !border-[#C43D3D]' : '');

  // OTP Handlers
  const handleSendOtp = async () => {
    if (!form.phone || otpLoading) return;
    setOtpLoading(true);
    setOtpError(null);

    try {
      const resp = await authFetch(user, '/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: cleanPhone })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setOtpSent(true);
    } catch (err: any) {
      setOtpError(err.message || 'Verification transmission failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpLoading) return;
    setOtpLoading(true);
    setOtpError(null);

    try {
      const resp = await authFetch(user, '/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: cleanPhone, code: otpCode })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setIsPhoneVerified(true);
      setOtpSent(false);
    } catch (err: any) {
      setOtpError('Invalid code. Access denied.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !db || isSaving) return;
    setSubmitted(true);
    if (formGaps.length > 0) return;
    setIsSaving(true);
    
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const nowIso = new Date().toISOString();
      
      await setDoc(doc(db, 'users', user.uid), {
        profile: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          fullName,
          dateOfBirth: form.dateOfBirth,
          phone: cleanPhone,
          country: form.country,
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.zipCode.trim(),
          profileCompleted: true,
          completedAt: nowIso
        },
        status: {
          phoneVerified: true,
          phoneVerifiedAt: nowIso
        },
        investor: {
          accountPurpose: form.accountPurpose,
          originFunds: form.originFunds,
          netWorth: form.netWorth,
          annualIncome: form.annualIncome,
          tradeForecast: form.tradeForecast,
          education: form.education,
          employmentStatus: form.employmentStatus,
          sourceWealth: form.sourceWealth
        }
      }, { merge: true });

      if (onCompleted) {
        onCompleted();
      } else {
        setDialog({
          status: 'success',
          title: 'Identity Synchronized',
          message: 'Your institutional profile has been successfully validated. You now have access to all platform nodes.'
        });
      }
    } catch (err: any) {
      setDialog({
        status: 'error',
        title: 'Transmission Failure',
        message: err.message || 'Failed to synchronize registration data.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Synchronizing Identity Node...</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      {(showGateBanner || (submitted && formGaps.length > 0)) && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20" role="status">
          <Info className="w-4 h-4 text-[#C43D3D] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-[#C43D3D] tracking-widest">
              Regulatory compliance required
            </p>
            <p className="text-[9px] text-[#C43D3D] uppercase font-bold leading-relaxed">
              Remaining Gaps: {(submitted ? formGaps : storedGaps).map(g => g.label).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} noValidate className="space-y-6">
            
            {/* 1. PERSONAL INFORMATION */}
            <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                <User className="w-5 h-5 text-[#0055FF]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">First Name</label>
                  <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]${errBorder('firstName')}`} />
                  {errText('firstName')}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Last Name</label>
                  <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]${errBorder('lastName')}`} />
                  {errText('lastName')}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-[#6B7280]">Date of Birth (must be {MIN_AGE_YEARS}+)</label>
                <input type="date" value={form.dateOfBirth} max={todayMinusYears(MIN_AGE_YEARS)} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]${errBorder('dateOfBirth')}`} />
                {errText('dateOfBirth')}
              </div>

              {/* PHONE & OTP FLOW */}
              <div className="space-y-4 pt-4 border-t border-[#F7F7F5]">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Phone Number (SMS Verification Required)</label>
                  {isPhoneVerified ? (
                    <div className="flex items-center justify-between p-3 bg-[#16835B]/5 border border-[#16835B]/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#16835B]" />
                        <span className="text-xs font-mono font-bold">{cleanPhone}</span>
                      </div>
                      <span className="text-[8px] font-bold uppercase text-[#16835B] bg-white px-2 py-0.5 border border-[#16835B]">Verified</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <select value={form.dialCode} onChange={e => setForm({...form, dialCode: e.target.value})} className="p-3 border border-[#E4E4E4] text-xs bg-[#F7F7F5] outline-none">
                          {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
                        </select>
                        <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={`flex-grow p-3 border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF] bg-white${errBorder('phone')}`} placeholder="700000000" />
                        <button 
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading || !isValidPhone(cleanPhone) || otpSent}
                          className="px-6 bg-[#0A0A0A] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0055FF] disabled:opacity-40"
                        >
                          {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                        </button>
                      </div>
                      
                      {otpSent && (
                        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] space-y-4 animate-in slide-in-from-top-2">
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold uppercase text-[#0055FF]">Enter 6-Digit Code</span>
                              <button type="button" onClick={() => setOtpSent(false)} className="text-[9px] font-bold uppercase underline text-[#6B7280]">Change Number</button>
                           </div>
                           <div className="flex gap-2">
                              <input 
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="flex-grow p-3 border-2 border-[#0A0A0A] text-center font-mono font-bold tracking-[0.5em] text-lg outline-none"
                                maxLength={6}
                                placeholder="000000"
                              />
                              <button 
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpLoading || otpCode.length < 6}
                                className="px-8 bg-[#16835B] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A]"
                              >
                                Confirm
                              </button>
                           </div>
                        </div>
                      )}

                      {otpError && (
                        <div className="flex items-center gap-2 p-2 bg-[#C43D3D]/5 text-[#C43D3D] text-[9px] font-bold uppercase">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{otpError}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {errText('phoneVerified')}
                </div>
              </div>
            </Card>

            {/* 2. ADDRESS INFORMATION */}
            <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                <MapPin className="w-5 h-5 text-[#0055FF]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Address Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Street Address</label>
                  <input value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]${errBorder('addressLine1')}`} />
                  {errText('addressLine1')}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Town / City</label>
                  <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]${errBorder('city')}`} />
                  {errText('city')}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Postal / Zip Code</label>
                  <input value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-mono font-bold bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]${errBorder('zipCode')}`} />
                  {errText('zipCode')}
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Country of Residence</label>
                  <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white outline-none${errBorder('country')}`}>
                    <option value="" disabled>Select...</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                  </select>
                  {errText('country')}
                </div>
              </div>
            </Card>

            {/* 3. INVESTOR PROFILE */}
            <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                <Briefcase className="w-5 h-5 text-[#0055FF]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Investor Profile</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Purpose of Account Opening</label>
                  <select value={form.accountPurpose} onChange={e => setForm({...form, accountPurpose: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none${errBorder('accountPurpose')}`}>
                    <option value="" disabled>Select...</option>
                    <option>Portfolio Diversification</option>
                    <option>Speculative Trading</option>
                    <option>Hedging</option>
                  </select>
                  {errText('accountPurpose')}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Estimated net worth</label>
                    <select value={form.netWorth} onChange={e => setForm({...form, netWorth: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none${errBorder('netWorth')}`}>
                    <option value="" disabled>Select...</option>
                      <option>Less than $10,000</option>
                      <option>$10,000 - $50,000</option>
                      <option>Over $100,000</option>
                    </select>
                    {errText('netWorth')}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Annual income</label>
                    <select value={form.annualIncome} onChange={e => setForm({...form, annualIncome: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none${errBorder('annualIncome')}`}>
                    <option value="" disabled>Select...</option>
                      <option>Less than $10,000</option>
                      <option>Over $100,000</option>
                    </select>
                    {errText('annualIncome')}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-[#6B7280]">Employment Status</label>
                  <select value={form.employmentStatus} onChange={e => setForm({...form, employmentStatus: e.target.value})} className={`w-full p-3 border border-[#E4E4E4] text-xs font-bold bg-[#F7F7F5] outline-none${errBorder('employmentStatus')}`}>
                    <option value="" disabled>Select...</option>
                    <option>Employed</option>
                    <option>Self-Employed</option>
                    <option>Unemployed</option>
                  </select>
                  {errText('employmentStatus')}
                </div>
              </div>
            </Card>

            <button 
              type="submit" 
              disabled={isSaving || !isPhoneVerified} 
              className={cn(
                "w-full py-5 text-xs font-bold uppercase tracking-[0.25em] shadow-xl transition-all",
                isPhoneVerified ? "bg-[#0A0A0A] text-white hover:bg-[#0055FF]" : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E4E4E4]"
              )}
            >
              {isSaving ? "SYNCHRONIZING..." : "Complete Registration"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-[#010813] text-white border-none shadow-xl space-y-6">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#0055FF]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Identity Node</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed uppercase font-bold tracking-tight">
              We require a verified mobile number to enable Multi-Factor Authentication (2FA) and provide instant trade settlement alerts.
            </p>
            {!isPhoneVerified && (
              <div className="p-4 bg-[#0055FF]/10 border border-[#0055FF]/30 text-[9px] font-bold text-[#0055FF] uppercase">
                Awaiting SMS Validation
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
