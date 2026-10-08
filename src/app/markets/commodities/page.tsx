
'use client';

/**
 * @fileOverview Specialized Commodities Market Page.
 * Features a high-fidelity hero section and filtered instrument registry.
 * Design matched to user-provided institutional reference.
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Star, 
  Sliders, 
  ArrowRight, 
  TrendingUp, 
  Droplets, 
  Coins,
  ShieldCheck
} from "lucide-react";
import { AVAILABLE_INSTRUMENTS } from "@/app/lib/instruments";
import { fetchLivePrice } from "@/app/lib/market-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { doc, setDoc, deleteDoc, collection } from "firebase/firestore";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { useTranslation } from "@/app/lib/i18n-context";
import { MarketIcon } from "@/components/MarketIcon";
import { cn } from "@/app/lib/utils";

export default function CommoditiesMarketPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();
  
  const [marketPrices, setMarketPrices] = useState<Record<string, { price: number; percent: number; status: string }>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtering only for Commodities
  const commodityInstruments = useMemo(() => {
    return AVAILABLE_INSTRUMENTS.filter(inst => inst.category === 'Commodities');
  }, []);

  const filteredInstruments = useMemo(() => {
    if (!searchQuery) return commodityInstruments;
    return commodityInstruments.filter(inst => 
      inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inst.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [commodityInstruments, searchQuery]);

  // Watchlist synchronization
  const watchlistQuery = useMemo(() => {
    if (!db || !user) return null;
    return collection(db, `users/${user.uid}/watchlist`);
  }, [db, user]);
  
  const { data: watchlist } = useCollection<any>(watchlistQuery);

  const isInWatchlist = (symbol: string) => {
    return watchlist?.some(item => item.symbol === symbol);
  };

  const toggleWatchlist = (inst: any) => {
    if (!user || !db) return;
    const docRef = doc(db, `users/${user.uid}/watchlist`, inst.symbol);
    if (isInWatchlist(inst.symbol)) {
      deleteDoc(docRef).catch(() => {});
    } else {
      setDoc(docRef, { 
        symbol: inst.symbol, 
        name: inst.name,
        category: inst.category,
        timestamp: new Date().toISOString() 
      }).catch(() => {});
    }
  };

  useEffect(() => {
    let active = true;
    const updatePrices = async () => {
      try {
        const updates: Record<string, { price: number; percent: number; status: string }> = {};
        await Promise.all(
          commodityInstruments.map(async (inst) => {
            try {
              const data = await fetchLivePrice(inst.symbol);
              updates[inst.symbol] = { price: data.price, percent: data.changePercent, status: data.status };
            } catch (e) {}
          })
        );
        if (!active) return;
        setMarketPrices(updates);
      } catch (err) {}
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [commodityInstruments]);

  return (
    <AuthedLayout title="Commodities" subtitle="Global Metals & Energy Markets">
      <div className="space-y-12 pb-20">
        
        {/* HIGH-FIDELITY HERO SECTION (Reference Image Match) */}
        <section className="relative w-full h-[400px] md:h-[500px] bg-[#0A1929] overflow-hidden flex items-center">
          {/* Background Graphic Simulation */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
            <div className="relative w-full h-full">
              <img 
                src="https://picsum.photos/seed/goldbars/1200/800" 
                alt="Commodities Background" 
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A1929] via-transparent to-transparent"></div>
              
              {/* Floating ID Tags matching reference */}
              <div className="absolute top-[30%] right-[40%] bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 animate-bounce">
                <div className="w-5 h-5 bg-[#C9A227] rounded-full flex items-center justify-center text-[8px] font-bold text-white">XAU</div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Gold Spot</span>
              </div>
              <div className="absolute top-[50%] right-[60%] bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 flex items-center gap-2">
                 <Droplets className="w-3.5 h-3.5 text-[#0055FF]" />
                 <span className="text-[9px] font-bold text-white uppercase tracking-widest">WTI Oil</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-3xl px-6 md:px-12 space-y-6">
            <h1 className="text-4xl md:text-6xl font-normal text-white tracking-tight leading-tight">
              Commodity trading <br /> platform
            </h1>
            <p className="text-sm md:text-lg text-white/70 max-w-xl leading-relaxed">
              Trade commodities with tight spreads on gold and oil while accessing global markets to diversify your portfolio.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link 
                href="/register" 
                className="bg-[#FFDE00] hover:bg-[#E5C700] text-[#0A0A0A] px-10 py-4 text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
              >
                Register
              </Link>
              <Link 
                href="/accounts/demo" 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 text-xs font-bold uppercase tracking-widest transition-all backdrop-blur-sm"
              >
                Try free demo
              </Link>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTER BAR */}
        <div className="max-w-7xl mx-auto px-4">
          <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-[#E4E4E4] bg-white shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0055FF]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Active Commodity Registry</span>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute inset-y-0 left-3 flex items-center pointer-events-none w-3.5 h-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search metals & energy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#F7F7F5] border border-[#E4E4E4] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>
          </Card>
        </div>

        {/* REGISTRY TABLE */}
        <div className="max-w-7xl mx-auto px-4">
          <Card className="border-[#E4E4E4] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F7F7F5]">
                  <TableRow>
                    <TableHead className="w-12 text-center">Fav</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Instrument</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Market Type</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Live Price</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">24h Change</TableHead>
                    <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {filteredInstruments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-12 text-center text-[#6B7280] uppercase font-bold tracking-widest">
                        No commodity matches found.
                      </TableCell>
                    </TableRow>
                  ) : filteredInstruments.map((inst) => {
                    const live = marketPrices[inst.symbol];
                    const price = live?.price;
                    const percent = live?.percent;
                    const status = live ? live.status : inst.status;
                    const isPositive = percent !== undefined ? percent >= 0 : true;
                    const starred = isInWatchlist(inst.symbol);

                    return (
                      <TableRow key={inst.symbol} className="hover:bg-[#F7F7F5] transition-colors group">
                        <TableCell className="text-center">
                          <button 
                            onClick={() => toggleWatchlist(inst)}
                            disabled={!user}
                            className={cn(
                              "transition-all transform active:scale-90",
                              !user ? 'opacity-20' : starred ? 'text-[#0055FF]' : 'text-[#E4E4E4] hover:text-[#0055FF]'
                            )}
                          >
                            <Star className={cn("w-4 h-4", starred && "fill-[#0055FF]")} />
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-4">
                            <MarketIcon symbol={inst.symbol} size="md" />
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-xs text-[#0A0A0A]">{inst.symbol}</span>
                              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-tight">{inst.name}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#6B7280] text-[9px] font-bold uppercase tracking-widest">
                          {inst.marketType}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm text-[#0A0A0A]">
                          {price !== undefined ? formatNumber(price, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-mono font-bold text-xs",
                          isPositive ? "text-[#16835B]" : "text-[#C43D3D]"
                        )}>
                          {percent !== undefined ? (isPositive ? "+" : "") + formatNumber(percent, { minimumFractionDigits: 2 }) + "%" : "---"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "text-[8px] font-bold uppercase px-2 py-0.5 border",
                            status === 'Open' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#6B7280] text-[#6B7280] bg-[#F7F7F5]"
                          )}>
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="brand" className="h-8 px-6">
                            <Link href={user ? `/terminal?symbol=${inst.symbol}` : '/login'}>
                              <span className="text-[9px] font-bold uppercase tracking-widest">Trade</span>
                              <Sliders className="ml-2 w-3 h-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* BOTTOM INTEGRITY SECTION */}
        <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-6 bg-white border border-[#E4E4E4] space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#0055FF]" />
              <h4 className="text-xs font-bold uppercase text-[#0A0A0A]">Deterministic Pricing</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Our commodity feeds are derived from multi-source global exchange data to ensure total price integrity and zero slippage.
              </p>
           </div>
           <div className="p-6 bg-white border border-[#E4E4E4] space-y-3">
              <TrendingUp className="w-6 h-6 text-[#16835B]" />
              <h4 className="text-xs font-bold uppercase text-[#0A0A0A]">Leveraged Exposure</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Maximize your market presence with professional leverage across gold, silver, and energy derivatives.
              </p>
           </div>
           <div className="p-6 bg-white border border-[#E4E4E4] space-y-3">
              <Coins className="w-6 h-6 text-[#0055FF]" />
              <h4 className="text-xs font-bold uppercase text-[#0A0A0A]">Instant Settlement</h4>
              <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Execution and settlement occur in real-time, with results credited instantly to your institutional ledger.
              </p>
           </div>
        </section>

      </div>
    </AuthedLayout>
  );
}
