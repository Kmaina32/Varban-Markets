
'use client';

/**
 * @fileOverview Notification Preferences Workspace (Supabase Version).
 * Synchronizes alert flags with the Supabase profiles ledger.
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/app/lib/supabase/client';
import { useUser } from '@/firebase';
import { cn } from '@/app/lib/utils';

interface AlertItem {
  key: string;
  label: string;
}

const ALERT_ITEMS: AlertItem[] = [
  { key: 'newTrades', label: 'NEW TRADES' },
  { key: 'withdrawSuccess', label: 'WITHDRAW SUCCESS' },
  { key: 'securityAlerts', label: 'SECURITY ALERTS' },
  { key: 'systemStatus', label: 'SYSTEM STATUS' }
];

export default function AlertsTab() {
  const { user } = useUser();
  const supabase = createClient();
  
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      if (!user?.uid) return;
      const { data } = await supabase
        .from('profiles')
        .select('alert_preferences')
        .eq('id', user.uid)
        .single();
      
      if (data) setPreferences(data.alert_preferences);
      setLoading(false);
    }
    loadAlerts();
  }, [user?.uid, supabase]);

  const toggleAlert = async (key: string, current: boolean) => {
    if (!user?.uid) return;
    const newPrefs = { ...preferences, [key]: !current };
    
    // Optimistic update
    setPreferences(newPrefs);
    
    await supabase
      .from('profiles')
      .update({ alert_preferences: newPrefs })
      .eq('id', user.uid);
  };

  if (loading) return <div className="p-12 text-center text-[#6B7280] font-mono animate-pulse">Syncing Alerts...</div>;

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card className="bg-white border-[#E4E4E4] p-10 shadow-sm space-y-6">
        <h3 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">
          NOTIFICATION PREFERENCES
        </h3>
        
        <div className="space-y-4">
          {ALERT_ITEMS.map((item) => {
            const isChecked = preferences?.[item.key] ?? true;
            return (
              <div 
                key={item.key} 
                className="flex items-center justify-between p-5 bg-white border border-[#E4E4E4] transition-colors hover:bg-[#F7F7F5]"
              >
                <span className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider">
                  {item.label}
                </span>
                
                <label className="relative flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAlert(item.key, isChecked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-5 h-5 bg-white border-2 border-[#E4E4E4] flex items-center justify-center transition-all",
                    isChecked ? "bg-[#0055FF] border-[#0055FF]" : "peer-hover:border-[#0055FF]"
                  )}>
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
