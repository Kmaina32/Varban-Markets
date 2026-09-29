
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  User, 
  Activity, 
  Check, 
  Globe, 
  ShieldCheck,
  Lock,
  Bell,
  Settings,
  Fingerprint,
  Plus,
  Loader2,
  DollarSign,
  Clock,
  MapPin,
  Wifi,
  ShieldAlert,
  FileText,
  Upload,
  Smartphone,
  Laptop,
  X,
  Languages,
  Zap,
  Layout,
  CheckCircle2,
  Trash2,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import { useUser, useDoc, useFirestore, useCollection, useAuth } from "@/firebase";
import { doc, updateDoc, collection, query, orderBy, limit, serverTimestamp, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { useTranslation } from "@/app/lib/i18n-context";
import { COUNTRIES } from "@/app/lib/countries";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";
import { R2_PUBLIC_URL } from "@/app/lib/r2-service";

type AccountTab = 'profile' | 'kyc' | 'security' | 'alerts' | 'display';

const TIMEZONES = [
  { label: "UTC -08:00 (PT)", value: "UTC-8" },
  { label: "UTC -05:00 (ET)", value: "UTC-5" },
  { label: "UTC +00:00 (GMT)", value: "UTC+0" },
  { label: "UTC +01:00 (CET)", value: "UTC+1" },
  { label: "UTC +03:00 (MSK)", value: "UTC+3" },
  { label: "UTC +05:30 (IST)", value: "UTC+5.5" },
  { label: "UTC +08:00 (HKT)", value: "UTC+8" },
  { label: "UTC +09:00 (JST)", value: "UTC+9" }
];

export default function AccountClient() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatNumber, formatDate } = useTranslation();
  
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as AccountTab;
    if (tabParam && ['profile', 'kyc', 'security', 'alerts', 'display'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // --- PROFILE LOGIC ---
  const [profileForm, setProfileForm] = useState({
    firstName: "", lastName: "", phone: "", country: "United Kingdom", dialCode: "+44"
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.profile) {
      const p = profile.profile;
      const rawPhone = p.phone || "";
      const phoneParts = rawPhone.split(' ');
      setProfileForm({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        phone: phoneParts.length > 1 ? phoneParts.slice(1).join(' ') : rawPhone,
        country: p.country || "United Kingdom",
        dialCode: phoneParts.length > 1 ? phoneParts[0] : "+44"
      });
    }
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || isSavingProfile) return;
    setIsSavingProfile(true);
    try {
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
      const cleanPhone = `${profileForm.dialCode} ${profileForm.phone}`.trim();
      
      await setDoc(doc(db, "users", user.uid), {
        profile: {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          fullName: fullName,
          phone: cleanPhone,
          country: profileForm.country,
        }
      }, { merge: true });
      
      setProfileFeedback("Profile updated successfully.");
      setTimeout(() => setProfileFeedback(null), 4000);
    } catch (err) { alert("Failed to save changes."); }
    finally { setIsSavingProfile(false); }
  };

  const handlePhotoClick = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !db) return;

    if (!file.type.startsWith('image/')) {
      alert("Invalid format: Please select a JPEG or PNG image.");
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // 1. Get Presigned URL with Institutional Path
      const resp = await fetch('/api/storage/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          userId: user.uid,
          userName: profile?.profile?.fullName || user.email?.split('@')[0],
          purpose: 'profile'
        })
      });

      const { uploadUrl, key } = await resp.json();
      if (!uploadUrl) throw new Error("Storage node unreachable");

      // 2. Upload to R2
      const uploadResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      if (!uploadResp.ok) throw new Error("Transmission failed");

      // 3. Update Firestore using setDoc merge
      const finalUrl = `${R2_PUBLIC_URL}/${key}`;
      await setDoc(doc(db, "users", user.uid), {
        profile: {
          photoUrl: finalUrl
        }
      }, { merge: true });

      setProfileFeedback("Identity photo updated.");
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to synchronize profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const updatePreference = async (key: string, value: any) => {
    if (!user || !db) return;
    try {
      await setDoc(doc(db, "users", user.uid), { 
        preferences: { [key]: value } 
      }, { merge: true });
    } catch (e) {}
  };

  return (
    <AuthedLayout title="Account Hub" subtitle="Manage your identity and workspace settings">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'kyc', label: 'KYC', icon: ShieldCheck },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'display', label: 'Display', icon: Settings },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AccountTab)} className={cn("flex-1 min-w-[110px] py-4 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 border-b-2", activeTab === tab.id ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]")}>
              <tab.icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-8 bg-white border-[#E4E4E4] lg:col-span-2 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 border-b border-[#F7F7F5] pb-8">
                  <div className="relative group">
                    <div className={cn(
                      "w-24 h-24 rounded-none border-2 border-[#E4E4E4] flex items-center justify-center bg-[#F7F7F5] overflow-hidden transition-all duration-300",
                      isUploadingPhoto ? "opacity-50" : "group-hover:border-[#0055FF]"
                    )}>
                      {profile?.profile?.photoUrl ? (
                        <img src={profile.profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-[#6B7280]" />
                      )}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                          <Loader2 className="w-6 h-6 text-[#0055FF] animate-spin" />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handlePhotoClick}
                      disabled={isUploadingPhoto}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0A0A0A] text-white flex items-center justify-center shadow-lg hover:bg-[#0055FF] transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      type="file" 
                      ref={photoInputRef} 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em] block mb-1">Institutional Identity</span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">
                      {profile?.profile?.fullName || "Account Profile"}
                    </h3>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed mt-1 max-w-sm">
                      Update your account photo and personal details. Your identity is verified against submitted compliance documents.
                    </p>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-[#6B7280]">First Name</label><input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0055FF]" required /></div>
                    <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-[#6B7280]">Last Name</label><input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0055FF]" required /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Phone Number</label>
                    <div className="flex gap-2">
                      <select value={profileForm.dialCode} onChange={e => setProfileForm({...profileForm, dialCode: e.target.value})} className="p-3 border border-[#E4E4E4] text-xs bg-[#F7F7F5] outline-none">
                        {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
                      </select>
                      <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="flex-grow p-3 border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF]" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Country</label>
                    <select value={profileForm.country} onChange={e => setProfileForm({...profileForm, country: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white outline-none">
                      {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  {profileFeedback && <div className="p-3 bg-[#16835B]/10 border border-[#16835B] text-[9px] font-bold text-[#16835B] uppercase">{profileFeedback}</div>}
                  <button type="submit" disabled={isSavingProfile} className="w-full btn-institutional-primary py-4">{isSavingProfile ? "Synchronizing..." : "Save Identity Changes"}</button>
                </form>
              </Card>

              <div className="space-y-6">
                <Card className="p-6 bg-white border-[#E4E4E4] border-l-4 border-l-[#0055FF] shadow-sm flex flex-col space-y-4">
                  <span className="text-[8px] font-bold uppercase text-[#6B7280] tracking-widest">System Metadata</span>
                  <div><span className="text-[8px] uppercase text-[#6B7280] block mb-1">Entity Reference</span><p className="text-[10px] font-mono font-bold truncate text-[#0A0A0A] bg-[#F7F7F5] p-2 border border-[#E4E4E4]">{user?.uid}</p></div>
                  <div><span className="text-[8px] uppercase text-[#6B7280] block mb-1">Contact Domain</span><p className="text-[10px] font-mono font-bold truncate text-[#0A0A0A]">{profile?.profile?.email || user?.email}</p></div>
                  <div><span className="text-[8px] uppercase text-[#6B7280] block mb-1">Authority Level</span><p className="text-[10px] font-bold uppercase text-[#0055FF]">{profile?.status?.role || "Trader"}</p></div>
                </Card>

                <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
                    Personal detail modifications are logged in the immutable security ledger. Significant changes may trigger a KYC re-verification audit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
                <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#0055FF]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Localization</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Interface Language</label>
                    <select value={profile?.preferences?.language || 'ENGLISH'} onChange={(e) => updatePreference('language', e.target.value)} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white outline-none">
                      <option value="ENGLISH">English</option>
                      <option value="FRENCH">Français</option>
                      <option value="SPANISH">Español</option>
                      <option value="PORTUGUESE">Português</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">System Timezone</label>
                    <select value={profile?.preferences?.timezone || 'UTC+0'} onChange={(e) => updatePreference('timezone', e.target.value)} className="w-full p-3 border border-[#E4E4E4] text-xs font-mono font-bold bg-white outline-none">
                      {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthedLayout>
  );
}
