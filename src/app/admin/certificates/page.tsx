'use client';

/**
 * @fileOverview Admin: company profile and regulatory certificates.
 * - Company profile  -> Firestore `site_profile/company` (public read, admin write)
 * - Certificates     -> Firestore `certificates` + files in R2 under site/certificates/
 * Uploads go through admin-verified API routes; nothing here is published until
 * an administrator saves it, and each certificate can be shown or hidden.
 */

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, query, setDoc, updateDoc } from "firebase/firestore";
import { Building2, FileCheck, Upload, Eye, EyeOff, Trash2, ExternalLink, Save, Loader2 } from "lucide-react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import {
  DEFAULT_COMPANY,
  mergeCompany,
  certificateFileUrl,
  CERTIFICATE_MAX_BYTES,
  CERTIFICATE_TYPES,
  type CompanyProfile,
  type Certificate,
  type Office,
} from "@/app/lib/company";
import { cn } from "@/app/lib/utils";

const labelCls = "text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5";
const inputCls = "w-full text-xs px-3 py-2.5 bg-[#F7F7F5] border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A]";

type Notice = { kind: "ok" | "error"; text: string } | null;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function OfficeFields({ title, value, onChange }: { title: string; value: Office; onChange: (o: Office) => void }) {
  const set = (k: keyof Office) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="space-y-3 p-4 border border-[#E4E4E4] bg-white">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">{title}</h4>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Country"><input className={inputCls} value={value.country} onChange={set("country")} /></Field>
        <Field label="City"><input className={inputCls} value={value.city} onChange={set("city")} /></Field>
      </div>
      <Field label="Full address (shown publicly)"><input className={inputCls} value={value.address} onChange={set("address")} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email"><input className={inputCls} value={value.email || ""} onChange={set("email")} /></Field>
        <Field label="Phone (optional)"><input className={inputCls} value={value.phone || ""} onChange={set("phone")} /></Field>
      </div>
    </div>
  );
}

export default function AdminCertificatesPage() {
  const { user } = useUser();
  const db = useFirestore();

  // ---- Company profile -----------------------------------------------------
  const { data: companyDoc } = useDoc<any>(db, "site_profile/company");
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [companyNotice, setCompanyNotice] = useState<Notice>(null);
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    if (companyDoc) setCompany(mergeCompany(companyDoc));
  }, [companyDoc]);

  const logAction = async (actionType: string, details: string) => {
    if (!db) return;
    try {
      await addDoc(collection(db, "adminLogs"), {
        timestamp: new Date(),
        adminEmail: user?.email || "--",
        actionType,
        targetUser: "site_profile",
        details,
        status: "Success",
      });
    } catch (e) {
      console.error("Audit log write failed:", e);
    }
  };

  const saveCompany = async () => {
    if (!db) return;
    setSavingCompany(true);
    setCompanyNotice(null);
    try {
      await setDoc(doc(db, "site_profile", "company"), { ...company, updatedAt: new Date().toISOString() }, { merge: true });
      await logAction("COMPANY_PROFILE_UPDATE", `Legal name: ${company.legalName}`);
      setCompanyNotice({ kind: "ok", text: "Company profile published. Public pages now show these details." });
    } catch (e) {
      setCompanyNotice({ kind: "error", text: "Could not save. Check that you are signed in as an administrator and that the Firestore rules are deployed." });
    } finally {
      setSavingCompany(false);
    }
  };

  // ---- Certificates ----------------------------------------------------------
  const certQuery = useMemo(() => (db ? query(collection(db, "certificates")) : null), [db]);
  const { data: certData, loading: certLoading } = useCollection<Certificate>(certQuery);
  const certificates = useMemo(
    () => [...certData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(b.createdAt).localeCompare(String(a.createdAt))),
    [certData]
  );

  const [form, setForm] = useState({ title: "", issuer: "", jurisdiction: "", referenceNumber: "", issuedAt: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [certNotice, setCertNotice] = useState<Notice>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const onPickFile = (f: File | null) => {
    setCertNotice(null);
    if (!f) return setFile(null);
    if (!CERTIFICATE_TYPES[f.type]) {
      setFile(null);
      return setCertNotice({ kind: "error", text: "Only PDF, PNG, JPG or WebP files are accepted." });
    }
    if (f.size > CERTIFICATE_MAX_BYTES) {
      setFile(null);
      return setCertNotice({ kind: "error", text: "File is larger than 10 MB." });
    }
    setFile(f);
  };

  const uploadCertificate = async () => {
    if (!db || !user || !file) return;
    if (!form.title.trim() || !form.issuer.trim()) {
      return setCertNotice({ kind: "error", text: "Title and issuing authority are required." });
    }
    setUploading(true);
    setCertNotice(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/certificates/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not prepare the upload.");

      const put = await fetch(body.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("The file could not be uploaded to storage.");

      const nextOrder = certificates.length ? Math.max(...certificates.map((c) => c.order ?? 0)) + 1 : 1;
      await addDoc(collection(db, "certificates"), {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        jurisdiction: form.jurisdiction.trim(),
        referenceNumber: form.referenceNumber.trim(),
        issuedAt: form.issuedAt,
        fileType: file.type,
        storageKey: body.key,
        visible: false, // drafts stay private until an admin publishes them
        order: nextOrder,
        createdAt: new Date().toISOString(),
      });
      await logAction("CERTIFICATE_UPLOAD", `${form.title.trim()} (${body.key})`);

      setForm({ title: "", issuer: "", jurisdiction: "", referenceNumber: "", issuedAt: "" });
      setFile(null);
      setCertNotice({ kind: "ok", text: "Uploaded as a draft. Use “Publish” to show it on the public site." });
    } catch (e: any) {
      setCertNotice({ kind: "error", text: e?.message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const toggleVisible = async (c: Certificate) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "certificates", c.id), { visible: !c.visible });
      await logAction(c.visible ? "CERTIFICATE_HIDE" : "CERTIFICATE_PUBLISH", c.title);
    } catch {
      setCertNotice({ kind: "error", text: "Could not change visibility." });
    }
  };

  const setOrder = async (c: Certificate, order: number) => {
    if (!db || !Number.isFinite(order) || order === c.order) return;
    try {
      await updateDoc(doc(db, "certificates", c.id), { order });
    } catch {
      setCertNotice({ kind: "error", text: "Could not change the display order." });
    }
  };

  const removeCertificate = async (c: Certificate) => {
    if (!db || !user) return;
    setConfirmDeleteId(null);
    try {
      await deleteDoc(doc(db, "certificates", c.id)); // stops public display immediately
      await logAction("CERTIFICATE_DELETE", c.title);
      const token = await user.getIdToken();
      const res = await fetch("/api/certificates/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: c.storageKey }),
      });
      if (!res.ok) throw new Error("file");
      setCertNotice({ kind: "ok", text: "Certificate removed." });
    } catch (e: any) {
      setCertNotice({ kind: "error", text: "Entry removed, but the stored file could not be deleted. Remove it from Storage Node if needed." });
    }
  };

  const noticeBox = (n: Notice) =>
    n && (
      <p role="status" className={cn("text-[10px] font-bold uppercase tracking-tight p-3 border", n.kind === "ok" ? "text-[#16835B] border-[#16835B] bg-[#16835B]/5" : "text-[#C43D3D] border-[#C43D3D] bg-[#FCF1F1]")}>
        {n.text}
      </p>
    );

  return (
    <AuthedLayout title="Certificates & Company" subtitle="Publish company details and regulatory certificates to the public site">
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* COMPANY PROFILE */}
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 flex items-center text-[#0A0A0A]">
            <Building2 className="w-3.5 h-3.5 mr-2 text-[#0055FF]" /> Company profile
          </h3>
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            Registration and regulator lines appear on the public site only when filled in. Enter exactly what appears on your official
            documents, and leave a field empty if it does not apply.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Legal name"><input className={inputCls} value={company.legalName} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} /></Field>
            <Field label="Brand name"><input className={inputCls} value={company.brandName} onChange={(e) => setCompany({ ...company, brandName: e.target.value })} /></Field>
            <Field label="Registration number"><input className={inputCls} value={company.registrationNumber} onChange={(e) => setCompany({ ...company, registrationNumber: e.target.value })} /></Field>
            <Field label="Support email"><input className={inputCls} value={company.supportEmail} onChange={(e) => setCompany({ ...company, supportEmail: e.target.value })} /></Field>
            <Field label="Regulator / licensing authority"><input className={inputCls} value={company.regulator} onChange={(e) => setCompany({ ...company, regulator: e.target.value })} /></Field>
            <Field label="Licence number"><input className={inputCls} value={company.licenseNumber} onChange={(e) => setCompany({ ...company, licenseNumber: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-1">
            <OfficeFields title="Registered office (Seychelles)" value={company.registeredOffice} onChange={(o) => setCompany({ ...company, registeredOffice: o })} />
          </div>
          {noticeBox(companyNotice)}
          <button
            onClick={saveCompany}
            disabled={savingCompany || !db}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-colors disabled:opacity-50"
          >
            {savingCompany ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Publish company profile
          </button>
        </Card>

        {/* UPLOAD */}
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 flex items-center text-[#0A0A0A]">
            <Upload className="w-3.5 h-3.5 mr-2 text-[#16835B]" /> Upload a certificate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title *"><input className={inputCls} placeholder="Certificate of Incorporation" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Issuing authority *"><input className={inputCls} placeholder="As shown on the document" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></Field>
            <Field label="Jurisdiction"><input className={inputCls} placeholder="Seychelles" value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} /></Field>
            <Field label="Reference number"><input className={inputCls} value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} /></Field>
            <Field label="Issue date"><input type="date" className={inputCls} value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} /></Field>
            <Field label="File (PDF, PNG, JPG, WebP · max 10 MB) *">
              <input type="file" accept=".pdf,image/png,image/jpeg,image/webp" className={cn(inputCls, "file:mr-3 file:border-0 file:bg-[#0A0A0A] file:text-white file:text-[10px] file:font-bold file:uppercase file:px-3 file:py-1.5")} onChange={(e) => onPickFile(e.target.files?.[0] || null)} />
            </Field>
          </div>
          {noticeBox(certNotice)}
          <button
            onClick={uploadCertificate}
            disabled={uploading || !file || !db || !user}
            className="inline-flex items-center gap-2 bg-[#0055FF] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0044cc] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload as draft
          </button>
        </Card>

        {/* LIST */}
        <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-[#E4E4E4] pb-3 flex items-center text-[#0A0A0A]">
            <FileCheck className="w-3.5 h-3.5 mr-2 text-[#0055FF]" /> Certificates ({certificates.length})
          </h3>
          {certLoading && <p className="text-[11px] text-[#6B7280]">Loading…</p>}
          {!certLoading && certificates.length === 0 && (
            <p className="text-[11px] text-[#6B7280]">No certificates uploaded yet.</p>
          )}
          <ul className="space-y-3">
            {certificates.map((c) => (
              <li key={c.id} className="p-4 border border-[#E4E4E4] bg-[#F7F7F5] flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#0A0A0A]">{c.title}</span>
                    <span className={cn("text-[8px] font-bold uppercase px-2 py-0.5 border", c.visible ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#6B7280] text-[#6B7280] bg-white")}>
                      {c.visible ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mt-1">
                    {[c.issuer, c.jurisdiction, c.referenceNumber && `Ref ${c.referenceNumber}`, c.issuedAt].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#6B7280]">
                    Order
                    <input
                      type="number"
                      defaultValue={c.order ?? 0}
                      onBlur={(e) => setOrder(c, parseInt(e.target.value, 10))}
                      className="w-14 text-xs px-2 py-1.5 bg-white border border-[#E4E4E4] rounded-none"
                    />
                  </label>
                  <a href={certificateFileUrl(c.storageKey)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-2 text-[9px] font-bold uppercase border border-[#E4E4E4] bg-white hover:border-[#0A0A0A]">
                    <ExternalLink className="w-3 h-3" /> View
                  </a>
                  <button onClick={() => toggleVisible(c)} className="inline-flex items-center gap-1 px-3 py-2 text-[9px] font-bold uppercase border border-[#E4E4E4] bg-white hover:border-[#0A0A0A]">
                    {c.visible ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Publish</>}
                  </button>
                  {confirmDeleteId === c.id ? (
                    <>
                      <button onClick={() => removeCertificate(c)} className="px-3 py-2 text-[9px] font-bold uppercase bg-[#C43D3D] text-white">Confirm delete</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-2 text-[9px] font-bold uppercase border border-[#E4E4E4] bg-white">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(c.id)} className="inline-flex items-center gap-1 px-3 py-2 text-[9px] font-bold uppercase border border-[#E4E4E4] bg-white text-[#C43D3D] hover:border-[#C43D3D]">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AuthedLayout>
  );
}
