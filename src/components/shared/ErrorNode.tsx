'use client';

/**
 * @fileOverview Institutional Error Node UI.
 * Refined with natural English and precise viewport centering.
 */

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCw, LayoutDashboard, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ErrorNodeProps {
  error: Error & { digest?: string };
  reset: () => void;
  context?: string;
}

export default function ErrorNode({ error, reset, context = "System" }: ErrorNodeProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F7F7F5]">
      <Card className="max-w-xl w-full bg-white border-[#E4E4E4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 md:p-12 text-center space-y-8">
          {/* Status Indicator */}
          <div className="relative flex justify-center">
            <div className="w-20 h-20 bg-white border border-[#E4E4E4] rounded-full flex items-center justify-center shadow-xl">
              <ShieldAlert className="w-10 h-10 text-[#C43D3D]" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.4em] block">
              Connection Issue: {context}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
              We encountered a technical problem.
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm mx-auto font-medium uppercase tracking-tight">
              There was a problem loading this part of the platform. Your account and trades remain safe, but we need to reset this view to continue.
            </p>
          </div>

          {/* Trace ID */}
          {error.digest && (
            <div className="p-3 bg-[#F7F7F5] border border-[#E4E4E4] inline-block">
              <span className="text-[9px] font-mono text-[#6B7280] uppercase tracking-widest block mb-1">Audit Code</span>
              <code className="text-[10px] font-mono font-bold text-[#0A0A0A] uppercase">{error.digest}</code>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button 
              onClick={() => reset()}
              className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
            <Link href="/client/dashboard" className="w-full">
              <button className="w-full py-4 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-all flex items-center justify-center gap-2 shadow-sm">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-[#F7F7F5] border-t border-[#E4E4E4] p-4 flex justify-between items-center px-8">
          <Link href="/about/contact" className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-[#0055FF] flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Support</span>
          </Link>
          <span className="text-[8px] font-bold text-[#D1D5DB] uppercase tracking-[0.2em]">
            Varban Safety System
          </span>
        </div>
      </Card>
    </div>
  );
}
