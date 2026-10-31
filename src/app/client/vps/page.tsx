
'use client';

/**
 * @fileOverview Authenticated VPS Management Hub.
 * Features a multi-step provisioning flow and institutional dashboard.
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  Check,
  ChevronRight,
  ArrowRight,
  Loader2,
  AlertCircle,
  Database,
  Cpu,
  Clock
} from 'lucide-react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp, increment } from 'firebase/firestore';
import { useTranslation } from '@/app/lib/i18n-context';
import { cn } from '@/app/lib/utils';
import StatusDialog, { DialogStatus } from '@/components/shared/StatusDialog';

interface VpsPlan {
  id: string;
  name: string;
  price: number;
  cpu: string;
  ram: string;
  ssd: string;
  desc: string;
  recommended?: boolean;
}

const VPS_PLANS: VpsPlan[] = [
  { id: 'nvme-2', name: 'NVMe 2', price: 4.49, cpu: '1 vCPU', ram: '2GB DDR5', ssd: '50GB NVMe', desc: 'Standard workspace for single terminal strategies.' },
  { id: 'nvme-4', name: 'NVMe 4', price: 8.49, cpu: '2 vCPU', ram: '4GB DDR5', ssd: '100GB NVMe', desc: 'Optimized for Docker and AI automated agents.', recommended: true },
  { id: 'nvme-8', name: 'NVMe 8', price: 12.49, cpu: '4 vCPU', ram: '8GB DDR5', ssd: '200GB NVMe', desc: 'Heavy traffic and multi-container production.' },
  { id: 'nvme-16', name: 'NVMe 16', price: 25.99, cpu: '8 vCPU', ram: '16GB DDR5', ssd: '450GB NVMe', desc: 'Enterprise stack for institutional algorithms.' },
];

export default function ClientVpsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { formatNumber } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  // States: 'SELECTION' | 'CONFIRMATION' | 'PROVISIONING' | 'ACTIVE'
  const [viewState, setViewState] = useState<'SELECTION' | 'CONFIRMATION' | 'PROVISIONING' | 'ACTIVE'>('SELECTION');
  const [selectedPlan, setSelectedPlan] = useState<VpsPlan | null>(null);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dialog, setDialog] = useState<{ status: DialogStatus; title: string; message: string }>({
    status: null,
    title: '',
    message: ''
  });

  const activeBalance = profile?.balance || 0;

  // Handle Provisioning Simulation
  useEffect(() => {
    if (viewState === 'PROVISIONING') {
      const logs = [
        "► Initiating institutional handshake...",
        "► Allocating dedicated vCPU cores...",
        "► Provisioning DDR5 RAM blocks...",
        "► Formatting NVMe SSD partition...",
        "► Configuring hardware firewall...",
        "► Installing Varban Matching Engine v4.2...",
        "► Securing RDP access token...",
        "✓ Server successfully initialized."
      ];
      
      let currentLog = 0;
      const interval = setInterval(() => {
        if (currentLog < logs.length) {
          setProvisioningLogs(prev => [...prev, logs[currentLog]]);
          setProgress(prev => Math.min(100, prev + (100 / logs.length)));
          currentLog++;
        } else {
          clearInterval(interval);
          setTimeout(() => setViewState('ACTIVE'), 1500);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [viewState]);

  const handleStartProvisioning = async () => {
    if (!selectedPlan || isProcessing || !user || !db) return;
    
    if (activeBalance < selectedPlan.price) {
      setDialog({
        status: 'error',
        title: 'Insufficient Balance',
        message: `Your current balance of $${formatNumber(activeBalance)} is below the required $${selectedPlan.price} for the ${selectedPlan.name} tier.`
      });
      return;
    }

    setIsProcessing(true);
    try {
      const ref = `VPS-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // 1. Log Transaction
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        type: "VPS Subscription",
        asset: "USD",
        amount: selectedPlan.price,
        status: "Confirmed",
        ref,
        timestamp: serverTimestamp(),
        details: `Tier: ${selectedPlan.name}`
      });

      // 2. Deduct Balance
      await setDoc(doc(db, "users", user.uid), {
        balance: increment(-selectedPlan.price),
        equity: increment(-selectedPlan.price)
      }, { merge: true });

      setViewState('PROVISIONING');
    } catch (e) {
      setDialog({
        status: 'error',
        title: 'Handshake Failure',
        message: 'Could not synchronize with the provisioning node. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AuthedLayout 
      title="Vps (Virtual private server )" 
      subtitle="Institutional infrastructure management and deployment"
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <StatusDialog 
          status={dialog.status} 
          title={dialog.title} 
          message={dialog.message} 
          onClose={() => setDialog({ ...dialog, status: null })} 
        />

        {/* 1. SELECTION VIEW */}
        {viewState === 'SELECTION' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block mb-2">Service Catalog</span>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">Select Server Tier</h2>
                <p className="text-xs text-[#6B7280] font-bold uppercase tracking-widest">Choose the resources for your trading environment</p>
              </div>
              <div className="px-6 py-3 bg-white border border-[#E4E4E4] rounded-xl flex items-center gap-4 shadow-sm">
                 <span className="text-[9px] font-bold text-[#6B7280] uppercase">Your Balance:</span>
                 <span className="text-sm font-mono font-bold text-[#16835B]">${formatNumber(activeBalance, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VPS_PLANS.map((plan) => (
                <Card 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    "p-8 bg-white border flex flex-col justify-between transition-all cursor-pointer group rounded-xl shadow-sm relative overflow-hidden",
                    selectedPlan?.id === plan.id ? "border-[#0055FF] ring-1 ring-[#0055FF]" : "border-[#E4E4E4] hover:border-[#0055FF]/50"
                  )}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 bg-[#0055FF] text-white text-[8px] font-bold uppercase px-3 py-1 tracking-widest rounded-bl-lg">
                      Recommended
                    </div>
                  )}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">{plan.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#6B7280]">
                        <Cpu className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">{plan.cpu}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6B7280]">
                        <Database className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">{plan.ram}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6B7280]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">{plan.ssd}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase leading-relaxed h-8 opacity-70">{plan.desc}</p>
                    <div className="pt-4 border-t border-[#F7F7F5]">
                      <span className="text-2xl font-mono font-bold text-[#0A0A0A]">${plan.price}</span>
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase ml-1">/ Month</span>
                    </div>
                  </div>
                  <button className={cn(
                    "w-full py-3.5 mt-8 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                    selectedPlan?.id === plan.id ? "bg-[#0A0A0A] text-white" : "bg-[#F7F7F5] text-[#0A0A0A] group-hover:bg-[#0055FF] group-hover:text-white"
                  )}>
                    {selectedPlan?.id === plan.id ? "Selected" : "Choose Tier"}
                  </button>
                </Card>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button 
                disabled={!selectedPlan}
                onClick={() => setViewState('CONFIRMATION')}
                className="px-12 py-4 bg-[#0A0A0A] text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#0055FF] transition-all disabled:opacity-30 rounded-xl shadow-xl flex items-center gap-3"
              >
                Configure Provisioning <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. CONFIRMATION VIEW */}
        {viewState === 'CONFIRMATION' && selectedPlan && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
            <button onClick={() => setViewState('SELECTION')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A]">
               <ChevronRight className="w-4 h-4 rotate-180" /> Back to Selection
            </button>
            
            <Card className="bg-white border-[#E4E4E4] p-10 rounded-xl shadow-2xl space-y-8 border-b-4 border-b-[#0055FF]">
               <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">Review Provisioning</h2>
                 <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Instance Authorization</p>
               </div>

               <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E4E4E4] pb-4">
                     <span className="text-[10px] font-bold text-[#6B7280] uppercase">Selected Plan</span>
                     <span className="text-xs font-bold text-[#0A0A0A] uppercase">{selectedPlan.name} Tier</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase">
                     <div className="space-y-1"><p className="text-[#6B7280]">CPU</p><p className="text-[#0A0A0A]">{selectedPlan.cpu}</p></div>
                     <div className="space-y-1 text-right"><p className="text-[#6B7280]">RAM</p><p className="text-[#0A0A0A]">{selectedPlan.ram}</p></div>
                     <div className="space-y-1"><p className="text-[#6B7280]">Storage</p><p className="text-[#0A0A0A]">{selectedPlan.ssd}</p></div>
                     <div className="space-y-1 text-right"><p className="text-[#6B7280]">Monthly Fee</p><p className="text-[#16835B]">${selectedPlan.price}</p></div>
                  </div>
               </div>

               <div className="p-4 bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#0055FF] shrink-0" />
                  <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold">
                    Upon confirmation, ${selectedPlan.price} will be deducted from your liquid balance to provision the dedicated hardware.
                  </p>
               </div>

               <button 
                onClick={handleStartProvisioning}
                disabled={isProcessing}
                className="w-full py-5 bg-[#0A0A0A] text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#0055FF] transition-all rounded-xl shadow-lg flex items-center justify-center gap-3"
               >
                 {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                 {isProcessing ? "Authorizing Ledger..." : "Confirm & Deploy Server"}
               </button>
            </Card>
          </div>
        )}

        {/* 3. PROVISIONING VIEW */}
        {viewState === 'PROVISIONING' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
               <Loader2 className="w-12 h-12 text-[#0055FF] animate-spin mx-auto" />
               <h2 className="text-xl font-bold uppercase tracking-[0.3em] text-[#0A0A0A]">Deploying Node</h2>
               <div className="w-full bg-[#E4E4E4] h-1.5 rounded-full overflow-hidden max-w-sm mx-auto">
                  <div 
                    className="bg-[#0055FF] h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
               </div>
            </div>

            <div className="bg-[#010813] rounded-xl shadow-2xl overflow-hidden font-mono border border-white/10">
              <div className="bg-white/10 px-4 py-3 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16835B]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16835B]/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16835B]/50"></div>
                </div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest">vps-provisioner-01</span>
              </div>
              <div className="p-8 space-y-2 text-[11px] min-h-[280px]">
                {provisioningLogs.map((log, i) => (
                  <p key={i} className={cn(
                    "transition-all duration-300",
                    log.startsWith('✓') ? "text-[#16835B] font-bold pt-4" : "text-white/70"
                  )}>
                    {log}
                  </p>
                ))}
                {progress < 100 && (
                  <div className="w-2 h-4 bg-white animate-pulse inline-block ml-1"></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. ACTIVE VIEW (DASHBOARD) */}
        {viewState === 'ACTIVE' && selectedPlan && (
          <div className="space-y-8 animate-in fade-in duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Card */}
                <Card className="p-8 bg-[#0A0A0A] text-white rounded-xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[#16835B] flex items-center justify-center">
                            <Server className="w-5 h-5" />
                         </div>
                         <div>
                            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest block">Instance Status</span>
                            <span className="text-sm font-bold uppercase tracking-tight">Node Operational</span>
                         </div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
                         <span className="text-[8px] font-bold text-[#0055FF] uppercase tracking-widest block">Hardware Domain</span>
                         <p className="text-xs font-mono font-bold">{selectedPlan.name} &bull; {selectedPlan.cpu}</p>
                      </div>
                   </div>
                   <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#16835B] animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#16835B]">Optimal Performance</span>
                      </div>
                      <button className="p-2 hover:bg-white/10 transition-all rounded-lg"><RefreshCw className="w-4 h-4" /></button>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055FF]/10 rounded-bl-full -z-0"></div>
                </Card>

                {/* Connectivity Card */}
                <Card className="p-8 bg-white border border-[#E4E4E4] rounded-xl shadow-sm flex flex-col justify-between">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Network Latency</span>
                         <Globe className="w-4 h-4 text-[#0055FF]" />
                      </div>
                      <div>
                         <span className="text-4xl font-mono font-bold text-[#0A0A0A] tracking-tighter">0.42<span className="text-lg ml-1">ms</span></span>
                         <p className="text-[10px] text-[#6B7280] font-bold uppercase mt-2 tracking-widest">Sub-Millisecond Execution Link</p>
                      </div>
                   </div>
                   <div className="mt-8 p-4 bg-[#F7F7F5] border border-[#E4E4E4] rounded-xl flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[#0A0A0A] uppercase">Global Relay</span>
                      <span className="text-[8px] font-bold text-[#16835B] uppercase bg-white px-2 py-0.5 border border-[#16835B]">ACTIVE</span>
                   </div>
                </Card>

                {/* Usage Card */}
                <Card className="p-8 bg-white border border-[#E4E4E4] rounded-xl shadow-sm space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Resource Usage</span>
                      <Activity className="w-4 h-4 text-[#16835B]" />
                   </div>
                   <div className="space-y-5">
                      <div className="space-y-1.5">
                         <div className="flex justify-between text-[9px] font-bold uppercase">
                            <span className="text-[#6B7280]">CPU Utilization</span>
                            <span className="text-[#0A0A0A]">12%</span>
                         </div>
                         <div className="h-1 bg-[#F7F7F5] rounded-full overflow-hidden"><div className="bg-[#0055FF] h-full w-[12%]"></div></div>
                      </div>
                      <div className="space-y-1.5">
                         <div className="flex justify-between text-[9px] font-bold uppercase">
                            <span className="text-[#6B7280]">RAM Allocation</span>
                            <span className="text-[#0A0A0A]">24%</span>
                         </div>
                         <div className="h-1 bg-[#F7F7F5] rounded-full overflow-hidden"><div className="bg-[#16835B] h-full w-[24%]"></div></div>
                      </div>
                      <div className="space-y-1.5">
                         <div className="flex justify-between text-[9px] font-bold uppercase">
                            <span className="text-[#6B7280]">Storage Index</span>
                            <span className="text-[#0A0A0A]">8%</span>
                         </div>
                         <div className="h-1 bg-[#F7F7F5] rounded-full overflow-hidden"><div className="bg-[#0A0A0A] h-full w-[8%]"></div></div>
                      </div>
                   </div>
                </Card>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                   <Card className="bg-white border border-[#E4E4E4] rounded-xl shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-[#F7F7F5] bg-[#F7F7F5] flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">RDP Access Protocol</h3>
                        <div className="flex items-center gap-1.5">
                           <Lock className="w-3 h-3 text-[#16835B]" />
                           <span className="text-[8px] font-bold text-[#16835B] uppercase">End-to-End Encrypted</span>
                        </div>
                      </div>
                      <div className="p-8 space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                               <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Server IP Address</label>
                               <div className="flex items-center gap-2">
                                  <code className="flex-grow p-4 bg-[#F7F7F5] border border-[#E4E4E4] rounded-xl text-xs font-mono font-bold text-[#0A0A0A]">142.93.242.108</code>
                                  <button onClick={() => handleCopy('142.93.242.108', 'ip')} className="p-4 border border-[#E4E4E4] hover:bg-[#F7F7F5] transition-all rounded-xl">
                                    {copied === 'ip' ? <Check className="w-4 h-4 text-[#16835B]" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
                                  </button>
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Secure Access Token</label>
                               <div className="flex items-center gap-2">
                                  <code className="flex-grow p-4 bg-[#F7F7F5] border border-[#E4E4E4] rounded-xl text-xs font-mono font-bold text-[#0A0A0A]">••••••••••••</code>
                                  <button onClick={() => handleCopy('VRB-PROV-SECURE-99', 'pass')} className="p-4 border border-[#E4E4E4] hover:bg-[#F7F7F5] transition-all rounded-xl">
                                    {copied === 'pass' ? <Check className="w-4 h-4 text-[#16835B]" /> : <Lock className="w-4 h-4 text-[#6B7280]" />}
                                  </button>
                               </div>
                            </div>
                         </div>
                         <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <button className="flex-1 py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 shadow-lg rounded-xl">
                               <ExternalLink className="w-3.5 h-3.5" />
                               Launch RDP Terminal
                            </button>
                            <button className="flex-1 py-4 bg-white border border-[#E4E4E4] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#F7F7F5] transition-all rounded-xl">
                               Download Config Profile
                            </button>
                         </div>
                      </div>
                   </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                   <Card className="p-8 bg-[#010813] text-white border-none shadow-xl rounded-xl space-y-6">
                      <div className="flex items-center gap-2 text-[#0055FF]">
                        <Terminal className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Deployment Log</span>
                      </div>
                      <div className="space-y-4">
                         {[
                           'Varban Terminal pre-installed.',
                           'Claude Code agent active.',
                           '24/7 matching node persistence.',
                           'Scheduled reboots: SUN 21:00 GMT.'
                         ].map((step, i) => (
                           <div key={i} className="flex gap-3">
                              <span className="text-[10px] font-mono font-bold text-[#0055FF]">0{i+1}</span>
                              <p className="text-[10px] text-[#94A3B8] font-bold uppercase leading-tight">{step}</p>
                           </div>
                         ))}
                      </div>
                   </Card>

                   <div className="p-6 bg-white border border-[#E4E4E4] rounded-xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-2">
                         <Power className="w-4 h-4 text-[#C43D3D]" />
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Administrative Actions</h4>
                      </div>
                      <div className="flex flex-col gap-2">
                         <button className="w-full py-3 bg-[#F7F7F5] border border-[#E4E4E4] text-[9px] font-bold uppercase tracking-widest hover:border-[#0055FF] rounded-lg transition-all">Soft Reboot Instance</button>
                         <button 
                          onClick={() => setViewState('SELECTION')}
                          className="w-full py-3 bg-white border border-[#E4E4E4] text-[9px] font-bold uppercase tracking-widest text-[#C43D3D] hover:bg-[#C43D3D] hover:text-white rounded-lg transition-all"
                         >
                           Decommission Node
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </AuthedLayout>
  );
}
