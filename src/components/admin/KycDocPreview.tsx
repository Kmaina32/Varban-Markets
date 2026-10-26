'use client';

import React, { useEffect, useState } from "react";
import { Loader2, AlertTriangle, FileText } from "lucide-react";
import { authFetch } from "@/app/lib/auth-fetch";

export interface StoredObject {
  state: "idle" | "loading" | "ready" | "error";
  url: string | null;
  mime: string;
  error: string;
}

const IDLE: StoredObject = { state: "idle", url: null, mime: "", error: "" };

/**
 * Fetches a stored object through the admin-only same-origin proxy and exposes
 * it as an object URL. The URL is revoked when the key changes or on unmount.
 */
export function useStoredObject(user: { getIdToken: () => Promise<string> } | null, key: string | null | undefined): StoredObject {
  const [obj, setObj] = useState<StoredObject>(IDLE);

  useEffect(() => {
    if (!key || !user) { setObj(IDLE); return; }
    let cancelled = false;
    let created: string | null = null;
    setObj({ ...IDLE, state: "loading" });
    (async () => {
      try {
        const res = await authFetch(user, "/api/storage/object", { method: "POST", body: JSON.stringify({ storageKey: key }) });
        if (!res.ok) {
          let msg = `Could not load the file (${res.status}).`;
          try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
          throw new Error(msg);
        }
        const blob = await res.blob();
        created = URL.createObjectURL(blob);
        if (cancelled) { URL.revokeObjectURL(created); created = null; return; }
        setObj({ state: "ready", url: created, mime: blob.type || "", error: "" });
      } catch (e: any) {
        if (!cancelled) setObj({ state: "error", url: null, mime: "", error: e?.message || "Could not load the file." });
      }
    })();
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
    // user object identity may change on token refresh; the uid is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, (user as any)?.uid]);

  return obj;
}

export const isImageObject = (o: StoredObject) => o.state === "ready" && o.mime.startsWith("image/");

export default function KycDocPreview({ label, storageKey, obj, optionalMissingText }: {
  label: string;
  storageKey: string | null | undefined;
  obj: StoredObject;
  optionalMissingText?: string;
}) {
  return (
    <figure className="border border-[#E4E4E4] bg-[#F7F7F5] p-2">
      <figcaption className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">{label}</figcaption>
      <div className="min-h-[140px] flex items-center justify-center">
        {!storageKey ? (
          <p className="text-[11px] text-[#6B7280] text-center px-2">{optionalMissingText || "Not provided."}</p>
        ) : obj.state === "loading" || obj.state === "idle" ? (
          <div role="status" className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading {label.toLowerCase()}...
          </div>
        ) : obj.state === "error" ? (
          <p role="alert" className="flex items-start gap-2 text-[11px] text-[#C43D3D] px-2">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" /> {obj.error}
          </p>
        ) : obj.mime.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={obj.url!} alt={`${label} submitted by the applicant`} className="max-h-80 w-auto max-w-full object-contain" />
        ) : (
          <div className="text-center space-y-2">
            <FileText className="w-8 h-8 mx-auto text-[#6B7280]" aria-hidden="true" />
            <p className="text-[11px] text-[#6B7280]">{obj.mime === "application/pdf" ? "PDF document" : "Document"} (cannot be previewed inline)</p>
            <a href={obj.url!} target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#0055FF] underline underline-offset-4">
              Open {label.toLowerCase()}
            </a>
          </div>
        )}
      </div>
    </figure>
  );
}
