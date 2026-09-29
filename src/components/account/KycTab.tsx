'use client';

/**
 * @fileOverview Institutional KYC Verification Tab.
 * Implements 4 specific document slots for identity and residency proof.
 * Updated: Biometric Selfie now triggers the front camera directly.
 */

import React, { useState } from 'react';
import { ShieldCheck, FileText, Camera, Upload, Loader2, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/app/lib/utils';

interface KycSlot {
  id: string;
  title: string;
  desc: string;
  icon: any;
  acceptsPdf: boolean;
}

const KYC_SLOTS: KycSlot[] = [
  { id: 'PASSPORT', title: 'Passport Image', desc: 'Full bio-page scan showing name, photo and MRZ.', icon: FileText, acceptsPdf: true },
  { id: 'NATIONAL_ID', title: 'Government ID', desc: 'National Identity Card or Driver License (Front & Back).', icon: FileText, acceptsPdf: true },
  { id: 'RESIDENCE_PROOF', title: 'Proof of Residence', desc: 'Utility bill or bank statement from the last 3 months.', icon: FileText, acceptsPdf: true },
  { id: 'SELFIE_VERIFICATION', title: 'Biometric Selfie', desc: 'A clear photo of your face while holding your ID document.', icon: Camera, acceptsPdf: false }
];

export default function KycTab() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleUpload = async (file: File, type: string) => {
    if (!user || !db) return;
    setIsUploading(type);
    
    try {
      const resp = await fetch('/api/storage/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          userId: user.uid,
          purpose: 'kyc'
        })
      });
      
      const { uploadUrl, key } = await resp.json();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

      // Record in kyc_submissions sub-collection
      await addDoc(collection(db, `users/${user.uid}/kyc_submissions`), {
        type,
        storageKey: key,
        fileType: file.type,
        fileName: file.name,
        timestamp: serverTimestamp(),
        status: 'Pending'
      });

      // Update primary user status to Pending if it's not already Verified
      if (profile?.status?.verificationStatus !== 'Verified') {
        await setDoc(doc(db, "users", user.uid), {
          status: { verificationStatus: 'Pending' }
        }, { merge: true });
      }

      alert(`${type.replace('_', ' ')} transmitted for audit.`);
    } catch (e) {
      alert("Verification transmission failed.");
    } finally {
      setIsUploading(null);
    }
  };

  const status = profile?.status?.verificationStatus || 'Not Verified';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8 bg-white border-[#E4E4E4] space-y-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#F7F7F5]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Verification Desk</h3>
            <p className="text-[11px] text-[#6B7280] mt-1">Complete your identity audit to unlock unrestricted platform access.</p>
          </div>
          <div className={cn(
            "px-3 py-1.5 border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
            status === 'Verified' ? "bg-[#16835B]/10 border-[#16835B] text-[#16835B]" : "bg-[#F7F7F5] border-[#E4E4E4] text-[#6B7280]"
          )}>
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Status: {status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {KYC_SLOTS.map((slot) => (
            <div key={slot.id} className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] flex flex-col justify-between space-y-4 group hover:border-[#0055FF] transition-all">
              <div className="space-y-3">
                <slot.icon className="w-6 h-6 text-[#0055FF]" />
                <h4 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">{slot.title}</h4>
                <p className="text-[10px] text-[#6B7280] leading-relaxed">{slot.desc}</p>
              </div>
              <button 
                disabled={isUploading === slot.id || status === 'Verified'}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = slot.acceptsPdf ? 'image/*,application/pdf' : 'image/*';
                  
                  // Trigger front camera for selfie verification
                  if (slot.id === 'SELFIE_VERIFICATION') {
                    input.setAttribute('capture', 'user');
                  }
                  
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleUpload(file, slot.id);
                  };
                  input.click();
                }}
                className="w-full py-3 bg-white border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:border-[#0055FF] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isUploading === slot.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{slot.id === 'SELFIE_VERIFICATION' ? 'Open Camera' : 'Upload Document'}</span>
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#0055FF]/5 border border-[#0055FF]/20 space-y-4">
          <div className="flex items-center gap-2 text-[#0055FF]">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Compliance Requirements</h4>
          </div>
          <ul className="text-[10px] text-[#6B7280] space-y-2 font-bold uppercase leading-relaxed">
            <li className="flex items-start gap-2"><span>&bull;</span> Images must be high-resolution, color, and uncropped.</li>
            <li className="flex items-start gap-2"><span>&bull;</span> Document names must match your profile exactly.</li>
            <li className="flex items-start gap-2"><span>&bull;</span> Third-party documents are strictly rejected.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
