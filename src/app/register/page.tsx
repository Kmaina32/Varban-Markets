
"use client";

/**
 * @fileOverview Unified Signup Page.
 * Integrated with Supabase Auth, Institutional Terms Modal, and Security Rate Limiting.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { Check, User, Mail, Lock, ArrowLeft, Loader2, X, FileText, ShieldAlert } from "lucide-react";
import { COUNTRIES } from "@/app/lib/countries";
import { detectLocation } from "@/app/lib/geolocation-service";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { cn } from "@/app/lib/utils";

export default function UnifiedSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dialCode: "+44",
    country: "United Kingdom",
    password: "",
    confirmPassword: "",
    assent: false
  });

  useEffect(() => {
    const performGeoLookup = async () => {
      const geo = await detectLocation();
      if (geo && geo.country_name) {
        const matchedCountry = COUNTRIES.find(c => 
          c.name.toLowerCase() === geo.country_name.toLowerCase() || 
          c.code === geo.country_code
        );
        if (matchedCountry) {
          setFormData(prev => ({
            ...prev,
            country: matchedCountry.name,
            dialCode: matchedCountry.dial_code
          }));
        }
      }
    };
    performGeoLookup();
  }, []);

  // Cooldown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!formData.assent) {
        setError("Acceptance of Terms is mandatory for regulatory compliance.");
        return;
      }
      
      setLoading(true);

      try {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              full_name: fullName,
              country: formData.country,
              phone: `${formData.dialCode} ${formData.phone}`
            }
          }
        });

        if (signUpError) {
          // Handle Rate Limiting (Error 429)
          if (signUpError.status === 429 || signUpError.message.toLowerCase().includes('rate limit')) {
            setCooldown(60);
            return;
          }
          throw signUpError;
        }

        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const steps = [
    { title: "Details", icon: User },
    { title: "Contact", icon: Mail },
    { title: "Security", icon: Lock }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-[calc(100vh-64px)] flex items-center justify-center py-8 md:py-16 px-4 relative">
      
      {/* INSTITUTIONAL TERMS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[600] bg-[#0A0A0A]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-[#E4E4E4] w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Master Client Agreement</h3>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto no-scrollbar text-xs leading-relaxed text-[#6B7280] space-y-6">
              <div className="space-y-3">
                <h4 className="font-bold text-[#0A0A0A] uppercase tracking-wider">1. TRADING PROTOCOL</h4>
                <p>Varban Markets provides high-speed execution for synthetic and derivative contracts. By proceeding, you acknowledge that all settlements are deterministic and based on multi-source index aggregation.</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-[#0A0A0A] uppercase tracking-wider text-[#C43D3D]">2. RISK DISCLOSURE</h4>
                <p>Derivative trading involves significant risk of capital loss. 84.12% of retail traders lose capital. You accept that your committed stake is the maximum exposure per contract and that markets can be highly volatile.</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-[#0A0A0A] uppercase tracking-wider">3. AML & COMPLIANCE</h4>
                <p>Identity verification (KYC) is required for all withdrawals. We strictly enforce a "No Third-Party Payment" policy. Funds must originate from accounts in your legal name.</p>
              </div>
              <div className="p-4 bg-[#F7F7F5] border-l-4 border-[#0055FF] font-bold text-[#0A0A0A] uppercase leading-relaxed">
                "I HEREBY ACCEPT THE TERMS OF SERVICE AND ACKNOWLEDGE THE FULL RISK OF CAPITAL LOSS ASSOCIATED WITH DERIVATIVE TRADING."
              </div>
            </div>
            <div className="p-6 border-t border-[#E4E4E4] bg-white text-right shrink-0">
               <button 
                onClick={() => { setShowTermsModal(false); setFormData({...formData, assent: true}); }}
                className="btn-institutional-primary px-10"
               >
                 Accept & Continue
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E4E4E4] max-w-5xl w-full shadow-lg flex flex-col md:flex-row overflow-hidden min-h-[600px] relative">
        <Link href="/" className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors lg:text-white lg:hover:text-[#0055FF]">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        
        <div className="hidden lg:block w-1/2 relative">
          <Image src={placeholderImages.auth.url} alt="Varban Markets Welcome" fill className="object-cover" priority data-ai-hint={placeholderImages.auth.hint} />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Create Account</span>
            <h2 className="text-2xl font-bold uppercase text-white tracking-tight leading-tight">Join the world's most stable trading network.</h2>
            <div className="w-12 h-1 bg-[#0055FF] mt-4"></div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col bg-white">
          <div className="bg-[#F7F7F5] border-b border-[#E4E4E4] p-6 md:p-8 text-[#0A0A0A] shrink-0">
            <div className="mt-6 lg:mt-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Registration Workspace</span>
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-6">Create Account</h1>
              
              <div className="flex justify-between items-center relative">
                {steps.map((s, i) => {
                  const stepNum = i + 1;
                  const isComplete = step > stepNum;
                  const isActive = step === stepNum;
                  return (
                    <div key={i} className="flex flex-col items-center space-y-2 relative z-10 w-1/3">
                      <div className={cn(
                        "w-8 h-8 flex items-center justify-center border transition-all duration-300",
                        isComplete ? "bg-[#16835B] border-[#16835B] text-white" : 
                        isActive ? "bg-[#0055FF] border-[#0055FF] text-white" : 
                        "border-[#E4E4E4] bg-white text-[#6B7280]"
                      )}>
                        {isComplete ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={cn("text-[8px] font-bold uppercase tracking-widest", isActive ? "text-[#0A0A0A]" : "text-[#6B7280]")}>{s.title}</span>
                    </div>
                  )
                })}
                <div className="absolute top-4 left-0 right-0 h-px bg-[#E4E4E4] -z-0 w-2/3 mx-auto"></div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-12 flex-grow flex flex-col justify-center">
            
            {/* INSTITUTIONAL SECURITY COOLDOWN */}
            {cooldown > 0 && (
              <div className="mb-6 p-6 bg-[#C43D3D]/5 border border-[#C43D3D]/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-4">
                  <ShieldAlert className="w-6 h-6 text-[#C43D3D] shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-[#C43D3D] uppercase tracking-widest leading-relaxed">
                      Security Protection Active
                    </p>
                    <p className="text-[10px] text-[#6B7280] uppercase mt-1">
                      To prevent automated attacks, you can only request this after {cooldown} seconds.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && cooldown === 0 && (
              <div className="mb-6 p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide">
                {error}
              </div>
            )}
            
            <form onSubmit={handleNext} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">First Name</label>
                      <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] focus:border-[#0A0A0A] outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Last Name</label>
                      <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] focus:border-[#0A0A0A] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Country of Residence</label>
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full text-xs p-3 border border-[#E4E4E4] bg-white">
                      {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Primary Email</label>
                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full text-xs p-3 border border-[#E4E4E4] focus:border-[#0A0A0A] outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Phone Number</label>
                    <div className="flex gap-2">
                      <select name="dialCode" value={formData.dialCode} onChange={handleChange} className="p-3 border border-[#E4E4E4] text-xs">
                        {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
                      </select>
                      <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="flex-grow text-xs p-3 border border-[#E4E4E4] outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Create Strong Password</label>
                    <input required name="password" value={formData.password} onChange={handleChange} type="password" placeholder="At least 6 characters" className="w-full text-xs p-3 border border-[#E4E4E4] outline-none focus:border-[#0055FF]" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Confirm Password</label>
                    <input required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" className="w-full text-xs p-3 border border-[#E4E4E4] outline-none focus:border-[#0055FF]" />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input required type="checkbox" name="assent" checked={formData.assent} onChange={handleChange} className="mt-0.5 accent-[#0055FF] w-4 h-4" />
                    <button 
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[9px] font-bold uppercase text-[#6B7280] hover:text-[#0055FF] transition-colors underline"
                    >
                      I accept the terms of service and risk disclosure.
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-between gap-4">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="w-1/3 py-4 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-colors">
                    Back
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={loading || cooldown > 0} 
                  className={cn(
                    "btn-institutional-primary py-4 transition-all duration-300", 
                    step > 1 ? 'w-2/3' : 'w-full',
                    cooldown > 0 && "opacity-50 cursor-not-allowed grayscale bg-[#6B7280] border-[#6B7280]"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting...</span>
                    </div>
                  ) : (
                    step === 3 ? (cooldown > 0 ? `RETRY IN ${cooldown}S` : "Finalize Account") : "Continue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
