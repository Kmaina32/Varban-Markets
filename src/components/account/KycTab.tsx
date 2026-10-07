'use client';

/**
 * @fileOverview Institutional 3-Slot KYC Verification Pipeline.
 * Updated with Firebase null-guards to prevent "collection()" crashes.
 */

import React, { useState } from 'react';
import { ShieldCheck, FileText, Camera, Plus, Loader2, ShieldAlert, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createClient } from '@/app/lib/supabase/client';
import { cn } from '@/app/lib/utils';
import CameraCaptureModal from './CameraCaptureModal';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

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
    desc: 'Passport or ID. Select both Front and Back images if applicable.', 
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
  const supabase = createClient();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const handleUpload = async (files: FileList | File[], type: string) => {
    if (!user) return;
    setIsUploading(type);
    
    try {
      const fileArray = Array.isArray(files) ? files : Array.from(files);
      
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

        await fetch(uploadUrl, { 
          method: 'PUT', 
          headers: { 'Content-Type': file.type }, 
          body: file 
        });

        // Guard Firebase usage
        if (db) {
          await addDoc(collection(db, `users/${user.uid}/kyc_submissions`), {
            type,
            storageKey: key,
            fileType: file.type,
            fileName: file.name,
            timestamp: serverTimestamp(),
            status: 'Pending'
          });
        }
      }

      // Update Supabase profiles table
      await supabase.from('profiles').update({ verification_status: 'Pending' }).eq('id', user.uid);

      if (db && profile?.status?.verificationStatus !== 'Verified') {
        await setDoc(doc(db, "users", user.uid), {
          status: { verificationStatus: 'Pending' }
        }, { merge: true });
      }

      setDialog({
        status: 'success',
        title: 'Evidence Registered',
        message: 'Your documents have been submitted to the compliance node for manual audit.'
      });
    } catch (e) {
      setDialog({
        status: 'error',
        title: 'Transmission failure',
        message: 'Handshake Error: Could not establish a secure link with the compliance node.'
      });
    } finally {
      setIsUploading(null);
    }
  };

  const status = profile?.verification_status || profile?.status?.verificationStatus || 'Not Verified';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <StatusDialog 
        status={dialog.status} 
        title={dialog.title} 
        message={dialog.message} 
        onClose={() => setDialog({ ...dialog, status: null })} 
      />

      <CameraCaptureModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={(file) => handleUpload([file], 'BIOMETRIC_SELFIE')} 
      />

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

                <button 
                  disabled={isUploading === slot.id || status === 'Verified'}
                  onClick={() => {
                    if (slot.isCamera) {
                      setIsCameraOpen(true);
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
      </Card>
    </div>
  );
}