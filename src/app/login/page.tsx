"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import placeholderImages from "@/app/lib/placeholder-images.json";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("The email or password you entered is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex items-center justify-center py-16 px-4">
      <div className="bg-white border border-[#E4E4E4] max-w-4xl w-full shadow-lg flex overflow-hidden min-h-[600px]">
        {/* Left Side: Image */}
        <div className="hidden lg:block w-1/2 relative">
          <Image
            src={placeholderImages.auth.url}
            alt="Varban Infrastructure"
            fill
            className="object-cover"
            data-ai-hint={placeholderImages.auth.hint}
          />
          <div className="absolute inset-0 bg-[#0A0A0A]/20"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227] block mb-2">Institutional Access</span>
            <h2 className="text-2xl font-bold uppercase text-white tracking-tight leading-tight">
              Secure Gateway to Derivative Markets
            </h2>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="border-b border-[#E4E4E4] pb-6 mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Sign In</h1>
            <p className="text-xs text-[#6B7280] mt-1 uppercase tracking-widest font-bold">Access your professional workspace.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#0055FF]/10 border border-[#0055FF]/20 text-[10px] font-bold text-[#0055FF] uppercase tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A] bg-white text-[#0A0A0A] placeholder:text-[#6B7280]/30"
                placeholder="trader@varbanmarkets.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">Password</label>
                <Link href="/help" className="text-[9px] text-[#6B7280] uppercase underline font-bold">Forgot Password?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A] bg-white text-[#0A0A0A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-institutional-primary py-4"
            >
              {loading ? "Authenticating..." : "Sign In to Workspace"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#E4E4E4] text-center">
            <span className="text-[11px] text-[#6B7280] uppercase tracking-wide">New to Varban Markets? </span>
            <Link href="/register" className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest underline decoration-[#C9A227] decoration-2 underline-offset-4 ml-1">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
