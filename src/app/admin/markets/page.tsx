'use client';

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Database, Zap, ShieldCheck, Power } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { AVAILABLE_INSTRUMENTS, Instrument } from "@/app/lib/instruments";
import { useState } from "react";
import { cn } from "@/app/lib/utils";

export default function MarketControl() {
  const { t, formatNumber } = useTranslation();
  const [instruments, setInstruments] = useState<Instrument[]>(AVAILABLE_INSTRUMENTS);

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

  return (
    <AuthedLayout 
      title={t('nav.adminMarkets')} 
      subtitle="Market infrastructure management and availability control"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Instrument</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase">Market Domain</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-right">Liquidity</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">Status</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E4] text-xs">
                  {instruments.map((inst) => (
                    <tr key={inst.symbol} className="hover:bg-[#F7F7F5]">
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
                          "px-2 py-0.5 border text-[9px] font-bold uppercase",
                          inst.status === 'Open' ? "border-[#16835B] text-[#16835B]" : "border-[#C43D3D] text-[#C43D3D]"
                        )}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleStatus(inst.symbol)}
                          className={cn(
                            "p-2 border transition-colors",
                            inst.status === 'Open' ? "border-[#E4E4E4] hover:bg-[#C43D3D] hover:text-white" : "border-[#16835B] text-[#16835B] hover:bg-[#16835B] hover:text-white"
                          )}
                        >
                          <Power className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#0A0A0A] text-white p-6 shadow-sm border border-[#0A0A0A]">
              <Zap className="w-8 h-8 text-[#0055FF] mb-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Global Market Switch</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed mb-6">
                Institutional-grade control over all trade vectors. Emergency halt protocols can be engaged during network instability.
              </p>
              <button className="w-full py-3 bg-[#C43D3D] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#C43D3D] transition-all">
                Emergency Halt Feed
              </button>
            </Card>

            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#16835B] mb-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2">Pricing Audit</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Varban pricing feeds are derived from deterministic multi-source index calculations. All data ticks are logged for regulatory compliance.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AuthedLayout>
  );
}
