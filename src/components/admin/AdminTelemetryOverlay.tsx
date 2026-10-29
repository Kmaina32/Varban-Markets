'use client';

/**
 * @fileOverview Institutional Admin Telemetry Node.
 * Displays real-time infrastructure metrics in a high-fidelity glass-liquid container.
 * Exclusively accessible to entities with Root Authority.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Minimize2, 
  Maximize2, 
  ShieldAlert,
  Zap
} from 'lucide-react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { cn } from '@/app/lib/utils';

const SUPER_ADMIN_EMAILS = ['macos8388@gmail.com', 'gmaina4242@gmail.com'];

export default function AdminTelemetryOverlay() {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  const [isMinimized, setIsMinimized] = useState(false);
  const [metrics, setMetrics] = useState({
    cpu: 12,
    ram: 45,
    dbLatency: 18,
    status: 'OPTIMAL'
  });

  // Verify Authority
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) || profile?.status?.role === 'Admin';
  }, [user, profile]);

  // Simulate Real-time Telemetry Ticks
  useEffect(() => {
    if (!isAdmin) return;
    
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.max(8, Math.min(24, prev.cpu + (Math.random() * 4 - 2))),
        ram: Math.max(40, Math.min(52, prev.ram + (Math.random() * 2 - 1))),
        dbLatency: Math.max(12, Math.min(35, prev.dbLatency + (Math.random() * 6 - 3))),
        status: Math.random() > 0.98 ? 'SCALING' : 'OPTIMAL'
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[999] pointer-events-none">
      <div className={cn(
        "relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 overflow-hidden pointer-events-auto",
        isMinimized ? "w-12 h-12 rounded-full" : "w-64 h-80 rounded-[2rem]"
      )}>
        {/* Toggle Trigger */}
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute top-3 right-3 z-30 p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
        >
          {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>

        {isMinimized ? (
          <div className="flex items-center justify-center h-full animate-pulse">
            <ShieldAlert className="w-5 h-5 text-[#0055FF]" />
          </div>
        ) : (
          <div className="h-full flex flex-col p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0055FF] flex items-center justify-center shadow-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1">Telemetry Node</h3>
                <span className="text-[8px] font-bold text-[#16835B] uppercase tracking-tighter bg-white/10 px-1.5 py-0.5 rounded">
                  {metrics.status}
                </span>
              </div>
            </div>

            {/* Liquid Gauge Container */}
            <div className="relative flex-grow rounded-2xl bg-black/20 border border-white/5 overflow-hidden">
              {/* Dynamic Wave Animation */}
              <div 
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0055FF]/60 to-[#0055FF]/20 transition-all duration-1000 ease-in-out"
                style={{ height: `${metrics.ram}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-4 -translate-y-full overflow-hidden opacity-50">
                  <svg className="w-[200%] h-full animate-liquid-wave fill-[#0055FF]/40" viewBox="0 0 1200 24" preserveAspectRatio="none">
                    <path d="M0,0 C150,0 200,20 400,20 C600,20 650,0 800,0 C950,0 1000,20 1200,20 L1200,24 L0,24 Z" />
                  </svg>
                </div>
              </div>

              {/* Data Overlay */}
              <div className="relative z-20 h-full flex flex-col justify-between p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3 h-3 text-white/40" />
                      <span className="text-[9px] font-bold text-white/60 uppercase">CPU Load</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{metrics.cpu.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-3 h-3 text-white/40" />
                      <span className="text-[9px] font-bold text-white/60 uppercase">DB Latency</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{metrics.dbLatency.toFixed(0)}ms</span>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-white/5">
                   <div className="text-[18px] font-mono font-bold text-white leading-none mb-1">
                     {metrics.ram.toFixed(1)}%
                   </div>
                   <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">RAM Allocation</span>
                </div>
              </div>
            </div>

            {/* Safety Proof */}
            <div className="flex items-center gap-2 pt-1">
               <Zap className="w-2.5 h-2.5 text-[#0055FF]" />
               <span className="text-[7px] font-bold text-white/30 uppercase tracking-[0.3em]">
                 Root Node: {user.uid.substring(0, 8).toUpperCase()}
               </span>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes liquidWave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-liquid-wave {
          animation: liquidWave 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
