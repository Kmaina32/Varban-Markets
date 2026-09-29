
'use client';

/**
 * @fileOverview Profile Management Tab.
 * Handles identity metadata and profile photo synchronization.
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Loader2, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { COUNTRIES } from '@/app/lib/countries';
import { R2_PUBLIC_URL } from '@/app/lib/r2-service';
import { cn } from '@/app/lib/utils';

export default function ProfileTab() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", country: "United Kingdom", dialCode: "+44"
  });

  useEffect(() => {
    if (profile?.profile) {
      const p = profile.profile;
      const rawPhone = p.phone || "";
      const phoneParts = rawPhone.split(' ');
      setForm({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        phone: phoneParts.length > 1 ? phoneParts.slice(1).join(' ') : rawPhone,
        country: p.country || "United Kingdom",
        dialCode: phoneParts.length > 1 ? phoneParts[0] : "+44"
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || isSaving) return;
    setIsSaving(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const cleanPhone = `${form.dialCode} ${form.phone}`.trim();
      
      await setDoc(doc(db, "users", user.uid), {
        profile: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          fullName: fullName,
          phone: cleanPhone,
          country: form.country,
        }
      }, { merge: true });
      
      setFeedback("Identity updated successfully.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      alert("Failed to synchronize changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !db) return;

    if (!file.type.startsWith('image/')) {
      alert("Invalid format: Please select a JPEG or PNG image.");
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const resp = await fetch('/api/storage/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          userId: user.uid,
          userName: profile?.profile?.fullName || user.email?.split('@')[0],
          purpose: 'profile'
        })
      });

      const { uploadUrl, key } = await resp.json();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

      const finalUrl = `${R2_PUBLIC_URL}/${key}`;
      await setDoc(doc(db, "users", user.uid), {
        profile: { photoUrl: finalUrl }
      }, { merge: true });

      setFeedback("Photo updated.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      alert("Failed to sync photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-8 bg-white border-[#E4E4E4] lg:col-span-2 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 border-b border-[#F7F7F5] pb-8">
          <div className="relative group">
            <div className={cn(
              "w-24 h-24 rounded-full border-2 border-[#E4E4E4] flex items-center justify-center bg-[#F7F7F5] overflow-hidden transition-all duration-300",
              isUploadingPhoto ? "opacity-50" : "group-hover:border-[#0055FF]"
            )}>
              {profile?.profile?.photoUrl ? (
                <img src={profile.profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#6B7280]" />
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <Loader2 className="w-6 h-6 text-[#0055FF] animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0A0A0A] text-white flex items-center justify-center rounded-full shadow-lg hover:bg-[#0055FF] transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em] block mb-1">Institutional Identity</span>
            <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">
              {profile?.profile?.fullName || "Account Profile"}
            </h3>
            <p className="text-[11px] text-[#6B7280] leading-relaxed mt-1 max-w-sm">
              Update your account photo and personal details. Your identity is verified against submitted compliance documents.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-[#6B7280]">First Name</label>
              <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0055FF]" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-[#6B7280]">Last Name</label>
              <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase outline-none focus:border-[#0055FF]" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-[#6B7280]">Phone Number</label>
            <div className="flex gap-2">
              <select value={form.dialCode} onChange={e => setForm({...form, dialCode: e.target.value})} className="p-3 border border-[#E4E4E4] text-xs bg-[#F7F7F5] outline-none">
                {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.flag} {c.dial_code}</option>)}
              </select>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="flex-grow p-3 border border-[#E4E4E4] text-xs font-mono outline-none focus:border-[#0055FF]" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-[#6B7280]">Country</label>
            <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full p-3 border border-[#E4E4E4] text-xs font-bold uppercase bg-white outline-none">
              {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          {feedback && <div className="p-3 bg-[#16835B]/10 border border-[#16835B] text-[9px] font-bold text-[#16835B] uppercase">{feedback}</div>}
          <button type="submit" disabled={isSaving} className="w-full btn-institutional-primary py-4">
            {isSaving ? "Synchronizing..." : "Save Identity Changes"}
          </button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-6 bg-white border-[#E4E4E4] border-l-4 border-l-[#0055FF] shadow-sm flex flex-col space-y-4">
          <span className="text-[8px] font-bold uppercase text-[#6B7280] tracking-widest">System Metadata</span>
          <div>
            <span className="text-[8px] uppercase text-[#6B7280] block mb-1">Entity Reference</span>
            <p className="text-[10px] font-mono font-bold truncate text-[#0A0A0A] bg-[#F7F7F5] p-2 border border-[#E4E4E4]">{user?.uid}</p>
          </div>
          <div>
            <span className="text-[8px] uppercase text-[#6B7280] block mb-1">Authority Level</span>
            <p className="text-[10px] font-bold uppercase text-[#0055FF]">{profile?.status?.role || "Trader"}</p>
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
