
"use client";

/**
 * @fileOverview Login Workspace.
 * Integrated with Passkey/WebAuthn and Google Authentication.
 * Records active device sessions upon successful sign-in.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { Eye, EyeOff, Fingerprint, Loader2, ArrowLeft } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import { cn } from "@/app/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Other";
    let os = "Other";

    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";
    
    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "macOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("iPhone") > -1) os = "iOS";

    return { browser, os, deviceName: `${browser} on ${os}` };
  };

  const recordSession = async (user: User) => {
    if (!db) return;
    const { browser, os, deviceName } = getDeviceInfo();
    
    // Attempt to get IP
    let ip = "0.0.0.0";
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      ip = data.ip;
    } catch (e) {}

    await addDoc(collection(db, `users/${user.uid}/sessions`), {
      deviceName,
      browser,
      os,
      ip,
      lastActive: serverTimestamp(),
      userAgent: navigator.userAgent
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    setError(null);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await recordSession(cred.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError("The email or password you entered is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setGoogleLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const nameParts = (user.displayName || "").trim().split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(' ') || "";

        // Create skeleton profile for Google sign-ups
        await setDoc(userRef, {
          fullName: user.displayName || "",
          firstName: firstName,
          lastName: lastName,
          email: user.email?.toLowerCase() || "",
          balance: 1000.00,
          equity: 1000.00,
          currency: "USD",
          verificationStatus: "Not Verified",
          role: "Trader",
          referralCode: 'VRB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date().toISOString()
        });
      }
      
      await recordSession(user);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
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
      const resp = await fetch('/api/auth/passkey/authenticate/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      
      const options = await resp.json();
      if (options.error) throw new Error(options.error);

      const asseResp = await startAuthentication({ optionsJSON: options });

      const verifyResp = await fetch('/api/auth/passkey/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...asseResp, email: email.toLowerCase() }),
      });

      const verificationJSON = await verifyResp.json();

      if (verificationJSON && verificationJSON.verified) {
        // Find user by email manually as Passkey doesn't use standard Firebase Auth creds yet in this mock
        // Note: Real implementation would use custom token or similar
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
    <div className="bg-[#F7F7F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-16 px-4">
      <div className="bg-white border border-[#E4E4E4] max-w-4xl w-full shadow-lg flex overflow-hidden min-h-[600px] relative">
        {/* Back Button */}
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

        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="border-b border-[#E4E4E4] pb-6 mb-8 mt-4 lg:mt-0">
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
                <Link href="/forgot-password" title="Forgot Password" className="text-[9px] text-[#6B7280] uppercase underline font-bold">Forgot Password?</Link>
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
                disabled={loading || passkeyLoading || googleLoading}
                className="w-full btn-institutional-primary py-4 shadow-sm"
              >
                {loading ? "Logging in..." : "Log in to Account"}
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E4E4E4]"></span></div>
                <span className="relative bg-white px-3 text-[8px] font-bold uppercase text-[#6B7280] tracking-[0.2em]">Other ways to sign in</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || passkeyLoading || googleLoading}
                  className="py-3.5 border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-[#F7F7F5] transition-colors"
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handlePasskeySignIn}
                  disabled={loading || passkeyLoading || googleLoading}
                  className="py-3.5 border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-[#F7F7F5] transition-colors"
                >
                  {passkeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                  <span>Passkey</span>
                </button>
              </div>
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
