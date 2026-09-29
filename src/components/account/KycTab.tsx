
'use client';

/**
 * @fileOverview Institutional KYC Verification Tab.
 * Consolidates ID upload into a single slot allowing for two image selections.
 */

import React, { useState } from 'react';
import { ShieldCheck, FileText, Camera, Upload, Loader2, ShieldAlert, Check, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/app/lib/utils';
import CameraCaptureModal from './CameraCaptureModal';

interface KycSlot {
  id: string;
  title: string;
  desc: string;
  icon: any;
  multiple: boolean;
  acceptsPdf: boolean;
}

const KYC_SLOTS: KycSlot[] = [
  { 
    id: 'IDENTITY_DOCUMENT', 
    title: 'Identity Document', 
    desc: 'Upload both FRONT and BACK images (or Passport page). Select 2 files.', 
    icon: FileText, 
    multiple: true,
    acceptsPdf: true 
  },
  { 
    id: 'RESIDENCE_PROOF', 
    title: 'Proof of Residence', 
    desc: 'Utility bill or bank statement issued in the last 3 months.', 
    icon: FileText, 
    multiple: false,
    acceptsPdf: true 
  },
  { 
    id: 'SELFIE_VERIFICATION', 
    title: 'Biometric Selfie', 
    desc: 'Live front-facing photo captured directly through your camera.', 
    icon: Camera, 
    multiple: false,
    acceptsPdf: false 
  }
];

export default function KycTab() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleUpload = async (files: FileList | File[], type: string) => {
    if (!user || !db) return;
    setIsUploading(type);
    
    try {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
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

        await addDoc(collection(db, `users/${user.uid}/kyc_submissions`), {
          type,
          storageKey: key,
          fileType: file.type,
          fileName: file.name,
          timestamp: serverTimestamp(),
          status: 'Pending'
        });
      }

      if (profile?.status?.verificationStatus !== 'Verified') {
        await setDoc(doc(db, "users", user.uid), {
          status: { verificationStatus: 'Pending' }
        }, { merge: true });
      }

      alert("Evidence transmission registered in the compliance ledger.");
    } catch (e) {
      alert("Handshake Failure: Verification transmission failed.");
    } finally {
      setIsUploading(null);
    }
  };

  const status = profile?.status?.verificationStatus || 'Not Verified';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <CameraCaptureModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={(file) => handleUpload([file], 'SELFIE_VERIFICATION')} 
      />

      <Card className="p-8 bg-white border-[#E4E4E4] space-y-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#F7F7F5]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Verification Desk</h3>
            <p className="text-[11px] text-[#6B7280] mt-1 uppercase font-bold tracking-wider">Audit Requirement: Identity, Residence, and Biometric Proof.</p>
          </div>
          <div className={cn(
            "px-4 py-2 border text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2",
            status === 'Verified' ? "bg-[#16835B]/10 border-[#16835B] text-[#16835B]" : "bg-[#F7F7F5] border-[#E4E4E4] text-[#6B7280]"
          )}>
            <ShieldCheck className="w-4 h-4" />
            <span>Status: {status}</span>
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
              
              <button 
                disabled={isUploading === slot.id || status === 'Verified'}
                onClick={() => {
                  if (slot.id === 'SELFIE_VERIFICATION') {
                    setIsCameraOpen(true);
                    return;
                  }
                  
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = slot.multiple;
                  input.accept = slot.acceptsPdf ? 'image/*,application/pdf' : 'image/*';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) handleUpload(files, slot.id);
                  };
                  input.click();
                }}
                className="w-full py-3 bg-white border border-[#E4E4E4] text-[9px] font-bold uppercase tracking-widest hover:border-[#0055FF] hover:text-[#0055FF] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isUploading === slot.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{slot.id === 'SELFIE_VERIFICATION' ? 'Launch Camera' : slot.multiple ? 'Select 2 Files' : 'Select File'}</span>
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#F7F7F5] border border-[#E4E4E4] border-l-4 border-l-[#0055FF] flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-[#0055FF] shrink-0" />
          <p className="text-[10px] text-[#6B7280] uppercase font-bold leading-relaxed tracking-wider">
            All submitted documents are reviewed manually by the compliance node within 24 to 48 business hours. Ensure all metadata is visible and images are not blurred.
          </p>
        </div>
      </Card>
    </div>
  );
}
