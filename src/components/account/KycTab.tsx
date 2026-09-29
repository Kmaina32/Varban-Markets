
'use client';

/**
 * @fileOverview Institutional 3-Slot KYC Verification Pipeline.
 * 1. Identity Document (Passport/ID - allows 2 files for Front/Back).
 * 2. Proof of Residence (PDF/Image).
 * 3. Biometric Selfie (Triggers native hardware camera).
 */

import React, { useState, useRef } from 'react';
import { ShieldCheck, FileText, Camera, Upload, Loader2, ShieldAlert, Check, Plus, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/app/lib/utils';

interface KycSlot {
  id: string;
  title: string;
  desc: string;
  icon: any;
  multiple: boolean;
  acceptsPdf: boolean;
  isCamera?: boolean;
}

const KYC_SLOTS: KycSlot[] = [
  { 
    id: 'IDENTITY_DOCUMENT', 
    title: 'Identity Document', 
    desc: 'Passport or ID. Select 2 images for Front and Back if using National ID.', 
    icon: FileText, 
    multiple: true,
    acceptsPdf: true 
  },
  { 
    id: 'RESIDENCE_PROOF', 
    title: 'Proof of Residence', 
    desc: 'Utility bill or bank statement (issued in the last 3 months).', 
    icon: FileText, 
    multiple: false,
    acceptsPdf: true 
  },
  { 
    id: 'BIOMETRIC_SELFIE', 
    title: 'Biometric Selfie', 
    desc: 'Capture a live photo of your face using your device camera.', 
    icon: Camera, 
    multiple: false,
    acceptsPdf: false,
    isCamera: true
  }
];

export default function KycTab() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | File[], type: string) => {
    if (!user || !db) return;
    setIsUploading(type);
    
    try {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        // 1. Generate secure R2 transmission token
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

        // 2. Perform direct PUT to Cloudflare R2
        await fetch(uploadUrl, { 
          method: 'PUT', 
          headers: { 'Content-Type': file.type }, 
          body: file 
        });

        // 3. Register entry in compliance ledger
        await addDoc(collection(db, `users/${user.uid}/kyc_submissions`), {
          type,
          storageKey: key,
          fileType: file.type,
          fileName: file.name,
          timestamp: serverTimestamp(),
          status: 'Pending'
        });
      }

      // Update global verification state
      if (profile?.status?.verificationStatus !== 'Verified') {
        await setDoc(doc(db, "users", user.uid), {
          status: { verificationStatus: 'Pending' }
        }, { merge: true });
      }

      alert("Evidence successfully registered in the compliance ledger.");
    } catch (e) {
      console.error("KYC Upload Failure:", e);
      alert("Transmission Failure: Could not establish a secure link with the compliance node.");
    } finally {
      setIsUploading(null);
    }
  };

  const status = profile?.status?.verificationStatus || 'Not Verified';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="p-8 bg-white border-[#E4E4E4] space-y-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#F7F7F5]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Verification Desk</h3>
            <p className="text-[11px] text-[#6B7280] mt-1 uppercase font-bold tracking-wider">
              Required: Identity, Residence, and Biometric Proof.
            </p>
          </div>
          <div className={cn(
            "px-4 py-2 border text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2",
            status === 'Verified' ? "bg-[#16835B]/10 border-[#16835B] text-[#16835B]" : 
            status === 'Pending' ? "bg-[#0055FF]/10 border-[#0055FF] text-[#0055FF]" :
            "bg-[#F7F7F5] border-[#E4E4E4] text-[#6B7280]"
          )}>
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Status: {status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {KYC_SLOTS.map((slot) => (
            <div key={slot.id} className="p-6 border border-[#E4E4E4] bg-[#F7F7F5] flex flex-col justify-between space-y-6 group hover:border-[#0055FF] transition-all">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-white border border-[#E4E4E4] flex items-center justify-center">
                  <slot.icon className="w-5 h-5 text-[#0055FF]" />
                </div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A]">{slot.title}</h4>
                <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase font-bold opacity-70">{slot.desc}</p>
              </div>
              
              <div className="relative">
                {/* Hidden Inputs */}
                {slot.isCamera ? (
                  <input
                    type="file"
                    ref={selfieInputRef}
                    className="hidden"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) handleUpload(files, slot.id);
                    }}
                  />
                ) : (
                  <input
                    id={`file-input-${slot.id}`}
                    type="file"
                    className="hidden"
                    multiple={slot.multiple}
                    accept={slot.acceptsPdf ? 'image/*,application/pdf' : 'image/*'}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) handleUpload(files, slot.id);
                    }}
                  />
                )}

                <button 
                  disabled={isUploading === slot.id || status === 'Verified'}
                  onClick={() => {
                    if (slot.isCamera) {
                      selfieInputRef.current?.click();
                    } else {
                      document.getElementById(`file-input-${slot.id}`)?.click();
                    }
                  }}
                  className="w-full py-3 bg-white border border-[#E4E4E4] text-[9px] font-bold uppercase tracking-widest hover:border-[#0055FF] hover:text-[#0055FF] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isUploading === slot.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{slot.isCamera ? 'Open Camera' : 'Upload Files'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#F7F7F5] border border-[#E4E4E4] border-l-4 border-l-[#C9A227] flex items-start gap-4 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-[#C9A227] shrink-0" />
          <div className="space-y-2">
            <p className="text-[10px] text-[#0A0A0A] uppercase font-bold leading-relaxed tracking-wider">
              Institutional Compliance Notice
            </p>
            <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase">
              All documents are manually verified against global AML standards within 24-48 hours. Ensure your profile name exactly matches your identity documents to prevent account freezes.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-[#E4E4E4] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-[#0055FF]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">Verification Level: Standard Trader</span>
        </div>
        <button className="text-[9px] font-bold text-[#0055FF] uppercase underline decoration-2 underline-offset-4">
          View Limit Matrix
        </button>
      </Card>
    </div>
  );
}
