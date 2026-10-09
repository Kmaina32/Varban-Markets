'use client';

/**
 * @fileOverview Institutional Bottom Panel.
 * Manages active exposure, pending orders, and execution history.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/app/lib/utils';
import { Activity, Clock, FileText, ChevronRight, XCircle } from 'lucide-react';
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

  const tabs = [
    { id: 'POSITIONS', label: `Active Exposure (${positions.length})`, icon: Activity },
    { id: 'ORDERS', label: `Pending Orders (${orders.length})`, icon: FileText },
    { id: 'HISTORY', label: 'Trade History', icon: Clock }
  ];

  return (
    <div className="h-full flex flex-col bg-white border-t border-[#E4E4E4] shadow-[0_-4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="flex border-b border-[#E4E4E4] bg-[#F7F7F5] shrink-0 sticky top-0 z-20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "px-6 py-3.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border-r border-[#E4E4E4] transition-all",
              activeTab === tab.id ? "bg-white text-[#0055FF] border-b-2 border-b-[#0055FF]" : "text-[#6B7280] hover:bg-[#F0F0F0]"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar">
        {activeTab === 'POSITIONS' && (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-white border-b border-[#F7F7F5] sticky top-0 z-10">
              <tr className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">
                <th className="p-4">Reference</th>
                <th className="p-4">Market</th>
                <th className="p-4">Side</th>
                <th className="p-4 text-right">Entry</th>
                <th className="p-4 text-right">Qty / Stake</th>
                <th className="p-4 text-right">Current</th>
                <th className="p-4 text-right">Unrealized P/L</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F7F5] text-[10px] font-mono">
              {positions.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-[#D1D5DB] font-bold uppercase italic">No active market exposure detected.</td></tr>
              ) : positions.map(pos => (
                <tr key={pos.id} className="hover:bg-[#F7F7F5] transition-colors group">
                  <td className="p-4 text-[#6B7280] uppercase">{pos.id.slice(0, 10)}</td>
                  <td className="p-4 font-bold text-[#0A0A0A]">{pos.instrument}</td>
                  <td className="p-4"><span className={cn("px-2 py-0.5 border text-[9px] font-bold uppercase", pos.vector === 'BUY' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#C43D3D] text-[#C43D3D] bg-[#C43D3D]/5")}>{pos.vector}</span></td>
                  <td className="p-4 text-right text-[#6B7280]">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right font-bold text-[#0A0A0A]">${pos.stake.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-[#0A0A0A]">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right font-bold text-[#16835B]">+$0.00</td>
                  <td className="p-4 text-center">
                    <button className="p-2 border border-[#E4E4E4] text-[#C43D3D] hover:bg-[#C43D3D] hover:text-white transition-colors"><XCircle className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'ORDERS' && (
           <table className="w-full text-left border-collapse">
             <thead className="bg-white border-b border-[#F7F7F5] sticky top-0 z-10">
               <tr className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">
                 <th className="p-4">Ref</th>
                 <th className="p-4">Type</th>
                 <th className="p-4">Market</th>
                 <th className="p-4 text-right">Target Price</th>
                 <th className="p-4 text-right">Stake</th>
                 <th className="p-4 text-center">Decision</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[#F7F7F5] text-[10px] font-mono">
                <tr><td colSpan={6} className="p-12 text-center text-[#D1D5DB] font-bold uppercase italic">Registry empty. No pending orders.</td></tr>
             </tbody>
           </table>
        )}

        {activeTab === 'HISTORY' && (
           <table className="w-full text-left border-collapse">
             <thead className="bg-white border-b border-[#F7F7F5] sticky top-0 z-10">
               <tr className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest">
                 <th className="p-4">Settlement Time</th>
                 <th className="p-4">Market</th>
                 <th className="p-4">Reference</th>
                 <th className="p-4 text-right">Stake</th>
                 <th className="p-4 text-right">Outcome</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[#F7F7F5] text-[10px] font-mono">
               {history.length === 0 ? (
                 <tr><td colSpan={5} className="p-12 text-center text-[#D1D5DB] font-bold uppercase italic">No historical records in current domain.</td></tr>
               ) : history.map(h => (
                 <tr key={h.id} className="hover:bg-[#F7F7F5]">
                   <td className="p-4 text-[#6B7280] uppercase">{new Date(h.timestamp).toLocaleTimeString()}</td>
                   <td className="p-4 font-bold">{h.instrument}</td>
                   <td className="p-4 text-[#D1D5DB] uppercase">{h.id.slice(0, 8)}</td>
                   <td className="p-4 text-right font-bold">${h.stake.toFixed(2)}</td>
                   <td className="p-4 text-right font-bold text-[#16835B]">+$${(h.stake * 0.85).toFixed(2)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>
    </div>
  );
}
