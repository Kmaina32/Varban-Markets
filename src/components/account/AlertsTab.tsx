
'use client';

/**
 * @fileOverview Notifications & Subscriptions.
 */

import React from 'react';
import { Bell, Activity, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { useTranslation } from '@/app/lib/i18n-context';
import { cn } from '@/app/lib/utils';

export default function AlertsTab() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  const { formatDate } = useTranslation();

  const { data: notifications } = useCollection<any>(
    user ? query(collection(db, `users/${user.uid}/notifications`), orderBy('timestamp', 'desc'), limit(20)) : null
  );

  const toggleAlert = async (key: string, current: boolean) => {
    if (!user || !db) return;
    await setDoc(doc(db, "users", user.uid), {
      preferences: { alerts: { [key]: !current } }
    }, { merge: true });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-[#E4E4E4] shadow-sm md:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#F7F7F5] pb-4 mb-6">Subscriptions</h3>
          <div className="space-y-5">
            {[
              { key: 'newTrades', label: 'Trade Execution' },
              { key: 'withdrawSuccess', label: 'Cashier Events' },
              { key: 'securityAlerts', label: 'Security Logs' },
              { key: 'systemStatus', label: 'Node Status' }
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
            {!notifications ? (
              <div className="h-full flex items-center justify-center p-8 text-[#6B7280] text-[10px] uppercase font-bold tracking-widest">Synchronizing ledger...</div>
            ) : notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                <Bell className="w-10 h-10 text-[#E4E4E4]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Registry is Clear</p>
              </div>
            ) : (
              notifications.map((note: any) => (
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
  );
}
