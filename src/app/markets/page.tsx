
"use client";

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
import AuthedLayout from "@/components/layout/AuthedLayout";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { doc, setDoc, deleteDoc, collection } from "firebase/firestore";

/**
 * @fileOverview Institutional Market Registry.
 * Allows traders to browse instruments, monitor live quotes, and manage their watchlist.
 */

export default function MarketsPage() {
  const { user } = useUser();
  const db = useFirestore();
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
            } catch (e) {
              // Individual instrument errors don't halt the registry feed
            }
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

  const categories = ["All", "Forex", "Equities", "Digital Assets", "Commodities"];

  const filteredInstruments = AVAILABLE_INSTRUMENTS.filter((inst) => {
    const matchesCategory = selectedCategory === "All" || inst.category === selectedCategory;
    const matchesSearch = inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inst.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AuthedLayout 
      title="Market Registry" 
      subtitle="INSTRUMENT REGISTRY & LIVE FEEDS"
    >
      <div className="max-w-7xl mx-auto space-y-6">
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
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute inset-y-0 left-3 flex items-center pointer-events-none w-3.5 h-3.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Filter instruments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#F7F7F5] border border-[#E4E4E4] rounded-none focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>
        </Card>

        <Card className="border-[#E4E4E4] overflow-hidden rounded-none shadow-sm">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="w-12 text-center">Fav</TableHead>
                <TableHead>Instrument</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Live Price</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Execution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filteredInstruments.map((inst) => {
                const live = marketPrices[inst.symbol];
                const price = live ? live.price : inst.price;
                const percent = live ? live.percent : inst.changePercent;
                const status = live ? live.status : inst.status;
                const isPositive = percent >= 0;
                const starred = isInWatchlist(inst.symbol);

                return (
                  <TableRow key={inst.symbol} className="hover:bg-[#F7F7F5] transition-colors">
                    <TableCell className="text-center">
                      <button 
                        onClick={() => toggleWatchlist(inst)}
                        className={`transition-all transform active:scale-90 ${starred ? 'text-[#C9A227]' : 'text-[#E4E4E4] hover:text-[#C9A227]'}`}
                      >
                        <Star className={`w-4 h-4 ${starred ? 'fill-[#C9A227]' : ''}`} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-[#0A0A0A]">{inst.symbol}</span>
                        <span className="text-[10px] text-[#6B7280] uppercase tracking-tighter">{inst.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#6B7280] text-[10px] uppercase tracking-wider">
                      {inst.category}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-[#0A0A0A]">
                      {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold ${isPositive ? "text-[#16835B]" : "text-[#C43D3D]"}`}>
                      {isPositive ? "+" : ""}{percent}%
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 border border-[#16835B] text-[#16835B]">
                        {status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button asChild size="sm" variant="brand" className="h-7 px-4">
                        <Link href={`/terminal?symbol=${inst.symbol}`}>
                          <span>Terminal</span>
                          <Sliders className="ml-1.5 w-3 h-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AuthedLayout>
  );
}
