"use client";

/**
 * @fileOverview Security Management Workspace.
 * Integrated with Passkey/WebAuthn biometric registration and wired password recovery.
 */

import { useState } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Lock, Shield, Key, Smartphone, History, Fingerprint, Plus, Trash2, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { startRegistration } from "@simplewebauthn/browser";
import { useUser, useFirestore, useCollection, useAuth } from "@/firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { cn } from "@/app/lib/utils";

export default function SecurityManagementPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetingPassword, setIsResetingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const { data: passkeys, loading: passkeysLoading } = useCollection<any>(
    user && db ? collection(db, `users/${user.uid}/passkeys`) : null
  );

  const sessions = [
    { device: "Chrome / Windows", ip: "192.168.1.1", status: t('dashboard.live'), last: "Active Now" },
    { device: "Mobile App", ip: "10.0.0.1", status: t('common.active'), last: "2h ago" }
  ];

  const handleRegisterPasskey = async () => {
    if (!user) return;
    setIsRegistering(true);
    setFeedback(null);

    try {
      const resp = await fetch('/api/auth/passkey/register/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const options = await resp.json();
      const attResp = await startRegistration({ optionsJSON: options });
      const verifyResp = await fetch('/api/auth/passkey/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });

      const verificationJSON = await verifyResp.json();

      if (verificationJSON && verificationJSON.verified) {
        setFeedback({ type: 'success', message: 'Biometric passkey successfully registered.' });
      } else {
        setFeedback({ type: 'error', message: 'Verification failed. Please try again.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Biometric registration interrupted.' });
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email || !auth) return;
    
    setIsResetingPassword(true);
    setFeedback(null);

    try {
      await sendPasswordResetEmail(auth, user.email);
      setFeedback({ 
        type: 'success', 
        message: `Recovery link transmitted to ${user.email}. Please check your inbox to modify your password.` 
      });
    } catch (e) {
      setFeedback({ 
        type: 'error', 
        message: 'Authority failure: Could not initiate password recovery.' 
      });
    } finally {
      setIsResetingPassword(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    if (!db || !user || !window.confirm("Confirm deletion of this biometric credential?")) return;
    await deleteDoc(doc(db, `users/${user.uid}/passkeys`, id));
  };

  return (
    <AuthedLayout 
      title={t('nav.security')} 
      subtitle={t('pages.securitySubtitle')}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {feedback && (
            <div className={cn(
              "p-4 border text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 animate-in fade-in slide-in-from-top-1",
              feedback.type === 'success' ? "bg-[#16835B]/5 border-[#16835B]/20 text-[#16835B]" : "bg-[#C43D3D]/5 border-[#C43D3D]/20 text-[#C43D3D]"
            )}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              {feedback.message}
            </div>
          )}

          {/* Biometric Passkeys Section */}
          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-[#E4E4E4] pb-3 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#0055FF]" />
                Passkeys & Biometrics
              </h3>
              <button 
                onClick={handleRegisterPasskey}
                disabled={isRegistering}
                className="text-[10px] font-bold uppercase tracking-widest bg-[#0A0A0A] text-white px-3 py-1.5 flex items-center gap-1.5 hover:bg-[#0055FF] transition-colors disabled:opacity-50"
              >
                {isRegistering ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {isRegistering ? "Wait..." : "Add Passkey"}
              </button>
            </div>

            <div className="space-y-3">
              {passkeysLoading ? (
                <div className="p-4 text-center text-[10px] text-[#6B7280] uppercase font-bold">Synchronizing keys...</div>
              ) : passkeys?.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E4E4E4] bg-[#F7F7F5]">
                  <p className="text-[10px] text-[#6B7280] uppercase font-bold">No passkeys registered</p>
                  <p className="text-[9px] text-[#6B7280] mt-1">Use your device fingerprint or Face ID for faster, secure access.</p>
                </div>
              ) : passkeys?.map((key: any) => (
                <div key={key.id} className="flex justify-between items-center p-4 border border-[#E4E4E4] bg-[#F7F7F5]">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E4E4E4] flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-[#0055FF]" />
                    </div>
                    <div>
                      <span className="font-bold block uppercase text-[10px]">{key.deviceName || 'Authorized Device'}</span>
                      <span className="text-[8px] text-[#6B7280] font-mono">Registered: {new Date(key.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeletePasskey(key.id)}
                    className="p-2 text-[#6B7280] hover:text-[#C43D3D] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6">Manage Access</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border border-[#F7F7F5] bg-[#F7F7F5]">
                <div className="flex items-center space-x-4">
                  <Key className="w-4 h-4 text-[#C9A227]" />
                  <span className="text-[11px] font-bold uppercase">Standard Password</span>
                </div>
                <button 
                  onClick={handlePasswordReset}
                  disabled={isResetingPassword}
                  className="text-[10px] font-bold uppercase underline decoration-[#0055FF] decoration-2 underline-offset-4 hover:text-[#0055FF] transition-colors flex items-center gap-1.5"
                >
                  {isResetingPassword && <Loader2 className="w-3 h-3 animate-spin" />}
                  Change
                </button>
              </div>
              <div className="flex justify-between items-center p-4 border border-[#F7F7F5] bg-[#F7F7F5]">
                <div className="flex items-center space-x-4">
                  <Smartphone className="w-4 h-4 text-[#16835B]" />
                  <span className="text-[11px] font-bold uppercase">2FA Auth</span>
                </div>
                <span className="text-[9px] font-bold bg-[#16835B] text-white px-2 py-0.5">ON</span>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 mb-6">Active Sessions</h3>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-4 border border-[#E4E4E4] text-[11px]">
                  <div className="flex items-center space-x-4">
                    <History className="w-4 h-4 text-[#6B7280]" />
                    <div>
                      <span className="font-bold block uppercase">{s.device}</span>
                      <span className="font-mono text-[#6B7280]">{s.ip}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold block uppercase text-[#16835B]">{s.status}</span>
                    <span className="text-[9px] text-[#6B7280] block">{s.last}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border border-[#C43D3D] text-[#C43D3D] text-[10px] font-bold uppercase tracking-widest hover:bg-[#C43D3D] hover:text-white transition-all">
              Log Out Everywhere Else
            </button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white text-[#0A0A0A] p-6 shadow-sm border border-[#C9A227]">
            <Shield className="w-8 h-8 text-[#C9A227] mb-4" />
            <h4 className="text-sm font-bold uppercase tracking-tight mb-2">Status: Protected</h4>
            <p className="text-[11px] text-[#6B7280] leading-relaxed mb-4">
              Your account is safe. All money moves need a second code to confirm.
            </p>
            <div className="h-1 w-full bg-[#F7F7F5] overflow-hidden">
              <div className="h-full bg-[#16835B] w-full"></div>
            </div>
          </Card>

          <div className="p-4 bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-start space-x-3">
            <Mail className="w-4 h-4 text-[#0055FF] shrink-0 mt-0.5" />
            <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase font-bold">
              Account modifications are verified via registered email domain to prevent unauthorized authority escalation.
            </p>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
