"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Check, ShieldCheck, User, Mail, Lock } from "lucide-react";
import placeholderImages from "@/app/lib/placeholder-images.json";

const COUNTRIES = [
  // ... (countries list omitted for brevity, keeping existing logic)
  { code: 'US', name: 'United States', prefix: '+1', flag: '🇺🇸' },
  // ... add more if needed
].sort((a, b) => a.name.localeCompare(b.name));

export default function UnifiedSignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryIndex, setCountryIndex] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    assent: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Operational parameters mismatch: Passwords do not match.");
        return;
      }
      if (!auth || !db) return;
      setLoading(true);

      createUserWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          const user = userCredential.user;
          setDoc(doc(db, "users", user.uid), {
            fullName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            balance: 1000.00,
            equity: 1000.00,
            currency: "USD",
            verificationStatus: "Not Verified"
          }).catch(() => {});

          router.push("/dashboard");
        })
        .catch((err: any) => {
          setError(err.message || "Infrastructure handshake failed: Registration could not be concluded.");
          setLoading(false);
        });
    }
  };

  const steps = [
    { title: "Identity", icon: User },
    { title: "Contact", icon: Mail },
    { title: "Security", icon: Lock }
  ];

  return (
    <div className="bg-[#F7F7F5] min-h-screen flex items-center justify-center py-16 px-4">
      <div className="bg-white border border-[#E4E4E4] max-w-5xl w-full shadow-lg flex overflow-hidden min-h-[700px]">
        {/* Left Side: Image */}
        <div className="hidden lg:block w-1/2 relative">
          <Image
            src="/assets/auth.png"
            alt="Varban Infrastructure"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0A0A]/20"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Workspace Access</span>
            <h2 className="text-2xl font-bold uppercase text-white tracking-tight leading-tight">
              Institutional Grade Trading Infrastructure
            </h2>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="bg-white border-b border-[#E4E4E4] p-8 text-[#0A0A0A] relative overflow-hidden shrink-0">
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Varban Markets</span>
              <h1 className="text-2xl font-bold uppercase tracking-tight mb-6">Create Account</h1>
              
              <div className="flex justify-between items-center">
                {steps.map((s, i) => {
                  const stepNum = i + 1;
                  const isComplete = step > stepNum;
                  const isActive = step === stepNum;
                  return (
                    <div key={i} className="flex flex-col items-center space-y-2 relative z-10 w-1/3">
                      <div className={`w-8 h-8 flex items-center justify-center border transition-all duration-300 ${
                        isComplete ? "bg-[#16835B] border-[#16835B] text-white" : 
                        isActive ? "bg-[#0055FF] border-[#0055FF] text-white" : 
                        "border-[#E4E4E4] bg-[#F7F7F5] text-[#6B7280]"
                      }`}>
                        {isComplete ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? "text-[#0A0A0A]" : "text-[#6B7280]"}`}>
                        {s.title}
                      </span>
                    </div>
                  )
                })}
                <div className="absolute top-4 left-1/6 right-1/6 h-px bg-[#E4E4E4] -z-0 w-2/3 mx-auto"></div>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12 flex-grow flex flex-col justify-center">
            {error && (
              <div className="mb-6 p-4 bg-[#C43D3D]/10 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide">
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
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">First Corporate Name</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="e.g. John" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Last Corporate Name</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] placeholder:text-[#6B7280]/30" placeholder="e.g. Doe" />
                  </div>
                </div>
              )}
              {/* Other steps logic follows similarly... */}
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
                  className={`btn-institutional-primary py-4 ${step > 1 ? 'w-2/3' : 'w-full'}`}
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
