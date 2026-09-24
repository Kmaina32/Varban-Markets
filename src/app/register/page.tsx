"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Check, ShieldCheck, User, Mail, Lock, ChevronDown, Eye, EyeOff } from "lucide-react";
import { COUNTRIES } from "@/app/lib/countries";

export default function UnifiedSignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dialCode: "+44",
    country: "United Kingdom",
    password: "",
    confirmPassword: "",
    referralCode: "",
    assent: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const generateReferralCode = () => {
    return 'VRB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Security Mismatch: Passwords do not match.");
        return;
      }
      if (!formData.assent) {
        setError("Policy Compliance: You must accept the Risk Disclosure.");
        return;
      }
      if (!auth || !db) return;
      setLoading(true);

      try {
        let referredByUid = "";
        if (formData.referralCode) {
          const q = query(collection(db, "users"), where("referralCode", "==", formData.referralCode), limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            referredByUid = querySnapshot.docs[0].id;
          } else {
            setLoading(false);
            setError("Invalid Referral Code: The provided code does not exist in our registry.");
            return;
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email.toLowerCase(),
          phone: `${formData.dialCode} ${formData.phone}`,
          country: formData.country,
          balance: 1000.00,
          equity: 1000.00,
          currency: "USD",
          verificationStatus: "Not Verified",
          role: "Trader",
          referralCode: generateReferralCode(),
          referredBy: referredByUid,
          createdAt: new Date().toISOString()
        });

        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Registration Failure: Handshake could not be concluded.");
        setLoading(false);
      }
    }
  };

  const steps = [
    { title: "Identity", icon: User },
    { title: "Contact", icon: Mail },
    { title: "Security", icon: Lock }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex items-center justify-center py-8 md:py-16 px-4">
      <div className="bg-white border border-[#E4E4E4] max-w-5xl w-full shadow-lg flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Left Side: Image (Desktop only) */}
        <div className="hidden lg:block w-1/2 relative">
          <Image
            src="/assets/auth.png"
            alt="Varban Infrastructure"
            fill
            className="object-cover grayscale opacity-10"
          />
          <div className="absolute inset-0 bg-white/40"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Workspace Access</span>
            <h2 className="text-2xl font-bold uppercase text-[#0A0A0A] tracking-tight leading-tight">
              Institutional Grade Trading Infrastructure
            </h2>
            <div className="w-12 h-1 bg-[#0055FF] mt-4"></div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col bg-white">
          <div className="bg-[#F7F7F5] border-b border-[#E4E4E4] p-6 md:p-8 text-[#0A0A0A] relative overflow-hidden shrink-0">
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Varban Markets</span>
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-6">Create Account</h1>
              
              <div className="flex justify-between items-center relative">
                {steps.map((s, i) => {
                  const stepNum = i + 1;
                  const isComplete = step > stepNum;
                  const isActive = step === stepNum;
                  return (
                    <div key={i} className="flex flex-col items-center space-y-2 relative z-10 w-1/3">
                      <div className={`w-8 h-8 flex items-center justify-center border transition-all duration-300 ${
                        isComplete ? "bg-[#16835B] border-[#16835B] text-white" : 
                        isActive ? "bg-[#0055FF] border-[#0055FF] text-white" : 
                        "border-[#E4E4E4] bg-white text-[#6B7280]"
                      }`}>
                        {isComplete ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? "text-[#0A0A0A]" : "text-[#6B7280]"}`}>
                        {s.title}
                      </span>
                    </div>
                  )
                })}
                <div className="absolute top-4 left-0 right-0 h-px bg-[#E4E4E4] -z-0 w-2/3 mx-auto"></div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-12 flex-grow flex flex-col justify-center">
            {error && (
              <div className="mb-6 p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide">
                {error}
              </div>
            )}

            <form onSubmit={handleNext} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b border-[#E4E4E4] pb-2 mb-4">
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Personal Records</h2>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">First Name</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="e.g. John" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Last Name</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="e.g. Doe" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Country of Residence</label>
                    <div className="relative">
                      <select 
                        name="country" 
                        value={formData.country} 
                        onChange={handleChange} 
                        className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] appearance-none"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b border-[#E4E4E4] pb-2 mb-4">
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Contact Matrix</h2>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Email Address</label>
                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]" placeholder="trader@varbanmarkets.com" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="relative w-32 shrink-0">
                        <select 
                          name="dialCode" 
                          value={formData.dialCode} 
                          onChange={handleChange} 
                          className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] appearance-none"
                        >
                          {COUNTRIES.map(c => (
                            <option key={`${c.code}-dial`} value={c.dial_code}>{c.flag} {c.dial_code}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6B7280] pointer-events-none" />
                      </div>
                      <input 
                        required 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        type="tel" 
                        className="flex-grow text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]" 
                        placeholder="7912 345678" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b border-[#E4E4E4] pb-2 mb-4">
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Security & Network</h2>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Create Password</label>
                    <div className="relative">
                      <input 
                        required 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        type={showPassword ? "text" : "password"} 
                        className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] pr-10" 
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
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input 
                        required 
                        name="confirmPassword" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0A0A0A]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#0055FF] block mb-1.5">
                      Referral Code (Optional)
                    </label>
                    <input name="referralCode" value={formData.referralCode} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-[#F7F7F5] text-[#0A0A0A] focus:outline-none focus:border-[#0055FF] font-mono" placeholder="VRB-XXXXXX" />
                  </div>
                  <div className="flex items-start space-x-2 pt-2">
                    <input required type="checkbox" name="assent" checked={formData.assent} onChange={handleChange} className="mt-0.5 accent-[#0055FF]" />
                    <span className="text-[9px] text-[#6B7280] leading-relaxed uppercase font-bold">
                      I accept the <Link href="/risk-disclosure" className="text-[#0055FF] underline">Risk Disclosure</Link> and platform protocols.
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-between gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="w-1/3 py-4 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-colors"
                  >
                    Previous
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-institutional-primary py-4 shadow-sm ${step > 1 ? 'w-2/3' : 'w-full'}`}
                >
                  {step === 3 ? (loading ? "Processing..." : "Confirm & Commit") : "Next Procedure"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E4E4E4] text-center">
              <span className="text-[11px] text-[#6B7280] uppercase tracking-wide">Already authorized? </span>
              <Link href="/login" className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest underline decoration-[#0055FF] decoration-2 underline-offset-4 ml-1">Sign In</Link>
            </div>
          </div>

          <div className="bg-[#F7F7F5] border-t border-[#E4E4E4] p-4 flex items-center justify-center space-x-2 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16835B]" />
            <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.2em]">Secure Infrastructure Handshake Engaged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
