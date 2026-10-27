"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Check as CheckIcon, Circle as CircleIcon } from "lucide-react";
import { evaluatePassword, checkWithFirebase, isPasswordPolicyError } from "@/app/lib/password-policy";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { 
  Check, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Globe, 
  Loader2, 
  Info,
  AlertCircle
} from "lucide-react";
import { COUNTRIES } from "@/app/lib/countries";
import { detectLocation } from "@/app/lib/geolocation-service";
import { cn } from "@/app/lib/utils";

/**
 * @fileOverview Onboarding Workspace (Firebase).
 * Updated for /client redirection and password confirmation.
 */

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth, db } = initializeFirebase();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPartnerCode, setShowPartnerCode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", 
    lastName: "",
    email: "",
    country: "United Kingdom",
    password: "",
    confirmPassword: "",
    partnerCode: searchParams.get('ref') || "",
    isNotUSCitizen: false
  });

  useEffect(() => {
    const performGeoLookup = async () => {
      const geo = await detectLocation();
      if (geo && geo.country_name) {
        setFormData(prev => ({ ...prev, country: geo.country_name }));
      }
    };
    performGeoLookup();
  }, []);

  // Single shared policy (src/app/lib/password-policy.ts) mirrors the Firebase console setting.
  const passwordPolicy = evaluatePassword(formData.password);
  const isPasswordValid = passwordPolicy.valid;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  
  const canSubmit = isPasswordValid && passwordsMatch && formData.isNotUSCitizen && !loading && !googleLoading && formData.firstName && formData.lastName && formData.email;

  const executeRecaptcha = async (action: string) => {
    return new Promise<string>((resolve) => {
      if (typeof window !== 'undefined' && window.grecaptcha?.enterprise && siteKey) {
        window.grecaptcha.enterprise.ready(async () => {
          try {
            const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
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

      router.push("/client/complete-registration");
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
      
      // Ask Firebase to validate against the console policy first (best effort),
      // so the user gets a precise message instead of a generic failure.
      const policyCheck = await checkWithFirebase(auth, formData.password);
      if (!policyCheck.ok) {
        setError(policyCheck.message || "Your password does not meet the password policy.");
        setLoading(false);
        return;
      }

      const { user } = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);

      await setDoc(doc(db, "users", user.uid), {
        balance: 0,
        equity: 0,
        currency: "USD",
        profile: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          country: formData.country,
          createdAt: new Date().toISOString()
        },
        status: {
          verificationStatus: "Not Verified",
          role: "Trader",
          createdAt: new Date().toISOString()
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
      
      router.push("/client/complete-registration");
    } catch (err: any) {
      if (isPasswordPolicyError(err)) {
        setError("Your password does not meet the password policy. Check the requirements below and try again.");
      } else if (String(err?.code || err?.message || "").includes("auth/email-already-in-use")) {
        setError("An account with this email already exists. Try signing in instead.");
      } else {
        setError(err.message || "Registration failed.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex flex-col">
      <header className="bg-white border-b border-[#E4E4E4] h-16 flex items-center px-4 md:px-8 justify-between shrink-0">
        <Link href="/" className="flex items-center">
          <img src="/assets/logo2.png" alt="Varban" className="h-5 w-auto object-contain" />
        </Link>
        <button className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
          <Globe className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:py-12">
        <div className="w-full max-w-[480px] space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h1 className="text-xl md:text-2xl font-bold text-[#0A0A0A] text-center tracking-tight uppercase">
            Create your trading account
          </h1>

          <div className="bg-white p-8 border border-[#E4E4E4] shadow-sm space-y-8">
            {error && (
              <div className="p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[11px] font-bold text-[#C43D3D] uppercase text-left flex items-start gap-3 animate-in fade-in duration-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              onClick={handleGoogleRegister}
              disabled={googleLoading || loading}
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-grow h-px bg-[#E4E4E4]"></div>
              <span className="text-[9px] font-bold text-[#6B7280] uppercase">or manual registration</span>
              <div className="flex-grow h-px bg-[#E4E4E4]"></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full p-3.5 bg-[#F7F7F5] border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] transition-all"
                    placeholder="e.g. John"
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
                    placeholder="e.g. Doe"
                  />
                </div>
                <div className="col-span-2 space-y-2">
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
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Country / Region of residence
                </label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      autoComplete="new-password"
                      aria-describedby="password-requirements"
                      maxLength={128}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full p-3.5 bg-white border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D1D5DB] hover:text-[#0A0A0A]"
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
                    autoComplete="new-password"
                    maxLength={128}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className={cn(
                      "w-full p-3.5 bg-white border text-sm outline-none transition-all",
                      formData.confirmPassword && !passwordsMatch ? "border-[#C43D3D] bg-[#C43D3D]/5" : "border-[#E4E4E4] focus:border-[#0A0A0A]"
                    )}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <ul id="password-requirements" aria-live="polite" className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 -mt-2">
                {passwordPolicy.checks.map((c) => (
                  <li key={c.id} className={cn("flex items-center gap-2 text-[11px] font-medium", c.met ? "text-[#16835B]" : "text-[#6B7280]")}>
                    {c.met ? <CheckIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : <CircleIcon className="w-3 h-3 shrink-0" aria-hidden="true" />}
                    <span>{c.label}<span className="sr-only">{c.met ? " (met)" : " (not met yet)"}</span></span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <button 
                  type="button"
                  onClick={() => setShowPartnerCode(!showPartnerCode)}
                  className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  Partner code (optional) <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showPartnerCode && "rotate-180")} />
                </button>
                {showPartnerCode && (
                  <input
                    type="text"
                    value={formData.partnerCode}
                    onChange={(e) => setFormData({...formData, partnerCode: e.target.value})}
                    className="w-full p-3 bg-[#F7F7F5] border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] animate-in slide-in-from-top-1 duration-200"
                    placeholder="Enter partner code"
                  />
                )}
              </div>

              <div className="flex items-start gap-3 py-2 group cursor-pointer" onClick={() => setFormData({...formData, isNotUSCitizen: !formData.isNotUSCitizen})}>
                <div className={cn(
                  "w-5 h-5 border-2 shrink-0 flex items-center justify-center transition-all",
                  formData.isNotUSCitizen ? "bg-[#0055FF] border-[#0055FF]" : "border-[#E4E4E4] group-hover:border-[#0A0A0A]"
                )}>
                  {formData.isNotUSCitizen && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className="text-[11px] text-[#6B7280] leading-snug group-hover:text-[#0A0A0A] transition-colors uppercase font-bold tracking-tight">
                  I declare and confirm that I am not a citizen or resident of the US for tax purposes.
                </p>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg",
                  canSubmit 
                    ? "bg-[#0A0A0A] text-white hover:bg-[#0055FF] hover:scale-[1.01]" 
                    : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E4E4E4]"
                )}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </div>
                ) : "Continue"}
              </button>
            </form>
          </div>
          
          <div className="text-center">
            <Link href="/login" className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-[#0A0A0A] underline decoration-2 underline-offset-4">
              Already have an account? Sign in
            </Link>
          </div>
          <p className="mt-6 text-center text-[9px] leading-relaxed text-[#6B7280]">
            Protected by reCAPTCHA. Google&apos;s{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>{" "}and{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a> apply.
          </p>
        </div>
      </main>
    </div>
  );
}
