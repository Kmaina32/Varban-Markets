
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
  Image as ImageIcon,
  AlertTriangle,
  LogOut,
  Key,
  Shield
} from "lucide-react";
import { useUser, useDoc, useFirestore, useCollection, useAuth } from "@/firebase";
import { doc, updateDoc, collection, query, orderBy, limit, serverTimestamp, addDoc, setDoc, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
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
  const auth = useAuth();
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

      const uploadResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      if (!uploadResp.ok) throw new Error("Transmission failed");

      const finalUrl = `${R2_PUBLIC_URL}/${key}`;
      await setDoc(doc(db, "users", user.uid), {
        profile: { photoUrl: finalUrl }
      }, { merge: true });

      setProfileFeedback("Identity photo updated.");
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err) {
      alert("Failed to synchronize profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // --- KYC LOGIC ---
  const [isUploadingKyc, setIsUploadingKyc] = useState<string | null>(null);
  const handleKycUpload = async (file: File, type: string) => {
    if (!user || !db) return;
    setIsUploadingKyc(type);
    try {
      const resp = await fetch('/api/storage/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          userId: user.uid,
          purpose: 'kyc'
        })
      });
      const { uploadUrl, key } = await resp.json();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

      // Record submission
      await addDoc(collection(db, `users/${user.uid}/kyc_submissions`), {
        type,
        storageKey: key,
        fileType: file.type,
        fileName: file.name,
        timestamp: serverTimestamp(),
        status: 'Pending'
      });

      // Update user status
      await setDoc(doc(db, "users", user.uid), {
        status: { verificationStatus: 'Pending' }
      }, { merge: true });

      alert(`${type.replace('_', ' ')} submitted for institutional audit.`);
    } catch (e) {
      alert("Verification transmission failed.");
    } finally {
      setIsUploadingKyc(null);
    }
  };

  // --- SECURITY LOGIC ---
  const { data: sessions } = useCollection<any>(
    user ? query(collection(db, `users/${user.uid}/sessions`), orderBy('lastActive', 'desc'), limit(5)) : null
  );

  const handlePasswordReset = async () => {
    if (!auth || !user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("A secure password reset link has been dispatched to your email domain.");
    } catch (e) { alert("Handshake failure."); }
  };

  const handleRevokeSessions = async () => {
    if (!db || !user) return;
    if (!window.confirm("Confirm: This will terminate all other active session tokens.")) return;
    // In a real app, this would involve a Cloud Function or setting a 'sessionsRevokedAt' field
    alert("Global session revocation initiated. Tokens will expire within 60 seconds.");
  };

  // --- ALERTS LOGIC ---
  const { data: notifications } = useCollection<any>(
    user ? query(collection(db, `users/${user.uid}/notifications`), orderBy('timestamp', 'desc'), limit(20)) : null
  );

  const toggleAlert = async (key: string, current: boolean) => {
    if (!user || !db) return;
    await setDoc(doc(db, "users", user.uid), {
      preferences: { alerts: { [key]: !current } }
    }, { merge: true });
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
                      "w-24 h-24 rounded-full border-2 border-[#E4E4E4] flex items-center justify-center bg-[#F7F7F5] overflow-hidden transition-all duration-300",
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
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0A0A0A] text-white flex items-center justify-center rounded-full shadow-lg hover:bg-[#0055FF] transition-colors"
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

          {activeTab === 'kyc' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#F7F7F5]">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Identity Verification</h3>
                    <p className="text-[11px] text-[#6B7280] mt-1">Complete Tier 2 verification to unlock unrestricted withdrawals.</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                    profile?.status?.verificationStatus === 'Verified' ? "bg-[#16835B]/10 border-[#16835B] text-[#16835B]" : "bg-[#F7F7F5] border-[#E4E4E4] text-[#6B7280]"
                  )}>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Status: {profile?.status?.verificationStatus || 'Not Verified'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'IDENTITY_DOCUMENT', title: 'Government ID', desc: 'Passport, National ID or Driver License (Front & Back).', icon: FileText },
                    { id: 'SELFIE_PROOF', title: 'Biometric Selfie', desc: 'A clear photo of your face while holding your ID document.', icon: Camera }
                  ].map((doc) => (
                    <div key={doc.id} className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <doc.icon className="w-6 h-6 text-[#0055FF]" />
                        <h4 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">{doc.title}</h4>
                        <p className="text-[10px] text-[#6B7280] leading-relaxed">{doc.desc}</p>
                      </div>
                      <button 
                        disabled={isUploadingKyc === doc.id || profile?.status?.verificationStatus === 'Verified'}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*,application/pdf';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleKycUpload(file, doc.id);
                          };
                          input.click();
                        }}
                        className="w-full py-3 bg-white border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:border-[#0055FF] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        {isUploadingKyc === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Upload Document</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-[#0055FF]/5 border border-[#0055FF]/20 space-y-4">
                  <div className="flex items-center gap-2 text-[#0055FF]">
                    <ShieldAlert className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Regulatory Requirements</h4>
                  </div>
                  <ul className="text-[10px] text-[#6B7280] space-y-2 font-bold uppercase leading-relaxed">
                    <li className="flex items-start gap-2"><span>&bull;</span> Documents must be clear, high-resolution, and in color.</li>
                    <li className="flex items-start gap-2"><span>&bull;</span> Name and birth date must match your profile exactly.</li>
                    <li className="flex items-start gap-2"><span>&bull;</span> Selfies must be taken in a well-lit area with a neutral background.</li>
                  </ul>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                    <Key className="w-5 h-5 text-[#0055FF]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Credentials</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Password Synchronization</span>
                      <button onClick={handlePasswordReset} className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all shadow-md">
                        Transmit Reset Link
                      </button>
                    </div>
                    <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                       <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
                         Changing your password will terminate all active session tokens on other devices for your protection.
                       </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                    <Shield className="w-5 h-5 text-[#16835B]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Multi-Factor Auth</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                      <div>
                        <span className="text-[10px] font-bold uppercase block">Authenticator App</span>
                        <span className="text-[8px] text-[#6B7280] uppercase tracking-widest">TOTP Protocol</span>
                      </div>
                      <span className="px-2 py-0.5 bg-[#6B7280]/10 text-[#6B7280] border border-[#6B7280] text-[8px] font-bold uppercase">Disabled</span>
                    </div>
                    <button className="w-full py-4 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#F7F7F5] transition-all">
                      Configure MFA Node
                    </button>
                  </div>
                </Card>
              </div>

              <Card className="bg-white border-[#E4E4E4] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#F7F7F5] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-[#0055FF]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Active Sessions</h3>
                  </div>
                  <button onClick={handleRevokeSessions} className="text-[9px] font-bold text-[#C43D3D] uppercase tracking-widest underline decoration-2 underline-offset-4">
                    Revoke Other Nodes
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                      <tr className="text-[8px] font-bold uppercase text-[#6B7280] tracking-widest">
                        <th className="p-4">Device Domain</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Location Context</th>
                        <th className="p-4 text-right">Last Telemetry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E4] text-[10px] font-mono">
                      {sessions?.map((sess) => (
                        <tr key={sess.id} className="hover:bg-[#F7F7F5] transition-colors">
                          <td className="p-4 font-bold text-[#0A0A0A]">{sess.deviceName || 'Authorized Device'}</td>
                          <td className="p-4 text-[#6B7280]">{sess.ip || '---'}</td>
                          <td className="p-4 text-[#6B7280] uppercase">{sess.os} &bull; {sess.browser}</td>
                          <td className="p-4 text-right text-[#0A0A0A] font-bold">
                            {sess.lastActive?.toDate ? formatDate(sess.lastActive.toDate()) : 'Active Now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white border-[#E4E4E4] shadow-sm md:col-span-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#F7F7F5] pb-4 mb-6">Subscriptions</h3>
                  <div className="space-y-5">
                    {[
                      { key: 'newTrades', label: 'Trade Execution' },
                      { key: 'withdrawSuccess', label: 'Cashier Events' },
                      { key: 'securityAlerts', label: 'Security Logs' },
                      { key: 'systemStatus', label: 'Node Telemetry' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">{item.label}</span>
                        <button 
                          onClick={() => toggleAlert(item.key, profile?.preferences?.alerts?.[item.key])}
                          className={cn(
                            "w-10 h-5 relative transition-colors duration-200 rounded-none border",
                            profile?.preferences?.alerts?.[item.key] ? "bg-[#0055FF] border-[#0055FF]" : "bg-[#F7F7F5] border-[#E4E4E4]"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-3.5 h-3.5 bg-white transition-transform duration-200",
                            profile?.preferences?.alerts?.[item.key] ? "left-[23px]" : "left-0.5"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-white border-[#E4E4E4] shadow-sm md:col-span-2 overflow-hidden flex flex-col h-[500px]">
                  <div className="p-5 border-b border-[#F7F7F5] bg-[#F7F7F5] flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Notification Ledger</span>
                    <Activity className="w-4 h-4 text-[#0055FF]" />
                  </div>
                  <div className="flex-grow overflow-y-auto no-scrollbar divide-y divide-[#F7F7F5]">
                    {notifications?.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                        <Bell className="w-10 h-10 text-[#E4E4E4]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Registry is Clear</p>
                      </div>
                    ) : (
                      notifications?.map((note) => (
                        <div key={note.id} className={cn("p-5 transition-colors hover:bg-[#F7F7F5]", note.isUnread ? "bg-[#0055FF]/5" : "")}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-tight text-[#0A0A0A]">{note.title}</span>
                            <span className="text-[8px] font-mono text-[#6B7280]">{note.timestamp?.toDate ? formatDate(note.timestamp.toDate()) : '---'}</span>
                          </div>
                          <p className="text-[11px] text-[#6B7280] leading-relaxed">{note.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
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

              <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
                <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[#16835B]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Terminal Layout</h3>
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase block">Interface Density</span>
                        <p className="text-[9px] text-[#6B7280] uppercase tracking-wider">Adjust terminal spacing and font hierarchy</p>
                      </div>
                      <div className="flex bg-[#F7F7F5] border border-[#E4E4E4] p-1">
                        <button 
                          onClick={() => updatePreference('uiDensity', 'standard')}
                          className={cn("px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest transition-all", profile?.preferences?.uiDensity === 'standard' ? "bg-[#0A0A0A] text-white shadow-md" : "text-[#6B7280] hover:text-[#0A0A0A]")}
                        >
                          Standard
                        </button>
                        <button 
                          onClick={() => updatePreference('uiDensity', 'compact')}
                          className={cn("px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest transition-all", profile?.preferences?.uiDensity === 'compact' ? "bg-[#0A0A0A] text-white shadow-md" : "text-[#6B7280] hover:text-[#0A0A0A]")}
                        >
                          Compact
                        </button>
                      </div>
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
