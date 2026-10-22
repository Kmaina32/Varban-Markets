'use client';

/**
 * @fileOverview Bot Marketplace Registry.
 * High-performance hub for automated trading tools.
 * Fully localized for international markets.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AuthedLayout from '@/components/layout/AuthedLayout';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  ChevronRight,
  Layers,
  ArrowRight,
  X,
  Info,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useTranslation } from '@/app/lib/i18n-context';

interface Bot {
  id: string;
  name: string;
  version: string;
  category: string;
  winRate: string;
  drawdown: string;
  pnl: string;
  risk: string;
  desc: string;
  status: string;
  minStake: number;
  features: string[];
}

const BOTS_REGISTRY: Bot[] = [
  {
    id: "vrb-prime-01",
    name: "Varban Prime Bot",
    version: "v4.2.1",
    category: "scalping",
    winRate: "68%",
    drawdown: "4%",
    pnl: "+124%",
    risk: "Medium",
    desc: "Our fastest bot. Designed to catch small price moves and deliver steady results in active markets.",
    status: "Verified",
    minStake: 100,
    features: [
      "Fastest entry and exit speed",
      "Works best on major currency pairs",
      "Automatic risk protection on every trade",
      "Built-in stop loss management"
    ]
  },
  {
    id: "vrb-trend-master",
    name: "Momentum Bot",
    version: "v2.0.0",
    category: "trend",
    winRate: "72%",
    drawdown: "8%",
    pnl: "+86%",
    risk: "Low",
    desc: "A smart bot that follows market trends. It waits for the best moment to enter a trade for long-term growth.",
    status: "Verified",
    minStake: 250,
    features: [
      "Follows strong market movements",
      "Highly reliable during news events",
      "Optimized for Gold and Bitcoin",
      "Smart trailing take-profit"
    ]
  },
  {
    id: "vrb-arb-crypto",
    name: "Stability Bot",
    version: "v1.1.4",
    category: "arbitrage",
    winRate: "94%",
    drawdown: "1%",
    pnl: "+42%",
    risk: "Very Low",
    desc: "Built for safety. This bot identifies small price gaps across different markets to provide low-risk growth.",
    status: "Verified",
    minStake: 1000,
    features: [
      "Lowest risk profile in our registry",
      "Consistently small but safe wins",
      "No overnight trading exposure",
      "Instant settlement verification"
    ]
  },
  {
    id: "vrb-grid-04",
    name: "Balanced Grid Bot",
    version: "v3.5.0",
    category: "grid",
    winRate: "59%",
    drawdown: "12%",
    pnl: "+156%",
    risk: "High",
    desc: "A powerful bot for markets that move sideways. It keeps your trades balanced by buying and selling within a set range.",
    status: "Verified",
    minStake: 50,
    features: [
      "Best for flat market conditions",
      "Works 24/7 on synthetic indices",
      "Highly customizable price range",
      "Profit reinvestment mode available"
    ]
  }
];

export default function BotMarketplacePage() {
  const { t, formatNumber } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  const BOT_CATEGORIES = [
    { id: 'all', label: t('common.all') },
    { id: 'scalping', label: 'Fast Response' },
    { id: 'trend', label: 'Market Trends' },
    { id: 'arbitrage', label: 'Low Risk' },
    { id: 'grid', label: 'Balanced' }
  ];

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
      title={t('bots.marketplaceTitle')} 
      subtitle={t('bots.marketplaceSubtitle')}
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-20">
        
        {/* Marketplace Banner */}
        <Card className="bg-white border-[#E4E4E4] p-8 md:p-12 relative overflow-hidden shadow-sm border-b-4 border-b-[#0055FF]">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0055FF]/5 border border-[#0055FF]/20">
              <Zap className="w-3.5 h-3.5 text-[#0055FF]" />
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em]">Automated Trading Tools</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight text-[#0A0A0A]">
              {t('bots.bannerTitle')}
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight">
              {t('bots.bannerDesc')}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0055FF]/5 rounded-full -mr-32 -mt-32"></div>
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
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF] shadow-sm"
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
                        <span className="px-1.5 py-0.5 bg-[#F7F7F5] border border-[#E4E4E4] text-[8px] font-bold uppercase text-[#6B7280]">{t('common.active')} Node</span>
                      </div>
                      <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A] group-hover:text-[#0055FF] transition-colors">{bot.name}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedBot(bot)}
                      className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline flex items-center gap-1.5"
                    >
                      <Info className="w-3 h-3" /> {t('help.readGuide')}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#6B7280] leading-relaxed font-medium uppercase tracking-tight line-clamp-2">
                    {bot.desc}
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#F7F7F5]">
                    <div>
                      <span className="text-[8px] font-bold text-[#6B7280] uppercase block mb-1">{t('bots.successRate')}</span>
                      <span className="text-xs font-mono font-bold text-[#16835B]">{bot.winRate}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-[#6B7280] uppercase block mb-1">{t('bots.typicalRisk')}</span>
                      <span className="text-xs font-mono font-bold text-[#C43D3D]">{bot.drawdown}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-[#6B7280] uppercase block mb-1">{t('bots.growthHistory')}</span>
                      <span className="text-xs font-mono font-bold text-[#0A0A0A]">{bot.pnl}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#F7F7F5] border-t border-[#E4E4E4] flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase">{t('bots.minimumAmount')}</span>
                        <span className="text-[10px] font-mono font-bold">${bot.minStake} USD</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase">Risk level</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          bot.risk === 'Low' || bot.risk === 'Very Low' ? "text-[#16835B]" : 
                          bot.risk === 'Medium' ? "text-[#C9A227]" : "text-[#C43D3D]"
                        )}>{bot.risk}</span>
                     </div>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline">
                    {t('bots.startUsing')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {filteredBots.length === 0 && (
            <div className="py-24 text-center space-y-4 border-2 border-dashed border-[#E4E4E4] bg-white">
              <Layers className="w-12 h-12 text-[#E4E4E4] mx-auto" />
              <div>
                <h3 className="text-sm font-bold uppercase text-[#0A0A0A]">{t('bots.noBotsFound')}</h3>
                <p className="text-[10px] text-[#6B7280] uppercase font-bold mt-1 tracking-widest">{t('bots.adjustSearch')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Policy Notice */}
        <div className="p-6 bg-[#0055FF]/5 border border-[#0055FF]/20 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#0055FF] shrink-0 mt-0.5" />
              <div>
                 <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">{t('bots.policyTitle')}</h4>
                 <p className="text-[10px] text-[#6B7280] leading-relaxed font-bold uppercase mt-1">
                    {t('bots.policyDesc')}
                 </p>
              </div>
           </div>
           <Link href="/help" className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest underline decoration-2 underline-offset-4 whitespace-nowrap">
              {t('bots.reviewPolicy')}
           </Link>
        </div>

      </div>

      {/* Bot Features Modal */}
      {selectedBot && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">{selectedBot.name} Features</h3>
              </div>
              <button onClick={() => setSelectedBot(null)} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                {selectedBot.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#16835B]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#16835B]" />
                    </div>
                    <p className="text-[11px] text-[#6B7280] font-bold uppercase leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-[#F7F7F5]">
                <button 
                  onClick={() => setSelectedBot(null)}
                  className="w-full btn-institutional-primary py-4"
                >
                  {t('common.dismiss')}
                </button>
              </div>
            </div>

            <div className="bg-[#F7F7F5] p-3 text-center border-t border-[#E4E4E4]">
               <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.3em]">
                 Varban Bot Node &bull; Ready to Deploy
               </span>
            </div>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
