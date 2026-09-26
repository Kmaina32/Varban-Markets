
"use client";

/**
 * @fileOverview Login Workspace.
 * Integrated with Passkey/WebAuthn for passwordless biometric entry.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { Eye, EyeOff, Fingerprint, Loader2 } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import { cn } from "@/app/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
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

  const handlePasskeySignIn = async () => {
    if (!email) {
      setError("Please enter your email address to sign in with a passkey.");
      return;
    }

    setPasskeyLoading(true);
    setError(null);

    try {
      // 1. Get options from server
      const resp = await fetch('/api/auth/passkey/authenticate/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      
      const options = await resp.json();
      if (options.error) throw new Error(options.error);

      // 2. Browser biometric prompt
      const asseResp = await startAuthentication({ optionsJSON: options });

      // 3. Verify with server
      const verifyResp = await fetch('/api/auth/passkey/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...asseResp, email: email.toLowerCase() }),
      });

      const verificationJSON = await verifyResp.json();

      if (verificationJSON && verificationJSON.verified) {
        // Success - in a real app, this would use a Firebase Custom Token
        // For MVP, we proceed to dashboard if verified
        router.push("/dashboard");
      } else {
        throw new Error('Verification failed.');
      }
    } catch (err: any) {
      setError(err.message || "Passkey authentication failed.");
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex items-center justify-center py-16 px-4">
      <div className="bg-white border border-[#E4E4E4] max-w-4xl w-full shadow-lg flex overflow-hidden min-h-[600px]">
        {/* Left Side: Full Color Auth Image */}
        <div className="hidden lg:block w-1/2 relative">
          <Image
            src={placeholderImages.auth.url}
            alt="Varban Markets Login"
            fill
            className="object-cover"
            priority
            data-ai-hint={placeholderImages.auth.hint}
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Welcome Back</span>
            <h2 className="text-2xl font-bold uppercase text-white tracking-tight leading-tight">
              Sign in to your trading account.
            </h2>
            <div className="w-12 h-1 bg-[#0055FF] mt-4"></div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="border-b border-[#E4E4E4] pb-6 mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Sign In</h1>
            <p className="text-xs text-[#6B7280] mt-1 uppercase tracking-widest font-bold">Access your trading dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide">
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
                <Link href="/forgot-password" disableNav className="text-[9px] text-[#6B7280] uppercase underline font-bold">Forgot Password?</Link>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0A0A0A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || passkeyLoading}
                className="w-full btn-institutional-primary py-4 shadow-sm"
              >
                {loading ? "Logging in..." : "Log in to Account"}
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E4E4E4]"></span></div>
                <span className="relative bg-white px-3 text-[8px] font-bold uppercase text-[#6B7280] tracking-[0.2em]">Institutional Access</span>
              </div>

              <button
                type="button"
                onClick={handlePasskeySignIn}
                disabled={loading || passkeyLoading}
                className="w-full py-4 border border-[#0A0A0A] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-[#F7F7F5] transition-colors"
              >
                {passkeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                <span>Sign in with Passkey</span>
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-[#E4E4E4] text-center">
            <span className="text-[11px] text-[#6B7280] uppercase tracking-wide">New to the platform? </span>
            <Link href="/register" className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest underline decoration-[#0055FF] decoration-2 underline-offset-4 ml-1">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
