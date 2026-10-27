'use client';

/**
 * @fileOverview KYC verification flow: gate -> document details -> ID upload ->
 * liveness selfie -> review & submit. 
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ShieldCheck, FileText, Camera, Loader2, AlertCircle, CheckCircle2, RefreshCw, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, updateDoc, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/app/lib/utils';
import { authFetch } from '@/app/lib/auth-fetch';
import { getProfileGaps } from '@/app/lib/profile-completion';
import type { LivenessResult } from './LivenessCapture';

// Dynamic import for the camera component to prevent face-api critical dependency warnings
const CameraCaptureModal = dynamic(() => import('./CameraCaptureModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[600] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white p-8 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0055FF]" />
        <p className="text-xs font-bold uppercase tracking-widest">Initializing Secure Camera...</p>
      </div>
    </div>
  )
});

type DocType = 'passport' | 'national_id' | 'drivers_license';
type SlotId = 'front' | 'back' | 'selfie';
type UploadState = { status: 'idle' | 'uploading' | 'done' | 'error'; key?: string; error?: string };

const DOC_TYPES: { id: DocType; label: string }[] = [
  { id: 'passport', label: 'Passport' },
  { id: 'national_id', label: 'National ID' },
  { id: 'drivers_license', label: "Driver's licence" },
];
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024;
const STEPS = ['Details', 'ID document', 'Selfie', 'Review'];

const inputCls =
  'w-full px-4 py-3 bg-white border border-[#E4E4E4] text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0055FF]';
const btnCls =
  'px-5 py-3 bg-white border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest hover:border-[#0055FF] hover:text-[#0055FF] transition-all flex items-center justify-center gap-2 disabled:opacity-40';
const primaryCls =
  'px-6 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 disabled:opacity-40';

function validateFile(f: File): string | null {
  if (!ALLOWED.includes(f.type)) return 'Only JPG, PNG, WebP or PDF files are accepted.';
  if (f.size <= 0 || f.size > MAX_BYTES) return 'The file must be 10 MB or smaller.';
  return null;
}

function toDate(v: any): Date | null {
  if (!v) return null;
  if (typeof v === 'string') { const d = new Date(v); return isNaN(+d) ? null : d; }
  if (typeof v.toDate === 'function') return v.toDate();
  return null;
}

export default function KycTab() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile, loading: profileLoading } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState<DocType>('national_id');
  const [country, setCountry] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [files, setFiles] = useState<{ front?: File; back?: File; selfie?: Blob | File }>({});
  const [uploads, setUploads] = useState<Record<SlotId, UploadState>>({
    front: { status: 'idle' }, back: { status: 'idle' }, selfie: { status: 'idle' },
  });
  const [faceCheck, setFaceCheck] = useState<LivenessResult | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [latest, setLatest] = useState<Date | null>(null);
  const urlsRef = useRef<string[]>([]);

  const status: string = profile?.status?.verificationStatus || 'Not Verified';
  const canSubmitNew = status === 'Not Verified' || status === 'Rejected';
  const gaps = profile ? getProfileGaps(profile) : [];

  useEffect(() => () => { urlsRef.current.forEach((u) => URL.revokeObjectURL(u)); }, []);

  useEffect(() => {
    if (!db || !user || status === 'Not Verified') return;
    let cancelled = false;
    getDocs(query(collection(db, `users/${user.uid}/kyc_submissions`), orderBy('createdAt', 'desc'), limit(1)))
      .then((snap) => { if (!cancelled && !snap.empty) setLatest(toDate(snap.docs[0].data().createdAt)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [db, user, status, done]);

  const makeUrl = (blob: Blob) => {
    const u = URL.createObjectURL(blob);
    urlsRef.current.push(u);
    return u;
  };

  const setUpload = (slot: SlotId, s: UploadState) => setUploads((p) => ({ ...p, [slot]: s }));

  const uploadFile = async (slot: SlotId, file: File | Blob, name: string) => {
    if (!user) return;
    const f = file instanceof File ? file : new File([file], name, { type: file.type || 'image/jpeg' });
    setUpload(slot, { status: 'uploading' });
    try {
      let resp = await authFetch(user, '/api/storage/presigned-url', {
        method: 'POST',
        body: JSON.stringify({ fileName: f.name, fileType: f.type, fileSize: f.size, purpose: 'kyc' }),
      });
      if (!resp.ok) throw new Error((await resp.json())?.error || 'Could not prepare the upload.');
      
      const { uploadUrl, key } = await resp.json();
      let put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f });
      if (!put.ok) throw new Error(`Storage refused the file.`);
      setUpload(slot, { status: 'done', key });
    } catch (e: any) {
      setUpload(slot, { status: 'error', error: e?.message || 'Upload failed.' });
    }
  };

  const pickDoc = (slot: 'front' | 'back', file: File | undefined) => {
    if (!file) return;
    const err = validateFile(file);
    if (err) { setUpload(slot, { status: 'error', error: err }); return; }
    setFiles((p) => ({ ...p, [slot]: file }));
    const url = file.type.startsWith('image/') ? makeUrl(file) : null;
    (slot === 'front' ? setFrontUrl : setBackUrl)(url);
    setSubmitError('');
    uploadFile(slot, file, file.name);
  };

  const onSelfie = (blob: Blob, result: LivenessResult) => {
    setCameraOpen(false);
    const file = blob instanceof File ? blob : new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
    setFiles((p) => ({ ...p, selfie: file }));
    setFaceCheck(result);
    setSelfieUrl(makeUrl(file));
    uploadFile('selfie', file, file.name);
  };

  const retry = (slot: SlotId) => {
    const f = files[slot];
    if (f) uploadFile(slot, f, slot === 'selfie' ? `selfie_${Date.now()}.jpg` : (f as File).name);
  };

  const needsBack = docType !== 'passport';
  const detailsOk = country.trim().length >= 2 && /^[A-Za-z0-9\- /]{4,30}$/.test(docNumber.trim());
  const docsOk = uploads.front.status === 'done' && (!needsBack || uploads.back.status === 'done');
  const selfieOk = uploads.selfie.status === 'done' && !!faceCheck;

  const submit = async () => {
    if (!user || !db || submitting || !canSubmitNew) return;
    if (!docsOk || !selfieOk || !faceCheck) return;
    setSubmitting(true);
    setSubmitError('');
    const now = new Date().toISOString();
    try {
      await addDoc(collection(db, `users/${user.uid}/kyc_submissions`), {
        status: 'Pending',
        documentType: docType,
        documentCountry: country.trim(),
        documentNumber: docNumber.trim(),
        storageKey: uploads.front.key,
        backKey: needsBack ? uploads.back.key ?? null : null,
        selfieKey: uploads.selfie.key,
        faceCheck: { source: 'browser', ...faceCheck, checkedAt: now },
        createdAt: now,
      });
      await updateDoc(doc(db, 'users', user.uid), {
        'status.verificationStatus': 'Pending',
        'status.kycSubmittedAt': now,
      });
      setDone(true);
    } catch (e: any) {
      setSubmitError('The decision could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const UploadSlot = ({ slot, label }: { slot: 'front' | 'back'; label: string }) => {
    const u = uploads[slot];
    const f = files[slot];
    const preview = slot === 'front' ? frontUrl : backUrl;
    return (
      <div className="p-5 border border-[#E4E4E4] bg-[#F7F7F5] space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0055FF]" />
          <h4 className="text-[11px] font-bold uppercase tracking-widest">{label}</h4>
        </div>
        {f && (
          <div className="flex items-center gap-3">
            {preview && <img src={preview} alt="" className="w-16 h-16 object-cover border border-[#E4E4E4]" />}
            <div className="min-w-0 text-[11px] text-[#6B7280]">
              <p className="truncate font-bold text-[#0A0A0A]">{f.name}</p>
              <p>{(f.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        )}
        {u.status === 'uploading' && (
          <p className="text-[11px] text-[#0055FF] font-bold flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...</p>
        )}
        {u.status === 'done' && (
          <p className="text-[11px] text-[#16835B] font-bold flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" />Uploaded</p>
        )}
        {u.status === 'error' && (
          <div className="space-y-2">
            <p className="text-[11px] text-[#C43D3D] font-bold flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{u.error}</p>
            {f && <button type="button" onClick={() => retry(slot)} className={btnCls}><RefreshCw className="w-3.5 h-3.5" />Retry</button>}
          </div>
        )}
        <label className={cn(btnCls, 'cursor-pointer', u.status === 'uploading' && 'opacity-40 pointer-events-none')}>
          <Upload className="w-3.5 h-3.5" />
          <span>{f ? 'Change file' : 'Choose file'}</span>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => { pickDoc(slot, e.target.files?.[0]); e.target.value = ''; }}
          />
        </label>
      </div>
    );
  };

  const statusBadge = (
    <div className={cn(
      'px-4 py-2 border text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2',
      status === 'Verified' ? 'bg-[#16835B]/10 border-[#16835B] text-[#16835B]' :
      status === 'Pending' ? 'bg-[#0055FF]/10 border-[#0055FF] text-[#0055FF]' :
      status === 'Rejected' ? 'bg-[#C43D3D]/10 border-[#C43D3D] text-[#C43D3D]' :
      'bg-[#F7F7F5] border-[#E4E4E4] text-[#6B7280]'
    )}>
      <ShieldCheck className="w-4 h-4" />
      <span>Status: {status}</span>
    </div>
  );

  let body: React.ReactNode;
  if (profileLoading || !profile) {
    body = <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" /></div>;
  } else if (done || status === 'Pending' || status === 'Verified') {
    body = (
      <div className="space-y-3 text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-[#16835B] mx-auto mb-4" />
        <h4 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Verification Pending</h4>
        <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm mx-auto">
          {status === 'Verified'
            ? 'Your institutional identity has been successfully validated.'
            : 'Your documentation is currently undergoing review by our compliance team. Expected timeframe: 24-48 business hours.'}
        </p>
      </div>
    );
  } else if (gaps.length > 0) {
    body = (
      <div className="space-y-4">
        <p className="text-xs text-[#6B7280]">Complete your mandatory investor profile before uploading ID documents:</p>
        <ul className="list-disc pl-5 text-[11px] space-y-1 font-bold uppercase text-[#C43D3D]">
          {gaps.map((g) => <li key={g.key}>{g.label}</li>)}
        </ul>
        <Link href="/complete-profile?next=/client/account" className={cn(primaryCls, 'inline-flex')}>Complete profile</Link>
      </div>
    );
  } else {
    body = (
      <div className="space-y-6">
        <ol className="flex gap-2 text-[10px] font-bold uppercase tracking-widest overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => (
            <li key={s} className={cn('px-4 py-2 border whitespace-nowrap', i === step ? 'border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5' : i < step ? 'border-[#16835B] text-[#16835B]' : 'border-[#E4E4E4] text-[#6B7280]')}>
              {i + 1}. {s}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DOC_TYPES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDocType(d.id)}
                  className={cn('py-3 border text-[10px] font-bold uppercase tracking-widest transition-all', docType === d.id ? 'border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5' : 'border-[#E4E4E4] hover:bg-[#F7F7F5]')}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Issuing country</span>
                <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Kenya" />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Document number</span>
                <input className={inputCls} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="As printed on the document" />
              </label>
            </div>
            <button disabled={!detailsOk} onClick={() => setStep(1)} className={primaryCls}>Continue</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UploadSlot slot="front" label={docType === 'passport' ? 'Photo page' : 'ID front'} />
              {needsBack && <UploadSlot slot="back" label="ID back" />}
            </div>
            <div className="flex gap-3 pt-4 border-t border-[#F7F7F5]">
              <button onClick={() => setStep(0)} className={btnCls}>Back</button>
              <button disabled={!docsOk} onClick={() => setStep(2)} className={primaryCls}>Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-xs text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight bg-[#F7F7F5] p-4 border-l-4 border-[#0055FF]">
              Start the live biometric handshake. You will be asked to blink and turn your head to verify your identity in real-time.
            </p>
            {selfieUrl && (
              <div className="flex items-center gap-6 p-4 border border-[#16835B] bg-[#16835B]/5">
                <img src={selfieUrl} alt="Selfie" className="w-20 h-20 object-cover border border-[#E4E4E4]" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#16835B] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Biometric Capture Ready</span>
                </div>
              </div>
            )}
            <button onClick={() => setCameraOpen(true)} className={cn(btnCls, "w-full py-4 bg-[#0A0A0A] text-white hover:bg-[#0055FF]")}>
              <Camera className="w-4 h-4 mr-2" />{selfieUrl ? 'Recapture Biometrics' : 'Initialize Selfie Check'}
            </button>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className={btnCls}>Back</button>
              <button disabled={!selfieOk} onClick={() => setStep(3)} className={primaryCls}>Review Submission</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-6 space-y-4">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] border-b border-[#E4E4E4] pb-2">Transmission Summary</h4>
               <dl className="grid grid-cols-2 gap-y-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="space-y-1"><dt className="text-[#6B7280]">Document</dt><dd className="text-[#0A0A0A]">{docType}</dd></div>
                  <div className="space-y-1"><dt className="text-[#6B7280]">Country</dt><dd className="text-[#0A0A0A]">{country}</dd></div>
                  <div className="space-y-1"><dt className="text-[#6B7280]">Doc Reference</dt><dd className="text-[#0A0A0A] font-mono">{docNumber}</dd></div>
                  <div className="space-y-1"><dt className="text-[#6B7280]">Selfie Mode</dt><dd className="text-[#16835B]">{faceCheck?.livenessSkipped ? 'UPLOAD' : 'LIVE BIOMETRIC'}</dd></div>
               </dl>
            </div>
            {submitError && <div className="p-3 bg-[#C43D3D]/5 border border-[#C43D3D] text-[10px] font-bold uppercase text-[#C43D3D]">{submitError}</div>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} disabled={submitting} className={btnCls}>Back</button>
              <button onClick={submit} disabled={submitting || !docsOk || !selfieOk} className={cn(primaryCls, "flex-grow py-4")}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transmit Verification Package"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {cameraOpen && <CameraCaptureModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={onSelfie} />}
      <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#F7F7F5] pb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Identity Verification</h3>
            <p className="text-[11px] text-[#6B7280] mt-1 uppercase font-bold tracking-wider">Regulatory Compliance & Fund Safety</p>
          </div>
          {statusBadge}
        </div>
        {body}
      </Card>
    </div>
  );
}
