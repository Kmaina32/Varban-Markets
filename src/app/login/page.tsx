"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/app/lib/i18n-context";

/**
 * @fileOverview Login Workspace (Firebase).
 * Protected by Google reCAPTCHA Enterprise.
 * Enhanced with Google OAuth.
 */

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { auth, db } = initializeFirebase();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists, if not initialize it
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
            country: "Global",
            createdAt: new Date().toISOString()
          },
          status: {
            verificationStatus: "Not Verified",
            role: "Trader",
            createdAt: new Date().toISOString()
          },
          referral: {
            code: `VRB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            referredBy: null
          },
          preferences: {
            language: "ENGLISH",
            timezone: "UTC+0",
            mfaEnabled: false
          }
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: any) {
      setError(err.message || "Google Handshake Failed.");
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const recaptchaToken = await executeRecaptcha('LOGIN');
      if (!recaptchaToken && siteKey) {
        throw new Error("Security Handshake Interrupted: Unable to verify session integrity.");
      }
      
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err: any) {
      let msg = err?.message || "Authentication failed.";
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) {
        msg = "Sign in failed: The email or password provided is incorrect.";
      } else if (msg.includes('auth/too-many-requests')) {
        msg = "Security Lock: Too many failed attempts. Access is temporarily restricted.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-16 px-4 relative">
      <title>Sign In | Varban Markets Trading Terminal</title>
      <meta name="description" content="Secure access to your Varban Markets trading workspace. Enter your credentials to manage your portfolio and execute high-speed derivative trades." />
      
      {success && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#F7F7F5]/80 backdrop-blur-sm animate-in fade-in duration-500">
          <Card className="bg-white border-[#E4E4E4] w-full max-w-sm shadow-2xl p-10 md:p-12 text-center space-y-6 animate-in zoom-in-95 duration-300 rounded-none border-b-4 border-b-[#0055FF]">
            <div className="flex justify-center">
              <Check className="w-12 h-12 text-[#0055FF] stroke-[3px]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">{t('auth.loginSuccess')}</h2>
              <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase tracking-[0.2em] font-bold">
                {t('auth.verifying')}
              </p>
            </div>
            <div className="flex justify-center pt-4">
              <Loader2 className="w-5 h-5 text-[#0055FF] animate-spin" />
            </div>
          </Card>
        </div>
      )}

      <div className="bg-white border border-[#E4E4E4] max-w-4xl w-full shadow-lg flex overflow-hidden min-h-[600px] relative">
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors lg:text-white lg:hover:text-[#0055FF]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('auth.backToHome')}</span>
        </Link>

        <div className="hidden lg:block w-1/2 relative">
          <Image
            src={placeholderImages.auth.url}
            alt="Auth"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="border-b border-[#E4E4E4] pb-6 mb-8 mt-4 lg:mt-0">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">{t('auth.signIn')}</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
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
              <span className="text-[9px] font-bold text-[#6B7280] uppercase">or manual sign in</span>
              <div className="flex-grow h-px bg-[#E4E4E4]"></div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">{t('auth.email')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A] bg-white text-[#0A0A0A]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">{t('auth.password')}</label>
                  <Link href="/forgot-password" title="Forgot Password" className="text-[9px] text-[#6B7280] uppercase underline font-bold">{t('auth.forgot')}</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A] bg-white text-[#0A0A0A] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full btn-institutional-primary py-4 shadow-sm bg-[#0055FF] border-[#0055FF] text-white hover:bg-[#0044cc]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('auth.signIn')}
              </button>
            </form>
          </div>

          <div className="mt-10 pt-6 border-t border-[#E4E4E4] text-center">
            <span className="text-[11px] text-[#6B7280] uppercase tracking-wide">{t('auth.newToPlatform')} </span>
            <Link href="/register" className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest underline decoration-[#0055FF] decoration-2 underline-offset-4 ml-1">{t('auth.createAccount')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
