'use client';

/**
 * @fileOverview Authenticated Market Registry (workspace chrome via AuthedLayout).
 * The public equivalent lives at /markets and keeps the landing Navbar/Footer.
 */

import Link from "next/link";
import { BarChart4, Layers, Calendar, ArrowRight } from "lucide-react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import MarketRegistry from "@/components/markets/MarketRegistry";

const TOOLS = [
  { label: "Market Heatmaps", href: "/client/markets/heatmaps", icon: Layers, text: "Sector performance at a glance" },
  { label: "Market Screener", href: "/client/markets/screener", icon: BarChart4, text: "Technical filtering and discovery" },
  { label: "Economic Calendar", href: "/client/calendar", icon: Calendar, text: "Global fundamental catalysts" },
];

export default function ClientMarketsPage() {
  return (
    <AuthedLayout
      title="Markets"
      subtitle="Global instrument registry with live pricing"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center justify-between gap-4 p-4 bg-white border border-[#E4E4E4] hover:border-[#0055FF] transition-colors"
            >
              <div className="flex items-center gap-3">
                <tool.icon className="w-4 h-4 text-[#0055FF]" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] block">{tool.label}</span>
                  <span className="text-[9px] font-bold uppercase tracking-tight text-[#6B7280]">{tool.text}</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#0055FF] transition-colors" />
            </Link>
          ))}
        </div>

        <MarketRegistry variant="client" />
      </div>
    </AuthedLayout>
  );
}
