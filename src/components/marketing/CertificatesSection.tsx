'use client';

import { useMemo } from "react";
import Link from "next/link";
import { collection, query, where } from "firebase/firestore";
import { FileCheck, FileText, ExternalLink } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { certificateFileUrl, type Certificate } from "@/app/lib/company";

/**
 * Published certificates and regulatory documents. Only documents an
 * administrator has marked as published are readable by the public
 * (enforced by firestore.rules, not just by this query).
 * Files are uploaded at /admin/certificates.
 */
export function CertificatesSection({ headingLevel = 2, showLinkToAll = false }: { headingLevel?: 2 | 3; showLinkToAll?: boolean }) {
  const db = useFirestore();
  const q = useMemo(() => (db ? query(collection(db, "certificates"), where("visible", "==", true)) : null), [db]);
  const { data, loading } = useCollection<Certificate>(q);
  const certs = useMemo(
    () => [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data]
  );
  const H = headingLevel === 2 ? "h2" : "h3";

  return (
    <section className="bg-white border border-[#E4E4E4] p-8 md:p-10 space-y-6 text-[#0A0A0A]" aria-labelledby="certificates-heading">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-1 text-[#16835B]">Documents</span>
        <H id="certificates-heading" className="text-xl md:text-2xl font-bold uppercase tracking-tight">Certificates and regulatory documents</H>
        <p className="text-xs text-[#6B7280] leading-relaxed mt-2 max-w-3xl">
          Official documents for Varban Markets Ltd, registered in Seychelles with an office in the United Kingdom, are published here
          as they are issued. Each entry names the issuing authority and its reference number so you can check it with that authority.
        </p>
      </div>

      {certs.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((c) => {
            const isImage = c.fileType?.startsWith("image/");
            const url = certificateFileUrl(c.storageKey);
            return (
              <li key={c.id} className="border border-[#E4E4E4] bg-[#F7F7F5] flex flex-col">
                <a href={url} target="_blank" rel="noopener noreferrer" className="block bg-white border-b border-[#E4E4E4] h-40 overflow-hidden" aria-label={`Open ${c.title}`}>
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={`${c.title}, issued by ${c.issuer}`} loading="lazy" className="w-full h-full object-contain" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-[#6B7280]">
                      <FileText className="w-10 h-10" aria-hidden="true" />
                    </span>
                  )}
                </a>
                <div className="p-5 space-y-2 flex-1 flex flex-col">
                  <h3 className="text-xs font-bold uppercase tracking-wider">{c.title}</h3>
                  <dl className="text-[11px] text-[#6B7280] space-y-1">
                    <div className="flex gap-2"><dt className="font-bold uppercase text-[9px] tracking-widest w-20 shrink-0 pt-0.5">Issued by</dt><dd>{c.issuer}</dd></div>
                    {c.jurisdiction && <div className="flex gap-2"><dt className="font-bold uppercase text-[9px] tracking-widest w-20 shrink-0 pt-0.5">Jurisdiction</dt><dd>{c.jurisdiction}</dd></div>}
                    {c.referenceNumber && <div className="flex gap-2"><dt className="font-bold uppercase text-[9px] tracking-widest w-20 shrink-0 pt-0.5">Reference</dt><dd className="font-mono">{c.referenceNumber}</dd></div>}
                    {c.issuedAt && <div className="flex gap-2"><dt className="font-bold uppercase text-[9px] tracking-widest w-20 shrink-0 pt-0.5">Issued</dt><dd>{c.issuedAt}</dd></div>}
                  </dl>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#0055FF] hover:underline">
                    View document <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        !loading && (
          <p className="flex items-start gap-3 text-xs text-[#6B7280] border border-dashed border-[#E4E4E4] p-5">
            <FileCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            No documents have been published yet. For questions about our registration, contact{" "}
            <Link href="/contact" className="text-[#0055FF] font-bold hover:underline">support</Link>.
          </p>
        )
      )}

      {showLinkToAll && (
        <Link href="/about/licenses" className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#0055FF] hover:underline">
          Company registration and documents
        </Link>
      )}
    </section>
  );
}
