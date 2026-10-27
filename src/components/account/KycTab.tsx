'use client';

/**
 * @fileOverview KYC verification flow: gate -> document details -> ID upload ->
 * liveness selfie -> review & submit. Files go to storage through an
 * authenticated presigned URL; the submission is a Firestore doc the rules
 * validate, then users/{uid}.status.verificationStatus moves to 'Pending'.
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Camera, Loader2, AlertCircle, CheckCircle2, RefreshCw, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, updateDoc, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/app/lib/utils';
import { authFetch } from '@/app/lib/auth-fetch';
import { getProfileGaps } from '@/app/lib/profile-completion';
import CameraCaptureModal from './CameraCaptureModal';
import type { LivenessResult } from './LivenessCapture';

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
  'px-6 py-3 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0044cc] transition-all flex items-center justify-center gap-2 disabled:opacity-40';

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

  // Date of the latest submission (for Pending / Verified / Rejected display)
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
      let resp: Response;
      try {
        resp = await authFetch(user, '/api/storage/presigned-url', {
          method: 'POST',
          body: JSON.stringify({ fileName: f.name, fileType: f.type, fileSize: f.size, purpose: 'kyc' }),
        });
      } catch {
        throw new Error('Network problem while preparing the upload. Check your connection and retry.');
      }
      if (!resp.ok) {
        let msg = '';
        try { msg = (await resp.json())?.error || ''; } catch { /* ignore */ }
        if (resp.status === 401) msg = 'Your session has expired. Please sign in again, then retry.';
        throw new Error(msg || `The server rejected the upload request (${resp.status}).`);
      }
      const { uploadUrl, key } = await resp.json();
      let put: Response;
      try {
        put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f });
      } catch {
        throw new Error('Network problem while uploading the file. Check your connection and retry.');
      }
      if (!put.ok) throw new Error(`Storage refused the file (${put.status}). Please retry.`);
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
      let id = submissionId;
      if (!id) {
        const ref = await addDoc(collection(db, `users/${user.uid}/kyc_submissions`), {
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
        id = ref.id;
        setSubmissionId(id);
      }
      await updateDoc(doc(db, 'users', user.uid), {
        'status.verificationStatus': 'Pending',
        'status.kycSubmittedAt': now,
      });
      setDone(true);
    } catch (e: any) {
      setSubmitError(
        e?.code === 'permission-denied'
          ? 'We could not save your submission (permission denied). Make sure your status allows a new submission, then try again.'
          : 'We could not save your submission. Your uploaded files are kept; press Submit again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- render helpers ----------
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
            <p className="text-[11px] text-[#C43D3D] font-bold flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{label} failed: {u.error}</p>
            {f && <button type="button" onClick={() => retry(slot)} className={btnCls}><RefreshCw className="w-3.5 h-3.5" />Retry this file</button>}
          </div>
        )}
        <label className={cn(btnCls, 'cursor-pointer', u.status === 'uploading' && 'opacity-40 pointer-events-none')}>
          <Upload className="w-3.5 h-3.5" />
          <span>{f ? 'Choose a different file' : 'Choose file'}</span>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => { pickDoc(slot, e.target.files?.[0]); e.target.value = ''; }}
          />
        </label>
        <p className="text-[10px] text-[#6B7280]">JPG, PNG, WebP or PDF, up to 10 MB.</p>
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
      <div className="space-y-3">
        <p className="text-sm text-[#0A0A0A] leading-relaxed">
          {status === 'Verified'
            ? 'Your identity is verified. No further action is needed.'
            : 'Thank you, your documents have been sent. Someone on our team will review them and we will update your status here.'}
        </p>
        {(latest || done) && (
          <p className="text-[11px] text-[#6B7280] font-bold uppercase tracking-wider">
            Latest submission: {(latest ?? new Date()).toLocaleString()}
          </p>
        )}
      </div>
    );
  } else if (gaps.length > 0) {
    body = (
      <div className="space-y-4">
        <h4 className="text-sm font-bold">Please fill in your details first</h4>
        <p className="text-[12px] text-[#6B7280]">We need these before you can upload your ID:</p>
        <ul className="list-disc pl-5 text-[12px] space-y-1">
          {gaps.map((g) => <li key={g.key}>{g.label}</li>)}
        </ul>
        <Link href="/client/complete-registration" className={cn(primaryCls, 'inline-flex')}>Fill in my details</Link>
      </div>
    );
  } else {
    body = (
      <div className="space-y-6">
        {status === 'Rejected' && (
          <div className="p-4 border border-[#C43D3D] bg-[#C43D3D]/5 text-[12px] space-y-1">
            <p className="font-bold text-[#C43D3D]">Your last submission was rejected.</p>
            {profile?.status?.kycRejectionReason && <p>Reason: {profile.status.kycRejectionReason}</p>}
            {latest && <p className="text-[#6B7280]">Submitted {latest.toLocaleString()}. You can submit again below.</p>}
          </div>
        )}

        <ol className="flex gap-2 text-[10px] font-bold uppercase tracking-widest overflow-x-auto">
          {STEPS.map((s, i) => (
            <li key={s} className={cn('px-3 py-2 border whitespace-nowrap', i === step ? 'border-[#0055FF] text-[#0055FF]' : i < step ? 'border-[#16835B] text-[#16835B]' : 'border-[#E4E4E4] text-[#6B7280]')}>
              {i + 1}. {s}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DOC_TYPES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDocType(d.id)}
                  className={cn('py-3 border text-[11px] font-bold uppercase tracking-widest', docType === d.id ? 'border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5' : 'border-[#E4E4E4]')}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Issuing country</span>
              <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Kenya" />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Document number</span>
              <input className={inputCls} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="As printed on the document" />
            </label>
            <button disabled={!detailsOk} onClick={() => setStep(1)} className={primaryCls}>Continue</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UploadSlot slot="front" label={docType === 'passport' ? 'Photo page' : 'ID front'} />
              {needsBack && <UploadSlot slot="back" label="ID back" />}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className={btnCls}>Back</button>
              <button disabled={!docsOk} onClick={() => setStep(2)} className={primaryCls}>Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-[12px] text-[#6B7280] leading-relaxed">
              Take a live selfie. You will be asked to blink and turn your head. These checks run on your device and help our reviewer; a person on our team still reviews every submission.
            </p>
            {selfieUrl && (
              <div className="flex items-center gap-4">
                <img src={selfieUrl} alt="Your selfie" className="w-24 h-24 object-cover border border-[#E4E4E4]" />
                <div className="text-[11px] space-y-1">
                  {uploads.selfie.status === 'uploading' && <p className="text-[#0055FF] font-bold flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...</p>}
                  {uploads.selfie.status === 'done' && <p className="text-[#16835B] font-bold flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" />Uploaded</p>}
                  {faceCheck?.livenessSkipped && <p className="text-[#6B7280]">Live check skipped; the reviewer will be told.</p>}
                  {uploads.selfie.status === 'error' && (
                    <>
                      <p className="text-[#C43D3D] font-bold">Selfie failed: {uploads.selfie.error}</p>
                      <button type="button" onClick={() => retry('selfie')} className={btnCls}><RefreshCw className="w-3.5 h-3.5" />Retry this file</button>
                    </>
                  )}
                </div>
              </div>
            )}
            <button onClick={() => setCameraOpen(true)} className={btnCls}>
              <Camera className="w-3.5 h-3.5" />{selfieUrl ? 'Retake selfie' : 'Start selfie check'}
            </button>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className={btnCls}>Back</button>
              <button disabled={!selfieOk} onClick={() => setStep(3)} className={primaryCls}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <dl className="text-[12px] grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-[#6B7280]">Document</dt><dd className="font-bold">{DOC_TYPES.find((d) => d.id === docType)?.label}</dd>
              <dt className="text-[#6B7280]">Country</dt><dd className="font-bold">{country}</dd>
              <dt className="text-[#6B7280]">Number</dt><dd className="font-bold">{docNumber}</dd>
              <dt className="text-[#6B7280]">Front</dt><dd className="truncate">{files.front?.name}</dd>
              {needsBack && <><dt className="text-[#6B7280]">Back</dt><dd className="truncate">{files.back?.name}</dd></>}
              <dt className="text-[#6B7280]">Selfie</dt>
              <dd>{faceCheck?.livenessSkipped ? 'Uploaded photo (live check skipped)' : 'Live check completed'}</dd>
            </dl>
            <p className="text-[11px] text-[#6B7280]">A person on our team reviews every submission.</p>
            {submitError && <p className="text-[12px] text-[#C43D3D] font-bold">{submitError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} disabled={submitting} className={btnCls}>Back</button>
              <button onClick={submit} disabled={submitting || !docsOk || !selfieOk} className={primaryCls}>
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Submit for review
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <CameraCaptureModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={onSelfie} />
      <Card className="p-5 sm:p-8 bg-white border-[#E4E4E4] space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#F7F7F5]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Identity Verification</h3>
            <p className="text-[11px] text-[#6B7280] mt-1 uppercase font-bold tracking-wider">ID document and a live selfie</p>
          </div>
          {statusBadge}
        </div>
        {body}
      </Card>
    </div>
  );
}
