'use client';

/**
 * @fileOverview Institutional Telemetry Node v2.0.
 * Redesigned for high-fidelity white theme with dark typography.
 * Relocated above the AI chat bot with minimize/widget/close states.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Minimize2, 
  Maximize2, 
  ShieldAlert,
  Zap,
  X,
  PlusSquare,
  Globe,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { cn } from '@/app/lib/utils';

const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

export default function AdminTelemetryOverlay() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [state, setState] = useState<'expanded' | 'minimized' | 'closed'>('expanded');
  const [metrics, setMetrics] = useState({
    cpu: 10.9,
    dbLatency: 27,
    ram: 45.1,
    uptime: "99.98%",
    network: "1.2 GB/s",
    status: 'OPTIMAL'
  });

  // Verify Authority
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) || profile?.status?.role === 'Admin';
  }, [user, profile]);

  // Simulate telemetry flux
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(8.0, Math.min(15.0, prev.cpu + (Math.random() * 2 - 1))),
        dbLatency: Math.max(22, Math.min(35, prev.dbLatency + Math.floor(Math.random() * 4 - 2))),
        ram: Math.max(44.0, Math.min(46.0, prev.ram + (Math.random() * 0.4 - 0.2))),
        status: Math.random() > 0.99 ? 'SCALING' : 'OPTIMAL'
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) return null;

  // CLOSED STATE: Show small "N" trigger in bottom left as per reference
  if (state === 'closed') {
    return (
      <button 
        onClick={() => setState('expanded')}
        className="fixed bottom-6 left-6 z-[999] w-10 h-10 bg-[#0A0A0A] rounded-full flex items-center justify-center text-white text-xs font-mono font-bold shadow-xl hover:scale-110 transition-all pointer-events-auto"
      >
        N
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed z-[999] transition-all duration-500 ease-in-out pointer-events-auto",
      state === 'expanded' ? "bottom-[100px] right-6" : "bottom-24 right-6"
    )}>
      <div className={cn(
        "relative bg-white border border-[#E4E4E4] shadow-2xl transition-all duration-500 overflow-hidden",
        state === 'expanded' ? "w-[280px] h-[400px] rounded-[2.5rem]" : "w-14 h-14 rounded-full flex items-center justify-center bg-[#0A0A0A]"
      )}>
        
        {state === 'minimized' ? (
          <button onClick={() => setState('expanded')} className="text-white animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </button>
        ) : (
          <div className="h-full flex flex-col p-8 space-y-6">
            {/* Header Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-1 z-30">
              <button onClick={() => setState('minimized')} className="p-1 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"><Minimize2 className="w-3.5 h-3.5" /></button>
              <button className="p-1 text-[#6B7280] hover:text-[#0055FF] transition-colors"><PlusSquare className="w-3.5 h-3.5" /></button>
              <button onClick={() => setState('closed')} className="p-1 text-[#6B7280] hover:text-[#C43D3D] transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>

            {/* Branded Header */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0055FF] flex items-center justify-center shadow-lg shadow-[#0055FF]/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#D1D5DB] uppercase tracking-[0.3em] leading-none mb-1">Telemetry Node</h3>
                <span className="text-[9px] font-bold text-[#16835B] uppercase tracking-widest">{metrics.status}</span>
              </div>
            </div>

            {/* Data Card (As per reference image) */}
            <div className="bg-[#94A3B8]/10 rounded-[2rem] p-6 space-y-5 flex-grow relative overflow-hidden flex flex-col">
              <div className="space-y-4 relative z-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full border-2 border-[#6B7280]"></div>
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">CPU LOAD</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0A0A0A]">{metrics.cpu.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-[#6B7280] opacity-30" />
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">DB LATENCY</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0A0A0A]">{metrics.dbLatency}ms</span>
                </div>
              </div>

              {/* Liquid RAM Gauge (Centered large as per image) */}
              <div className="flex-grow flex flex-col items-center justify-center pt-4 relative">
                <div className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-t from-[#0055FF]/40 to-[#0055FF]/10 z-0">
                  <svg className="w-[200%] h-4 absolute top-0 -translate-y-full animate-wave fill-[#0055FF]/20" viewBox="0 0 1200 24" preserveAspectRatio="none">
                    <path d="M0,0 C150,0 200,20 400,20 C600,20 650,0 800,0 C950,0 1000,20 1200,20 L1200,24 L0,24 Z" />
                  </svg>
                </div>
                <div className="relative z-10 text-center">
                  <span className="text-3xl font-mono font-bold text-[#0A0A0A] tracking-tighter">
                    {metrics.ram.toFixed(1)}%
                  </span>
                  <span className="block text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.4em] mt-2 opacity-60">RAM ALLOCATION</span>
                </div>
              </div>
            </div>

            {/* Extended Data Bar */}
            <div className="flex justify-between items-center px-2 pt-2 border-t border-[#F7F7F5]">
              <div className="flex items-center gap-1.5">
                <Globe className="w-2.5 h-2.5 text-[#6B7280]" />
                <span className="text-[8px] font-bold text-[#6B7280] uppercase">Uptime {metrics.uptime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-2.5 h-2.5 text-[#0055FF]" />
                <span className="text-[8px] font-bold text-[#6B7280] uppercase">{metrics.network}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes flowWave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave {
          animation: flowWave 6s linear infinite;
        }
      `}</style>
    </div>
  );
}
