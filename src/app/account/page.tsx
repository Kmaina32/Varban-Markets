"use client";

import { useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Shield, User, Activity, Check, Save, Smartphone, Globe, AlertCircle } from "lucide-react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { COUNTRIES } from "@/app/lib/countries";
import { cn } from "@/app/lib/utils";

export default function AccountWorkspace() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useTranslation();
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const rawPhone = profile.phone || "";
      const phoneParts = rawPhone.includes(' ') ? rawPhone.split(' ') : ["+44", rawPhone];
      const dialCode = phoneParts.length > 1 ? phoneParts[0] : "+44";
      const number = phoneParts.length > 1 ? phoneParts.slice(1).join(' ') : rawPhone;

      setFormData({
        firstName: profile.firstName || profile.fullName?.split(' ')[0] || "",
        middleName: profile.middleName || "",
        lastName: profile.lastName || profile.fullName?.split(' ').slice(1).join(' ') || "",
        phone: number,
        country: profile.country || "United Kingdom",
        dialCode: dialCode
      });
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || isSaving) return;

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();
      const cleanPhone = `${formData.dialCode} ${formData.phone}`.trim();

      const updateData = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        fullName: fullName,
        phone: cleanPhone,
        country: formData.country,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", user.uid), updateData, { merge: true });
      setSuccessMessage("Profile details updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const personalParams = [
    { label: "Account UID", value: user?.uid?.slice(0, 14).toUpperCase() || "..." },
    { label: "Email Address", value: user?.email || "..." },
    { label: "Verification Level", value: profile?.verificationStatus || "Not Verified" },
    { label: "Base Currency", value: profile?.currency || "USD" }
  ];

  return (
    <AuthedLayout 
      title={t('nav.account')} 
      subtitle={t('pages.accountSubtitle')}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-[#E4E4E4] p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-3 text-[#0055FF] pb-2 border-b border-[#E4E4E4]">
                <User className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">{t('nav.account')}</span>
              </div>
              <div className="space-y-2 text-[11px] font-mono">
                {personalParams.map((p, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-[#F7F7F5] last:border-0">
                    <span className="text-[#6B7280]">{p.label}:</span>
                    <span className="font-bold text-[#0A0A0A] truncate max-w-[120px]">{profileLoading ? "..." : p.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E4] p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-3 text-[#16835B] pb-2 border-b border-[#E4E4E4]">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">{t('nav.security')}</span>
              </div>
              <p className="text-[10px] text-[#6B7280] uppercase leading-relaxed font-bold">
                Keep your legal profile details synchronized with your identity documents for hassle-free withdrawals.
              </p>
            </div>
          </div>

          {/* Main Profile Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#E4E4E4] pb-4 mb-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                    Edit Personal Profile
                  </h3>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-0.5">
                    Update your registered account parameters
                  </p>
                </div>
              </div>

              {successMessage && (
                <div className="mb-6 p-4 bg-[#16835B]/10 border border-[#16835B]/30 text-[10px] font-bold text-[#16835B] uppercase tracking-wide flex items-center space-x-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 bg-[#C43D3D]/10 border border-[#C43D3D]/30 text-[10px] font-bold text-[#C43D3D] uppercase tracking-wide flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full text-xs p-3 border border-[#E4E4E4] bg-[#F7F7F5] focus:outline-none focus:border-[#0A0A0A]"
                      placeholder="First Name"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full text-xs p-3 border border-[#E4E4E4] bg-[#F7F7F5] focus:outline-none focus:border-[#0A0A0A]"
                      placeholder="Middle Name (Optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full text-xs p-3 border border-[#E4E4E4] bg-[#F7F7F5] focus:outline-none focus:border-[#0A0A0A]"
                    placeholder="Last Name"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3" /> Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.dialCode}
                      onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                      className="w-32 text-xs p-3 border border-[#E4E4E4] bg-[#F7F7F5] text-[#0A0A0A] focus:outline-none shrink-0"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.dial_code}>
                          {c.flag} {c.dial_code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-grow text-xs p-3 border border-[#E4E4E4] bg-[#F7F7F5] focus:outline-none focus:border-[#0A0A0A]"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> Country of Residence
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full text-xs p-3 border border-[#E4E4E4] bg-[#F7F7F5] text-[#0A0A0A] focus:outline-none"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-[#E4E4E4] flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-institutional-primary py-3 px-6 flex items-center space-x-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
