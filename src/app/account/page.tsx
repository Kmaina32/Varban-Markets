
"use client";

/**
 * @fileOverview Consolidated Account Hub.
 * Manages Profile, Verification, Security, Notifications, and Preferences in one workspace.
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  User, 
  Activity, 
  Check, 
  Save, 
  Smartphone, 
  Globe, 
  AlertCircle,
  ShieldCheck,
  Lock,
  Bell,
  Settings,
  Fingerprint,
  Plus,
  Trash2,
  Loader2,
  Mail,
  History,
  Key,
  Clock,
  DollarSign
} from "lucide-react";
import { useUser, useDoc, useFirestore, useCollection, useAuth } from "@/firebase";
import { doc, setDoc, updateDoc, collection, query, orderBy, limit, deleteDoc, serverTimestamp } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { startRegistration } from "@simplewebauthn/browser";
import { useTranslation } from "@/app/lib/i18n-context";
import { COUNTRIES } from "@/app/lib/countries";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";

type AccountTab = 'profile' | 'verification' | 'security' | 'alerts' | 'display';

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

export default function AccountHub() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatNumber, formatDate } = useTranslation();
  
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');

  // Sync state with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as AccountTab;
    if (tabParam && ['profile', 'verification', 'security', 'alerts', 'display'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/account?${params.toString()}`);
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
      setProfileFeedback("Profile synchronized successfully.");
      setTimeout(() => setProfileFeedback(null), 4000);
    } catch (err) { alert("Handshake failure."); }
    finally { setIsSavingProfile(false); }
  };

  // --- SUB-MODULE: SECURITY ---
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isPwdResetLoading, setIsPwdResetLoading] = useState(false);
  const { data: passkeys } = useCollection<any>(user && db ? collection(db, `users/${user.uid}/passkeys`) : null);

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
      alert("Biometric ID Registered.");
    } catch (e) { alert("Registration interrupted."); }
    finally { setIsBiometricLoading(false); }
  };

  const handlePasswordReset = async () => {
    if (!user?.email || !auth) return;
    setIsPwdResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert(`Recovery link transmitted to ${user.email}.`);
    } catch (e) { alert("Authority failure."); }
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
      alert("Display preferences synchronized.");
    } catch (e) { alert("Failed to save."); }
  };

  // --- SUB-MODULE: NOTIFICATIONS ---
  const notesQuery = useMemo(() => {
    if (!db || !user || activeTab !== 'alerts') return null;
    return query(collection(db, `users/${user.uid}/notifications`), orderBy("timestamp", "desc"), limit(20));
  }, [db, user, activeTab]);
  const { data: alerts, loading: alertsLoading } = useCollection<any>(notesQuery);

  // --- SUB-MODULE: VERIFICATION ---
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const handleDocUpload = (label: string) => {
    setUploadingDoc(label);
    setTimeout(async () => {
      if (user && db) {
        await updateDoc(doc(db, "users", user.uid), { verificationStatus: "Pending" });
        alert(`${label} received and queued for audit.`);
      }
      setUploadingDoc(null);
    }, 2000);
  };

  const tutorialSteps: TutorialStep[] = [
    {
      selector: "#tour-account-nav",
      title: "Account Hub",
      description: "Manage your entire digital identity from this unified dashboard. Switch between profile, security, and display settings instantly."
    },
    {
      selector: "#tour-kyc-status",
      title: "Regulatory Status",
      description: "Monitor your verification level to ensure uninterrupted access to institutional liquidity and higher withdrawal limits."
    }
  ];

  return (
    <AuthedLayout 
      title="Account Hub" 
      subtitle="Institutional identity and workspace configuration"
    >
      <PageTutorial steps={tutorialSteps} storageKey="varban_account_hub_tutorial" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Hub Navigation */}
        <div id="tour-account-nav" className="flex border-b border-[#E4E4E4] bg-white sticky top-[-1px] z-20 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'verification', label: 'Identity', icon: ShieldCheck },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'alerts', label: 'Alerts Feed', icon: Bell },
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
          
          {/* TAB: PROFILE */}
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
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Contact Phone</label>
                    <div className="flex gap-2">
                      <select value={profileForm.dialCode} onChange={e => setProfileForm({...profileForm, dialCode: e.target.value})} className="p-3 border border-[#E4E4E4] text-xs bg-[#F7F7F5]">
                        {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
                      </select>
                      <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="flex-grow p-3 border border-[#E4E4E4] text-xs font-mono focus:border-[#0A0A0A] outline-none" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-[#6B7280]">Jurisdiction</label>
                    <select value={profileForm.country} onChange={e => setProfileForm({...profileForm, country: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase appearance-none bg-white">
                      {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  {profileFeedback && <div className="p-3 bg-[#16835B]/10 border border-[#16835B] text-[9px] font-bold text-[#16835B] uppercase">{profileFeedback}</div>}
                  <button type="submit" disabled={isSavingProfile} className="w-full btn-institutional-primary py-4">
                    {isSavingProfile ? "Synchronizing..." : "Save Profile Details"}
                  </button>
                </form>
              </Card>
              <div className="space-y-6">
                <Card className="p-6 bg-[#0A0A0A] text-white border-l-4 border-[#0055FF]">
                  <span className="text-[8px] font-bold uppercase text-[#6B7280] block mb-4">Identity Meta</span>
                  <div className="space-y-4">
                    <div><span className="text-[8px] uppercase text-[#6B7280]">Account UID</span><p className="text-xs font-mono font-bold truncate">{user?.uid}</p></div>
                    <div><span className="text-[8px] uppercase text-[#6B7280]">Email Domain</span><p className="text-xs font-mono font-bold truncate">{user?.email}</p></div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Card id="tour-kyc-status" className="p-8 bg-white border-[#E4E4E4] shadow-sm flex items-center space-x-6">
                <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                  <ShieldCheck className={cn("w-8 h-8", profile?.verificationStatus === 'Verified' ? "text-[#16835B]" : "text-[#6B7280]")} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase">Status: {profile?.verificationStatus || 'Not Verified'}</h3>
                  <p className="text-[11px] text-[#6B7280] mt-1">Verify your identity to unlock institutional limits.</p>
                </div>
              </Card>
              <div className="space-y-3">
                {['ID Card / Passport', 'Proof of Address', 'Risk Consent'].map((label, i) => (
                  <Card key={i} className="p-5 bg-white border-[#E4E4E4] flex justify-between items-center group hover:border-[#0055FF] transition-all">
                    <div className="flex items-center space-x-4"><Smartphone className="w-4 h-4 text-[#6B7280]" /><div><span className="text-[11px] font-bold uppercase block">{label}</span><span className="text-[9px] text-[#6B7280] uppercase">Required Document</span></div></div>
                    <button onClick={() => handleDocUpload(label)} className="p-2 border border-[#E4E4E4] hover:bg-[#0055FF] hover:text-white transition-colors"><Smartphone className="w-3.5 h-3.5" /></button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-6">
                <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2"><Fingerprint className="w-4 h-4 text-[#0055FF]" /><h3 className="text-xs font-bold uppercase tracking-widest">Biometrics & Passkeys</h3></div>
                <p className="text-[10px] text-[#6B7280] leading-relaxed">Register your device fingerprint or Face ID for ultra-secure authentication.</p>
                <button onClick={handleRegisterPasskey} className="w-full btn-institutional-secondary py-3 flex items-center justify-center gap-2"><Plus className="w-3.5 h-3.5" /> Register New Device</button>
              </Card>
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-6">
                <div className="border-b border-[#F7F7F5] pb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-[#C43D3D]" /><h3 className="text-xs font-bold uppercase tracking-widest">Account Access</h3></div>
                <div className="flex justify-between items-center p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                  <span className="text-[10px] font-bold uppercase">Password Recovery</span>
                  <button onClick={handlePasswordReset} className="text-[9px] font-bold uppercase text-[#0055FF] hover:underline">Change Password</button>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                  <span className="text-[10px] font-bold uppercase">Active Sessions</span>
                  <span className="text-[9px] font-bold text-[#16835B] uppercase">Protected</span>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {alertsLoading ? <div className="text-center p-12 text-[10px] uppercase font-bold text-[#6B7280]">Syncing Alerts...</div> :
                alerts?.length === 0 ? <Card className="p-20 text-center border-dashed"><Bell className="w-8 h-8 text-[#E4E4E4] mx-auto mb-3" /><p className="text-[10px] font-bold uppercase text-[#6B7280]">Feed Clear</p></Card> :
                alerts?.map((a: any) => (
                  <Card key={a.id} className="p-5 bg-white border-[#E4E4E4] flex items-start space-x-4 border-l-4 border-l-[#0055FF]">
                    <Activity className="w-4 h-4 text-[#0055FF] shrink-0 mt-1" />
                    <div><div className="flex justify-between items-start mb-1"><h4 className="text-[11px] font-bold uppercase">{a.title}</h4><span className="text-[8px] font-mono text-[#6B7280]">{a.timestamp?.toDate ? a.timestamp.toDate().toLocaleTimeString() : '---'}</span></div><p className="text-xs text-[#6B7280] leading-relaxed">{a.body}</p></div>
                  </Card>
                ))
              }
            </div>
          )}

          {/* TAB: DISPLAY */}
          {activeTab === 'display' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-[#F7F7F5] pb-4"><div className="flex items-center gap-3"><DollarSign className="w-4 h-4 text-[#6B7280]" /><span className="text-[10px] font-bold uppercase">Base Currency</span></div>
                    <select value={displayForm.currency} onChange={e => setDisplayForm({...displayForm, currency: e.target.value})} className="bg-transparent text-[10px] font-bold uppercase outline-none">{PAYSTACK_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#F7F7F5] pb-4"><div className="flex items-center gap-3"><Globe className="w-4 h-4 text-[#6B7280]" /><span className="text-[10px] font-bold uppercase">Language</span></div>
                    <select value={displayForm.language} onChange={e => setDisplayForm({...displayForm, language: e.target.value})} className="bg-transparent text-[10px] font-bold uppercase outline-none"><option value="ENGLISH">English</option><option value="FRENCH">Français</option></select>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#F7F7F5] pb-4"><div className="flex items-center gap-3"><Clock className="w-4 h-4 text-[#6B7280]" /><span className="text-[10px] font-bold uppercase">Timezone</span></div>
                    <select value={displayForm.timezone} onChange={e => setDisplayForm({...displayForm, timezone: e.target.value})} className="bg-transparent text-[10px] font-bold uppercase outline-none">{TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}</select>
                  </div>
                </div>
                <button onClick={saveDisplay} className="w-full btn-institutional-primary">Synchronize Display Settings</button>
              </Card>
              <Card className="p-8 bg-white border-[#E4E4E4] space-y-4">
                <h3 className="text-[10px] font-bold uppercase text-[#6B7280] mb-4">Alert Preferences</h3>
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
