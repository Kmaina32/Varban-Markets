
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
  Camera
} from "lucide-react";
import { useUser, useDoc, useFirestore, useCollection, useAuth } from "@/firebase";
import { doc, updateDoc, collection, query, orderBy, limit, serverTimestamp, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { startRegistration } from "@simplewebauthn/browser";
import { useTranslation } from "@/app/lib/i18n-context";
import { COUNTRIES } from "@/app/lib/countries";
import { detectLocation, GeolocationData } from "@/app/lib/geolocation-service";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";

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
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatNumber, formatDate } = useTranslation();
  
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const kycSubQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, `users/${user.uid}/kyc_submissions`);
  }, [db, user]);
  const { data: submissions, loading: subLoading } = useCollection<any>(kycSubQuery);

  const alertsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, `users/${user.uid}/notifications`), orderBy("timestamp", "desc"), limit(20));
  }, [db, user]);
  const { data: notifications, loading: notificationsLoading } = useCollection<any>(alertsQuery);

  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadType, setActiveUploadType] = useState<string | null>(null);

  const [showKycTerms, setShowKycTerms] = useState(false);
  const [kycTermsStep, setKycTermsStep] = useState(0);

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
      await updateDoc(doc(db, "users", user.uid), {
        "profile.firstName": profileForm.firstName.trim(),
        "profile.lastName": profileForm.lastName.trim(),
        "profile.fullName": fullName,
        "profile.phone": cleanPhone,
        "profile.country": profileForm.country,
      });
      setProfileFeedback("Profile updated successfully.");
      setTimeout(() => setProfileFeedback(null), 4000);
    } catch (err) { alert("Failed to save changes."); }
    finally { setIsSavingProfile(false); }
  };

  // --- SECURITY & PREFERENCES LOGIC ---
  const updatePreference = async (key: string, value: any) => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { [`preferences.${key}`]: value });
    } catch (e) {}
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Verified': return { label: 'Verified', color: 'text-[#16835B]', bg: 'bg-[#16835B]/5', border: 'border-[#16835B]' };
      case 'Pending': return { label: 'Under Review', color: 'text-[#C9A227]', bg: 'bg-[#C9A227]/5', border: 'border-[#C9A227]' };
      case 'Rejected': return { label: 'Action Needed', color: 'text-[#C43D3D]', bg: 'bg-[#C43D3D]/5', border: 'border-[#C43D3D]' };
      default: return { label: 'Not Verified', color: 'text-[#6B7280]', bg: 'bg-[#F7F7F5]', border: 'border-[#E4E4E4]' };
    }
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
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-[#6B7280]">First Name</label><input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase" required /></div>
                    <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-[#6B7280]">Last Name</label><input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase" required /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Phone Number</label>
                    <div className="flex gap-2">
                      <select value={profileForm.dialCode} onChange={e => setProfileForm({...profileForm, dialCode: e.target.value})} className="p-3 border border-[#E4E4E4] text-xs bg-[#F7F7F5]">
                        {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
                      </select>
                      <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="flex-grow p-3 border border-[#E4E4E4] text-xs font-mono" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Country</label>
                    <select value={profileForm.country} onChange={e => setProfileForm({...profileForm, country: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white">
                      {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  {profileFeedback && <div className="p-3 bg-[#16835B]/10 border border-[#16835B] text-[9px] font-bold text-[#16835B] uppercase">{profileFeedback}</div>}
                  <button type="submit" disabled={isSavingProfile} className="w-full btn-institutional-primary py-4">{isSavingProfile ? "Saving..." : "Save Profile"}</button>
                </form>
              </Card>
              <Card className="p-6 bg-white border-[#E4E4E4] border-l-4 border-l-[#0055FF] shadow-sm flex flex-col space-y-4">
                <span className="text-[8px] font-bold uppercase text-[#6B7280]">Account Information</span>
                <div><span className="text-[8px] uppercase text-[#6B7280]">Internal ID</span><p className="text-xs font-mono font-bold truncate">{user?.uid}</p></div>
                <div><span className="text-[8px] uppercase text-[#6B7280]">Registered Email</span><p className="text-xs font-mono font-bold truncate">{profile?.profile?.email || user?.email}</p></div>
              </Card>
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
                    <select value={profile?.preferences?.language || 'ENGLISH'} onChange={(e) => updatePreference('language', e.target.value)} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white">
                      <option value="ENGLISH">English</option>
                      <option value="FRENCH">Français</option>
                      <option value="SPANISH">Español</option>
                      <option value="PORTUGUESE">Português</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">System Timezone</label>
                    <select value={profile?.preferences?.timezone || 'UTC+0'} onChange={(e) => updatePreference('timezone', e.target.value)} className="w-full p-3 border border-[#E4E4E4] text-xs font-mono font-bold bg-white">
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
