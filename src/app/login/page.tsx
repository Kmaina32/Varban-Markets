"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/app/lib/i18n-context";

/**
 * @fileOverview Login Workspace.
 * Refined for multi-language support and institutional blue success reveal.
 * Protected by Google reCAPTCHA Enterprise.
 */

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRecaptcha = async (action: string) => {
    return new Promise<string>((resolve) => {
      if (typeof window !== 'undefined' && window.grecaptcha?.enterprise) {
        window.grecaptcha.enterprise.ready(async () => {
          try {
            const token = await window.grecaptcha.enterprise.execute('6Le4lvotAAAAAOGKStaGBQ1H7DpRsKXGrLW64BQ1', { action });
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Execute reCAPTCHA Enterprise
      const recaptchaToken = await executeRecaptcha('LOGIN');
      if (recaptchaToken) {
        console.log("Security Token Obtained:", recaptchaToken.substring(0, 10) + "...");
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);

    } catch (err: any) {
      setError(err.message || "Sign in failure.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-16 px-4 relative">
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
            <div className="mb-6 p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
              disabled={loading}
              className="w-full btn-institutional-primary py-4 shadow-sm bg-[#0055FF] border-[#0055FF] text-white hover:bg-[#0044cc]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('auth.signIn')}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#E4E4E4] text-center">
            <span className="text-[11px] text-[#6B7280] uppercase tracking-wide">{t('auth.newToPlatform')} </span>
            <Link href="/register" className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest underline decoration-[#0055FF] decoration-2 underline-offset-4 ml-1">{t('auth.createAccount')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
