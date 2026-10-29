
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
import InstitutionalGlobe from "@/components/registration/InstitutionalGlobe";

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
    setError(null);
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

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex flex-col relative">
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
          showOtpStep ? "max-w-[480px]" : "max-w-6xl"
        )}>
          {!showOtpStep && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Side: 3D Globe */}
              <div className="hidden lg:block lg:col-span-5 h-[600px]">
                <InstitutionalGlobe />
              </div>

              {/* Right Side: Form */}
              <div className="lg:col-span-7">
                <Card className="bg-white p-8 md:p-10 border border-[#E4E4E4] shadow-sm space-y-8 rounded-2xl">
                  {error && (
                    <div className="p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[11px] font-bold text-[#C43D3D] uppercase text-left flex items-start gap-3 animate-in fade-in duration-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleGoogleRegister}
                      disabled={googleLoading || loading}
                      className="w-full py-4 border border-[#E4E4E4] bg-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#F7F7F5] transition-all rounded-xl"
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
                      onClick={() => document.getElementById('phone-input')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full py-4 border border-[#E4E4E4] bg-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#F7F7F5] transition-all rounded-xl"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Phone Token</span>
                    </button>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">First Name</label>
                          <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-sm rounded-xl focus:border-[#0A0A0A] outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Last Name</label>
                          <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-sm rounded-xl focus:border-[#0A0A0A] outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Email Address</label>
                          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-sm rounded-xl focus:border-[#0A0A0A] outline-none" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Phone Number</label>
                          <div className="flex gap-2">
                            <select value={formData.dialCode} onChange={e => setFormData({...formData, dialCode: e.target.value})} className="p-3 bg-white border border-[#E4E4E4] text-xs rounded-xl">
                              {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.dial_code}</option>)}
                            </select>
                            <input id="phone-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="flex-grow p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-sm rounded-xl outline-none" placeholder="700000000" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Create Password</label>
                          <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 bg-white border border-[#E4E4E4] text-sm rounded-xl focus:border-[#0A0A0A] outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Confirm Password</label>
                          <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full p-3 bg-white border border-[#E4E4E4] text-sm rounded-xl outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-[#F7F7F5] border border-[#E4E4E4] rounded-xl">
                      <input type="checkbox" checked={formData.isNotUSCitizen} onChange={e => setFormData({...formData, isNotUSCitizen: e.target.checked})} className="mt-1 w-4 h-4 accent-[#0055FF]" id="us-check" />
                      <label htmlFor="us-check" className="text-[10px] text-[#6B7280] uppercase font-bold leading-relaxed cursor-pointer">
                        I confirm I am not a resident of the US or other restricted jurisdictions.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit || loading}
                      className={cn(
                        "w-full py-5 text-[11px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl rounded-xl",
                        canSubmit ? "bg-[#0A0A0A] text-white hover:bg-[#0055FF]" : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E4E4E4]"
                      )}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Setting up your workspace"}
                    </button>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {showOtpStep && (
            <Card className="bg-white p-10 border border-[#E4E4E4] shadow-2xl rounded-2xl space-y-8 animate-in fade-in duration-300">
               <div className="p-6 bg-[#0055FF]/5 border border-[#0055FF]/20 text-center space-y-4 rounded-2xl">
                  <Smartphone className="w-10 h-10 text-[#0055FF] mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase text-[#0A0A0A]">Verify Your Phone</h3>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase">Token transmitted to {formData.dialCode} {formData.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-[#6B7280] tracking-widest text-center block">Enter 6-Digit Code</label>
                    <input 
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full p-4 border-2 border-[#0A0A0A] text-2xl font-mono font-bold tracking-[0.5em] text-center outline-none bg-[#F7F7F5] rounded-xl"
                      placeholder="000000"
                    />
                  </div>

                  <button 
                    onClick={handleVerifyOtp}
                    disabled={otpCode.length < 6 || otpLoading}
                    className="w-full btn-institutional-primary py-4 flex items-center justify-center gap-2 rounded-xl"
                  >
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Confirm Token</span>
                  </button>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold uppercase text-[#6B7280] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Expires in 10m
                    </span>
                    <button 
                      type="button"
                      disabled={resendTimer > 0 || otpLoading}
                      onClick={() => handleSendOtp(auth.currentUser)}
                      className="text-[9px] font-bold uppercase text-[#0055FF] hover:underline disabled:text-[#6B7280]"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend SMS"}
                    </button>
                  </div>
                </div>
            </Card>
          )}

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
