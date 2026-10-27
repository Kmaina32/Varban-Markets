"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Check as CheckIcon, Circle as CircleIcon, Check, Eye, EyeOff, Globe, Loader2, AlertCircle, Smartphone, ChevronDown, Clock, CheckCircle2, Mail } from "lucide-react";
import { evaluatePassword, checkWithFirebase } from "@/app/lib/password-policy";
import { doc, setDoc, getDoc } from "firebase/firestore";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { Card } from "@/components/ui/card";
import { COUNTRIES } from "@/app/lib/countries";
import { detectLocation } from "@/app/lib/geolocation-service";
import { cn } from "@/app/lib/utils";
import { useTranslation } from "@/app/lib/i18n-context";
import { authFetch } from "@/app/lib/auth-fetch";

/**
 * @fileOverview Onboarding Workspace (Firebase).
 * Widened layout to prevent excessive scrolling on desktop.
 */

export default function RegisterClient() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { auth, db } = initializeFirebase();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP Verification States
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "", 
    lastName: "",
    email: "",
    country: "United Kingdom",
    dialCode: "+44",
    phone: "",
    password: "",
    confirmPassword: "",
    partnerCode: searchParams.get('ref') || "",
    isNotUSCitizen: false
  });

  useEffect(() => {
    const performGeoLookup = async () => {
      const geo = await detectLocation();
      if (geo && geo.country_name) {
        const countryData = COUNTRIES.find(c => c.name === geo.country_name);
        setFormData(prev => ({ 
          ...prev, 
          country: geo.country_name,
          dialCode: countryData?.dial_code || "+44"
        }));
      }
    };
    performGeoLookup();
  }, []);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const passwordPolicy = evaluatePassword(formData.password);
  const isPasswordValid = passwordPolicy.valid;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  
  const canSubmit = isPasswordValid && passwordsMatch && formData.isNotUSCitizen && !loading && !googleLoading && formData.firstName && formData.lastName && formData.email && formData.phone;

  const executeRecaptcha = async (action: string) => {
    return new Promise<string>((resolve) => {
      if (typeof window !== 'undefined' && (window as any).grecaptcha?.enterprise && siteKey) {
        (window as any).grecaptcha.enterprise.ready(async () => {
          try {
            const token = await (window as any).grecaptcha.enterprise.execute(siteKey, { action });
            resolve(token);
          } catch (e) {
            console.error("reCAPTCHA execution failure", e);
            resolve("");
          }
        });
      } else {
        resolve("");
      }
    });
  };

  const handleSendOtp = async (userObj: any) => {
    setOtpLoading(true);
    setOtpError(null);
    const fullPhone = `${formData.dialCode} ${formData.phone}`.trim();

    try {
      const resp = await authFetch(userObj, '/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: fullPhone })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Verification token transmission failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpLoading || !auth.currentUser) return;
    setOtpLoading(true);
    setError(null);
    const fullPhone = `${formData.dialCode} ${formData.phone}`.trim();

    try {
      const resp = await authFetch(auth.currentUser, '/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: fullPhone, code: otpCode })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      // Success
      setSuccess(true);
      setTimeout(() => router.push("/client/dashboard"), 1500);
    } catch (err: any) {
      setError('The verification code is invalid or has expired.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          balance: 0,
          equity: 0,
          currency: "USD",
          profile: {
            firstName: user.displayName?.split(' ')[0] || "Trader",
            lastName: user.displayName?.split(' ').slice(1).join(' ') || "",
            fullName: user.displayName || "Trader",
            email: user.email,
            country: formData.country || "Global",
            createdAt: new Date().toISOString()
          },
          status: {
            verificationStatus: "Not Verified",
            role: "Trader",
            createdAt: new Date().toISOString()
          },
          referral: {
            code: `VRB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            referredBy: formData.partnerCode || null
          },
          preferences: {
            language: "ENGLISH",
            timezone: "UTC+0",
            mfaEnabled: false
          }
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/client/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Google Handshake Failed.");
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Validation Error: Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const recaptchaToken = await executeRecaptcha('REGISTER');
      if (!recaptchaToken && siteKey) {
        throw new Error("Security Handshake Interrupted: Unable to verify session integrity.");
      }
      
      const policyCheck = await checkWithFirebase(auth, formData.password);
      if (!policyCheck.ok) {
        setError(policyCheck.message || "Your password does not meet requirements.");
        setLoading(false);
        return;
      }

      const { user } = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const fullPhone = `${formData.dialCode} ${formData.phone}`.trim();

      await setDoc(doc(db, "users", user.uid), {
        balance: 0,
        equity: 0,
        currency: "USD",
        profile: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          phone: fullPhone,
          country: formData.country,
          createdAt: new Date().toISOString()
        },
        status: {
          verificationStatus: "Not Verified",
          role: "Trader",
          createdAt: new Date().toISOString(),
          phoneVerified: false
        },
        referral: {
          code: `VRB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          referredBy: formData.partnerCode.trim() || null
        },
        preferences: {
          language: "ENGLISH",
          timezone: "UTC+0",
          mfaEnabled: false
        }
      });
      
      await handleSendOtp(user);
      setShowOtpStep(true);
    } catch (err: any) {
      let msg = err?.message || "Registration failed.";
      if (err?.code === 'auth/email-already-in-use') {
        msg = "An account with this email already exists.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const setOtpError = (msg: string | null) => {
    setError(msg);
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex flex-col relative">
      {success && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#F7F7F5]/90 backdrop-blur-md animate-in fade-in duration-500">
          <Card className="bg-white border-[#E4E4E4] w-full max-w-md shadow-2xl p-10 md:p-12 text-center space-y-6 animate-in zoom-in-95 duration-300 rounded-none border-b-4 border-b-[#0055FF]">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-[#0055FF] animate-spin stroke-[2px]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Initializing Workspace</h2>
              <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase tracking-[0.2em] font-bold">
                Synchronizing identity and trading nodes...
              </p>
            </div>
          </Card>
        </div>
      )}

      <header className="bg-white border-b border-[#E4E4E4] h-16 flex items-center px-4 md:px-8 justify-between shrink-0">
        <Link href="/" className="flex items-center">
          <img src="/assets/logo2.png" alt="Varban" className="h-5 w-auto object-contain" />
        </Link>
        <button className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
          <Globe className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:py-12">
        <div className={cn(
          "w-full transition-all duration-500 space-y-8 animate-in fade-in slide-in-from-bottom-2",
          showOtpStep ? "max-w-[480px]" : "max-w-4xl"
        )}>
          <h1 className="text-xl md:text-2xl font-bold text-[#0A0A0A] text-center tracking-tight uppercase">
            {showOtpStep ? "Verify Your Phone" : "Create your trading account"}
          </h1>

          <div className="bg-white p-8 md:p-10 border border-[#E4E4E4] shadow-sm space-y-8">
            {error && (
              <div className="p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[11px] font-bold text-[#C43D3D] uppercase text-left flex items-start gap-3 animate-in fade-in duration-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {!showOtpStep ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <button
                    onClick={handleGoogleRegister}
                    disabled={googleLoading || loading || success}
                    className="w-full py-4 border border-[#E4E4E4] bg-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#F7F7F5] transition-all"
                  >
                    {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Google</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const phoneField = document.getElementById('phone-input');
                      phoneField?.scrollIntoView({ behavior: 'smooth' });
                      phoneField?.focus();
                    }}
                    className="w-full py-4 border border-[#E4E4E4] bg-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#F7F7F5] transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Phone</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 max-w-sm mx-auto">
                  <div className="flex-grow h-px bg-[#E4E4E4]"></div>
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase">Identity Registry</span>
                  <div className="flex-grow h-px bg-[#E4E4E4]"></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1: Personal Details */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">First Name</label>
                          <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full p-3.5 bg-[#F7F7F5] border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] transition-all"
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Last Name</label>
                          <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full p-3.5 bg-[#F7F7F5] border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] transition-all"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full p-3.5 bg-[#F7F7F5] border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] transition-all"
                          placeholder="trader@domain.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Phone Number</label>
                        <div className="flex gap-2">
                          <select 
                            value={formData.dialCode}
                            onChange={(e) => setFormData({...formData, dialCode: e.target.value})}
                            className="p-3.5 bg-white border border-[#E4E4E4] text-sm outline-none w-24"
                          >
                            {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.dial_code}</option>)}
                          </select>
                          <input
                            id="phone-input"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                            className="flex-grow p-3.5 bg-[#F7F7F5] border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] transition-all"
                            placeholder="700000000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Security & Region */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Country</label>
                        <div className="relative group">
                          <select 
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                            className="w-full p-3.5 bg-white border border-[#E4E4E4] text-sm appearance-none outline-none focus:border-[#0A0A0A] transition-colors cursor-pointer"
                          >
                            {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Create Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            autoComplete="new-password"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full p-3.5 bg-white border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D1D5DB]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Confirm Password</label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className={cn(
                            "w-full p-3.5 bg-white border text-sm outline-none transition-all",
                            formData.confirmPassword && !passwordsMatch ? "border-[#C43D3D] bg-[#C43D3D]/5" : "border-[#E4E4E4] focus:border-[#0A0A0A]"
                          )}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-t border-[#F7F7F5] pt-8">
                    <div className="md:col-span-7">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                        {passwordPolicy.checks.map((c) => (
                          <li key={c.id} className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight", c.met ? "text-[#16835B]" : "text-[#6B7280]")}>
                            {c.met ? <CheckIcon className="w-3.5 h-3.5" /> : <CircleIcon className="w-2.5 h-2.5 opacity-30" />}
                            <span>{c.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:col-span-5">
                      <div className="flex items-start gap-3 group cursor-pointer" onClick={() => setFormData({...formData, isNotUSCitizen: !formData.isNotUSCitizen})}>
                        <div className={cn(
                          "w-5 h-5 border-2 shrink-0 flex items-center justify-center transition-all",
                          formData.isNotUSCitizen ? "bg-[#0055FF] border-[#0055FF]" : "border-[#E4E4E4] group-hover:border-[#0A0A0A]"
                        )}>
                          {formData.isNotUSCitizen && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <p className="text-[10px] text-[#6B7280] leading-snug uppercase font-bold tracking-tight">
                          I confirm I am not a resident of the US or other restricted jurisdictions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className={cn(
                        "w-full py-5 text-[11px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl",
                        canSubmit ? "bg-[#0A0A0A] text-white hover:bg-[#0055FF]" : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E4E4E4]"
                      )}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Initiate Account Registration"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 max-w-sm mx-auto">
                <div className="p-6 bg-[#0055FF]/5 border border-[#0055FF]/20 text-center space-y-4">
                  <Smartphone className="w-10 h-10 text-[#0055FF] mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase text-[#0A0A0A]">Verification Required</h3>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase">Token transmitted to {formData.dialCode} {formData.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest">Enter 6-Digit Code</label>
                    <input 
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full p-4 border-2 border-[#0A0A0A] text-2xl font-mono font-bold tracking-[0.5em] text-center outline-none bg-[#F7F7F5]"
                      placeholder="000000"
                    />
                  </div>

                  <button 
                    onClick={handleVerifyOtp}
                    disabled={otpCode.length < 6 || otpLoading}
                    className="w-full btn-institutional-primary py-4 flex items-center justify-center gap-2"
                  >
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Confirm Token</span>
                  </button>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold uppercase text-[#6B7280] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Expires in 10m
                    </span>
                    <button 
                      disabled={resendTimer > 0 || otpLoading}
                      onClick={() => handleSendOtp(auth.currentUser)}
                      className="text-[9px] font-bold uppercase text-[#0055FF] hover:underline disabled:text-[#6B7280]"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend SMS"}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                  <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold text-center">
                    SMS verification is required to activate the institutional settlement engine.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Link href="/login" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-[#0A0A0A] underline decoration-2 underline-offset-4">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
