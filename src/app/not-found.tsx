'use client';

/**
 * @fileOverview Institutional 404 Not Found Node.
 * Provides a professional fallback for unrecognized routes with branded recovery paths.
 */

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  HelpCircle, 
  ShieldAlert, 
  LayoutDashboard, 
  Mail,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 text-[#0A0A0A]">
      <div className="w-full max-w-2xl space-y-12 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Institutional Branding */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/assets/logo2.png" 
            alt="Varban Markets" 
            width={140} 
            height={30} 
            className="w-auto h-8 object-contain opacity-20 grayscale"
          />
        </div>

        {/* Status Indicator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] -z-0 select-none pointer-events-none">
            <span className="text-[200px] font-bold font-mono tracking-tighter">404</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-white border border-[#E4E4E4] rounded-full flex items-center justify-center shadow-xl">
              <ShieldAlert className="w-10 h-10 text-[#C43D3D]" />
            </div>
            
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.4em] block">Error Code: NODE_NOT_FOUND</span>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display leading-tight">
                Resource unreachable.
              </h1>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-md mx-auto font-medium uppercase tracking-tight">
                The requested node or page does not exist in the current domain registry. The handshake with the server was completed, but no document was returned.
              </p>
            </div>
          </div>
        </div>

        {/* Recovery Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
          <Link href="/dashboard" className="flex-grow">
            <button className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 shadow-lg">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Trader Dashboard
            </button>
          </Link>
          <Link href="/" className="flex-grow">
            <button className="w-full py-4 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F7F5] transition-all flex items-center justify-center gap-2 shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              Return Home
            </button>
          </Link>
        </div>

        {/* Supplementary Support Links */}
        <div className="pt-8 border-t border-[#E4E4E4] max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link href="/help" className="group flex items-center gap-2 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-[#0055FF] transition-colors">
              <HelpCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              <span>Help Center</span>
            </Link>
            <Link href="/about/contact" className="group flex items-center gap-2 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-[#0055FF] transition-colors">
              <Mail className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              <span>Technical Desk</span>
            </Link>
            <Link href="/markets" className="group flex items-center gap-2 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest hover:text-[#0055FF] transition-colors">
              <Search className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              <span>Market Registry</span>
            </Link>
          </div>
        </div>

        {/* Institutional Watermark */}
        <div className="pt-12">
          <p className="text-[8px] font-bold text-[#D1D5DB] uppercase tracking-[0.3em]">
            Varban Institutional Node &bull; Rodney Bay, Saint Lucia
          </p>
        </div>

      </div>
    </div>
  );
}
