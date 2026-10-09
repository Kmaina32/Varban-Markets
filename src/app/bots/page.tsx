'use client';

/**
 * @fileOverview Institutional Bot Marketplace Registry.
 * High-performance discovery hub for automated execution modules.
 * Updated: Replaced black container background with Institutional White.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AuthedLayout from '@/components/layout/AuthedLayout';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Cpu, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useTranslation } from '@/app/lib/i18n-context';

const BOT_CATEGORIES = [
  { id: 'all', label: 'All Modules' },
  { id: 'scalping', label: 'High-Frequency' },
  { id: 'trend', label: 'Trend Following' },
  { id: 'arbitrage', label: 'Cross-Network' },
  { id: 'grid', label: 'Market Grid' }
];

const BOTS_REGISTRY = [
  {
    id: "vrb-prime-01",
    name: "Varban Prime Scalper",
    version: "v4.2.1",
    category: "scalping",
    winRate: "68.4%",
    drawdown: "4.2%",
    pnl: "+124.5%",
    risk: "Medium",
    desc: "Optimized for high-volatility majors. Executes micro-tick reversals with deterministic timestamp locking.",
    status: "Verified",
    minStake: 100
  },
  {
    id: "vrb-trend-master",
    name: "Momentum Sentinel",
    version: "v2.0.0",
    category: "trend",
    winRate: "72.1%",
    drawdown: "8.5%",
    pnl: "+86.2%",
    risk: "Low",
    desc: "Long-form trend recognition engine using multi-node EMA cross verification and liquidity-aware entries.",
    status: "Verified",
    minStake: 250
  },
  {
    id: "vrb-arb-crypto",
    name: "Delta Arb Engine",
    version: "v1.1.4",
    category: "arbitrage",
    winRate: "94.8%",
    drawdown: "1.2%",
    pnl: "+42.1%",
    risk: "Very Low",
    desc: "Exploits millisecond price discrepancies between synthetic indexes and Tier-1 liquidity providers.",
    status: "Beta",
    minStake: 1000
  },
  {
    id: "vrb-grid-04",
    name: "Stability Grid Node",
    version: "v3.5.0",
    category: "grid",
    winRate: "59.2%",
    drawdown: "12.4%",
    pnl: "+156.8%",
    risk: "High",
    desc: "Continuous execution module designed for sideways markets. Maintains balanced buy/sell grid parity.",
    status: "Verified",
    minStake: 50
  }
];

export default function BotMarketplacePage() {
  const { t, formatNumber } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBots = useMemo(() => {
    return BOTS_REGISTRY.filter(bot => {
      const matchesCat = activeCategory === 'all' || bot.category === activeCategory;
      const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            bot.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <AuthedLayout 
      title="Bot Marketplace" 
      subtitle="Automated Execution & Algorithmic Strategy Registry"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-20">
        
        {/* Marketplace Banner - Updated to Institutional White */}
        <Card className="bg-white border-[#E4E4E4] p-8 md:p-12 relative overflow-hidden shadow-sm border-b-4 border-b-[#0055FF]">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0055FF]/5 border border-[#0055FF]/20">
              <Cpu className="w-4 h-4 text-[#0055FF]" />
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em]">Institutional Algotrading</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight text-[#0A0A0A]">
              Execute with <br /> mathematical precision.
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">
              Deploy pre-verified algorithmic modules to your trading domain. Each bot is engineered for deterministic execution on the Varban matching engine.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0055FF]/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-12 right-12 hidden lg:block opacity-5">
             <Activity className="w-24 h-24 text-[#0055FF]" />
          </div>
        </Card>

        {/* Discovery Interface */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-[#E4E4E4]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
              {BOT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-5 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                    activeCategory === cat.id 
                      ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md" 
                      : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5] hover:text-[#0A0A0A]"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search bot registry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF] shadow-sm rounded-none"
              />
            </div>
          </div>

          {/* Bots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBots.map((bot) => (
              <Card key={bot.id} className="bg-white border-[#E4E4E4] shadow-sm hover:border-[#0055FF] transition-all group overflow-hidden flex flex-col">
                <div className="p-6 md:p-8 space-y-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest">{bot.version}</span>
                        {bot.status === 'Beta' && (
                          <span className="px-1.5 py-0.5 bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227] text-[8px] font-bold uppercase">Beta Node</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A] group-hover:text-[#0055FF] transition-colors">{bot.name}</h3>
                    </div>
                    <div className="w-12 h-12 bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center rounded-none group-hover:bg-[#0055FF]/5 transition-colors">
                       <Cpu className="w-6 h-6 text-[#0A0A0A] group-hover:text-[#0055FF]" />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight line-clamp-2">
                    {bot.desc}
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#F7F7F5]">
                    <div>
                      <span className="text-[8px] font-bold text-[#6B7280] uppercase block mb-1">Win Rate</span>
                      <span className="text-xs font-mono font-bold text-[#16835B]">{bot.winRate}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-[#6B7280] uppercase block mb-1">Max DD</span>
                      <span className="text-xs font-mono font-bold text-[#C43D3D]">{bot.drawdown}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-[#6B7280] uppercase block mb-1">Lifetime P&L</span>
                      <span className="text-xs font-mono font-bold text-[#0A0A0A]">{bot.pnl}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#F7F7F5] border-t border-[#E4E4E4] flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase">Min Stake</span>
                        <span className="text-[10px] font-mono font-bold">${bot.minStake} USD</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase">Risk Level</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          bot.risk === 'Low' || bot.risk === 'Very Low' ? "text-[#16835B]" : 
                          bot.risk === 'Medium' ? "text-[#C9A227]" : "text-[#C43D3D]"
                        )}>{bot.risk}</span>
                     </div>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline">
                    Deploy Module <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {filteredBots.length === 0 && (
            <div className="py-24 text-center space-y-4 border-2 border-dashed border-[#E4E4E4] bg-white">
              <Layers className="w-12 h-12 text-[#E4E4E4] mx-auto" />
              <div>
                <h3 className="text-sm font-bold uppercase text-[#0A0A0A]">No Modules Discovered</h3>
                <p className="text-[10px] text-[#6B7280] uppercase font-bold mt-1 tracking-widest">Adjust your filters or query to expand search domain.</p>
              </div>
            </div>
          )}
        </div>

        {/* Security / Compliance Notice */}
        <div className="p-6 bg-[#0055FF]/5 border border-[#0055FF]/20 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#0055FF] shrink-0 mt-0.5" />
              <div>
                 <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Deterministic Logic Verified</h4>
                 <p className="text-[10px] text-[#6B7280] leading-relaxed font-bold uppercase mt-1">
                    Every bot in the registry undergoes mandatory execution testing. Performance metrics represent historical results verified against the internal ledger.
                 </p>
              </div>
           </div>
           <Link href="/help" className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest underline decoration-2 underline-offset-4 whitespace-nowrap">
              Review Algotrading Risk Policy
           </Link>
        </div>

      </div>
    </AuthedLayout>
  );
}
