
'use client';

/**
 * @fileOverview Institutional Settings Workspace (Supabase Version).
 * Handles global preferences for Currency, Language, and Timezone.
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, Globe, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/app/lib/supabase/client';
import { useUser } from '@/firebase';
import { cn } from '@/app/lib/utils';

const TIMEZONES = [
  { label: "UTC -08:00 (PT)", value: "UTC-8" },
  { label: "UTC -05:00 (ET)", value: "UTC-5" },
  { label: "UTC +00:00 (GMT)", value: "UTC+0" },
  { label: "UTC +01:00 (CET)", value: "UTC+1" },
  { label: "UTC +08:00 (HKT)", value: "UTC+8" }
];

export default function DisplayTab() {
  const { user } = useUser();
  const supabase = createClient();
  
  const [form, setForm] = useState({
    currency: 'USD',
    language: 'ENGLISH',
    timezone: 'UTC+0'
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      if (!user?.uid) return;
      const { data } = await supabase
        .from('profiles')
        .select('currency, language, timezone')
        .eq('id', user.uid)
        .single();
      
      if (data) {
        setForm({
          currency: data.currency || 'USD',
          language: data.language || 'ENGLISH',
          timezone: data.timezone || 'UTC+0'
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, [user?.uid, supabase]);

  const handleSave = async () => {
    if (!user?.uid || isSaving) return;
    setIsSaving(true);
    setSuccess(false);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          currency: form.currency,
          language: form.language,
          timezone: form.timezone
        })
        .eq('id', user.uid);
      
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Platform synchronization failure.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-[#6B7280] font-mono animate-pulse">Accessing Preferences...</div>;

  return (
    <div className="max-w-2xl mx-auto py-4">
      <Card className="bg-white border-[#E4E4E4] p-10 shadow-sm space-y-10">
        <div className="space-y-0 divide-y divide-[#F7F7F5]">
          {/* CURRENCY SELECTOR */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-4 h-4 text-[#6B7280]" />
              <span className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest">CURRENCY</span>
            </div>
            <div className="relative group">
              <select 
                value={form.currency} 
                onChange={(e) => setForm({...form, currency: e.target.value})}
                className="appearance-none bg-transparent pr-6 text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="NGN">NGN</option>
                <option value="GHS">GHS</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0A0A0A] pointer-events-none" />
            </div>
          </div>

          {/* LANGUAGE SELECTOR */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Globe className="w-4 h-4 text-[#6B7280]" />
              <span className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest">LANGUAGE</span>
            </div>
            <div className="relative group">
              <select 
                value={form.language} 
                onChange={(e) => setForm({...form, language: e.target.value})}
                className="appearance-none bg-transparent pr-6 text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="ENGLISH">ENGLISH</option>
                <option value="FRENCH">FRANÇAIS</option>
                <option value="SPANISH">ESPAÑOL</option>
                <option value="PORTUGUESE">PORTUGUÊS</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0A0A0A] pointer-events-none" />
            </div>
          </div>

          {/* TIMEZONE SELECTOR */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Clock className="w-4 h-4 text-[#6B7280]" />
              <span className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-widest">TIMEZONE</span>
            </div>
            <div className="relative group">
              <select 
                value={form.timezone} 
                onChange={(e) => setForm({...form, timezone: e.target.value})}
                className="appearance-none bg-transparent pr-6 text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest outline-none cursor-pointer"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0A0A0A] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {success && (
            <div className="p-3 bg-[#16835B]/10 border border-[#16835B] text-[9px] font-bold text-[#16835B] uppercase flex items-center gap-2 animate-in fade-in duration-300">
              <CheckCircle2 className="w-4 h-4" /> Preferences Updated
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#0A0A0A] text-white py-5 text-[11px] font-bold uppercase tracking-[0.25em] transition-all hover:bg-[#161616] disabled:opacity-40 shadow-md"
          >
            {isSaving ? "SYNCING..." : "SAVE SETTINGS"}
          </button>
        </div>
      </Card>
    </div>
  );
}
