'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional row under the title (tabs). */
  header?: React.ReactNode;
}

/** A page-style drawer that slides up on phones. Drag the handle down, tap outside, or press Esc to close. */
export default function BottomSheet({ open, title, onClose, children, header }: Props) {
  const startY = useRef<number | null>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const move = (e: React.TouchEvent) => {
    if (startY.current === null || !sheet.current) return;
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    sheet.current.style.transform = `translateY(${dy}px)`;
    sheet.current.style.transition = 'none';
  };
  const end = (e: React.TouchEvent) => {
    if (startY.current === null || !sheet.current) return;
    const dy = e.changedTouches[0].clientY - startY.current;
    startY.current = null;
    sheet.current.style.transition = 'transform 200ms ease-out';
    if (dy > 90) onClose();
    else sheet.current.style.transform = '';
  };

  return (
    <div className="fixed inset-0 z-[500] lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[#0A0A0A]/40" onClick={onClose} />
      <div
        ref={sheet}
        className="absolute bottom-0 left-0 right-0 h-[88dvh] bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        <div
          className="shrink-0 touch-none"
          onTouchStart={(e) => { startY.current = e.touches[0].clientY; }}
          onTouchMove={move}
          onTouchEnd={end}
        >
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-[#D1D5DB]" />
          <div className="flex items-center justify-between px-4 pt-2 pb-3">
            <h2 className="text-base font-bold text-[#0A0A0A]">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="p-2 -mr-2 text-[#6B7280] hover:text-[#0A0A0A]"><X className="w-5 h-5" /></button>
          </div>
        </div>
        {header}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
