'use client';

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Globe } from "lucide-react";
import EconomicCalendar from "@/components/tradingview/EconomicCalendar";

export default function CalendarPage() {
  return (
    <AuthedLayout 
      title="Economic Calendar" 
      subtitle="Real-time tracking of global fundamental catalysts"
    >
      <div className="space-y-6 h-[calc(100vh-180px)] flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <Card className="p-4 bg-white border-[#E4E4E4] flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F7F7F5] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-[#0055FF]" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Event Cycle</span>
              <p className="text-[10px] font-bold text-[#0A0A0A] uppercase">Fundamental Feed</p>
            </div>
          </Card>
          <Card className="p-4 bg-white border-[#E4E4E4] flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F7F7F5] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#16835B]" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Update Frequency</span>
              <p className="text-[10px] font-bold text-[#0A0A0A] uppercase">Sub-Second Sync</p>
            </div>
          </Card>
          <Card className="p-4 bg-white border-[#E4E4E4] flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F7F7F5] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Domain Coverage</span>
              <p className="text-[10px] font-bold text-[#0A0A0A] uppercase">Global G10 + Emerging</p>
            </div>
          </Card>
        </div>

        <div className="flex-grow min-h-0 bg-white border border-[#E4E4E4]">
          <EconomicCalendar />
        </div>
      </div>
    </AuthedLayout>
  );
}
