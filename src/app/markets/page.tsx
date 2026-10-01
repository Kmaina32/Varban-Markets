"use client";

/**
 * @fileOverview Institutional Market Registry.
 * Shared page that renders within the authenticated workspace context for auth persistence.
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Sliders, Star } from "lucide-react";
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

export default function MarketsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t, formatNumber } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [marketPrices, setMarketPrices] = useState<Record<string, { price: number; percent: number; status: string }>>({});
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Watchlist synchronization logic
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
          AVAILABLE_INSTRUMENTS.map(async (inst) => {
            try {
              const data = await fetchLivePrice(inst.symbol);
              updates[inst.symbol] = { price: data.price, percent: data.changePercent, status: data.status };
            } catch (e) {}
          })
        );
        if (!active) return;
        setMarketPrices(updates);
        setErrorStatus(null);
      } catch (err) {
        if (!active) return;
        setErrorStatus("Unable to retrieve the latest market data.");
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const categories = ["All", "Forex", "Equities", "Crypto", "Commodities"];

  const filteredInstruments = AVAILABLE_INSTRUMENTS.filter((inst) => {
    const matchesCategory = selectedCategory === "All" || inst.category === selectedCategory;
    const matchesSearch = inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inst.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AuthedLayout title={t('nav.markets')} subtitle="Market Registry & List">
      <div className="space-y-8">
        {errorStatus && (
          <div className="p-3 bg-[#FCF1F1] border border-[#C43D3D] text-[10px] uppercase font-bold text-[#C43D3D]">
            {errorStatus}
          </div>
        )}

        <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-[#E4E4E4] rounded-none bg-white shadow-sm">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="text-[9px] px-4"
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute inset-y-0 left-3 flex items-center pointer-events-none w-3.5 h-3.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Filter registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#F7F7F5] border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>
        </Card>

        <Card className="border-[#E4E4E4] overflow-hidden rounded-none shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F7F7F5]">
                <TableRow>
                  <TableHead className="w-12 text-center">Fav</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Instrument</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Sector</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Live Price</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">24h Change</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">Node Status</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">Execution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {filteredInstruments.map((inst) => {
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
                          className={`transition-all transform active:scale-90 ${!user ? 'opacity-20' : starred ? 'text-[#0055FF]' : 'text-[#E4E4E4] hover:text-[#0055FF]'}`}
                        >
                          <Star className={`w-4 h-4 ${starred ? 'fill-[#0055FF]' : ''}`} />
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <MarketIcon symbol={inst.symbol} size="md" />
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-xs text-[#0A0A0A]">{inst.symbol}</span>
                            <span className="text-[9px] text-[#6B7280] uppercase tracking-tighter font-bold">{inst.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#6B7280] text-[9px] font-bold uppercase tracking-[0.1em]">
                        {inst.category}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm text-[#0A0A0A]">
                        {price !== undefined ? formatNumber(price, { minimumFractionDigits: 2, maximumFractionDigits: 5 }) : "---"}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold text-xs ${isPositive ? "text-[#16835B]" : "text-[#C43D3D]"}`}>
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
                      <TableCell className="text-center">
                        <Button asChild size="sm" variant="brand" className="h-8 px-5 rounded-none">
                          <Link href={user ? `/terminal?symbol=${inst.symbol}` : '/login'}>
                            <span className="text-[9px] font-bold uppercase tracking-widest">Trade Terminal</span>
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
    </AuthedLayout>
  );
}
