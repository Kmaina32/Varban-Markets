
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { evaluatePassword } from "@/app/lib/password-policy";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, Check, Smartphone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/app/lib/i18n-context";
import { COUNTRIES } from "@/app/lib/countries";
import { cn } from "@/app/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { auth, db } = initializeFirebase();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+44");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

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

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      setSuccess(true);
      setTimeout(() => router.push("/client/dashboard"), 1200);
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
      await executeRecaptcha('LOGIN');
      await signInWithEmailAndPassword(auth, email.trim(), password);

      setSuccess(true);
      setTimeout(() => {
        router.push("/client/dashboard");
      }, 1500);

    } catch (err: any) {
      setError("Sign in failed: The email or password provided is incorrect.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-16 px-4 relative">
      {success && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#F7F7F5]/80 backdrop-blur-sm animate-in fade-in duration-500">
          <Card className="bg-white border-[#E4E4E4] w-full max-w-md shadow-2xl p-10 md:p-12 text-center space-y-6 animate-in zoom-in-95 duration-300 rounded-2xl border-b-4 border-b-[#0055FF]">
            <div className="flex justify-center">
              <Check className="w-12 h-12 text-[#0055FF] stroke-[3px]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Loading your account</h2>
              <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase tracking-[0.2em] font-bold">
                Accessing your secure trading workspace
              </p>
            </div>
          </Card>
        </div>
      )}

      <div className="bg-white border border-[#E4E4E4] max-w-4xl w-full shadow-lg flex overflow-hidden min-h-[600px] relative rounded-2xl">
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors lg:text-white lg:hover:text-[#0055FF]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
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
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Sign In</h1>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-4 border border-[#E4E4E4] bg-white text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F7F7F5] transition-all rounded-xl"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-[#E4E4E4] rounded-xl bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-[#E4E4E4] rounded-xl bg-[#F7F7F5] outline-none focus:border-[#0A0A0A]" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-[#0A0A0A] text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[#0055FF] transition-all">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Loading your account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
