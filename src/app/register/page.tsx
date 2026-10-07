"use client";

/**
 * @fileOverview Finalized Onboarding Workspace.
 * Matches the "Finish creating your account" UI from the institutional reference.
 * Features real-time password validation and regulatory declarations.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { 
  Check, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Globe, 
  Loader2, 
  Info,
  User
} from "lucide-react";
import { COUNTRIES } from "@/app/lib/countries";
import { detectLocation } from "@/app/lib/geolocation-service";
import { cn } from "@/app/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPartnerCode, setShowPartnerCode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "Macos", 
    lastName: "25",
    email: "macos8388@gmail.com",
    country: "Kenya",
    password: "",
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

  const passwordValidators = [
    { label: "Between 8-15 characters", test: (p: string) => p.length >= 8 && p.length <= 15 },
    { label: "At least one upper and one lower case letter", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
    { label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
    { label: "At least one special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) }
  ];

  const isPasswordValid = passwordValidators.every(v => v.test(formData.password));
  const canSubmit = isPasswordValid && formData.isNotUSCitizen && !loading;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            country: formData.country,
            partner_code: formData.partnerCode
          }
        }
      });

      if (signUpError) throw signUpError;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex flex-col">
      {/* Auth-Specific Minimal Header */}
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
          <h1 className="text-xl md:text-2xl font-bold text-[#0A0A0A] text-center tracking-tight">
            Finish creating your account
          </h1>

          {/* User Preview Card */}
          <div className="bg-[#F3F4F6] p-6 rounded-lg flex items-center gap-4 border border-[#E4E4E4]/50 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF9800] to-[#F44336] flex items-center justify-center text-white text-xl font-bold">
              {formData.firstName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#0A0A0A] text-sm">{formData.firstName} {formData.lastName}</h3>
              <p className="text-xs text-[#6B7280] truncate">{formData.email}</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-3 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[11px] font-bold text-[#C43D3D] uppercase text-center">
                {error}
              </div>
            )}

            {/* Country Selector */}
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

            {/* Password Field */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                  Choose a password <Info className="w-3.5 h-3.5 text-[#D1D5DB]" />
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-3.5 bg-white border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] pr-12 transition-colors"
                  placeholder="Enter secure password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D1D5DB] hover:text-[#0A0A0A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Validators */}
              <div className="space-y-2 pt-1">
                {passwordValidators.map((v, i) => {
                  const isValid = v.test(formData.password);
                  return (
                    <div key={i} className="flex items-center justify-between text-[11px] transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          isValid ? "bg-[#16835B]" : "bg-[#D1D5DB]"
                        )} />
                        <span className={cn(isValid ? "text-[#16835B] font-bold" : "text-[#6B7280]")}>
                          {v.label}
                        </span>
                      </div>
                      {i === 0 && <span className="font-mono text-[#D1D5DB]">{formData.password.length}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Partner Code */}
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
                  className="w-full p-3 bg-white border border-[#E4E4E4] text-sm outline-none focus:border-[#0A0A0A] animate-in slide-in-from-top-1 duration-200"
                  placeholder="Enter partner code"
                />
              )}
            </div>

            {/* Declaration */}
            <div className="flex items-start gap-3 py-2 group cursor-pointer" onClick={() => setFormData({...formData, isNotUSCitizen: !formData.isNotUSCitizen})}>
              <div className={cn(
                "w-5 h-5 border-2 shrink-0 flex items-center justify-center transition-all",
                formData.isNotUSCitizen ? "bg-[#0055FF] border-[#0055FF]" : "border-[#E4E4E4] group-hover:border-[#0A0A0A]"
              )}>
                {formData.isNotUSCitizen && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <p className="text-[11px] text-[#6B7280] leading-snug group-hover:text-[#0A0A0A] transition-colors">
                I declare and confirm that I am not a citizen or resident of the US for tax purposes.
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg",
                canSubmit 
                  ? "bg-[#FFDE00] text-[#0A0A0A] hover:bg-[#F2D200] hover:scale-[1.01]" 
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
      </main>

      {/* Floating Yellow Chat Trigger */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-[#FFDE00] text-[#0A0A0A] flex items-center justify-center rounded-full shadow-2xl hover:scale-105 transition-all">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>
        </button>
      </div>
    </div>
  );
}