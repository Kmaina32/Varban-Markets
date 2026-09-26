"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { COUNTRIES } from "@/app/lib/countries";
import { ChevronDown, User, Smartphone, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    country: "United Kingdom",
    dialCode: "+44"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial form data from existing profile (especially for Google users)
  useEffect(() => {
    if (profile && !isSaving) {
      setFormData({
        firstName: profile.firstName || profile.fullName?.split(' ')[0] || "",
        middleName: profile.middleName || "",
        lastName: profile.lastName || profile.fullName?.split(' ').slice(1).join(' ') || "",
        phone: profile.phone?.includes(' ') ? profile.phone.split(' ').slice(1).join(' ') : profile.phone || "",
        country: profile.country || "United Kingdom",
        dialCode: profile.phone?.includes(' ') ? profile.phone.split(' ')[0] : "+44"
      });
    }
  }, [profile, isSaving]);

  // Robust completion check
  const isProfileComplete = useMemo(() => {
    if (!profile) return false;
    return !!(profile.firstName && profile.lastName && profile.phone && profile.country);
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    // Only redirect if complete AND we are not currently in the middle of a save process
    if (!authLoading && !profileLoading && isProfileComplete && !isSaving) {
      router.push('/dashboard');
    }
  }, [authLoading, profileLoading, isProfileComplete, user, isSaving, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || isSaving) return;

    setIsSaving(true);
    setError(null);

    const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();
    const cleanPhone = `${formData.dialCode} ${formData.phone}`.trim();
    
    const data = {
      fullName: fullName,
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      lastName: formData.lastName.trim(),
      phone: cleanPhone,
      country: formData.country,
      updatedAt: new Date().toISOString()
    };

    setDoc(doc(db, "users", user.uid), data, { merge: true })
      .then(() => {
        // Use router.replace to avoid back-button issues
        router.replace("/dashboard");
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'write',
          requestResourceData: data,
        });

        errorEmitter.emit('permission-error', permissionError);
        setError("Setup failure: The security vault could not be updated. Check your connection.");
        setIsSaving(false);
      });
  };

  if (authLoading || (profileLoading && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F5] min-h-screen py-16 px-4 flex items-center justify-center">
      <Card className="max-w-md w-full bg-white border-[#E4E4E4] shadow-2xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#0055FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-[#0055FF]" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">Complete Your Profile</h1>
          <p className="text-xs text-[#6B7280] uppercase tracking-widest font-bold">Action required to access the platform</p>
        </div>

        {error && (
          <div className="p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
                <User className="w-3 h-3" /> First Name
              </label>
              <input 
                required 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" 
                placeholder="Legal first name"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
                Middle Name
              </label>
              <input 
                type="text" 
                value={formData.middleName}
                onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" 
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
              Last Name
            </label>
            <input 
              required 
              type="text" 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" 
              placeholder="Legal last name"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
              <Smartphone className="w-3 h-3" /> Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative w-28 shrink-0">
                <select 
                  value={formData.dialCode}
                  onChange={(e) => setFormData({...formData, dialCode: e.target.value})}
                  className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-[#F7F7F5] text-[#0A0A0A] appearance-none focus:outline-none"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6B7280] pointer-events-none" />
              </div>
              <input 
                required 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="flex-grow text-xs p-3 border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" 
                placeholder="7912 345678" 
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Country of Residence
            </label>
            <div className="relative">
              <select 
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full text-xs p-3 border border-[#E4E4E4] rounded-none bg-[#F7F7F5] text-[#0A0A0A] appearance-none focus:outline-none"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
            </div>
          </div>

          <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#16835B] shrink-0" />
            <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
              To keep our community safe, we need these details to confirm your identity and follow international rules.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full btn-institutional-primary py-4"
          >
            {isSaving ? "Updating Ledger..." : "Complete Setup"}
          </button>
        </form>
      </Card>
    </div>
  );
}
