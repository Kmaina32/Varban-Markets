'use client';

/**
 * @fileOverview Bot Marketplace Registry.
 * Integrated with AI-assisted configuration modification.
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  Check,
  BarChart3,
  Settings2,
  Loader2
} from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useTranslation } from '@/app/lib/i18n-context';
import type { BotId, BotConfig } from '@/app/lib/bots-engine/types';
import ModifyBotModal from '@/components/bots/ModifyBotModal';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';

interface BotDisplay extends BotConfig {
  category: string;
  winRate: string;
  drawdown: string;
  pnl: string;
  risk: string;
  desc: string;
  features: string[];
}

const STATIC_METADATA: Record<string, any> = {
  "bm-liquidity-sweep": {
    category: "scalping",
    winRate: "74%",
    drawdown: "3.5%",
    pnl: "+142%",
    risk: "Medium",
    desc: "Designed for institutional range sweeps, identifying high-precision reversals after Asian session liquidity grabs.",
    features: [
      "Asian-session range sweep detection",
      "Structure-shift validation protocol",
      "Automatic displacement ATR filtering",
      "Planned invalidation stop-loss"
    ]
  },
  "trend-continuation": {
    category: "trend",
    winRate: "68%",
    drawdown: "6.2%",
    pnl: "+94%",
    risk: "Low",
    desc: "Follows established market momentum using dual EMA filters and volatility-adjusted pullbacks.",
    features: [
      "EMA 50/200 dual trend filter",
      "ATR-adjusted pullback entry logic",
      "Bullish/Bearish candle confirmation",
      "Trailing take-profit targets"
    ]
  },
  "breakout-retest": {
    category: "grid",
    winRate: "62%",
    drawdown: "9.5%",
    pnl: "+168%",
    risk: "High",
    desc: "Identifies high-probability consolidation breakouts and validates entries on confirmed structural retests.",
    features: [
      "Consolidation range lookback logic",
      "Retest tolerance ATR monitoring",
      "High-velocity breakout detection",
      "Risk-reward optimization engine"
    ]
  },
  "mean-reversion": {
    category: "arbitrage",
    winRate: "82%",
    drawdown: "2.1%",
    pnl: "+48%",
    risk: "Very Low",
    desc: "Capitalizes on price extremes using Bollinger bands and RSI divergence, filtered by trend-strength guards.",
    features: [
      "Volatility band entry protocol",
      "RSI extreme signal validation",
      "Trend-strength guardian check",
      "Instant mid-line exit targets"
    ]
  },
  "momentum-scanner": {
    category: "trend",
    winRate: "59%",
    drawdown: "14%",
    pnl: "+210%",
    risk: "High",
    desc: "Multi-market scanner that ranks assets by relative momentum for high-velocity trend following.",
    features: [
      "Lookback momentum ranking engine",
      "Multi-EMA trend alignment check",
      "Volatility-adjusted trailing stops",
      "Global asset scan capability"
    ]
  }
};

const DEFAULT_CONFIGS: BotConfig[] = [
  { id: "bm-liquidity-sweep", name: "BM Liquidity Sweep", enabled: false, mode: 'paper', symbols: ['XAUUSD'], timeframes: ['5m', '15m'], riskPercent: 0.25, minRiskReward: 1.5, maxTradesPerDay: 3, params: { asianBars: 24, displacementAtr: 0.8 }, version: 1, updatedAt: '' },
  { id: "trend-continuation", name: "EMA Momentum", enabled: false, mode: 'paper', symbols: ['EURUSD', 'BTCUSD'], timeframes: ['15m', '1h'], riskPercent: 0.25, minRiskReward: 1.5, maxTradesPerDay: 3, params: { pullbackAtr: 0.35, targetAtr: 2.0 }, version: 1, updatedAt: '' },
  { id: "breakout-retest", name: "Structure Master", enabled: false, mode: 'paper', symbols: ['EURUSD', 'BTCUSD'], timeframes: ['5m', '15m'], riskPercent: 0.25, minRiskReward: 1.5, maxTradesPerDay: 3, params: { rangeLookback: 20, retestAtr: 0.2 }, version: 1, updatedAt: '' },
  { id: "mean-reversion", name: "Mean Reversion", enabled: false, mode: 'paper', symbols: ['EURUSD', 'BTCUSD'], timeframes: ['15m', '1h'], riskPercent: 0.25, minRiskReward: 1.5, maxTradesPerDay: 3, params: { period: 20 }, version: 1, updatedAt: '' },
  { id: "momentum-scanner", name: "Momentum Scanner", enabled: false, mode: 'paper', symbols: ['XAUUSD', 'EURUSD'], timeframes: ['15m', '1h'], riskPercent: 0.25, minRiskReward: 1.5, maxTradesPerDay: 3, params: { momentumLookback: 20, momentumThreshold: 0.004 }, version: 1, updatedAt: '' }
];

export default function BotMarketplacePage() {
  const { t, formatNumber } = useTranslation();
  const { user } = useUser();
  const db = useFirestore();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBotMetadata, setSelectedBotMetadata] = useState<any | null>(null);
  const [editingBot, setEditingBot] = useState<BotConfig | null>(null);

  const configsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, `users/${user.uid}/bot_configs`));
  }, [db, user]);

  const { data: userConfigs, loading: configsLoading } = useCollection<BotConfig>(configsQuery);

  const displayBots = useMemo(() => {
    return DEFAULT_CONFIGS.map(def => {
      const userConfig = userConfigs?.find(c => c.id === def.id);
      const meta = STATIC_METADATA[def.id];
      return {
        ...(userConfig || def),
        ...meta
      } as BotDisplay;
    });
  }, [userConfigs]);

  const BOT_CATEGORIES = [
    { id: 'all', label: t('common.all') },
    { id: 'scalping', label: 'Liquidity/Scalp' },
    { id: 'trend', label: 'Momentum/Trend' },
    { id: 'arbitrage', label: 'Mean Reversion' },
    { id: 'grid', label: 'Structural' }
  ];

  const filteredBots = useMemo(() => {
    return displayBots.filter(bot => {
      const matchesCat = activeCategory === 'all' || bot.category === activeCategory;
      const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            bot.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery, displayBots]);

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
              <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.2em]">Five Strategy Engine</span>
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
            {configsLoading ? (
              <div className="col-span-2 py-32 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Syncing Engine Configurations...</span>
              </div>
            ) : filteredBots.map((bot) => (
              <Card key={bot.id} className="bg-white border-[#E4E4E4] shadow-sm hover:border-[#0055FF] transition-all group overflow-hidden flex flex-col">
                <div className="p-6 md:p-8 space-y-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-widest">Version {bot.version}.0</span>
                        <span className="px-1.5 py-0.5 bg-[#F7F7F5] border border-[#E4E4E4] text-[8px] font-bold uppercase text-[#6B7280]">{bot.enabled ? 'ACTIVE' : 'IDLE'} Node</span>
                      </div>
                      <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A] group-hover:text-[#0055FF] transition-colors">{bot.name}</h3>
                    </div>
                    <button 
                      onClick={() => setEditingBot(bot)}
                      className="p-2 border border-[#E4E4E4] bg-white text-[#6B7280] hover:text-[#0055FF] hover:border-[#0055FF] transition-all shadow-sm flex items-center gap-2"
                      title="Modify Configuration"
                    >
                      <Settings2 className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Modify</span>
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
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase">Risk Cap</span>
                        <span className="text-[10px] font-mono font-bold">{bot.riskPercent}%</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-[#6B7280] uppercase">Status</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          bot.enabled ? "text-[#16835B]" : "text-[#6B7280]"
                        )}>{bot.enabled ? 'Executing' : 'Standby'}</span>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBotMetadata(bot)}
                    className="flex items-center gap-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline"
                  >
                    Technical Specs <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
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

      {/* Tech Specs Modal */}
      {selectedBotMetadata && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-[#F7F7F5] flex justify-between items-center bg-[#F7F7F5]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">{selectedBotMetadata.name} Strategy</h3>
              </div>
              <button onClick={() => setSelectedBotMetadata(null)} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                {selectedBotMetadata.features.map((feature: string, idx: number) => (
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
                  onClick={() => setSelectedBotMetadata(null)}
                  className="w-full btn-institutional-primary py-4"
                >
                  {t('common.dismiss')}
                </button>
              </div>
            </div>

            <div className="bg-[#F7F7F5] p-3 text-center border-t border-[#E4E4E4]">
               <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.3em]">
                 Strategy Engine Node &bull; {selectedBotMetadata.id.toUpperCase()}
               </span>
            </div>
          </Card>
        </div>
      )}

      {/* Modify Bot Modal */}
      {editingBot && (
        <ModifyBotModal 
          bot={editingBot} 
          isOpen={!!editingBot} 
          onClose={() => setEditingBot(null)}
          onUpdate={() => {}} // useCollection handles the live update
        />
      )}
    </AuthedLayout>
  );
}
