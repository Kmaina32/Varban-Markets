
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
    if (searchParams.get('tab') === 'verification') setActiveTab('kyc');
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'security' && !geoData) {
      detectLocation().then(data => setGeoData(data));
    }
  }, [activeTab, geoData]);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/account?${params.toString()}`);
  };

  // --- PROFILE LOGIC ---
  const [profileForm, setProfileForm] = useState({
    firstName: "", middleName: "", lastName: "", phone: "", country: "United Kingdom", dialCode: "+44"
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const rawPhone = profile.phone || "";
      const phoneParts = rawPhone.includes(' ') ? rawPhone.split(' ') : ["+44", rawPhone];
      setProfileForm({
        firstName: profile.firstName || profile.fullName?.split(' ')[0] || "",
        middleName: profile.middleName || "",
        lastName: profile.lastName || profile.fullName?.split(' ').slice(1).join(' ') || "",
        phone: phoneParts.length > 1 ? phoneParts.slice(1).join(' ') : rawPhone,
        country: profile.country || "United Kingdom",
        dialCode: phoneParts.length > 1 ? phoneParts[0] : "+44"
      });
    }
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || isSavingProfile) return;
    setIsSavingProfile(true);
    try {
      const fullName = `${profileForm.firstName} ${profileForm.middleName ? profileForm.middleName + ' ' : ''}${profileForm.lastName}`.trim();
      const cleanPhone = `${profileForm.dialCode} ${profileForm.phone}`.trim();
      await updateDoc(doc(db, "users", user.uid), {
        firstName: profileForm.firstName.trim(),
        middleName: profileForm.middleName.trim(),
        lastName: profileForm.lastName.trim(),
        fullName: fullName,
        phone: cleanPhone,
        country: profileForm.country,
        updatedAt: new Date().toISOString()
      });
      setProfileFeedback("Profile updated successfully.");
      setTimeout(() => setProfileFeedback(null), 4000);
    } catch (err) { alert("Failed to save changes."); }
    finally { setIsSavingProfile(false); }
  };

  // --- SECURITY LOGIC ---
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isPwdResetLoading, setIsPwdResetLoading] = useState(false);

  const handleRegisterPasskey = async () => {
    if (!user) return;
    setIsBiometricLoading(true);
    try {
      const resp = await fetch('/api/auth/passkey/register/generate-options', { method: 'POST' });
      const options = await resp.json();
      const startRegistration = (await import('@simplewebauthn/browser')).startRegistration;
      const attResp = await startRegistration({ optionsJSON: options });
      await fetch('/api/auth/passkey/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });
      alert("Device registered for biometric login.");
    } catch (e) { alert("Registration failed."); }
    finally { setIsBiometricLoading(false); }
  };

  const handlePasswordReset = async () => {
    if (!user?.email || !auth) return;
    setIsPwdResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert(`Instructions have been sent to ${user.email}.`);
    } catch (e) { alert("Unable to send reset link."); }
    finally { setIsPwdResetLoading(false); }
  };

  // --- ALERTS LOGIC ---
  const toggleAlertSetting = async (key: string, value: boolean) => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { [`alerts.${key}`]: value });
    } catch (e) {}
  };

  const markAlertAsRead = async (id: string) => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/notifications`, id), { isUnread: false });
    } catch (e) {}
  };

  const deleteAlert = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/notifications`, id));
    } catch (e) {}
  };

  // --- DISPLAY LOGIC ---
  const updatePreference = async (key: string, value: any) => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { [key]: value });
    } catch (e) {}
  };

  // --- KYC UPLOAD LOGIC ---
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  const initiateUpload = (id: string) => {
    if (id === 'RULES') {
      setShowKycTerms(true);
      return;
    }
    setActiveUploadType(id);
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadType || !user || !db) return;
    setUploadingDoc(activeUploadType);
    try {
      const resp = await fetch('/api/storage/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, userId: user.uid })
      });
      if (!resp.ok) throw new Error("Could not generate upload token.");
      const { uploadUrl, key } = await resp.json();
      
      const uploadResp = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!uploadResp.ok) throw new Error("R2 rejected transmission.");

      const subIdMap: Record<string, string> = {
        'ID': 'GOVERNMENT_ID',
        'ADDRESS': 'PROOF_OF_ADDRESS',
        'SELFIE': 'SELFIE_VERIFICATION'
      };
      
      const subId = subIdMap[activeUploadType];

      await setDoc(doc(db, `users/${user.uid}/kyc_submissions`, subId), {
        type: activeUploadType, 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        status: "Pending", 
        storageKey: key, 
        timestamp: serverTimestamp()
      });
      
      await updateDoc(doc(db, "users", user.uid), { verificationStatus: "Pending", kycSubmittedAt: serverTimestamp() });
      await addDoc(collection(db, `users/${user.uid}/notifications`), {
        title: "Document Transmitted", 
        body: `Your ${activeUploadType} document is queued for audit.`, 
        type: "Security", 
        isUnread: true, 
        timestamp: serverTimestamp()
      });
    } catch (err: any) { alert(`Transmission Failure: ${err.message}`); }
    finally { setUploadingDoc(null); setActiveUploadType(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const finalizeKycAgreement = async () => {
    setUploadingDoc('RULES');
    if (!user || !db) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/kyc_submissions`, "RULES_AGREEMENT"), {
        type: "RULES", status: "Accepted", timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, "users", user.uid), { verificationStatus: "Pending" });
      setShowKycTerms(false);
    } catch (e) { alert("Handshake failure."); }
    finally { setUploadingDoc(null); }
  };

  const TERMS_CONTENT = [
    { title: "Risk Disclosure", content: "Trading derivatives carries a high level of risk to your capital. You should only trade with money you can afford to lose." },
    { title: "Execution Rules", content: "Trades are executed at the exact tick price received. Results are settled instantly upon contract expiration." },
    { title: "Withdrawal Policy", content: "Withdrawals are processed back to source within 24-48 business hours after security verification." }
  ];

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
      <PageTutorial steps={[{ selector: "#tour-account-nav", title: "Settings Hub", description: "Manage profile and security." }]} storageKey="varban_account_hub_tutorial" />
      <input type="file" ref={fileInputRef} onChange={onFileSelected} className="hidden" accept="image/*,application/pdf" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div id="tour-account-nav" className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'kyc', label: 'KYC', icon: ShieldCheck },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'display', label: 'Display', icon: Settings },
          ].map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id as AccountTab)} className={cn("flex-1 min-w-[110px] py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center justify-center space-x-2 transition-all border-b-2", activeTab === tab.id ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]")}>
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
                    <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-[#6B7280]">First Name</label><input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase focus:border-[#0A0A0A] outline-none" required /></div>
                    <div className="space-y-1"><label className="text-[9px] font-bold uppercase text-[#6B7280]">Last Name</label><input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase focus:border-[#0A0A0A] outline-none" required /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Phone Number</label>
                    <div className="flex gap-2">
                      <select value={profileForm.dialCode} onChange={e => setProfileForm({...profileForm, dialCode: e.target.value})} className="p-3 border border-[#E4E4E4] text-xs bg-[#F7F7F5]">
                        {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
                      </select>
                      <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="flex-grow p-3 border border-[#E4E4E4] text-xs font-mono focus:border-[#0A0A0A] outline-none" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Country</label>
                    <select value={profileForm.country} onChange={e => setProfileForm({...profileForm, country: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase appearance-none bg-white">
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
                <div><span className="text-[8px] uppercase text-[#6B7280]">Registered Email</span><p className="text-xs font-mono font-bold truncate">{user?.email}</p></div>
              </Card>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className={cn("p-8 border shrink-0 relative z-10 flex flex-col items-center justify-center font-bold uppercase tracking-widest text-[10px]", getStatusInfo(profile?.verificationStatus).bg, getStatusInfo(profile?.verificationStatus).border, getStatusInfo(profile?.verificationStatus).color)}>Status</div>
                <div className="relative z-10 flex-grow text-center md:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1">Account Level</span>
                  <h3 className={cn("text-2xl font-bold uppercase tracking-tight", getStatusInfo(profile?.verificationStatus).color)}>{getStatusInfo(profile?.verificationStatus).label}</h3>
                  <p className="text-[11px] text-[#6B7280] mt-2 max-w-md">Provide identification and a selfie to unlock higher limits.</p>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'ID', subId: 'GOVERNMENT_ID', label: 'Government ID', desc: 'Passport or National ID card. (PDF/JPG)', icon: FileText },
                  { id: 'SELFIE', subId: 'SELFIE_VERIFICATION', label: 'Selfie Proof', desc: 'Clear portrait photo of your face.', icon: Camera },
                  { id: 'ADDRESS', subId: 'PROOF_OF_ADDRESS', label: 'Proof of Address', desc: 'Utility bill or bank statement. (PDF/JPG)', icon: MapPin },
                  { id: 'RULES', subId: 'RULES_AGREEMENT', label: 'Rules Agreement', desc: 'Review and accept platform rules.', icon: CheckCircle2 }
                ].map((docItem) => {
                  const sub = submissions?.find(s => s.id === docItem.subId);
                  const isVerified = profile?.verificationStatus === 'Verified';
                  const isSubmitted = sub?.status === 'Pending' || sub?.status === 'Accepted';
                  const isLocked = isVerified || (isSubmitted && profile?.verificationStatus === 'Pending');

                  return (
                    <Card key={docItem.id} className="p-6 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between hover:border-[#0055FF] transition-all">
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold uppercase text-[#0055FF] tracking-[0.2em]">{docItem.id}</span>
                          {sub?.status === 'Accepted' || isVerified ? <Check className="w-3 h-3 text-[#16835B]" /> : <docItem.icon className="w-3 h-3 text-[#E4E4E4]" />}
                        </div>
                        <h4 className="text-11px font-bold uppercase text-[#0A0A0A]">{docItem.label}</h4>
                        <p className="text-[10px] text-[#6B7280]">{docItem.desc}</p>
                      </div>
                      <button 
                        onClick={() => initiateUpload(docItem.id)}
                        disabled={uploadingDoc === docItem.id || isLocked}
                        className={cn(
                          "w-full py-2.5 text-[9px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center space-x-2",
                          isLocked ? "bg-[#F7F7F5] text-[#6B7280] border-[#E4E4E4]" : "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#0055FF] hover:text-white"
                        )}
                      >
                        {uploadingDoc === docItem.id ? <Loader2 className="w-3 h-3 animate-spin" /> : isLocked ? <span>Accepted</span> : <span>{docItem.id === 'RULES' ? <><Check className="w-3 h-3" /> Accept Terms</> : <><Upload className="w-3 h-3" /> Upload File</>}</span>}
                      </button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
                <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-[#0055FF]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Login Security</h3>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Register this device for cryptographic biometric login. This prevents unauthorized access even if your password is compromised.
                </p>
                <button onClick={handleRegisterPasskey} disabled={isBiometricLoading} className="w-full btn-institutional-secondary py-3 flex items-center justify-center gap-2 shadow-sm">
                  {isBiometricLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-[#0055FF]" />}
                  <span>Register This Device</span>
                </button>
                {geoData && <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] space-y-2 text-[10px]">
                  <div className="flex justify-between"><span>Current IP:</span><span className="font-mono font-bold text-[#0A0A0A]">{geoData.ip}</span></div>
                  <div className="flex justify-between"><span>Location:</span><span className="font-bold text-[#0A0A0A] uppercase">{geoData.city}, {geoData.country_name}</span></div>
                </div>}
              </Card>
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
                <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C43D3D]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Password Node</h3>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Modify your primary account password. For institutional security, we recommend at least 12 characters and quarterly rotations.
                </p>
                <button onClick={handlePasswordReset} disabled={isPwdResetLoading} className="w-full btn-institutional-secondary py-3 shadow-sm">
                  {isPwdResetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : "Initiate Password Reset"}
                </button>
              </Card>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm lg:col-span-1">
                <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#0055FF]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Preferences</h3>
                </div>
                
                <div className="space-y-5">
                  {[
                    { key: 'newTrades', label: 'Trade Execution', desc: 'Alerts for CALL/PUT entries' },
                    { key: 'withdrawSuccess', label: 'Vault Transfers', desc: 'Withdrawal and deposit status' },
                    { key: 'securityAlerts', label: 'Security Events', desc: 'Login and device notifications' },
                    { key: 'systemStatus', label: 'System Health', desc: 'Maintenance and network status' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#0A0A0A] block">{setting.label}</span>
                        <p className="text-[9px] text-[#6B7280]">{setting.desc}</p>
                      </div>
                      <button 
                        onClick={() => toggleAlertSetting(setting.key, !profile?.alerts?.[setting.key])}
                        className={cn(
                          "w-10 h-5 border transition-all relative flex items-center px-0.5",
                          profile?.alerts?.[setting.key] ? "bg-[#16835B] border-[#16835B] justify-end" : "bg-[#F7F7F5] border-[#E4E4E4] justify-start"
                        )}
                      >
                        <div className="w-3.5 h-3.5 bg-white shadow-sm"></div>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-white border-[#E4E4E4] shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Recent Activity Log</h3>
                  <span className="text-[8px] font-mono text-[#6B7280] uppercase tracking-widest">Append-only Ledger</span>
                </div>
                
                <div className="divide-y divide-[#E4E4E4] overflow-y-auto max-h-[600px] no-scrollbar">
                  {notificationsLoading ? (
                    <div className="p-12 text-center text-[10px] font-mono text-[#6B7280]">Accessing Security Vault...</div>
                  ) : notifications?.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <Bell className="w-8 h-8 text-[#E4E4E4] mx-auto opacity-20" />
                      <p className="text-[10px] font-bold uppercase text-[#6B7280]">No active alerts recorded.</p>
                    </div>
                  ) : (
                    notifications?.map((note: any) => (
                      <div key={note.id} className={cn("p-5 flex items-start gap-4 hover:bg-[#F7F7F5] transition-colors group", note.isUnread && "bg-[#0055FF]/5")}>
                        <div className={cn(
                          "w-8 h-8 shrink-0 flex items-center justify-center border",
                          note.type === 'Security' ? "bg-white border-[#C43D3D] text-[#C43D3D]" : "bg-white border-[#0055FF] text-[#0055FF]"
                        )}>
                          {note.type === 'Security' ? <ShieldAlert className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold uppercase text-[#0A0A0A]">{note.title}</span>
                            <span className="text-[8px] font-mono text-[#6B7280]">{note.timestamp?.toDate ? formatDate(note.timestamp.toDate()) : '---'}</span>
                          </div>
                          <p className="text-[10px] text-[#6B7280] leading-relaxed">{note.body}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                          <button onClick={() => markAlertAsRead(note.id)} className="p-1 text-[#6B7280] hover:text-[#0055FF]" title="Dismiss"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteAlert(note.id)} className="p-1 text-[#6B7280] hover:text-[#C43D3D]" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
                  <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-[#0055FF]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Localization</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Interface Language</label>
                      <select 
                        value={profile?.language || 'ENGLISH'} 
                        onChange={(e) => updatePreference('language', e.target.value)}
                        className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white focus:border-[#0055FF] outline-none appearance-none"
                      >
                        <option value="ENGLISH">English</option>
                        <option value="FRENCH">Français</option>
                        <option value="SPANISH">Español</option>
                        <option value="PORTUGUESE">Português</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">System Timezone</label>
                      <select 
                        value={profile?.timezone || 'UTC+0'} 
                        onChange={(e) => updatePreference('timezone', e.target.value)}
                        className="w-full p-3 border border-[#E4E4E4] text-xs font-mono font-bold bg-white focus:border-[#0055FF] outline-none appearance-none"
                      >
                        {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                      </select>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
                  <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-[#16835B]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Interface Layout</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-3">UI Density</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => updatePreference('uiDensity', 'standard')}
                          className={cn(
                            "py-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                            (profile?.uiDensity || 'standard') === 'standard' ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                          )}
                        >
                          Standard
                        </button>
                        <button 
                          onClick={() => updatePreference('uiDensity', 'compact')}
                          className={cn(
                            "py-3 border text-[10px] font-bold uppercase tracking-widest transition-all",
                            profile?.uiDensity === 'compact' ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5]"
                          )}
                        >
                          Compact
                        </button>
                      </div>
                      <p className="text-[9px] text-[#6B7280] mt-3 uppercase tracking-wider leading-relaxed">
                        Compact mode maximizes vertical information visibility for high-frequency trading terminals.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center gap-3">
                <Wifi className="w-4 h-4 text-[#16835B]" />
                <p className="text-[9px] text-[#6B7280] uppercase font-bold tracking-widest">
                  Display modifications are synchronized instantly across all authorized device sessions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showKycTerms && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm">
          <Card className="bg-white border-[#E4E4E4] w-full max-w-xl shadow-2xl relative flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-[#E4E4E4] flex justify-between bg-[#F7F7F5]">
              <div><h3 className="text-xs font-bold uppercase tracking-widest">Rules Agreement</h3><p className="text-[9px] text-[#6B7280]">Section {kycTermsStep + 1} of {TERMS_CONTENT.length}</p></div>
              <button onClick={() => setShowKycTerms(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-8 overflow-y-auto flex-grow text-xs leading-relaxed space-y-4">
              <h2 className="text-sm font-bold uppercase">{TERMS_CONTENT[kycTermsStep].title}</h2>
              <p>{TERMS_CONTENT[kycTermsStep].content}</p>
            </div>
            <div className="p-5 border-t border-[#E4E4E4] flex justify-between bg-[#F7F7F5]">
              <button disabled={kycTermsStep === 0} onClick={() => setKycTermsStep(kycTermsStep - 1)} className="text-[10px] font-bold uppercase">Back</button>
              <button onClick={() => kycTermsStep < TERMS_CONTENT.length - 1 ? setKycTermsStep(kycTermsStep + 1) : finalizeKycAgreement()} className="px-6 py-2 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase">{kycTermsStep === TERMS_CONTENT.length - 1 ? "Accept & Sign" : "Next"}</button>
            </div>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
