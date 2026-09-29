
'use client';

/**
 * @fileOverview Localization & Workspace Layout.
 */

import React from 'react';
import { Languages, Layout, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { cn } from '@/app/lib/utils';

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

export default function DisplayTab() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const updatePreference = async (key: string, value: any) => {
    if (!user || !db) return;
    await setDoc(doc(db, "users", user.uid), { 
      preferences: { [key]: value } 
    }, { merge: true });
  };

  return (
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
  );
}
