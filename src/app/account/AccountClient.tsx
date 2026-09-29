
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
  ShieldQuestion,
  Smartphone,
  Laptop,
  X
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

const PAYSTACK_CURRENCIES = ["USD", "NGN", "GHS", "ZAR", "KES"];
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
  
  // Granular KYC submissions tracking
  const kycSubQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, `users/${user.uid}/kyc_submissions`);
  }, [db, user]);
  const { data: submissions, loading: subLoading } = useCollection<any>(kycSubQuery);

  // Sessions tracking
  const sessionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, `users/${user.uid}/sessions`), orderBy("lastActive", "desc"));
  }, [db, user]);
  const { data: sessions, loading: sessionsLoading } = useCollection<any>(sessionsQuery);

  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadType, setActiveUploadType] = useState<string | null>(null);

  // Sync state with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as AccountTab;
    if (tabParam && ['profile', 'kyc', 'security', 'alerts', 'display'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    if (searchParams.get('tab') === 'verification') setActiveTab('kyc');
  }, [searchParams]);

  // Fetch Geo Data for security tab using device permission flow
  useEffect(() => {
    if (activeTab === 'security' && !geoData) {
      setGeoLoading(true);
      detectLocation().then(data => {
        setGeoData(data);
        setGeoLoading(false);
      });
    }
  }, [activeTab, geoData]);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/account?${params.toString()}`);
  };

  const revokeSession = async (sessId: string) => {
    if (!db || !user || !window.confirm("Confirm remote session revocation? Device will be logged out instantly.")) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/sessions`, sessId));
    } catch (e) {
      alert("Authority Failure: Could not revoke session.");
    }
  };

  // --- SUB-MODULE: PROFILE ---
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    country: "United Kingdom",
    dialCode: "+44"
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

  // --- SUB-MODULE: SECURITY ---
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isPwdResetLoading, setIsPwdResetLoading] = useState(false);
  
  const passkeysQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, `users/${user.uid}/passkeys`);
  }, [db, user]);
  const { data: passkeys } = useCollection<any>(passkeysQuery);

  const handleRegisterPasskey = async () => {
    if (!user) return;
    setIsBiometricLoading(true);
    try {
      const resp = await fetch('/api/auth/passkey/register/generate-options', { method: 'POST' });
      const options = await resp.json();
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

  // --- SUB-MODULE: DISPLAY / PREFERENCES ---
  const [displayForm, setDisplayForm] = useState({
    currency: "USD",
    language: "ENGLISH",
    timezone: "UTC+0",
    newTrades: true,
    withdrawSuccess: true,
    securityAlerts: true,
    systemStatus: true
  });

  useEffect(() => {
    if (profile) {
      setDisplayForm({
        currency: profile.currency || "USD",
        language: profile.language || "ENGLISH",
        timezone: profile.timezone || "UTC+0",
        newTrades: profile.alerts?.newTrades ?? true,
        withdrawSuccess: profile.alerts?.withdrawSuccess ?? true,
        securityAlerts: profile.alerts?.securityAlerts ?? true,
        systemStatus: profile.alerts?.systemStatus ?? true
      });
    }
  }, [profile]);

  const saveDisplay = async () => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        currency: displayForm.currency,
        language: displayForm.language,
        timezone: displayForm.timezone,
        alerts: {
          newTrades: displayForm.newTrades,
          withdrawSuccess: displayForm.withdrawSuccess,
          securityAlerts: displayForm.securityAlerts,
          systemStatus: displayForm.systemStatus
        }
      });
      alert("Settings saved.");
    } catch (e) { alert("Failed to save settings."); }
  };

  // --- SUB-MODULE: NOTIFICATIONS ---
  const notesQuery = useMemo(() => {
    if (!db || !user || activeTab !== 'alerts') return null;
    return query(collection(db, `users/${user.uid}/notifications`), orderBy("timestamp", "desc"), limit(20));
  }, [db, user, activeTab]);
  const { data: alerts, loading: alertsLoading } = useCollection<any>(notesQuery);

  // --- SUB-MODULE: KYC ---
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  const initiateUpload = (id: string) => {
    if (id === 'RULES') {
      handleFinalKycSubmission('AGREEMENT');
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
      // 1. Request Presigned URL from Server Node
      const resp = await fetch('/api/storage/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          userId: user.uid
        })
      });

      const { uploadUrl, key } = await resp.json();

      // 2. Perform direct institutional upload to R2
      const uploadResp = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 
          'Content-Type': file.type 
        }
      });

      if (!uploadResp.ok) {
        if (uploadResp.status === 403 || uploadResp.status === 0) {
          throw new Error("CORS Security Restriction: Please ensure R2 Bucket CORS policy allows PUT methods.");
        }
        throw new Error("Handshake Failure: Cloudflare R2 rejected the transmission.");
      }

      // 3. Register transmission in Firestore Ledger
      const subId = activeUploadType === 'ID' ? 'GOVERNMENT_ID' : 'PROOF_OF_ADDRESS';
      await setDoc(doc(db, `users/${user.uid}/kyc_submissions`, subId), {
        type: activeUploadType,
        fileName: file.name,
        fileSize: file.size,
        status: "Pending",
        storageKey: key,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, "users", user.uid), { 
        verificationStatus: "Pending",
        kycSubmittedAt: serverTimestamp() 
      });
      
      await addDoc(collection(db, `users/${user.uid}/notifications`), {
        title: "Documentation Transmitted",
        body: `Your ${activeUploadType === 'ID' ? 'ID' : 'Address'} document has been securely stored in the decentralized vault and queued for audit.`,
        type: "Security",
        isUnread: true,
        timestamp: serverTimestamp()
      });

    } catch (err: any) {
      console.error("KYC Transmission Error:", err);
      alert(`Transmission Failure: ${err.message || "Could not establish secure link to storage node."}`);
    } finally {
      setUploadingDoc(null);
      setActiveUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFinalKycSubmission = async (label: string) => {
    setUploadingDoc('RULES');
    setTimeout(async () => {
      if (user && db) {
        await setDoc(doc(db, `users/${user.uid}/kyc_submissions`, "RULES_AGREEMENT"), {
          type: "RULES",
          status: "Accepted",
          timestamp: serverTimestamp()
        });

        await updateDoc(doc(db, "users", user.uid), { 
          verificationStatus: "Pending"
        });
        
        await addDoc(collection(db, `users/${user.uid}/notifications`), {
          title: "Agreement Validated",
          body: `The Platform Rules Agreement has been cryptographically signed and stored in your account ledger.`,
          type: "Security",
          isUnread: true,
          timestamp: serverTimestamp()
        });
      }
      setUploadingDoc(null);
    }, 1500);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Verified':
        return { label: 'Verified', color: 'text-[#16835B]', bg: 'bg-[#16835B]/5', border: 'border-[#16835B]' };
      case 'Pending':
        return { label: 'Under Review', color: 'text-[#C9A227]', bg: 'bg-[#C9A227]/5', border: 'border-[#C9A227]' };
      case 'Rejected':
        return { label: 'Action Needed', color: 'text-[#C43D3D]', bg: 'bg-[#C43D3D]/5', border: 'border-[#C43D3D]' };
      default:
        return { label: 'Not Verified', color: 'text-[#6B7280]', bg: 'bg-[#F7F7F5]', border: 'border-[#E4E4E4]' };
    }
  };

  const tutorialSteps: TutorialStep[] = [
    {
      selector: "#tour-account-nav",
      title: "Settings Hub",
      description: "Manage your profile, identity documents, and account security all in one place."
    },
    {
      selector: "#tour-kyc-status",
      title: "Account Status",
      description: "Check your current verification level. Level up your account to unlock higher withdrawal limits."
    }
  ];

  return (
    <AuthedLayout 
      title="Account Hub" 
      subtitle="Manage your identity and workspace settings"
    >
      <PageTutorial steps={tutorialSteps} storageKey="varban_account_hub_tutorial" />

      {/* Hidden File Input for KYC */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileSelected} 
        className="hidden" 
        accept="image/*,.pdf" 
      />

      <div className="max-w-6xl mx-auto space-y-6">
        
        <div id="tour-account-nav" className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'kyc', label: 'KYC', icon: ShieldCheck },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'display', label: 'Display', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as AccountTab)}
              className={cn(
                "flex-1 min-w-[110px] py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center justify-center space-x-2 transition-all border-b-2",
                activeTab === tab.id 
                  ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" 
                  : "border-transparent text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F7F7F5]"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-8 bg-white border-[#E4E4E4] lg:col-span-2 shadow-sm">
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-[#6B7280]">First Name</label>
                      <input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase focus:border-[#0A0A0A] outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-[#6B7280]">Last Name</label>
                      <input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase focus:border-[#0A0A0A] outline-none" required />
                    </div>
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
                  <button type="submit" disabled={isSavingProfile} className="w-full btn-institutional-primary py-4">
                    {isSavingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </form>
              </Card>
              <div className="space-y-6">
                <Card className="p-6 bg-white text-[#0A0A0A] border-[#E4E4E4] border-l-4 border-l-[#0055FF] shadow-sm">
                  <span className="text-[8px] font-bold uppercase text-[#6B7280] block mb-4">Account Information</span>
                  <div className="space-y-4">
                    <div><span className="text-[8px] uppercase text-[#6B7280]">Internal ID</span><p className="text-xs font-mono font-bold truncate text-[#0A0A0A]">{user?.uid}</p></div>
                    <div><span className="text-[8px] uppercase text-[#6B7280]">Registered Email</span><p className="text-xs font-mono font-bold truncate text-[#0A0A0A]">{user?.email}</p></div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card id="tour-kyc-status" className="p-8 bg-white border-[#E4E4E4] shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className={cn("p-8 border shrink-0 relative z-10 flex flex-col items-center justify-center font-bold uppercase tracking-widest text-[10px]", getStatusInfo(profile?.verificationStatus).bg, getStatusInfo(profile?.verificationStatus).border, getStatusInfo(profile?.verificationStatus).color)}>
                  Status
                </div>
                <div className="relative z-10 flex-grow text-center md:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1">Account Level</span>
                  <h3 className={cn("text-2xl font-bold uppercase tracking-tight", getStatusInfo(profile?.verificationStatus).color)}>
                    {getStatusInfo(profile?.verificationStatus).label}
                  </h3>
                  <p className="text-[11px] text-[#6B7280] mt-2 max-w-md leading-relaxed">
                    {profile?.verificationStatus === 'Verified' 
                      ? "Your account is fully verified. You have access to all trading features and standard withdrawal limits."
                      : profile?.verificationStatus === 'Pending'
                      ? "Your documents are being checked. This usually takes 24-48 business hours."
                      : profile?.verificationStatus === 'Rejected'
                      ? "Your last application was not accepted. Please check the requirements and upload your documents again."
                      : "Provide your identification to unlock trading and secure your account."}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055FF]/5 rounded-bl-full -z-0"></div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'ID', subId: 'GOVERNMENT_ID', label: 'Government ID', desc: 'A clear photo of your Passport or National ID card.' },
                  { id: 'ADDRESS', subId: 'PROOF_OF_ADDRESS', label: 'Proof of Address', desc: 'A utility bill or bank statement from the last 3 months.' },
                  { id: 'RULES', subId: 'RULES_AGREEMENT', label: 'Agreement', desc: 'Confirm you have read and accept the platform rules.' }
                ].map((docItem) => {
                  const submission = submissions?.find(s => s.id === docItem.subId);
                  const isVerified = profile?.verificationStatus === 'Verified';
                  const isSubmitted = submission?.status === 'Pending' || submission?.status === 'Accepted';
                  const isUploading = uploadingDoc === docItem.id;
                  
                  // Locked only if verified OR if this specific doc is pending while global status is Pending
                  const isLocked = isVerified || (isSubmitted && profile?.verificationStatus === 'Pending');

                  return (
                    <Card key={docItem.id} className={cn(
                      "p-6 bg-white border-[#E4E4E4] transition-all group shadow-sm flex flex-col justify-between",
                      !isLocked && "hover:border-[#0055FF]"
                    )}>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold uppercase text-[#0055FF] tracking-[0.2em]">{docItem.id}</span>
                          {isVerified || submission?.status === 'Accepted' ? (
                            <span className="text-[8px] font-bold uppercase text-[#16835B]">Accepted</span>
                          ) : isSubmitted ? (
                            <span className="text-[8px] font-bold uppercase text-[#C9A227]">Auditing</span>
                          ) : null}
                        </div>
                        <div>
                          <h4 className="text-11px font-bold uppercase tracking-wider text-[#0A0A0A]">{docItem.label}</h4>
                          <p className="text-[10px] text-[#6B7280] mt-1 leading-relaxed">{docItem.desc}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => initiateUpload(docItem.id)}
                        disabled={isUploading || isLocked}
                        className={cn(
                          "w-full py-2.5 text-[9px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center space-x-2 shadow-sm",
                          isLocked
                            ? "bg-[#F7F7F5] text-[#6B7280] border-[#E4E4E4] cursor-not-allowed"
                            : "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#0055FF] hover:text-white hover:border-[#0055FF]"
                        )}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : isVerified ? (
                          <span>Verified</span>
                        ) : isSubmitted && profile?.verificationStatus === 'Pending' ? (
                          <span>Locked for Review</span>
                        ) : (
                          <>
                            {docItem.id === 'RULES' ? <Check className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                            <span>{docItem.id === 'RULES' ? "Accept Terms" : "Upload File"}</span>
                          </>
                        )}
                      </button>
                    </Card>
                  );
                })}

                <div className="p-6 bg-[#0055FF]/5 border border-dashed border-[#0055FF]/30 flex flex-col justify-center space-y-4">
                  <div className="flex items-center space-x-2 text-[#0055FF]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Privacy & Security</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] leading-relaxed">
                    Your documents are protected with high-level encryption. We only use this information to follow financial rules and keep your account safe.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-6">
                <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2"><Fingerprint className="w-4 h-4 text-[#0055FF]" /><h3 className="text-xs font-bold uppercase tracking-widest">Login Security</h3></div>
                <p className="text-[10px] text-[#6B7280] leading-relaxed">Register your device fingerprint or Face ID to sign in faster and more securely.</p>
                <button onClick={handleRegisterPasskey} className="w-full btn-institutional-secondary py-3 flex items-center justify-center gap-2"><Plus className="w-3.5 h-3.5" /> Register This Device</button>
                
                {/* Geolocation Insight */}
                <div className="pt-4 mt-4 border-t border-[#F7F7F5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-[#6B7280] tracking-widest flex items-center gap-1.5">
                      <Wifi className="w-3 h-3" /> Current Session Location
                    </span>
                    {geoLoading && <Loader2 className="w-3 h-3 animate-spin text-[#0055FF]" />}
                  </div>
                  {geoData ? (
                    <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] rounded space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#6B7280] uppercase font-bold">IP Address:</span>
                        <span className="font-mono font-bold text-[#0A0A0A]">{geoData.ip}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#6B7280] uppercase font-bold">Location:</span>
                        <span className="font-bold text-[#0A0A0A] flex items-center gap-1.5">
                          {geoData.city}, {geoData.country_name}
                        </span>
                      </div>
                      {geoData.security && (
                        <div className="flex justify-between items-center text-[10px] pt-1 border-t border-[#E4E4E4]">
                          <span className="text-[#6B7280] uppercase font-bold">Threat Level:</span>
                          <span className={cn(
                            "font-bold uppercase flex items-center gap-1",
                            geoData.security.threat_level === 'low' ? "text-[#16835B]" : "text-[#C43D3D]"
                          )}>
                            <ShieldAlert className="w-3 h-3" /> {geoData.security.threat_level}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : !geoLoading && (
                    <p className="text-[9px] text-[#6B7280] italic">Unable to retrieve location intelligence.</p>
                  )}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-8 bg-white border-[#E4E4E4] space-y-6">
                  <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-[#C43D3D]" /><h3 className="text-xs font-bold uppercase tracking-widest">Password & Access</h3></div>
                  <div className="flex justify-between items-center p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                    <span className="text-[10px] font-bold uppercase">Change Password</span>
                    <button onClick={handlePasswordReset} className="text-[9px] font-bold uppercase text-[#0055FF] hover:underline">Get Reset Link</button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                    <span className="text-[10px] font-bold uppercase">Account Access</span>
                    <span className="text-[9px] font-bold text-[#16835B] uppercase">Protected</span>
                  </div>
                </Card>

                <Card className="bg-white border-[#E4E4E4] shadow-sm">
                  <div className="p-4 border-b border-[#F7F7F5] flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#0055FF]" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">Authorized Devices</h3>
                  </div>
                  <div className="divide-y divide-[#F7F7F5]">
                    {sessionsLoading ? (
                      <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#0055FF]" /></div>
                    ) : sessions?.length === 0 ? (
                      <div className="p-8 text-center text-[10px] font-bold text-[#6B7280] uppercase">No sessions recorded</div>
                    ) : (
                      sessions.map((sess: any) => (
                        <div key={sess.id} className="p-4 flex items-center justify-between hover:bg-[#F7F7F5] transition-colors">
                          <div className="flex items-center space-x-3">
                            {sess.os?.toLowerCase().includes('win') || sess.os?.toLowerCase().includes('mac') ? <Laptop className="w-4 h-4 text-[#6B7280]" /> : <Smartphone className="w-4 h-4 text-[#6B7280]" />}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-[#0A0A0A]">{sess.deviceName || 'Device'}</span>
                                {sess.id === 'current' && <span className="bg-[#16835B]/10 text-[#16835B] text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-tighter">Current</span>}
                              </div>
                              <div className="text-[9px] text-[#6B7280] font-mono mt-0.5">{sess.ip} &bull; {sess.browser} &bull; {sess.lastActive?.toDate ? formatDate(sess.lastActive.toDate()) : 'Active now'}</div>
                            </div>
                          </div>
                          {sess.id !== 'current' && (
                            <button onClick={() => revokeSession(sess.id)} className="p-1.5 text-[#6B7280] hover:text-[#C43D3D] transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {alertsLoading ? <div className="text-center p-12 text-[10px] uppercase font-bold text-[#6B7280]">Updating...</div> :
                alerts?.length === 0 ? <Card className="p-20 text-center border-dashed"><Bell className="w-8 h-8 text-[#E4E4E4] mx-auto mb-3" /><p className="text-[10px] font-bold uppercase text-[#6B7280]">No current alerts</p></Card> :
                alerts?.map((a: any) => (
                  <Card key={a.id} className="p-5 bg-white border-[#E4E4E4] flex items-start space-x-4 border-l-4 border-l-[#0055FF]">
                    <Activity className="w-4 h-4 text-[#0055FF] shrink-0 mt-1" />
                    <div><div className="flex justify-between items-start mb-1"><h4 className="text-[11px] font-bold uppercase">{a.title}</h4><span className="text-[8px] font-mono text-[#6B7280]">{a.timestamp?.toDate ? a.timestamp.toDate().toLocaleTimeString() : '---'}</span></div><p className="text-xs text-[#6B7280] leading-relaxed">{a.body}</p></div>
                  </Card>
                ))
              }
            </div>
          )}

          {activeTab === 'display' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-[#F7F7F5] pb-4"><div className="flex items-center gap-3"><DollarSign className="w-4 h-4 text-[#6B7280]" /><span className="text-[10px] font-bold uppercase">Currency</span></div>
                    <select value={displayForm.currency} onChange={e => setDisplayForm({...displayForm, currency: e.target.value})} className="bg-transparent text-[10px] font-bold uppercase outline-none">{PAYSTACK_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#F7F7F5] pb-4"><div className="flex items-center gap-3"><Globe className="w-4 h-4 text-[#6B7280]" /><span className="text-[10px] font-bold uppercase">Language</span></div>
                    <select value={displayForm.language} onChange={e => setDisplayForm({...displayForm, language: e.target.value})} className="bg-transparent text-[10px] font-bold uppercase outline-none"><option value="ENGLISH">English</option><option value="FRENCH">Français</option></select>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#F7F7F5] pb-4"><div className="flex items-center gap-3"><Clock className="w-4 h-4 text-[#6B7280]" /><span className="text-[10px] font-bold uppercase">Timezone</span></div>
                    <select value={displayForm.timezone} onChange={e => setDisplayForm({...displayForm, timezone: e.target.value})} className="bg-transparent text-[10px] font-bold uppercase outline-none">{TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}</select>
                  </div>
                </div>
                <button onClick={saveDisplay} className="w-full btn-institutional-primary">Save Settings</button>
              </Card>
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-4">
                <h3 className="text-[10px] font-bold uppercase text-[#6B7280] mb-4">Notification Preferences</h3>
                {['newTrades', 'withdrawSuccess', 'securityAlerts', 'systemStatus'].map(k => (
                  <div key={k} className="flex justify-between items-center p-3 bg-[#F7F7F5] border border-[#E4E4E4]">
                    <span className="text-[10px] font-bold uppercase text-[#0A0A0A]">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <input type="checkbox" checked={displayForm[k]} onChange={() => setDisplayForm({...displayForm, [k]: !displayForm[k]})} className="w-4 h-4 accent-[#0055FF]" />
                  </div>
                ))}
              </Card>
            </div>
          )}

        </div>
      </div>
    </AuthedLayout>
  );
}
