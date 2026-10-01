"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase/client";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { ArrowLeft, CheckCircle2, Mail, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "We could not send a recovery link to that email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-16 px-4">
      <div className="bg-white border border-[#E4E4E4] max-w-4xl w-full shadow-lg flex overflow-hidden min-h-[600px] relative">
        <Link 
          href="/login" 
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors lg:text-white lg:hover:text-[#0055FF]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <div className="hidden lg:block w-1/2 relative">
          <Image
            src={placeholderImages.auth.url}
            alt="Varban Markets Recovery"
            fill
            className="object-cover"
            priority
            data-ai-hint={placeholderImages.auth.hint}
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Account Recovery</span>
            <h2 className="text-2xl font-bold uppercase text-white tracking-tight leading-tight">
              Restore access to your trading workspace.
            </h2>
            <div className="w-12 h-1 bg-[#0055FF] mt-4"></div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="border-b border-[#E4E4E4] pb-6 mb-8 mt-4 lg:mt-0">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Reset Password</h1>
            <p className="text-xs text-[#6B7280] mt-1 uppercase tracking-widest font-bold">Secure identity verification.</p>
          </div>

          {success ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-6 bg-[#16835B]/5 border border-[#16835B]/20 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#16835B] mx-auto" />
                <p className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wide">Recovery Email Transmitted</p>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Please check your inbox at <span className="font-bold text-[#0A0A0A]">{email}</span> for instructions to reset your password.
                </p>
              </div>
              <Link href="/login" className="w-full btn-institutional-primary py-4 flex items-center justify-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {error && (
                <div className="p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide">
                  {error}
                </div>
              )}

              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Registered Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A] bg-white text-[#0A0A0A] pr-10"
                    placeholder="trader@varbanmarkets.com"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                </div>
              </div>

              <div className="bg-[#F7F7F5] p-4 text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold">
                A secure link will be sent to your email address to allow password modification.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-institutional-primary py-4 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Send Recovery Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
