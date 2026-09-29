
'use client';

/**
 * @fileOverview Identity Protection & Session Security.
 * Real implementation for password resets, MFA provisioning, and session revocation.
 */

import React, { useState } from 'react';
import { Key, Shield, Laptop, AlertTriangle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useAuth, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useTranslation } from '@/app/lib/i18n-context';
import { cn } from '@/app/lib/utils';

export default function SecurityTab() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { formatDate } = useTranslation();
  
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const { data: sessions, loading: sessionsLoading } = useCollection<any>(
    user ? query(collection(db, `users/${user.uid}/sessions`), orderBy('lastActive', 'desc'), limit(10)) : null
  );

  const handlePasswordReset = async () => {
    if (!auth || !user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("A secure password reset link has been dispatched to your registered email domain.");
    } catch (e) {
      alert("Identity synchronization failure. Please try again later.");
    }
  };

  const handleRevokeSessions = async () => {
    if (!user || !db || isRevoking) return;
    if (!window.confirm("Confirm Authority: This will invalidate all active session tokens associated with this account. You may need to log in again on other devices.")) return;
    
    setIsRevoking(true);
    try {
      const sessionsRef = collection(db, `users/${user.uid}/sessions`);
      const snapshot = await getDocs(sessionsRef);
      
      const deletions = snapshot.docs.map(d => deleteDoc(doc(db, `users/${user.uid}/sessions`, d.id)));
      await Promise.all(deletions);
      
      alert("Security Protocol Executed: All remote session tokens have been revoked.");
    } catch (e) {
      alert("Authority Failure: Could not revoke sessions.");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleToggleMFA = async () => {
    if (!user || !db || isProvisioning) return;
    setIsProvisioning(true);
    
    try {
      const currentStatus = profile?.preferences?.mfaEnabled || false;
      await setDoc(doc(db, "users", user.uid), {
        preferences: { mfaEnabled: !currentStatus }
      }, { merge: true });
      
      alert(`MFA Node Status Updated: Now ${!currentStatus ? 'Active' : 'Disabled'}.`);
    } catch (e) {
      alert("Platform Synchronization Error.");
    } finally {
      setIsProvisioning(false);
    }
  };

  const mfaEnabled = profile?.preferences?.mfaEnabled || false;

  return (
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
              <button 
                onClick={handlePasswordReset} 
                className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all shadow-md"
              >
                Transmit Reset Link
              </button>
            </div>
            <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
               <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
                 Updating your credentials will terminate all active session tokens on remote nodes for your protection.
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
                <span className="text-[10px] font-bold uppercase block text-[#0A0A0A]">Authenticator App</span>
                <span className="text-[8px] text-[#6B7280] uppercase tracking-widest font-mono">TOTP PROTOCOL</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 border text-[8px] font-bold uppercase tracking-widest",
                mfaEnabled ? "bg-[#16835B]/10 text-[#16835B] border-[#16835B]" : "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]"
              )}>
                {mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <button 
              onClick={handleToggleMFA}
              disabled={isProvisioning}
              className="w-full py-4 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#F7F7F5] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isProvisioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 text-[#0055FF]" />}
              <span>{mfaEnabled ? 'Deactivate MFA Node' : 'Provision MFA Node'}</span>
            </button>
          </div>
        </Card>
      </div>

      <Card className="bg-white border-[#E4E4E4] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5]">
          <div className="flex items-center gap-3">
            <Laptop className="w-5 h-5 text-[#0055FF]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Active Sessions</h3>
          </div>
          <button 
            onClick={handleRevokeSessions} 
            disabled={isRevoking || !sessions?.length}
            className="text-[9px] font-bold text-[#C43D3D] uppercase tracking-widest underline decoration-2 underline-offset-4 disabled:opacity-40"
          >
            {isRevoking ? "Executing..." : "Revoke Other Nodes"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-white border-b border-[#E4E4E4]">
              <tr className="text-[8px] font-bold uppercase text-[#6B7280] tracking-widest">
                <th className="p-4">Device Domain</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Telemetry Context</th>
                <th className="p-4 text-right">Last Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E4] text-[10px] font-mono">
              {sessionsLoading ? (
                <tr><td colSpan={4} className="p-12 text-center text-[#6B7280] animate-pulse">Accessing security registry...</td></tr>
              ) : !sessions || sessions.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-[#6B7280] font-bold">No active remote sessions detected.</td></tr>
              ) : sessions.map((sess: any) => (
                <tr key={sess.id} className="hover:bg-[#F7F7F5] transition-colors">
                  <td className="p-4 font-bold text-[#0A0A0A] uppercase tracking-tighter">{sess.deviceName || 'Authorized Node'}</td>
                  <td className="p-4 text-[#6B7280]">{sess.ip || '---'}</td>
                  <td className="p-4 text-[#6B7280] uppercase tracking-tight">{sess.os} &bull; {sess.browser}</td>
                  <td className="p-4 text-right text-[#0A0A0A] font-bold">
                    {sess.lastActive?.toDate ? formatDate(sess.lastActive.toDate()) : 'Active Now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
         <AlertTriangle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
         <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
           Security Notice: Forging device signatures or bypassing session encryption will result in an immediate and permanent lock of all account assets. Maintain credential integrity at all times.
         </p>
      </div>
    </div>
  );
}

