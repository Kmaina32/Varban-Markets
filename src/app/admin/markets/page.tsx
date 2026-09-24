'use client';

/**
 * @fileOverview Admin Market Control Center.
 * Provides granular control over instrument availability and global feed status.
 * Optimized for institutional oversight with a clean white design.
 */

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Database, ShieldCheck, Power, AlertTriangle, Search } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { useState } from "react";
import { cn } from "@/app/lib/utils";

export default function MarketControl() {
  const { t, formatNumber } = useTranslation();
  const [instruments, setInstruments] = useState<Instrument[]>(AVAILABLE_INSTRUMENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleStatus = (symbol: string) => {
    setInstruments(prev => prev.map(inst => {
      if (inst.symbol === symbol) {
        return {
          ...inst,
          status: inst.status === 'Open' ? 'Closed' : 'Open'
        };
      }
      return inst;
    }));
  };

  const filteredInstruments = instruments.filter(i => 
    i.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthedLayout 
      title={t('nav.adminMarkets')} 
      subtitle="Market infrastructure management and availability control"
    >
      <div className="space-y-6">
        {/* Search & Statistics Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-[#E4E4E4] p-4 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search registry (e.g. BTC, Forex)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF]"
            />
          </div>
          <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16835B]"></span>
              <span>Active: {instruments.filter(i => i.status === 'Open').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0055FF]"></span>
              <span>Halted: {instruments.filter(i => i.status === 'Closed').length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                      <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Instrument</th>
                      <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Market Domain</th>
                      <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">Liquidity</th>
                      <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Status</th>
                      <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E4] text-xs">
                    {filteredInstruments.map((inst) => (
                      <tr key={inst.symbol} className="hover:bg-[#F7F7F5] transition-colors group">
                        <td className="p-4">
                          <span className="font-mono font-bold block text-[#0A0A0A]">{inst.symbol}</span>
                          <span className="text-[9px] text-[#6B7280] uppercase tracking-tighter">{inst.name}</span>
                        </td>
                        <td className="p-4 text-[#6B7280] uppercase text-[10px] tracking-widest">{inst.category}</td>
                        <td className="p-4 text-right font-mono text-[#6B7280]">
                          ${formatNumber(inst.maxStake, { notation: 'compact' })}
                        </td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "px-2 py-0.5 border text-[9px] font-bold uppercase transition-all",
                            inst.status === 'Open' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5"
                          )}>
                            {inst.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => toggleStatus(inst.symbol)}
                            className={cn(
                              "p-2 border transition-colors shadow-sm",
                              inst.status === 'Open' ? "border-[#E4E4E4] hover:bg-[#0055FF] hover:text-white" : "border-[#16835B] text-[#16835B] hover:bg-[#16835B] hover:text-white"
                            )}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-[#0055FF] mb-4">
                <Database className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Global Market Switch</h4>
              </div>
              <p className="text-[10px] text-[#6B7280] leading-relaxed mb-6">
                Institutional-grade control over all trade vectors. Emergency halt protocols can be engaged during network instability or maintenance windows.
              </p>
              <button 
                onClick={() => alert("Emergency Halt protocol initiated. Awaiting Root Authority confirmation...")}
                className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all border border-[#0A0A0A] hover:border-[#0055FF] shadow-sm"
              >
                Emergency Halt Feed
              </button>
            </Card>

            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm border-t-4 border-t-[#16835B]">
              <div className="flex items-center space-x-2 text-[#16835B] mb-4">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Pricing Audit</h4>
              </div>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Varban pricing feeds are derived from deterministic multi-source index calculations. All data ticks are logged for regulatory compliance and auditability.
              </p>
            </Card>

            <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
              <p className="text-[9px] text-[#6B7280] leading-relaxed uppercase font-bold">
                Status modifications propagate instantly across all active matching nodes and user terminals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
