"use client";

/**
 * @fileOverview Institutional Watchlist Registry.
 * Migrated to Supabase for persistence.
 */

import { useMemo, useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Star, TrendingUp, TrendingDown, Sliders, X, Plus, Search, Check } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { createClient } from "@/app/lib/supabase/client";
import { fetchLivePrice } from "@/app/lib/market-service";
import { useTranslation } from "@/app/lib/i18n-context";
import { AVAILABLE_INSTRUMENTS } from "@/app/lib/instruments";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";

export default function WatchlistPage() {
  const { user } = useUser();
  const supabase = createClient();
  const { t, formatNumber } = useTranslation();
  
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, any>>({});
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const trackedSymbols = useMemo(() => {
    return new Set(watchlist.map((item: any) => item.symbol));
  }, [watchlist]);

  const loadWatchlist = async () => {
    if (!user?.uid) return;
    const { data } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.uid);
    if (data) setWatchlist(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWatchlist();
  }, [user?.uid]);

  useEffect(() => {
    if (watchlist.length === 0) return;
    
    let active = true;
    const updatePrices = async () => {
      const newPrices: Record<string, any> = {};
      try {
        await Promise.all(watchlist.map(async (item: any) => {
          try {
            const data = await fetchLivePrice(item.symbol);
            if (data) newPrices[item.symbol] = data;
          } catch (e) {}
        }));
        if (active) setPrices(newPrices);
      } catch (err) {}
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [watchlist]);

  const toggleSymbol = async (inst: any) => {
    if (!user?.uid) return;
    
    if (trackedSymbols.has(inst.symbol)) {
      await supabase.from('watchlist').delete().eq('user_id', user.uid).eq('symbol', inst.symbol);
    } else {
      await supabase.from('watchlist').insert({
        user_id: user.uid,
        symbol: inst.symbol,
        name: inst.name,
        category: inst.category
      });
    }
    loadWatchlist();
  };

  const filteredInstruments = useMemo(() => {
    return AVAILABLE_INSTRUMENTS.filter((inst) => {
      const matchesCategory = selectedCategory === "All" || inst.category === selectedCategory;
      const matchesSearch = inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            inst.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const tutorialSteps: TutorialStep[] = [
    { selector: "#tour-watchlist-grid", title: "Your Workspace", description: "Manage and monitor your prioritized market instruments here." },
    { selector: "#tour-add-instrument", title: "Expand Your View", description: "Search the global registry to add new indices or pairs to your tracking list." }
  ];

  return (
    <AuthedLayout title={t('nav.watchlist')} subtitle={t('pages.watchlistSubtitle')}>
      <PageTutorial steps={tutorialSteps} storageKey="varban_watchlist_tutorial" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E4E4]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">Tracked Derivative Instruments</h2>
            <p className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-0.5">{watchlist.length} active instruments</p>
          </div>
          <button id="tour-add-instrument" onClick={() => setIsAddModalOpen(true)} className="btn-institutional-primary py-2.5 px-4 flex items-center justify-center space-x-2 text-[10px] shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Instrument</span>
          </button>
        </div>

        <div id="tour-watchlist-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{t('common.loading')}</p>
            </div>
          ) : watchlist.length === 0 ? (
            <Card className="bg-white border-[#E4E4E4] p-12 flex flex-col items-center justify-center text-[#6B7280] col-span-full shadow-sm">
              <Star className="w-10 h-10 mb-4 text-[#E4E4E4]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] mb-2">{t('dashboard.emptyWatchlist')}</h3>
              <button onClick={() => setIsAddModalOpen(true)} className="btn-institutional-primary">Add Your First Instrument</button>
            </Card>
          ) : (
            watchlist.map((item: any) => {
              const live = prices[item.symbol];
              const isPositive = live?.changePercent >= 0;
              return (
                <Card key={item.symbol} className="bg-white border-[#E4E4E4] p-5 shadow-sm group hover:border-[#0055FF] transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-[#0A0A0A] text-white px-1.5 py-0.5 uppercase mb-1 inline-block">{item.symbol}</span>
                      <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider truncate max-w-[140px]">{item.name}</h4>
                    </div>
                    <button onClick={() => toggleSymbol(item)} className="text-[#E4E4E4] hover:text-[#C43D3D] transition-colors p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <div className="text-xl font-mono font-bold text-[#0A0A0A]">{live ? formatNumber(live.price, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}</div>
                      {live && <div className={cn("flex items-center space-x-1 text-[10px] font-mono font-bold", isPositive ? 'text-[#16835B]' : 'text-[#C43D3D]')}><Check className="w-3 h-3" /><span>{isPositive ? "+" : ""}{live.changePercent}%</span></div>}
                    </div>
                    <Link href={`/terminal?symbol=${item.symbol}`} className="w-10 h-10 flex items-center justify-center bg-[#F7F7F5] border border-[#E4E4E4] text-[#0A0A0A] hover:bg-[#0055FF] hover:text-white transition-all shadow-sm"><Sliders className="w-4 h-4" /></Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0A]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E4E4E4] w-full max-w-xl shadow-2xl relative flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5] shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Add Instrument</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-[#E4E4E4] transition-colors"><X className="w-4 h-4 text-[#6B7280]" /></button>
            </div>
            <div className="p-4 border-b border-[#E4E4E4] space-y-3 bg-white shrink-0">
              <div className="relative"><Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full text-xs pl-9 pr-3 py-2.5 border border-[#E4E4E4] bg-[#F7F7F5] focus:outline-none" /></div>
              <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">{["All", "Crypto", "Forex", "Commodities", "Equities"].map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-3 py-1 text-[9px] font-bold uppercase tracking-wider border transition-colors shrink-0", selectedCategory === cat ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "bg-white text-[#6B7280] border-[#E4E4E4]")}>{cat}</button>))}</div>
            </div>
            <div className="p-4 overflow-y-auto flex-grow divide-y divide-[#E4E4E4]">
              {filteredInstruments.map((inst) => {
                const isTracked = trackedSymbols.has(inst.symbol);
                return (
                  <div key={inst.symbol} className="py-3 flex items-center justify-between hover:bg-[#F7F7F5] px-2 transition-colors">
                    <div><span className="text-xs font-mono font-bold text-[#0A0A0A]">{inst.symbol}</span><p className="text-[10px] text-[#6B7280] uppercase mt-0.5">{inst.name}</p></div>
                    <button onClick={() => toggleSymbol(inst)} className={cn("px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 border transition-all", isTracked ? "bg-[#16835B]/10 border-[#16835B] text-[#16835B]" : "bg-white border-[#E4E4E4] text-[#0A0A0A] hover:bg-[#0055FF] hover:text-white")}>{isTracked ? <><Check className="w-3 h-3" /><span>Added</span></> : <><Plus className="w-3 h-3" /><span>Add</span></>}</button>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-[#E4E4E4] bg-[#F7F7F5] text-right shrink-0"><button onClick={() => setIsAddModalOpen(false)} className="btn-institutional-primary py-2 px-5 text-[10px]">Done</button></div>
          </div>
        </div>
      )}
    </AuthedLayout>
  );
}
