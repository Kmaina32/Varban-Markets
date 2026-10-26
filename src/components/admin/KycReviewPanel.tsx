'use client';

import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc, collection, deleteField, doc, getDoc, getDocs, limit, orderBy, query, writeBatch,
} from "firebase/firestore";
import { AlertTriangle, Check, CheckCircle2, Loader2, ScanFace, ShieldCheck, X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { ageFromDate, getProfileGaps } from "@/app/lib/profile-completion";
import KycDocPreview, { isImageObject, useStoredObject } from "./KycDocPreview";
import type { MatchVerdict } from "@/app/lib/face";

export interface KycPanelUser { id: string; data: any }

const REJECT_REASONS = [
  "ID document is expired",
  "ID photo is blurry or unreadable",
  "Name on ID does not match profile",
  "Date of birth on ID does not match profile",
  "Selfie does not match ID photo",
  "Document appears altered or invalid",
  "Selfie missing or not a live photo",
];

const MIN_REASON = 10;

const toMillis = (ts: any): number => {
  try {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    const d = new Date(ts);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch { return 0; }
};
const fmt = (ts: any) => { const m = toMillis(ts); return m ? new Date(m).toLocaleString() : "--"; };
const s = (v: any) => (typeof v === "string" && v.trim() ? v.trim() : "--");

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280]">{label}</dt>
      <dd className="text-xs text-[#0A0A0A] break-words">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] border-b border-[#E4E4E4] pb-1">{title}</h4>
      {children}
    </section>
  );
}

export default function KycReviewPanel({ db, admin, target, onClose, onDecided }: {
  db: any;
  admin: any;
  target: KycPanelUser;
  onClose: () => void;
  onDecided: (uid: string, status: "Verified" | "Rejected") => void;
}) {
  const uid = target.id;
  const u = target.data || {};
  const p = u.profile || {};
  const inv = u.investor || {};
  const userStatus: string = u.status?.verificationStatus || "Not Verified";
  const name = p.fullName || [p.firstName, p.lastName].filter(Boolean).join(" ") || "Unnamed applicant";
  const gaps = useMemo(() => getProfileGaps(u), [u]);
  const age = ageFromDate(typeof p.dateOfBirth === "string" ? p.dateOfBirth.trim() : "");
  const address = [p.addressLine1, p.addressLine2, p.city, p.state, p.zipCode, p.country].filter((x: any) => typeof x === "string" && x.trim()).join(", ");

  // ---- submissions ----
  const [subs, setSubs] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSubsLoading(true); setSubsError("");
      try {
        const snap = await getDocs(query(collection(db, "users", uid, "kyc_submissions"), orderBy("createdAt", "desc"), limit(5)));
        if (cancelled) return;
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setSubs(rows);
        setSelectedId((rows.find(r => r.status === "Pending") || rows[0])?.id ?? null);
      } catch (e: any) {
        if (!cancelled) setSubsError(e?.message || "Could not load submissions.");
      }
      if (!cancelled) setSubsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [db, uid]);

  const sub = subs.find(x => x.id === selectedId) || null;
  const isPassport = /passport/i.test(sub?.documentType || "");

  // ---- documents ----
  const front = useStoredObject(admin, sub?.storageKey);
  const back = useStoredObject(admin, sub?.backKey);
  const selfie = useStoredObject(admin, sub?.selfieKey);

  // ---- face comparison (runs in this browser only; descriptors are never kept) ----
  type Cmp = { distance: number; verdict: MatchVerdict; comparedAt: string };
  const [cmp, setCmp] = useState<Cmp | null>(null);
  const [cmpBusy, setCmpBusy] = useState(false);
  const [cmpMsg, setCmpMsg] = useState("");
  useEffect(() => { setCmp(null); setCmpMsg(""); }, [selectedId]);

  const canCompare = isImageObject(front) && isImageObject(selfie) && !cmpBusy;
  const runCompare = async () => {
    if (!front.url || !selfie.url) return;
    setCmpBusy(true); setCmp(null); setCmpMsg("");
    try {
      const face = await import("@/app/lib/face");
      await face.loadRecognitionModel();
      const [a, b] = await Promise.all([face.loadImage(front.url), face.loadImage(selfie.url)]);
      const da = await face.faceDescriptor(a);
      const db_ = await face.faceDescriptor(b);
      if (!da && !db_) setCmpMsg("No face was found in either the ID photo or the selfie. Compare them by eye.");
      else if (!da) setCmpMsg("No face was found in the ID photo (it may be too small, blurry or cropped). Compare by eye.");
      else if (!db_) setCmpMsg("No face was found in the selfie. Ask the applicant for a clearer selfie, or compare by eye.");
      else {
        const r = face.compareDescriptors(da, db_);
        setCmp({ distance: Number(r.distance.toFixed(3)), verdict: r.verdict, comparedAt: new Date().toISOString() });
      }
    } catch (e: any) {
      setCmpMsg(e?.message || "The face comparison could not run in this browser.");
    }
    setCmpBusy(false);
  };

  // ---- decision ----
  const [mode, setMode] = useState<"idle" | "confirmApprove" | "reject" | "confirmReject">("idle");
  const [chosen, setChosen] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [decided, setDecided] = useState<string | null>(null);

  const reason = [...chosen, freeText.trim()].filter(Boolean).join(". ");
  const reasonOk = reason.length >= MIN_REASON;
  const isLegacy = userStatus === "Pending" && !subsLoading && !subsError && subs.length === 0;
  const actionable = !decided && ((sub?.status === "Pending") || isLegacy);

  const approveBlockers: string[] = [];
  if (!sub || sub.status !== "Pending") approveBlockers.push("there is no pending submission");
  if (gaps.length) approveBlockers.push("the profile is incomplete");
  if (sub && front.state !== "ready") approveBlockers.push("the ID front has not loaded");
  if (sub && !isPassport && sub.backKey && back.state !== "ready") approveBlockers.push("the ID back has not loaded");
  if (sub && !isPassport && !sub.backKey) approveBlockers.push("the ID back was not submitted");
  if (sub && selfie.state !== "ready") approveBlockers.push("the selfie has not loaded");
  const canApprove = actionable && approveBlockers.length === 0;

  const submit = async (action: "Approved" | "Rejected") => {
    if (busy || !admin) return;
    setBusy(true); setBanner(null);
    const approve = action === "Approved";
    const nowIso = new Date().toISOString();
    try {
      if (sub) {
        const fresh = await getDoc(doc(db, "users", uid, "kyc_submissions", sub.id));
        if (!fresh.exists() || fresh.data()?.status !== "Pending") {
          throw new Error("This submission is no longer pending (someone else may have reviewed it). Reload the list.");
        }
      }
      const batch = writeBatch(db);
      if (sub) {
        const subUpdate: any = {
          status: action,
          reviewedBy: admin.email || admin.uid,
          reviewedAt: nowIso,
          reviewNote: approve ? "" : reason,
        };
        if (cmp) subUpdate.adminFaceCheck = { distance: cmp.distance, verdict: cmp.verdict, comparedAt: cmp.comparedAt };
        batch.update(doc(db, "users", uid, "kyc_submissions", sub.id), subUpdate);
      }
      batch.update(doc(db, "users", uid), {
        "status.verificationStatus": approve ? "Verified" : "Rejected",
        "status.kycReviewedAt": nowIso,
        "status.kycRejectionReason": approve ? deleteField() : reason,
      });
      await batch.commit();
    } catch (e: any) {
      setBusy(false);
      setMode(approve ? "confirmApprove" : "confirmReject");
      setBanner({ kind: "error", text: e?.message || "The decision could not be saved. Nothing was changed." });
      return;
    }

    // Decision is saved. Notification and audit log are best effort.
    const warnings: string[] = [];
    try {
      const title = approve ? "Identity verification approved" : "Identity verification needs attention";
      const message = approve
        ? "Your identity has been verified. Your account is now fully verified."
        : `We could not verify your identity: ${reason}. Please update your details and submit again.`;
      await addDoc(collection(db, `users/${uid}/notifications`), {
        title, message, body: message, type: "kyc", read: false, isUnread: true, timestamp: new Date(),
      });
    } catch { warnings.push("the applicant notification"); }
    try {
      await addDoc(collection(db, "adminLogs"), {
        timestamp: new Date(),
        adminEmail: admin.email || "--",
        actionType: approve ? "KYC_APPROVE" : "KYC_REJECT",
        targetUser: uid,
        details: JSON.stringify({ submissionId: sub?.id ?? null, reason: approve ? undefined : reason, faceCheck: cmp ?? undefined }),
        status: "Success",
      });
    } catch { warnings.push("the audit log entry"); }

    setSubs(prev => prev.map(x => x.id === sub?.id ? { ...x, status: action } : x));
    setDecided(action);
    setMode("idle");
    setBusy(false);
    setBanner({
      kind: "success",
      text: `${name} was ${approve ? "approved" : "rejected"}.` + (warnings.length ? ` Saved, but ${warnings.join(" and ")} could not be written.` : ""),
    });
    onDecided(uid, approve ? "Verified" : "Rejected");
  };

  const fc = sub?.faceCheck;
  const fcConcern = fc && (fc.livenessSkipped === true || fc.faceFound === false || fc.blinkSeen === false || fc.turnSeen === false);
  const yn = (v: any) => (v === true ? "Yes" : v === false ? "No" : "--");

  const verdictStyle: Record<MatchVerdict, string> = {
    match: "border-[#16835B] bg-[#16835B]/5 text-[#16835B]",
    review: "border-[#C9A227] bg-[#C9A227]/5 text-[#8a6d10]",
    mismatch: "border-[#C43D3D] bg-[#C43D3D]/5 text-[#C43D3D]",
  };
  const verdictText: Record<MatchVerdict, string> = {
    match: "Likely the same person. The two faces are very similar.",
    review: "Inconclusive. The faces are somewhat similar; look closely before deciding.",
    mismatch: "Likely different people. The faces are not similar enough.",
  };

  return (
    <div role="dialog" aria-modal="false" aria-label={`KYC review for ${name}`}
      className="fixed inset-0 z-[400] bg-white overflow-y-auto lg:static lg:z-auto lg:border lg:border-[#E4E4E4] lg:shadow-sm lg:max-h-[calc(100vh-8rem)]">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 p-4 bg-[#F7F7F5] border-b border-[#E4E4E4]">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-5 h-5 text-[#0055FF] shrink-0" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-widest truncate">{name}</h3>
          <span className="text-[9px] font-bold uppercase border border-[#E4E4E4] px-1.5 py-0.5 bg-white">{decided === "Approved" ? "Verified" : decided === "Rejected" ? "Rejected" : userStatus}</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close review panel" className="p-1 text-[#6B7280] hover:text-[#0A0A0A]">
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {banner && (
          <div role={banner.kind === "error" ? "alert" : "status"}
            className={cn("p-3 text-xs border flex items-start gap-2", banner.kind === "error" ? "border-[#C43D3D] bg-[#C43D3D]/5 text-[#C43D3D]" : "border-[#16835B] bg-[#16835B]/5 text-[#16835B]")}>
            {banner.kind === "error" ? <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />}
            <span>{banner.text}</span>
          </div>
        )}

        <Section title="Profile">
          {gaps.length > 0 && (
            <div role="alert" className="p-3 border border-[#C43D3D] bg-[#C43D3D]/5 text-xs text-[#C43D3D]">
              <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" aria-hidden="true" /> Profile incomplete</p>
              <p className="mt-1">Approval is blocked until the applicant completes: {gaps.map(g => g.label).join(", ")}.</p>
            </div>
          )}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name" value={s(name)} />
            <Field label="Email" value={<span className="font-mono">{s(p.email)}</span>} />
            <Field label="Date of birth" value={p.dateOfBirth ? `${p.dateOfBirth}${age !== null ? ` (age ${age})` : ""}` : "--"} />
            <Field label="Phone" value={s(p.phone)} />
            <Field label="Country" value={s(p.country)} />
            <Field label="Address" value={address || "--"} />
            <Field label="Account purpose" value={s(inv.accountPurpose)} />
            <Field label="Employment" value={s(inv.employmentStatus)} />
            <Field label="Source of wealth" value={s(inv.sourceWealth)} />
            <Field label="Annual income" value={s(inv.annualIncome)} />
            <Field label="Net worth" value={s(inv.netWorth)} />
            <Field label="Funds originate from" value={s(inv.originFunds)} />
            <Field label="KYC submitted" value={fmt(u.status?.kycSubmittedAt)} />
            {u.status?.kycRejectionReason && <Field label="Previous rejection reason" value={u.status.kycRejectionReason} />}
          </dl>
        </Section>

        <Section title="Submission">
          {subsLoading ? (
            <div role="status" className="flex items-center gap-2 text-xs text-[#6B7280]"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading submissions...</div>
          ) : subsError ? (
            <p role="alert" className="text-xs text-[#C43D3D]">{subsError}</p>
          ) : !sub ? (
            <p className="text-xs text-[#6B7280]">
              {isLegacy
                ? "This user is marked Pending but has no submission record (legacy request). There are no documents to review, so they cannot be approved. You can reject with a reason so they resubmit."
                : "This user has no KYC submissions."}
            </p>
          ) : (
            <>
              {subs.length > 1 && (
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                  Submission
                  <select value={selectedId ?? ""} onChange={e => setSelectedId(e.target.value)} className="mt-1 block w-full border border-[#E4E4E4] bg-white p-2 text-xs normal-case tracking-normal font-normal text-[#0A0A0A]">
                    {subs.map(x => <option key={x.id} value={x.id}>{fmt(x.createdAt)} - {x.status}</option>)}
                  </select>
                </label>
              )}
              <dl className="grid grid-cols-2 gap-3">
                <Field label="Status" value={sub.status} />
                <Field label="Submitted" value={fmt(sub.createdAt)} />
                <Field label="Document type" value={s(sub.documentType)} />
                <Field label="Issuing country" value={s(sub.documentCountry)} />
                <Field label="Document number" value={<span className="font-mono">{s(sub.documentNumber)}</span>} />
                {sub.reviewedBy && <Field label="Reviewed by" value={`${sub.reviewedBy} on ${fmt(sub.reviewedAt)}`} />}
                {sub.reviewNote && <Field label="Review note" value={sub.reviewNote} />}
              </dl>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <KycDocPreview label="ID front" storageKey={sub.storageKey} obj={front} />
                <KycDocPreview label="Selfie" storageKey={sub.selfieKey} obj={selfie} />
                <KycDocPreview label="ID back" storageKey={sub.backKey} obj={back} optionalMissingText={isPassport ? "Not required for a passport." : "Not provided."} />
              </div>

              <div className={cn("p-3 border text-xs space-y-1", fcConcern ? "border-[#C9A227] bg-[#C9A227]/10" : "border-[#E4E4E4] bg-[#F7F7F5]")}>
                <p className="font-bold uppercase tracking-wider text-[10px]">Reported by the applicant&apos;s browser (advisory)</p>
                {!fc ? <p>No liveness data was submitted.</p> : (
                  <>
                    {fcConcern && (
                      <p role="alert" className="font-bold text-[#8a6d10] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {fc.livenessSkipped === true ? "The applicant skipped the liveness check." : "One or more liveness checks did not pass."} Examine the selfie and ID closely.
                      </p>
                    )}
                    <p>Face found: {yn(fc.faceFound)} | Blink seen: {yn(fc.blinkSeen)} | Head turn seen: {yn(fc.turnSeen)} | Liveness skipped: {yn(fc.livenessSkipped)}</p>
                    <p className="text-[#6B7280]">Checked {fmt(fc.checkedAt)}. These values are computed on the applicant&apos;s device and can be faked; do not rely on them.</p>
                  </>
                )}
              </div>
            </>
          )}
        </Section>

        {sub && (
          <Section title="Face comparison">
            <p className="text-[11px] text-[#6B7280]">Runs entirely in your browser. Nothing is uploaded and no face data is stored; only the distance and verdict are saved when you decide.</p>
            <button type="button" onClick={runCompare} disabled={!canCompare}
              className="px-4 py-2 border border-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0A0A0A] hover:text-white">
              {cmpBusy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ScanFace className="w-4 h-4" aria-hidden="true" />}
              {cmpBusy ? "Comparing..." : "Compare selfie with ID photo"}
            </button>
            {front.state === "ready" && !isImageObject(front) && (
              <p className="text-xs text-[#8a6d10]">The ID front is a PDF, so it cannot be compared automatically. Compare the faces by eye.</p>
            )}
            {!canCompare && !cmpBusy && !(front.state === "ready" && !isImageObject(front)) && (
              <p className="text-[11px] text-[#6B7280]">Available once the ID front and selfie images have loaded.</p>
            )}
            {cmpMsg && <p role="alert" className="text-xs text-[#8a6d10] border border-[#C9A227] bg-[#C9A227]/10 p-3">{cmpMsg}</p>}
            {cmp && (
              <div role="status" className={cn("p-3 border text-xs space-y-1", verdictStyle[cmp.verdict])}>
                <p className="font-bold uppercase tracking-wider text-[10px]">Result: {cmp.verdict} (distance {cmp.distance.toFixed(3)})</p>
                <p>{verdictText[cmp.verdict]} Lower distance means more similar; about 0.5 or below is a strong match and above 0.6 is a mismatch.</p>
              </div>
            )}
            <p className="text-[11px] text-[#6B7280]">
              This is a decision aid, not proof of identity. Always check the documents yourself: expiry date, signs of tampering, and that the name and date of birth match the profile.
            </p>
          </Section>
        )}

        <Section title="Decision">
          {decided ? (
            <p className="text-xs text-[#6B7280]">Decision recorded. Close this panel or pick another applicant.</p>
          ) : !actionable ? (
            <p className="text-xs text-[#6B7280]">
              {subsLoading ? "Loading..." : sub ? `This submission is ${sub.status}; only Pending submissions can be decided.` : "Nothing to decide."}
            </p>
          ) : (
            <div className="space-y-3">
              {mode === "idle" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <button type="button" onClick={() => setMode("confirmApprove")} disabled={!canApprove}
                      className="w-full py-3 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0A0A0A]">
                      <Check className="w-4 h-4" aria-hidden="true" /> Approve
                    </button>
                    {!canApprove && (
                      <p className="mt-1 text-[11px] text-[#C43D3D]">Cannot approve: {approveBlockers.length ? approveBlockers.join("; ") : "not available"}.</p>
                    )}
                  </div>
                  <button type="button" onClick={() => setMode("reject")}
                    className="py-3 border border-[#C43D3D] text-[#C43D3D] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C43D3D] hover:text-white self-start">
                    Reject...
                  </button>
                </div>
              )}

              {mode === "confirmApprove" && (
                <div role="alertdialog" aria-label="Confirm approval" className="p-3 border border-[#16835B] space-y-3">
                  <p className="text-xs">Approve identity verification for <strong>{name}</strong>? They will be marked Verified and notified.</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={() => submit("Approved")} className="px-4 py-2 bg-[#16835B] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50">
                      {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />} Confirm approval
                    </button>
                    <button type="button" disabled={busy} onClick={() => setMode("idle")} className="px-4 py-2 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                  </div>
                </div>
              )}

              {(mode === "reject" || mode === "confirmReject") && (
                <div className="space-y-3">
                  <fieldset disabled={mode === "confirmReject"}>
                    <legend className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">Common reasons</legend>
                    <div className="flex flex-wrap gap-2">
                      {REJECT_REASONS.map(r => {
                        const on = chosen.includes(r);
                        return (
                          <button key={r} type="button" aria-pressed={on}
                            onClick={() => setChosen(c => on ? c.filter(x => x !== r) : [...c, r])}
                            className={cn("px-2 py-1 border text-[11px]", on ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "border-[#E4E4E4] hover:bg-[#F7F7F5]")}>
                            {r}
                          </button>
                        );
                      })}
                    </div>
                    <label className="block mt-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                      Additional details
                      <textarea value={freeText} onChange={e => setFreeText(e.target.value)} rows={3} maxLength={500}
                        className="mt-1 block w-full border border-[#E4E4E4] p-2 text-xs normal-case tracking-normal font-normal text-[#0A0A0A]" />
                    </label>
                  </fieldset>
                  <p className={cn("text-[11px]", reasonOk ? "text-[#6B7280]" : "text-[#C43D3D]")}>
                    {reasonOk ? "The applicant will see this reason." : `A reason of at least ${MIN_REASON} characters is required (${reason.length}/${MIN_REASON}).`}
                  </p>
                  {mode === "reject" ? (
                    <div className="flex gap-2">
                      <button type="button" disabled={!reasonOk} onClick={() => setMode("confirmReject")} className="px-4 py-2 bg-[#C43D3D] text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
                      <button type="button" onClick={() => setMode("idle")} className="px-4 py-2 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                    </div>
                  ) : (
                    <div role="alertdialog" aria-label="Confirm rejection" className="p-3 border border-[#C43D3D] space-y-3">
                      <p className="text-xs">Reject <strong>{name}</strong> with this reason? &ldquo;{reason}&rdquo; They will be notified and can resubmit.</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={busy} onClick={() => submit("Rejected")} className="px-4 py-2 bg-[#C43D3D] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50">
                          {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />} Confirm rejection
                        </button>
                        <button type="button" disabled={busy} onClick={() => setMode("reject")} className="px-4 py-2 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-widest">Back</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
