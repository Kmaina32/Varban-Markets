
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, limit, getDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Check, User, Mail, Lock, ChevronDown, Eye, EyeOff, X, ArrowRight, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { COUNTRIES } from "@/app/lib/countries";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { cn } from "@/app/lib/utils";

export default function UnifiedSignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Terms Wizard State
  const [showTermsWizard, setShowTermsWizard] = useState(false);
  const [termsStep, setTermsStep] = useState(0);
  const [hasFinishedTerms, setHasFinishedTerms] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
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

  const handleGoogleSignUp = async () => {
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
        await setDoc(userRef, {
          fullName: user.displayName || "",
          email: user.email?.toLowerCase() || "",
          balance: 1000.00,
          equity: 1000.00,
          currency: "USD",
          verificationStatus: "Not Verified",
          role: "Trader",
          referralCode: generateReferralCode(),
          createdAt: new Date().toISOString()
        });
      }
      
      router.push("/dashboard");
    } catch (err: any) {
      setError("Google sign up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
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
        setError("Please review and accept the terms to continue.");
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
            setError("The referral code you entered is invalid.");
            return;
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();

        await setDoc(doc(db, "users", user.uid), {
          fullName: fullName,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
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
        setError(err.message || "Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  };

  const steps = [
    { title: "Details", icon: User },
    { title: "Contact", icon: Mail },
    { title: "Security", icon: Lock }
  ];

  const TERMS_CONTENT = [
    {
      title: "1. Terms of Service",
      content: "Varban Markets provides an electronic trading platform for institutional and retail users. By creating an account, you agree to these terms electronically. According to Saint Lucia law, this electronic agreement is as legally binding as a physical contract. You are responsible for keeping your login details safe."
    },
    {
      title: "2. Privacy Policy",
      content: "We collect your name, email, phone, address, and ID copies to verify your identity and prevent fraud. We use advanced encryption to protect your data. You have the right to ask for a copy of your data or correct your profile information at any time."
    },
    {
      title: "3. Risk Warning",
      content: "IMPORTANT: Trading derivatives and synthetic contracts is high-risk. You can lose all of your money very quickly. Prices can change instantly and move against you without warning. We do not guarantee profits or provide financial advice."
    },
    {
      title: "4. Identity Rules (AML/KYC)",
      content: "We verify the identity of every trader. Level 1 (Basic) handles up to $2,000 in deposits. Level 2 (Verified) requires an ID scan and selfie. Level 3 (Full) requires proof of address. You must only use bank accounts or wallets in your own name."
    },
    {
      title: "5. Trading Rules",
      content: "We execute trades at the exact price received from our providers. Results are determined at the exact second of expiration. Closing trades early returns a fixed 35% payout of your initial amount."
    },
    {
      title: "6. Fees & Charges",
      content: "We do not charge commissions on trades. Withdrawals carry a small network fee (for crypto) or processing fee (for bank transfers). Currency conversion fees may apply up to 1.5%."
    },
    {
      title: "7. Complaints Procedure",
      content: "If you have a problem, email support@varbanmarkets.com with your order ID and a description. We aim to confirm receipt in 24 hours and resolve most issues within 14 business days."
    },
    {
      title: "8. Market Data",
      content: "Market prices come from global providers. While we aim for accuracy, data is provided 'as-is'. You are not allowed to copy or scrape this data for external use."
    }
  ];

  const handleNextTerms = () => {
    if (termsStep < TERMS_CONTENT.length - 1) {
      setTermsStep(termsStep + 1);
    } else {
      setHasFinishedTerms(true);
      setShowTermsWizard(false);
    }
  };

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex items-center justify-center py-8 md:py-16 px-4">
      <div className="bg-white border border-[#E4E4E4] max-w-5xl w-full shadow-lg flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        <div className="hidden lg:block w-1/2 relative">
          <Image
            src={placeholderImages.auth.url}
            alt="Varban Markets Welcome"
            fill
            className="object-cover"
            priority
            data-ai-hint={placeholderImages.auth.hint}
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Create Account</span>
            <h2 className="text-2xl font-bold uppercase text-white tracking-tight leading-tight">
              Join thousands of traders worldwide.
            </h2>
            <div className="w-12 h-1 bg-[#0055FF] mt-4"></div>
          </div>
        </div>

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

            {step === 1 && (
              <div className="mb-8 space-y-4 animate-in fade-in duration-300">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  className="w-full py-4 border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-[#F7F7F5] transition-colors"
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />}
                  <span>Sign up with Google</span>
                </button>
                <div className="relative py-2 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E4E4E4]"></span></div>
                  <span className="relative bg-white px-3 text-[8px] font-bold uppercase text-[#6B7280] tracking-[0.2em]">Or use email</span>
                </div>
              </div>
            )}

            <form onSubmit={handleNext} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border-b border-[#E4E4E4] pb-2 mb-4">
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Personal Details</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">First Name</label>
                      <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="e.g. John" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Middle Name</label>
                      <input name="middleName" value={formData.middleName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="Optional" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Last Name</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="e.g. Doe" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Country</label>
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
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Contact Information</h2>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Email Address</label>
                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]" placeholder="support@varbanmarkets.com" />
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
                    <h2 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-[0.15em]">Secure Your Account</h2>
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

                  <div className="bg-[#F7F7F5] p-4 border border-[#E4E4E4] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#0A0A0A]">Legal Agreement</span>
                      {hasFinishedTerms ? (
                        <span className="text-[8px] font-bold uppercase bg-[#16835B] text-white px-2 py-0.5">Reviewed</span>
                      ) : (
                        <span className="text-[8px] font-bold uppercase bg-[#C9A227] text-white px-2 py-0.5">Pending Review</span>
                      )}
                    </div>
                    <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase font-bold">
                      You must review all 8 mandatory legal documents before you can accept the risk disclosure and rules.
                    </p>
                    <button 
                      type="button"
                      onClick={() => setShowTermsWizard(true)}
                      className="w-full py-2 bg-white border border-[#E4E4E4] text-[9px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0055FF]" />
                      <span>{hasFinishedTerms ? "Re-Review Documents" : "Review Terms & Conditions"}</span>
                    </button>
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <input 
                      required 
                      type="checkbox" 
                      name="assent" 
                      checked={formData.assent} 
                      onChange={handleChange} 
                      disabled={!hasFinishedTerms}
                      className={cn(
                        "mt-0.5 accent-[#0055FF]",
                        !hasFinishedTerms && "opacity-20 cursor-not-allowed"
                      )} 
                    />
                    <span className={cn(
                      "text-[9px] leading-relaxed uppercase font-bold",
                      hasFinishedTerms ? "text-[#6B7280]" : "text-[#6B7280]/40"
                    )}>
                      I confirm that I have read, understood, and accept the Risk Warning and all platform rules.
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
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || (step === 3 && !hasFinishedTerms)}
                  className={cn(
                    "btn-institutional-primary py-4 shadow-sm",
                    step > 1 ? 'w-2/3' : 'w-full',
                    step === 3 && !hasFinishedTerms && "opacity-20 cursor-not-allowed bg-[#E4E4E4] border-[#E4E4E4] text-[#6B7280]"
                  )}
                >
                  {step === 3 ? (loading ? "Creating account..." : "Complete Registration") : "Continue"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E4E4E4] text-center">
              <span className="text-[11px] text-[#6B7280] uppercase tracking-wide">Already have an account? </span>
              <Link href="/login" className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest underline decoration-[#0055FF] decoration-2 underline-offset-4 ml-1">Sign In</Link>
            </div>
          </div>
        </div>
      </div>

      {showTermsWizard && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-[#E4E4E4] w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5] shrink-0">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Mandatory Legal Review</h3>
                <p className="text-[9px] text-[#6B7280] font-mono mt-1 uppercase">Document {termsStep + 1} of {TERMS_CONTENT.length}</p>
              </div>
              <button 
                onClick={() => setShowTermsWizard(false)}
                className="p-2 hover:bg-[#E4E4E4] transition-colors"
              >
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <div className="h-1 bg-[#E4E4E4] w-full shrink-0">
              <div 
                className="h-full bg-[#0055FF] transition-all duration-300"
                style={{ width: `${((termsStep + 1) / TERMS_CONTENT.length) * 100}%` }}
              ></div>
            </div>

            <div className="p-8 md:p-12 overflow-y-auto flex-grow bg-white text-[#333333] text-sm leading-relaxed">
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A] mb-6 border-b border-[#E4E4E4] pb-4">
                {TERMS_CONTENT[termsStep].title}
              </h2>
              <div className="space-y-4">
                <p>{TERMS_CONTENT[termsStep].content}</p>
                <div className="p-6 bg-[#F7F7F5] border-l-4 border-[#0055FF] text-xs text-[#6B7280] font-bold uppercase leading-relaxed">
                  By clicking next, you confirm that you have read and understood this section of our platform rules and legal standards.
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5] shrink-0">
              <button 
                type="button"
                disabled={termsStep === 0}
                onClick={() => setTermsStep(termsStep - 1)}
                className={cn(
                  "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                  termsStep === 0 ? "text-[#6B7280]/20 cursor-not-allowed" : "text-[#6B7280] hover:text-[#0A0A0A]"
                )}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Section</span>
              </button>

              <button 
                type="button"
                onClick={handleNextTerms}
                className="px-8 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-colors flex items-center gap-2 shadow-md"
              >
                <span>{termsStep === TERMS_CONTENT.length - 1 ? "Finish & Accept" : "Next Section"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
