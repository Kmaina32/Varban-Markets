
'use client';

/**
 * @fileOverview Institutional Identity Protection & Session Security.
 * Hardened against Firebase null database references to prevent runtime crashes.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Key, Shield, Laptop, AlertTriangle, Loader2, Smartphone } from 'lucide-react';
import { PASSWORD_POLICY } from '@/app/lib/password-policy';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useAuth, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useTranslation } from '@/app/lib/i18n-context';
import { cn } from '@/app/lib/utils';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';
import PhoneVerification from './PhoneVerification';

export default function SecurityTab() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { formatDate } = useTranslation();
  
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  useEffect(() => {
    try { setNeedsUpgrade(sessionStorage.getItem('varban_password_upgrade') === '1'); } catch {}
  }, []);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const sessionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, `users/${user.uid}/sessions`), orderBy('lastActive', 'desc'), limit(10));
  }, [db, user]);

  const { data: sessions, loading: sessionsLoading } = useCollection<any>(sessionsQuery);

  const handlePasswordReset = async () => {
    if (!auth || !user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      try { sessionStorage.removeItem('varban_password_upgrade'); } catch {}
      setNeedsUpgrade(false);
      setDialog({
        status: 'success',
        title: 'Reset link dispatched',
        message: `A security link has been transmitted to ${user.email}. Please follow the instructions to update your credentials.`
      });
    } catch (e) {
      setDialog({
        status: 'error',
        title: 'Sync Failure',
        message: 'Unable to communicate with the identity provider. Please try again later.'
      });
    }
  };

  const handleRevokeSessions = async () => {
    if (!user || !db || isRevoking) return;
    
    setDialog({
      status: 'warning',
      title: 'Confirm Revocation',
      message: 'This will instantly invalidate all active session tokens on other devices. You will need to log back in manually everywhere else.',
      onAction: async () => {
        setIsRevoking(true);
        setDialog({ ...dialog, status: 'loading', title: 'Executing Revocation' });
        try {
          const sessionsRef = collection(db, `users/${user.uid}/sessions`);
          const snapshot = await getDocs(sessionsRef);
          const deletions = snapshot.docs.map(d => deleteDoc(doc(db, `users/${user.uid}/sessions`, d.id)));
          await Promise.all(deletions);
          
          setDialog({
            status: 'success',
            title: 'Global Revocation Complete',
            message: 'All remote session tokens have been invalidated successfully.'
          });
        } catch (e) {
          setDialog({ status: 'error', title: 'Command Failed', message: 'Failed to execute revocation across all nodes.' });
        } finally {
          setIsRevoking(false);
        }
      }
    } as any);
  };

  const handleToggleMFA = async () => {
    if (!user || !db || isProvisioning) return;
    
    // REQUIRE PHONE VERIFICATION FIRST
    if (!profile?.status?.phoneVerified) {
      setDialog({
        status: 'warning',
        title: 'Verification Required',
        message: 'You must verify your phone number via SMS before activating Multi-Factor Authentication.'
      });
      return;
    }

    setIsProvisioning(true);
    try {
      const currentStatus = profile?.preferences?.mfaEnabled || false;
      await setDoc(doc(db, "users", user.uid), {
        preferences: { mfaEnabled: !currentStatus }
      }, { merge: true });
      
      setDialog({
        status: 'success',
        title: 'Security State Updated',
        message: `Multi-factor authentication is now ${!currentStatus ? 'ACTIVE' : 'DISABLED'} for this entity.`
      });
    } catch (e) {
      setDialog({ status: 'error', title: 'Sync Error', message: 'MFA state synchronization interrupted.' });
    } finally {
      setIsProvisioning(false);
    }
  };

  const mfaEnabled = profile?.preferences?.mfaEnabled || false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })}
        actionLabel={(dialog as any).onAction ? 'Confirm Command' : undefined}
        onAction={(dialog as any).onAction}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
            <Key className="w-5 h-5 text-[#0055FF]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Security Credentials</h3>
          </div>
          <div className="space-y-4">
            {needsUpgrade && (
              <div role="alert" className="flex items-start gap-3 p-4 border border-[#C9A227] bg-[#C9A227]/5 text-[10px] font-bold uppercase leading-relaxed text-[#8a6d10]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Your password does not meet our current policy ({PASSWORD_POLICY.minLength}+ characters). Update your credentials to maintain account integrity.
                </span>
              </div>
            )}
            <div>
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">Password Sync</span>
              <button 
                onClick={handlePasswordReset} 
                className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all shadow-md"
              >
                Dispatch Reset Link
              </button>
            </div>
            <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed bg-[#F7F7F5] p-4 border border-[#E4E4E4]">
              Updating credentials will terminate all active session tokens on remote nodes for your protection.
            </p>
          </div>
        </Card>

        <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
            <Smartphone className="w-5 h-5 text-[#0055FF]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Identity Check (SMS)</h3>
          </div>
          <PhoneVerification 
            currentPhone={profile?.profile?.phone} 
            isVerified={profile?.status?.phoneVerified} 
          />
        </Card>
      </div>

      <Card className="p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
          <Shield className="w-5 h-5 text-[#16835B]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Multi-Factor Authentication (2FA)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-2">
            <p className="text-xs text-[#6B7280] leading-relaxed font-bold uppercase tracking-tight">
              Activate Multi-Factor Authentication to protect your capital domain. 2FA is mandatory for all withdrawals exceeding $1,000 USD to ensure total financial integrity.
            </p>
          </div>
          <div className="md:col-span-4 space-y-3">
             <div className="flex justify-between items-center p-3 bg-[#F7F7F5] border border-[#E4E4E4]">
                <span className="text-[9px] font-bold uppercase text-[#6B7280]">2FA Protocol</span>
                <span className={cn(
                  "px-2 py-0.5 border text-[8px] font-bold uppercase",
                  mfaEnabled ? "bg-[#16835B]/10 text-[#16835B] border-[#16835B]" : "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]"
                )}>
                  {mfaEnabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
             </div>
             <button 
                onClick={handleToggleMFA}
                disabled={isProvisioning}
                className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {isProvisioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                <span>{mfaEnabled ? 'Disable Protection' : 'Activate 2FA'}</span>
              </button>
          </div>
        </div>
      </Card>

      <Card className="bg-white border-[#E4E4E4] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5]">
          <div className="flex items-center gap-3">
            <Laptop className="w-5 h-5 text-[#0055FF]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Device Sessions</h3>
          </div>
          <button 
            onClick={handleRevokeSessions} 
            disabled={isRevoking || !sessions?.length}
            className="text-[9px] font-bold text-[#C43D3D] uppercase tracking-widest underline decoration-2 underline-offset-4 disabled:opacity-40"
          >
            {isRevoking ? "Revoking..." : "Logout Other Devices"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-white border-b border-[#E4E4E4]">
              <tr className="text-[8px] font-bold uppercase text-[#6B7280] tracking-widest">
                <th className="p-4">Authorized Node</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Platform Context</th>
                <th className="p-4 text-right">Last Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E4] text-[10px] font-mono">
              {sessionsLoading ? (
                <tr><td colSpan={4} className="p-12 text-center text-[#6B7280] animate-pulse">Syncing Security Registry...</td></tr>
              ) : !sessions || sessions.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-[#6B7280] font-bold uppercase">No remote sessions detected.</td></tr>
              ) : sessions.map((sess: any) => (
                <tr key={sess.id} className="hover:bg-[#F7F7F5] transition-colors">
                  <td className="p-4 font-bold text-[#0A0A0A] uppercase tracking-tighter">{sess.deviceName || 'Trading Terminal'}</td>
                  <td className="p-4 text-[#6B7280]">{sess.ip || '---'}</td>
                  <td className="p-4 text-[#6B7280] uppercase tracking-tight">{sess.os} &bull; {sess.browser}</td>
                  <td className="p-4 text-right text-[#0A0A0A] font-bold">
                    {sess.lastActive?.toDate ? formatDate(sess.lastActive.toDate()) : 'Active Node'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
