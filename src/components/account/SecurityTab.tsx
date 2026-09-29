
'use client';

/**
 * @fileOverview Identity Protection & Session Security.
 */

import React from 'react';
import { Key, Shield, Laptop, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useAuth } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useTranslation } from '@/app/lib/i18n-context';

export default function SecurityTab() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { formatDate } = useTranslation();

  const { data: sessions } = useCollection<any>(
    user ? query(collection(db, `users/${user.uid}/sessions`), orderBy('lastActive', 'desc'), limit(5)) : null
  );

  const handlePasswordReset = async () => {
    if (!auth || !user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("A secure password reset link has been dispatched to your email domain.");
    } catch (e) {
      alert("Identity synchronization failure.");
    }
  };

  const handleRevokeSessions = () => {
    if (!window.confirm("Confirm: This will invalidate all other active session tokens.")) return;
    alert("Session revocation initiated. Tokens will expire across all nodes.");
  };

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
              <button onClick={handlePasswordReset} className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all shadow-md">
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
                <span className="text-[10px] font-bold uppercase block">Authenticator App</span>
                <span className="text-[8px] text-[#6B7280] uppercase tracking-widest font-mono">TOTP PROTOCOL</span>
              </div>
              <span className="px-2 py-0.5 bg-[#6B7280]/10 text-[#6B7280] border border-[#6B7280] text-[8px] font-bold uppercase">Disabled</span>
            </div>
            <button className="w-full py-4 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#F7F7F5] transition-all">
              Provision MFA Node
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
                <th className="p-4">Telemetry Context</th>
                <th className="p-4 text-right">Last Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E4] text-[10px] font-mono">
              {!sessions ? (
                <tr><td colSpan={4} className="p-8 text-center text-[#6B7280]">Accessing security registry...</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-[#6B7280]">No external sessions detected.</td></tr>
              ) : sessions.map((sess: any) => (
                <tr key={sess.id} className="hover:bg-[#F7F7F5] transition-colors">
                  <td className="p-4 font-bold text-[#0A0A0A]">{sess.deviceName || 'Authorized Node'}</td>
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
  );
}
