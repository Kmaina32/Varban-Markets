
"use client";

import { useMemo, useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Star, TrendingUp, TrendingDown, Sliders, X } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { fetchLivePrice } from "@/app/lib/market-service";
import { useTranslation } from "@/app/lib/i18n-context";

/**
 * @fileOverview Institutional Watchlist Workspace.
 * Provides real-time monitoring of priority market instruments.
 */

export default function WatchlistPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();
  
  // Memoize the collection reference to prevent re-render loops
  const watchlistQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, `users/${user.uid}/watchlist`);
  }, [db, user]);

  const { data: watchlist, loading } = useCollection<any>(watchlistQuery);
  const [prices, setPrices] = useState<Record<string, any>>({});

  // Background polling for watchlist prices
  useEffect(() => {
    if (!watchlist || watchlist.length === 0) return;
    
    let active = true;
    const updatePrices = async () => {
      const newPrices: Record<string, any> = {};
      try {
        await Promise.all(watchlist.map(async (item: any) => {
          try {
            const data = await fetchLivePrice(item.symbol);
            newPrices[item.symbol] = data;
          } catch (e) {
            // Silently handle individual instrument data gaps
          }
        }));
        if (active) {
          setPrices(newPrices);
        }
      } catch (err) {
        // Handle global pricing service interruptions
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [watchlist]);

  const removeSymbol = (symbol: string) => {
    if (!db || !user) return;
    // Optimistic background deletion
    deleteDoc(doc(db, `users/${user.uid}/watchlist`, symbol)).catch(() => {});
  };

  return (
    <AuthedLayout 
      title={t('nav.watchlist')} 
      subtitle={t('pages.watchlistSubtitle')}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-6 h-6 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">{t('common.loading')}</p>
          </div>
        ) : !watchlist || watchlist.length === 0 ? (
          <Card className="bg-white border-[#E4E4E4] p-12 flex flex-col items-center justify-center text-[#6B7280] col-span-full shadow-sm">
            <Star className="w-10 h-10 mb-4 text-[#E4E4E4]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] mb-2">{t('dashboard.emptyWatchlist')}</h3>
            <p className="text-[10px] uppercase tracking-wider mb-6 text-center max-w-xs">
              Monitor priority instruments by adding them from the market registry.
            </p>
            <Link href="/markets" className="btn-institutional-primary">
              {t('dashboard.manageWatchlist')}
            </Link>
          </Card>
        ) : (
          watchlist.map((item: any) => {
            const live = prices[item.symbol];
            const isPositive = live?.changePercent >= 0;
            
            return (
              <Card key={item.symbol} className="bg-white border-[#E4E4E4] p-5 shadow-sm group hover:border-[#C9A227] transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-[#0A0A0A] text-white px-1.5 py-0.5 uppercase">
                        {item.symbol}
                      </span>
                      <span className="text-[8px] font-bold text-[#16835B] uppercase tracking-widest">Live</span>
                    </div>
                    <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider truncate max-w-[140px]">
                      {item.name || 'Derivative Asset'}
                    </h4>
                  </div>
                  <button 
                    onClick={() => removeSymbol(item.symbol)}
                    className="text-[#E4E4E4] hover:text-[#C43D3D] transition-colors p-1"
                    title="Remove from watchlist"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <div className="text-xl font-mono font-bold text-[#0A0A0A]">
                      {live ? formatNumber(live.price, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}
                    </div>
                    {live && (
                      <div className={`flex items-center space-x-1 text-[10px] font-mono font-bold ${isPositive ? 'text-[#16835B]' : 'text-[#C43D3D]'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isPositive ? "+" : ""}{live.changePercent}%</span>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    href={`/terminal?symbol=${item.symbol}`} 
                    className="w-10 h-10 flex items-center justify-center bg-[#F7F7F5] border border-[#E4E4E4] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all shadow-sm"
                  >
                    <Sliders className="w-4 h-4" />
                  </Link>
                </div>
                
                {/* Visual Background Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#C9A227]/5 -z-0 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Card>
            );
          })
        )}
      </div>
    </AuthedLayout>
  );
}
