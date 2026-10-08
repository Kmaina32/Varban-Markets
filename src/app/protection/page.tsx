
import Link from "next/link";
import { ShieldCheck, Lock, Globe, Database, FileCheck } from "lucide-react";

/**
 * @fileOverview Client Protection & Capital Integrity Page.
 * Detailed pillars of security and regulation.
 */

export default function ClientProtectionPage() {
  return (
    <div className="bg-white min-h-screen py-20 text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-[#E4E4E4] pb-16 mb-20 text-center">
          <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block mb-4">Capital Integrity</span>
          <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-tight mb-8">Client Protection</h1>
          <p className="text-sm md:text-lg text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
            Your security is our absolute priority. We employ institutional-grade safeguards, segregated account structures, and multi-signature cold storage to ensure your capital remains 100% secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center">
                <Database className="w-6 h-6 text-[#0055FF]" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Segregated Accounts</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed uppercase tracking-tight font-bold">
                Client funds are held strictly in segregated accounts at Tier-1 international banking institutions. This capital is entirely independent from company operational funds and cannot be accessed by creditors.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#16835B]" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Negative Balance Protection</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed uppercase tracking-tight font-bold">
                Our matching engine automatically halts execution if your margin is exhausted. You can never lose more than your initial committed stake on any individual contract.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center">
                <Globe className="w-6 h-6 text-[#0055FF]" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Global Regulation</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed uppercase tracking-tight font-bold">
                Varban Markets operates under the strict oversight of the Financial Services Authority (FSA). We undergo continuous auditing to maintain our status as a trusted international broker.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-[#16835B]" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">Auditability</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed uppercase tracking-tight font-bold">
                Every trade outcome is recorded in an immutable ledger with a millisecond-accurate timestamp. This ensures total transparency and allows for retroactive auditing of every execution.
              </p>
            </div>
          </div>
        </div>

        <div className="p-12 md:p-20 bg-[#F7F7F5] border-t-4 border-[#0055FF] text-center space-y-8 shadow-sm">
           <h4 className="text-2xl font-bold uppercase tracking-tight">Professional Standards.</h4>
           <p className="text-sm text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
             Join the thousands of institutional and retail traders who trust Varban Markets for their derivative execution and capital management.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
             <Link href="/register" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] text-white px-16">Open Secure Account</Link>
             <Link href="/about" className="btn-institutional-secondary px-16">About the Company</Link>
           </div>
        </div>

      </div>
    </div>
  );
}
