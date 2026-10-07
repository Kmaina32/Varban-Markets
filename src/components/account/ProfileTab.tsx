'use client';

/**
 * @fileOverview Profile Management Tab (Supabase Version).
 * Handles identity metadata and photo synchronization.
 * Feature: Idempotent profile initialization to handle missing records.
 */

import React, { useState, useEffect } from 'react';
import { User, Camera, Loader2, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/app/lib/supabase/client';
import { COUNTRIES } from '@/app/lib/countries';
import { cn } from '@/app/lib/utils';
import { useUser } from '@/firebase';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

export default function ProfileTab() {
  const { user } = useUser();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", country: "United Kingdom", dialCode: "+44"
  });

  const initializeProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.uid,
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          email: user.email,
          country: user.user_metadata?.country || "United Kingdom"
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      if (newProfile) {
        setProfile(newProfile);
        setForm({
          firstName: newProfile.first_name || "",
          lastName: newProfile.last_name || "",
          phone: "",
          country: newProfile.country || "United Kingdom",
          dialCode: "+44"
        });
      }
    } catch (err: any) {
      console.error("Initialization Error:", err);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.uid)
          .maybeSingle();
        
        if (error) {
          // If table doesn't exist, Supabase returns 404 or 42P01
          if (error.code === '42P01') {
            setDialog({
              status: 'error',
              title: 'Database Schema Required',
              message: 'The "profiles" table is missing. Please run the provided SQL setup instructions in your Supabase dashboard.'
            });
            return;
          }
          throw error;
        }

        if (data) {
          setProfile(data);
          const rawPhone = data.phone || "";
          const phoneParts = rawPhone.split(' ');
          setForm({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: phoneParts.length > 1 ? phoneParts.slice(1).join(' ') : rawPhone,
            country: data.country || "United Kingdom",
            dialCode: phoneParts.length > 1 ? phoneParts[0] : "+44"
          });
        } else {
          await initializeProfile();
        }
      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user?.uid, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || isSaving) return;
    setIsSaving(true);
    
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const cleanPhone = `${form.dialCode} ${form.phone}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          full_name: fullName,
          phone: cleanPhone,
          country: form.country,
        })
        .eq('id', user.uid);
      
      if (error) throw error;

      setDialog({
        status: 'success',
        title: 'Identity Verified',
        message: 'Your profile modifications have been successfully registered in the institutional ledger.'
      });
    } catch (err: any) {
      setDialog({
        status: 'error',
        title: 'Handshake Failed',
        message: err.message || 'Failed to synchronize changes. Root authority handshake failed.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Synchronizing Identity...</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      <Card className="p-8 bg-white border-[#E4E4E4] lg:col-span-2 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 border-b border-[#F7F7F5] pb-8">
          <div className="relative group">
            <div className={cn(
              "w-24 h-24 rounded-full border-2 border-[#E4E4E4] flex items-center justify-center bg-[#F7F7F5] overflow-hidden transition-all duration-300 group-hover:border-[#0055FF]"
            )}>
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#6B7280]" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0A0A0A] text-white flex items-center justify-center rounded-full shadow-lg cursor-pointer">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em] block mb-1">Institutional Identity</span>
            <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">
              {profile?.full_name || "Account Profile"}
            </h3>
            <p className="text-[11px] text-[#6B7280] leading-relaxed mt-1 max-w-sm uppercase font-bold tracking-wider">
              {profile?.verification_status || 'Not Verified'} &mdash; ID: {user?.uid?.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-[#6B7280]">First Name</label>
              <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-[#6B7280]">Last Name</label>
              <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0A0A0A] bg-[#F7F7F5]" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-[#6B7280]">Phone Number</label>
            <div className="flex gap-2">
              <select value={form.dialCode} onChange={e => setForm({...form, dialCode: e.target.value})} className="p-3 border border-[#E4E4E4] text-xs bg-[#F7F7F5] outline-none">
                {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
              </select>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="flex-grow p-3 border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF] bg-white" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-[#6B7280]">Country</label>
            <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white outline-none">
              {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={isSaving} className="w-full btn-institutional-primary py-4">
            {isSaving ? "SYNCHRONIZING..." : "Save Identity Changes"}
          </button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-6 bg-white border-[#E4E4E4] border-l-4 border-l-[#0055FF] shadow-sm flex flex-col space-y-4">
          <span className="text-[8px] font-bold uppercase text-[#6B7280] tracking-widest">System Metadata</span>
          <div>
            <span className="text-[8px] uppercase text-[#6B7280] block mb-1">Entity Domain</span>
            <p className="text-[10px] font-mono font-bold truncate text-[#0A0A0A] bg-[#F7F7F5] p-2 border border-[#E4E4E4]">{user?.email}</p>
          </div>
          <div>
            <span className="text-[8px] uppercase text-[#6B7280] block mb-1">Authority Level</span>
            <p className="text-[10px] font-bold uppercase text-[#0055FF]">{profile?.role || "Trader"}</p>
          </div>
        </Card>

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            Identity modifications are logged in the immutable security ledger. Significant changes may trigger a KYC re-verification audit.
          </p>
        </div>
      </div>
    </div>
  );
}