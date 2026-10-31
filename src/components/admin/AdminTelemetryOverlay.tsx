'use client';

/**
 * @fileOverview Institutional Telemetry Node v3.0.
 * Redesigned for high-fidelity professional aesthetics with a 6-second inactivity timeout.
 * Features a dynamic SVG wave for RAM visualization.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Minimize2, 
  Maximize2, 
  ShieldAlert,
  X,
  PlusSquare,
  Globe,
  RefreshCw
} from 'lucide-react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { cn } from '@/app/lib/utils';

const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];
const TIMEOUT_DURATION = 6000; // 6 seconds

export default function AdminTelemetryOverlay() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [state, setState] = useState<'expanded' | 'minimized' | 'closed'>('expanded');
  const [metrics, setMetrics] = useState({
    cpu: 11.4,
    dbLatency: 22,
    ram: 45.2,
    uptime: "99.98%",
    network: "1.2 GB/S",
    status: 'OPTIMAL'
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) || profile?.status?.role === 'Admin';
  }, [user, profile]);

  // Reset timeout on interaction
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (state === 'expanded') {
      timeoutRef.current = setTimeout(() => {
        setState('minimized');
      }, TIMEOUT_DURATION);
    }
  };

  useEffect(() => {
    if (isAdmin && state === 'expanded') {
      resetTimeout();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAdmin, state]);

  // Metric fluctuation simulation
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(8.0, Math.min(15.0, prev.cpu + (Math.random() * 0.6 - 0.3))),
        dbLatency: Math.max(18, Math.min(28, prev.dbLatency + Math.floor(Math.random() * 3 - 1))),
        ram: Math.max(44.5, Math.min(46.0, prev.ram + (Math.random() * 0.2 - 0.1))),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin || state === 'closed') return null;

  return (
    <div 
      className={cn(
        "fixed z-[1000] transition-all duration-700 ease-in-out pointer-events-auto",
        state === 'expanded' ? "bottom-6 right-6" : "bottom-6 right-6"
      )}
      onMouseEnter={resetTimeout}
      onMouseMove={resetTimeout}
    >
      {state === 'minimized' ? (
        <button 
          onClick={() => setState('expanded')}
          className="w-14 h-14 bg-[#0A0A0A] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all animate-in fade-in zoom-in"
        >
          <ShieldAlert className="w-6 h-6" />
        </button>
      ) : (
        <div className="relative w-[300px] bg-white border border-[#E4E4E4] shadow-2xl rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
          {/* Header Controls */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0055FF] flex items-center justify-center shadow-lg shadow-[#0055FF]/20 relative overflow-hidden">
                <Activity className="w-5 h-5 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[10px] font-bold text-[#D1D5DB] uppercase tracking-[0.3em] leading-none">Telemetry Node</h3>
                <span className="text-[9px] font-bold text-[#16835B] uppercase tracking-widest">{metrics.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setState('minimized')} className="p-1.5 text-[#D1D5DB] hover:text-[#0A0A0A] transition-colors"><Minimize2 className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 text-[#D1D5DB] hover:text-[#0055FF] transition-colors"><PlusSquare className="w-3.5 h-3.5" /></button>
              <button onClick={() => setState('closed')} className="p-1.5 text-[#D1D5DB] hover:text-[#C43D3D] transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Metrics Body */}
          <div className="px-8 pb-8 space-y-6">
            <div className="bg-[#F7F7F5] rounded-[2rem] p-6 space-y-5 relative overflow-hidden">
              <div className="space-y-4 relative z-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full border border-[#6B7280]"></div>
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">CPU LOAD</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0A0A0A]">{metrics.cpu.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-3.5 h-3.5 text-[#D1D5DB]" />
                    <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">DB LATENCY</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0A0A0A]">{metrics.dbLatency}ms</span>
                </div>
              </div>

              {/* Dynamic RAM Wave Indicator */}
              <div className="relative h-28 w-full bg-white/40 overflow-hidden border border-white/60">
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center">
                  <span className="text-3xl font-mono font-bold text-[#0A0A0A] tracking-tighter">
                    {metrics.ram.toFixed(1)}%
                  </span>
                  <span className="block text-[7px] font-bold text-[#6B7280] uppercase tracking-[0.4em] mt-1">RAM ALLOCATION</span>
                </div>
                
                {/* SVG Wave */}
                <div className="absolute inset-x-0 bottom-0 transition-all duration-1000 ease-in-out" style={{ height: `${metrics.ram}%` }}>
                  <div className="absolute top-0 left-0 w-[200%] h-full">
                    <svg className="absolute top-[-15px] left-0 w-full h-4 fill-[#0055FF]/10 animate-wave-slow" viewBox="0 0 1200 24" preserveAspectRatio="none">
                      <path d="M0,0 C150,0 200,20 400,20 C600,20 650,0 800,0 C950,0 1000,20 1200,20 L1200,24 L0,24 Z" />
                    </svg>
                    <svg className="absolute top-[-10px] left-[-200px] w-full h-4 fill-[#0055FF]/20 animate-wave-fast" viewBox="0 0 1200 24" preserveAspectRatio="none">
                      <path d="M0,0 C150,0 200,20 400,20 C600,20 650,0 800,0 C950,0 1000,20 1200,20 L1200,24 L0,24 Z" />
                    </svg>
                    <div className="w-full h-full bg-gradient-to-t from-[#0055FF]/30 to-[#0055FF]/10"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Metrics */}
            <div className="flex justify-between items-center px-2 pt-2 border-t border-[#F7F7F5]">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-[#D1D5DB]" />
                <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-tighter">UPTIME {metrics.uptime}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-[#0055FF]" />
                <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-tighter">{metrics.network}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave-slow {
          animation: wave 12s linear infinite;
        }
        .animate-wave-fast {
          animation: wave 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
