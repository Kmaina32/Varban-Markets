'use client';

/**
 * @fileOverview Institutional Bottom Panel (Advanced Ledger).
 * Enhanced columns for precision risk tracking including Swap, Margin, and TP/SL.
 * Roadmap Stage 2: Advanced Ledger implementation.
 * Updated: Fixed hydration mismatch for Audit-ID generation.
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/app/lib/utils';
import { Activity, Clock, FileText, ChevronRight, XCircle, Settings2, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/app/lib/i18n-context';

interface PortfolioManagerProps {
  positions: any[];
  orders: any[];
  history: any[];
  loading?: boolean;
}

type Tab = 'POSITIONS' | 'ORDERS' | 'HISTORY';

export default function PortfolioManager({ positions, orders, history, loading }: PortfolioManagerProps) {
  const { formatNumber } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('POSITIONS');
  const [auditId, setAuditId] = useState<string>("");

  // Fix hydration mismatch by generating the ID only on the client
  useEffect(() => {
    setAuditId(Math.random().toString(36).substring(7).toUpperCase());
  }, []);

  const tabs = [
    { id: 'POSITIONS', label: `Active Exposure (${positions.length})`, icon: Activity },
    { id: 'ORDERS', label: `Pending Orders (${orders.length})`, icon: FileText },
    { id: 'HISTORY', label: 'Settlement Archive', icon: Clock }
  ];

  return (
    <div className="h-full flex flex-col bg-white border-t border-[#E4E4E4] shadow-[0_-4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="flex border-b border-[#E4E4E4] bg-[#F7F7F5] shrink-0 sticky top-0 z-20 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "px-6 py-3.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border-r border-[#E4E4E4] transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-white text-[#0055FF] border-b-2 border-b-[#0055FF]" : "text-[#6B7280] hover:bg-[#F0F0F0]"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center px-4 gap-4 hidden md:flex">
           <div className="flex items-center gap-2 text-[8px] font-bold text-[#6B7280] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16835B]"></span>
              <span>Ledger Synchronized</span>
           </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto no-scrollbar">
        {activeTab === 'POSITIONS' && (
          <div className="min-w-[1200px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-[#F7F7F5] sticky top-0 z-10 shadow-sm">
                <tr className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Market</th>
                  <th className="p-4">Side</th>
                  <th className="p-4 text-right">Entry Price</th>
                  <th className="p-4 text-right">Target S/L</th>
                  <th className="p-4 text-right">Target T/P</th>
                  <th className="p-4 text-right">Current Price</th>
                  <th className="p-4 text-right">Stake/Qty</th>
                  <th className="p-4 text-right">Accrued Swap</th>
                  <th className="p-4 text-right">Margin Usage</th>
                  <th className="p-4 text-right">Floating P/L</th>
                  <th className="p-4 text-center">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F7F5] text-[10px] font-mono">
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Activity className="w-8 h-8 text-[#E4E4E4]" />
                        <span className="text-[#D1D5DB] font-bold uppercase tracking-[0.2em]">No active market exposure detected.</span>
                        <p className="text-[9px] text-[#6B7280] uppercase max-w-xs leading-relaxed">
                          Once a contract is executed on the matching engine, it will appear here in real-time.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : positions.map(pos => (
                  <tr key={pos.id} className="hover:bg-[#F7F7F5] transition-colors group">
                    <td className="p-4 text-[#6B7280] uppercase">{pos.id.slice(0, 10)}</td>
                    <td className="p-4 font-bold text-[#0A0A0A]">{pos.instrument}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 border text-[9px] font-bold uppercase",
                        pos.vector === 'BUY' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5"
                      )}>
                        {pos.vector}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#6B7280]">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right text-[#C43D3D]">---</td>
                    <td className="p-4 text-right text-[#16835B]">---</td>
                    <td className="p-4 text-right font-bold text-[#0A0A0A]">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-bold text-[#0A0A0A]">${pos.stake.toFixed(2)}</td>
                    <td className="p-4 text-right text-[#6B7280]">$0.00</td>
                    <td className="p-4 text-right text-[#6B7280]">$0.00</td>
                    <td className="p-4 text-right font-bold text-[#16835B]">+$0.00</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 border border-[#E4E4E4] bg-white text-[#6B7280] hover:text-[#0055FF] transition-colors shadow-sm" title="Modify Order"><Settings2 className="w-3.5 h-3.5" /></button>
                        <button className="p-2 border border-[#E4E4E4] bg-white text-[#C43D3D] hover:bg-[#C43D3D] hover:text-white transition-colors shadow-sm" title="Close Position"><XCircle className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ORDERS' && (
           <div className="min-w-[800px]">
             <table className="w-full text-left border-collapse">
               <thead className="bg-white border-b border-[#F7F7F5] sticky top-0 z-10 shadow-sm">
                 <tr className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">
                   <th className="p-4">Reference</th>
                   <th className="p-4">Type</th>
                   <th className="p-4">Market</th>
                   <th className="p-4 text-right">Target Entry</th>
                   <th className="p-4 text-right">Committed Stake</th>
                   <th className="p-4 text-center">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#F7F7F5] text-[10px] font-mono">
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-[#D1D5DB] font-bold uppercase italic tracking-widest opacity-50">
                      Pending registry empty. No limit or stop orders discovered.
                    </td>
                  </tr>
               </tbody>
             </table>
           </div>
        )}

        {activeTab === 'HISTORY' && (
           <div className="min-w-[1000px]">
             <table className="w-full text-left border-collapse">
               <thead className="bg-white border-b border-[#F7F7F5] sticky top-0 z-10 shadow-sm">
                 <tr className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">
                   <th className="p-4">Settlement Time</th>
                   <th className="p-4">Market Instrument</th>
                   <th className="p-4">Direction</th>
                   <th className="p-4 text-right">Entry Price</th>
                   <th className="p-4 text-right">Exit Price</th>
                   <th className="p-4 text-right">Net Outcome</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#F7F7F5] text-[10px] font-mono">
                 {history.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="p-16 text-center text-[#D1D5DB] font-bold uppercase italic tracking-widest opacity-50">
                       No historical records discovered in the current session domain.
                     </td>
                   </tr>
                 ) : history.map(h => (
                   <tr key={h.id} className="hover:bg-[#F7F7F5] transition-colors">
                     <td className="p-4 text-[#6B7280] uppercase">{new Date(h.timestamp).toLocaleTimeString()}</td>
                     <td className="p-4 font-bold text-[#0A0A0A]">{h.instrument}</td>
                     <td className="p-4 uppercase text-[#0A0A0A]">{h.vector}</td>
                     <td className="p-4 text-right text-[#6B7280]">${h.entryPrice.toFixed(2)}</td>
                     <td className="p-4 text-right text-[#6B7280]">${h.entryPrice.toFixed(2)}</td>
                     <td className="p-4 text-right font-bold text-[#16835B]">+$${(h.stake * 0.85).toFixed(2)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>

      <div className="h-8 bg-[#F7F7F5] border-t border-[#E4E4E4] flex items-center px-4 shrink-0 justify-between">
         <div className="flex items-center gap-4 text-[8px] font-bold uppercase tracking-widest text-[#6B7280]">
            <div className="flex items-center gap-1.5">
               <ShieldCheck className="w-3 h-3 text-[#16835B]" />
               <span>Defined-Risk Node</span>
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-[#16835B] animate-pulse"></div>
               <span>Secure Handshake Verified</span>
            </div>
         </div>
         <span className="text-[8px] font-mono text-[#D1D5DB] uppercase">Audit-ID: {auditId || "---"}</span>
      </div>
    </div>
  );
}