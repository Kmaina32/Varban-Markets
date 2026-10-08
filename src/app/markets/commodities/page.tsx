
'use client';

/**
 * @fileOverview Commodities Market Landing Page.
 * Matched precisely to the provided high-fidelity reference image.
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Star, 
  Sliders, 
  Droplets, 
  TrendingUp, 
  ShieldCheck,
  Coins
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
import placeholderImages from "@/app/lib/placeholder-images.json";
import { cn } from "@/app/lib/utils";

export default function CommoditiesMarketPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();
  
  const [marketPrices, setMarketPrices] = useState<Record<string, { price: number; percent: number; status: string }>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    <AuthedLayout title="Commodities" subtitle="Global Metals & Energy Registry">
      <div className="space-y-0 pb-20">
        
        {/* HIGH-FIDELITY REFERENCE HERO */}
        <section className="relative w-full h-[450px] md:h-[550px] bg-[#0A1921] overflow-hidden flex items-center mb-12">
          {/* Main Hero Image Context */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={placeholderImages.commodities_hero.url}
              alt="Commodities Background"
              fill
              className="object-cover opacity-60"
              priority
              data-ai-hint={placeholderImages.commodities_hero.hint}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A1921] via-[#0A1921]/60 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 items-center w-full gap-12">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-normal text-white tracking-tight leading-[1.1] font-display">
                Commodity trading <br /> platform
              </h1>
              <p className="text-sm md:text-lg text-white/80 max-w-lg leading-relaxed">
                Trade commodities with tight spreads on gold and oil while accessing global markets to diversify your portfolio.
              </p>
              <div className="flex flex-row items-center gap-4 pt-4">
                <Link 
                  href="/register" 
                  className="bg-[#FFDE00] hover:bg-[#E5C700] text-[#0A0A0A] px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl"
                >
                  Register
                </Link>
                <Link 
                  href="/accounts/demo" 
                  className="bg-[#1E2E36]/80 hover:bg-[#1E2E36] text-white border border-white/10 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all backdrop-blur-sm"
                >
                  Try free demo
                </Link>
              </div>
            </div>

            {/* Floating Asset Tags Visualizer */}
            <div className="relative hidden lg:block h-[400px]">
              {/* Asset Tag: XAU */}
              <div className="absolute top-10 right-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 flex items-center gap-3 shadow-2xl animate-in zoom-in duration-1000 delay-300">
                <div className="w-6 h-6 bg-[#C9A227] rounded-sm flex items-center justify-center">
                  <div className="w-3 h-1.5 bg-white/30 rounded-full"></div>
                </div>
                <span className="text-[11px] font-bold text-white uppercase tracking-[0.3em]">XAU</span>
              </div>

              {/* Asset Tag: Oil */}
              <div className="absolute top-[40%] left-[20%] bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 flex items-center justify-center shadow-2xl animate-in zoom-in duration-1000 delay-500">
                 <Droplets className="w-4 h-4 text-[#0055FF] fill-[#0055FF]/20" />
              </div>

              {/* 3D Bars Projection Placeholder */}
              <div className="absolute right-0 bottom-0 w-[450px] h-[300px] opacity-90 transition-transform duration-1000 hover:scale-105 pointer-events-none">
                 <Image 
                  src="https://picsum.photos/seed/goldrender/800/600" 
                  alt="Gold Bars Projection" 
                  width={800}
                  height={600}
                  className="w-full h-full object-contain"
                  data-ai-hint="gold bars"
                 />
              </div>
            </div>
          </div>
        </section>

        {/* REGISTRY FILTERS */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-[#E4E4E4] bg-white shadow-sm rounded-none">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Live Commodity Domain</span>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute inset-y-0 left-3 flex items-center pointer-events-none w-3.5 h-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search metal or energy assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#F7F7F5] border border-[#E4E4E4] focus:outline-none focus:border-[#0055FF] rounded-none"
              />
            </div>
          </Card>
        </div>

        {/* DATA REGISTRY TABLE */}
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <Card className="border-[#E4E4E4] overflow-hidden shadow-sm rounded-none">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F7F7F5]">
                  <TableRow>
                    <TableHead className="w-12 text-center">Fav</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Instrument</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Market Type</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Live Price</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">24h Change</TableHead>
                    <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">Node Status</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {filteredInstruments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-12 text-center text-[#6B7280] uppercase font-bold tracking-widest">
                        No commodity matches detected in registry.
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
                              <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-tighter">{inst.name}</span>
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
                          <Button asChild size="sm" variant="brand" className="h-8 px-6 rounded-none">
                            <Link href={user ? `/terminal?symbol=${inst.symbol}` : '/login'}>
                              <span className="text-[9px] font-bold uppercase tracking-widest">Execute</span>
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

        {/* PROMOTIONAL VALUE PROP SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-[#E4E4E4]">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-normal text-[#0A0A0A] tracking-tight font-display">
              Open an account and start trading <br className="hidden md:block" /> commodities
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12 order-2 lg:order-1">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#0A0A0A] tracking-tight uppercase">Expand your portfolio</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed font-medium">
                  by capitalizing on commodity trading opportunities internationally and beyond.
                </p>
              </div>
              <div className="space-y-3 border-t border-[#F7F7F5] pt-12">
                <h3 className="text-xl font-bold text-[#0A0A0A] tracking-tight uppercase">Enjoy trading gold and oil with tight spreads</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed font-medium">
                  and keep more of what you make.
                </p>
              </div>
              <div className="space-y-3 border-t border-[#F7F7F5] pt-12">
                <h3 className="text-xl font-bold text-[#0A0A0A] tracking-tight uppercase">Leverage unique trading conditions</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed font-medium">
                  and optimize your trading strategy with favorable market conditions.
                </p>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden aspect-[4/3] lg:aspect-square group shadow-2xl border border-[#E4E4E4] order-1 lg:order-2 bg-[#F7F7F5]">
              <Image 
                src={placeholderImages.trading_lifestyle.url} 
                alt="Trading on Mobile" 
                fill 
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                data-ai-hint={placeholderImages.trading_lifestyle.hint}
              />
              
              {/* Floating Asset Tags - Precise Placement as per Ref */}
              <div className="absolute top-[25%] left-[15%] bg-white/90 backdrop-blur-md border border-[#E4E4E4] rounded-full px-4 py-2 flex items-center gap-3 shadow-xl animate-in zoom-in duration-700 delay-500">
                <MarketIcon symbol="XAU/USD" size="sm" />
                <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest">XAUUSD</span>
              </div>

              <div className="absolute top-[55%] left-[35%] bg-white/90 backdrop-blur-md border border-[#E4E4E4] rounded-full px-4 py-2 flex items-center gap-3 shadow-xl animate-in zoom-in duration-700 delay-700">
                <MarketIcon symbol="WTI/USD" size="sm" />
                <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest">UKOIL</span>
              </div>

              <div className="absolute bottom-[20%] right-[15%] bg-white/90 backdrop-blur-md border border-[#E4E4E4] rounded-full px-4 py-2 flex items-center gap-3 shadow-xl animate-in zoom-in duration-700 delay-1000">
                <MarketIcon symbol="HG1" size="sm" />
                <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest">XNGUSD</span>
              </div>
            </div>
          </div>
        </section>

        {/* PILLAR INFO SECTION */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-10 bg-white border border-[#E4E4E4] space-y-4 shadow-sm border-t-4 border-t-[#C9A227]">
              <ShieldCheck className="w-8 h-8 text-[#0055FF]" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Audited Pricing</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Deterministic price matching derived from multi-node liquidity providers. No asymmetric slippage or dealer intervention.
              </p>
           </div>
           <div className="p-10 bg-white border border-[#E4E4E4] space-y-4 shadow-sm border-t-4 border-t-[#0055FF]">
              <TrendingUp className="w-8 h-8 text-[#16835B]" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Risk Management</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Negative balance protection and defined-risk contract structures. Your exposure is strictly limited to your initial stake.
              </p>
           </div>
           <div className="p-10 bg-white border border-[#E4E4E4] space-y-4 shadow-sm border-t-4 border-t-[#161616]">
              <Coins className="w-8 h-8 text-[#0055FF]" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Instant Clearing</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Capital moves at the speed of electronic markets. 100% automated settlement with results credited instantly to your ledger.
              </p>
           </div>
        </section>

      </div>
    </AuthedLayout>
  );
}
