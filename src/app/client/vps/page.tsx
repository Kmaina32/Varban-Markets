
'use client';

/**
 * @fileOverview Authenticated VPS Management Page.
 * Allows traders to monitor their VPS status and access credentials.
 */

import React, { useState, useEffect } from 'react';
import AuthedLayout from '@/components/layout/AuthedLayout';
import { Card } from '@/components/ui/card';
import { 
  Server, 
  Activity, 
  Lock, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  Power,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { useTranslation } from '@/app/lib/i18n-context';
import { cn } from '@/app/lib/utils';

export default function ClientVpsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [isProvisioned, setIsProvisioned] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeEquity = profile?.equity || profile?.balance || 0;
  const isEligibleForFree = activeEquity >= 5000;

  return (
    <AuthedLayout 
      title="Vps (Virtual private server )" 
      subtitle="Institutional infrastructure control hub"
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={cn(
            "p-8 border-none shadow-xl flex flex-col justify-between relative overflow-hidden rounded-3xl",
            isProvisioned ? "bg-[#0A0A0A] text-white" : "bg-white border border-[#E4E4E4] text-[#0A0A0A]"
          )}>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isProvisioned ? "bg-[#16835B]" : "bg-[#F7F7F5] border border-[#E4E4E4]"
                )}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                   <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 block">Server Status</span>
                   <span className="text-sm font-bold uppercase tracking-tight">{isProvisioned ? 'Operational' : 'Unprovisioned'}</span>
                </div>
              </div>
              
              {!isProvisioned && (
                <p className="text-[11px] font-bold uppercase tracking-tight opacity-70 leading-relaxed">
                  Provision a dedicated institutional VPS to ensure sub-1ms connectivity to execution nodes.
                </p>
              )}
            </div>
            
            {isProvisioned && (
              <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#16835B] animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#16835B]">High Performance</span>
                 </div>
                 <button className="p-2 hover:bg-white/10 transition-all rounded-lg"><RefreshCw className="w-4 h-4" /></button>
              </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055FF]/5 rounded-bl-full -z-0"></div>
          </Card>

          <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between rounded-3xl">
             <div className="space-y-6">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Equity Eligibility</span>
                <div>
                   <span className="text-2xl font-mono font-bold text-[#0A0A0A]">${formatNumber(activeEquity, { minimumFractionDigits: 2 })}</span>
                   <p className="text-[10px] text-[#6B7280] font-bold uppercase mt-2">Current Account Domain Value</p>
                </div>
             </div>
             <div className="mt-8 p-4 bg-[#F7F7F5] border border-[#E4E4E4] rounded-2xl">
                <span className="text-[9px] font-bold text-[#0A0A0A] uppercase block mb-1">
                   {isEligibleForFree ? 'Complimentary Access Active' : 'Premium Subscription'}
                </span>
                <p className="text-[8px] text-[#6B7280] font-bold uppercase">
                   {isEligibleForFree ? 'Your equity meets institutional requirements.' : 'Equity below $5,000 threshold. Monthly fee: $30.'}
                </p>
             </div>
          </Card>

          <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm flex flex-col justify-between rounded-3xl border-l-4 border-l-[#0055FF]">
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0055FF]">
                   <ShieldCheck className="w-5 h-5" />
                   <h4 className="text-[10px] font-bold uppercase tracking-widest">Protocol Verified</h4>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed font-bold uppercase tracking-tight">
                  VPS security is handled via hardware-level encryption. Multi-node backups ensure 100% layout persistence for your Varban Terminal.
                </p>
             </div>
             <button className="w-full py-4 border border-[#E4E4E4] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#F7F7F5] transition-all rounded-xl mt-6">
               View Performance Logs
             </button>
          </Card>
        </div>

        {!isProvisioned ? (
          <Card className="p-12 text-center bg-white border-[#E4E4E4] shadow-sm rounded-[2.5rem] space-y-8">
            <div className="max-w-md mx-auto space-y-6">
               <div className="w-20 h-20 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center mx-auto">
                  <Terminal className="w-10 h-10 text-[#0055FF]" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">Provision Your Server</h2>
                 <p className="text-xs text-[#6B7280] leading-relaxed font-bold uppercase">
                    Allocate dedicated institutional resources to your trading workspace.
                 </p>
               </div>
               <div className="pt-4">
                 <button 
                  onClick={() => setIsProvisioned(true)}
                  className="w-full py-5 bg-[#0055FF] text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#0A0A0A] transition-all shadow-xl rounded-2xl"
                 >
                   Initiate Server Provisioning
                 </button>
               </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Server Details & RDP */}
            <div className="lg:col-span-8 space-y-6">
               <Card className="bg-white border-[#E4E4E4] shadow-sm overflow-hidden rounded-3xl">
                  <div className="p-6 border-b border-[#F7F7F5] bg-[#F7F7F5] flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Access Credentials (RDP)</h3>
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
                       <span className="text-[9px] font-bold text-[#16835B] uppercase">Authorized Link</span>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Server IP Address</label>
                           <div className="flex items-center gap-2">
                              <code className="flex-grow p-3 bg-[#F7F7F5] border border-[#E4E4E4] rounded-xl text-xs font-mono font-bold text-[#0A0A0A]">142.93.242.108</code>
                              <button onClick={() => handleCopy('142.93.242.108', 'ip')} className="p-3 border border-[#E4E4E4] hover:bg-[#F7F7F5] transition-all rounded-xl">
                                {copied === 'ip' ? <Check className="w-4 h-4 text-[#16835B]" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
                              </button>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Access Token</label>
                           <div className="flex items-center gap-2">
                              <code className="flex-grow p-3 bg-[#F7F7F5] border border-[#E4E4E4] rounded-xl text-xs font-mono font-bold text-[#0A0A0A]">••••••••••••</code>
                              <button onClick={() => handleCopy('VRB-S3CR3T-PASS', 'pass')} className="p-3 border border-[#E4E4E4] hover:bg-[#F7F7F5] transition-all rounded-xl">
                                {copied === 'pass' ? <Check className="w-4 h-4 text-[#16835B]" /> : <Lock className="w-4 h-4 text-[#6B7280]" />}
                              </button>
                           </div>
                        </div>
                     </div>
                     <div className="pt-4">
                        <button className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 shadow-lg rounded-xl">
                           <ExternalLink className="w-3.5 h-3.5" />
                           Launch Remote Desktop Web Client
                        </button>
                     </div>
                  </div>
               </Card>

               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'CPU Usage', value: '4.2%', icon: Activity },
                    { label: 'RAM Allocation', value: '2.1 / 8GB', icon: Globe },
                    { label: 'Uptime', value: '14d 22h', icon: Clock },
                    { label: 'Node Region', value: 'Seychelles', icon: MapPin }
                  ].map((stat, i) => (
                    <Card key={i} className="p-4 bg-white border border-[#E4E4E4] shadow-sm rounded-2xl text-center space-y-1">
                       <span className="text-[8px] font-bold uppercase text-[#6B7280] tracking-widest">{stat.label}</span>
                       <span className="text-[11px] font-mono font-bold text-[#0A0A0A] block">{stat.value}</span>
                    </Card>
                  ))}
               </div>
            </div>

            {/* Documentation Sidebar */}
            <div className="lg:col-span-4 space-y-6">
               <Card className="p-8 bg-[#010813] text-white border-none shadow-xl rounded-[2.5rem] space-y-6">
                  <div className="flex items-center gap-2 text-[#0055FF]">
                    <Terminal className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Setup Instructions</span>
                  </div>
                  <div className="space-y-4">
                     {[
                       'Connect via standard RDP client.',
                       'Terminal is pre-installed in C:/Varban/',
                       'Maintain session to ensure bot activity.',
                       'Reboots occur weekly on Sundays 21:00 GMT.'
                     ].map((step, i) => (
                       <div key={i} className="flex gap-3">
                          <span className="text-[10px] font-mono font-bold text-[#0055FF]">0{i+1}</span>
                          <p className="text-[10px] text-[#94A3B8] font-bold uppercase leading-tight">{step}</p>
                       </div>
                     ))}
                  </div>
               </Card>

               <div className="p-6 bg-[#F7F7F5] border border-[#E4E4E4] rounded-3xl space-y-4">
                  <div className="flex items-center gap-2">
                     <Power className="w-4 h-4 text-[#C43D3D]" />
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Instance Actions</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                     <button className="w-full py-3 bg-white border border-[#E4E4E4] text-[9px] font-bold uppercase tracking-widest hover:border-[#0055FF] rounded-xl transition-all">Restart Matching Node</button>
                     <button onClick={() => setIsProvisioned(false)} className="w-full py-3 bg-white border border-[#E4E4E4] text-[9px] font-bold uppercase tracking-widest text-[#C43D3D] hover:bg-[#C43D3D] hover:text-white rounded-xl transition-all">Decommission Server</button>
                  </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </AuthedLayout>
  );
}

const MapPin = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
