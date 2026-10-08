
'use client';

/**
 * @fileOverview Forex Market Landing Page.
 * Institutional design with live spreads table and technical specifications.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Zap, 
  Clock, 
  ShieldCheck, 
  ChevronDown, 
  Info,
  MousePointer2,
  Lock,
  BarChart2,
  Play
} from 'lucide-react';
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/app/lib/utils";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { MarketIcon } from "@/components/MarketIcon";

const FOREX_PAIRS = [
  { symbol: "EURUSD", name: "Euro vs US Dollar", spread: "0.8", commission: "$0", leverage: "Customizable", long: "-0.56", short: "0", stop: "0" },
  { symbol: "GBPUSD", name: "Great Britain Pound vs US Dollar", spread: "1.0", commission: "$0", leverage: "Customizable", long: "-0.22", short: "-0.05", stop: "0" },
  { symbol: "USDJPY", name: "US Dollar vs Japanese Yen", spread: "1.0", commission: "$0", leverage: "Customizable", long: "0", short: "-1.85", stop: "0" },
  { symbol: "AUDUSD", name: "Australian Dollar vs US Dollar", spread: "0.9", commission: "$0", leverage: "Customizable", long: "0", short: "-0.2", stop: "0" },
  { symbol: "USDCAD", name: "US Dollar vs Canadian Dollar", spread: "1.6", commission: "$0", leverage: "Customizable", long: "0", short: "-0.89", stop: "0" },
  { symbol: "USDCHF", name: "US Dollar vs Swiss Franc", spread: "1.3", commission: "$0", leverage: "Customizable", long: "0", short: "-1.05", stop: "0" },
  { symbol: "NZDUSD", name: "New Zealand Dollar vs US Dollar", spread: "1.4", commission: "$0", leverage: "Customizable", long: "-0.39", short: "0", stop: "0" },
];

export default function ForexMarketPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <AuthedLayout title="Forex Markets" subtitle="Global Currency Pair Registry">
      <div className="space-y-0 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative w-full h-[500px] bg-[#0A0A0A] overflow-hidden flex items-center mb-12">
          <div className="absolute inset-0 z-0">
            <Image 
              src={placeholderImages.forex_hero.url}
              alt="Forex Trading"
              fill
              className="object-cover opacity-50"
              priority
              data-ai-hint={placeholderImages.forex_hero.hint}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-normal text-white tracking-tight leading-[1.1] font-display">
                Online forex trading <br /> for international markets
              </h1>
              <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-medium">
                Trade forex with 50% lower spreads than the industry average. Experience why professional traders choose Varban Markets for high-volume execution.
              </p>
              <div className="flex flex-row items-center gap-4 pt-4">
                <Link 
                  href="/register" 
                  className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl"
                >
                  Register
                </Link>
                <Link 
                  href="/accounts/demo" 
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all backdrop-blur-sm"
                >
                  Try free demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPS GRID */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-white border border-[#E4E4E4] space-y-4 shadow-sm hover:border-[#0055FF] transition-all group">
              <BarChart2 className="w-8 h-8 text-[#0055FF]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Tightest Spreads</h3>
              <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Trade on 28 major and minor pairs with pricing optimized for institutional liquidity.
              </p>
            </div>
            <div className="p-10 bg-white border border-[#E4E4E4] space-y-4 shadow-sm hover:border-[#0055FF] transition-all group">
              <Zap className="w-8 h-8 text-[#16835B]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Reliable Execution</h3>
              <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Deterministic price matching under 45ms across Varban Terminal and mobile nodes.
              </p>
            </div>
            <div className="p-10 bg-white border border-[#E4E4E4] space-y-4 shadow-sm hover:border-[#0055FF] transition-all group">
              <Clock className="w-8 h-8 text-[#0055FF]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Instant Clearing</h3>
              <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold tracking-tight">
                Withdraw funds instantly even on weekends using secure institutional payment protocols.
              </p>
            </div>
          </div>
        </section>

        {/* SPREADS TABLE SECTION */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="mb-12 space-y-2">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Forex market spreads and swaps</h2>
            <p className="text-xs text-[#6B7280] uppercase font-bold tracking-widest">Live Market Execution & Transparency</p>
          </div>

          <Card className="border-[#E4E4E4] overflow-hidden shadow-sm rounded-none">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#F7F7F5]">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Symbol</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Avg. Spread (pips)</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Commission</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Long Swap</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Short Swap</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {FOREX_PAIRS.map((pair) => (
                    <TableRow key={pair.symbol} className="hover:bg-[#F7F7F5] transition-colors group">
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <MarketIcon symbol={pair.symbol} size="md" />
                          <div>
                            <span className="font-mono font-bold text-xs text-[#0A0A0A] block">{pair.symbol}</span>
                            <span className="text-[9px] text-[#6B7280] uppercase font-bold">{pair.name}</span>
                            <span className="block text-[8px] text-[#16835B] font-bold uppercase mt-1">Swap-free available</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm text-[#0A0A0A]">{pair.spread}</TableCell>
                      <TableCell className="text-right font-mono text-[#6B7280]">{pair.commission}</TableCell>
                      <TableCell className="text-right font-mono text-[#6B7280]">{pair.long}</TableCell>
                      <TableCell className="text-right font-mono text-[#6B7280]">{pair.short}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/terminal?symbol=${pair.symbol}`} className="inline-flex items-center px-4 py-1.5 bg-[#0055FF] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#0A0A0A] transition-all">
                          Trade
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          <p className="text-[10px] text-[#6B7280] mt-4 leading-relaxed italic">
            Spreads in the above table are averages based on the previous trading day. Spreads may fluctuate and widen due to market volatility and liquidity shifts.
          </p>
        </section>

        {/* MARKET CONDITIONS SECTION */}
        <section className="bg-white border-y border-[#E4E4E4] py-24 mb-24">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Forex market conditions</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  The forex market is the world's largest financial marketplace, with over 5.5 trillion USD traded daily. Join a trusted international platform and experience 50% lower spreads across all majors.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#0055FF]">Trading Hours</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed font-medium uppercase">
                  Forex market trading hours are from Sunday 21:05 GMT to Friday 20:59 GMT. Synthetic indices remain active 24/7/365.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#0055FF]">Dynamic Margins</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed font-medium uppercase">
                  Leverage impacts margin requirements. Adjusting leverage will alter the margin needed. As market conditions shift, so do margin requirements.
                </p>
              </div>
            </div>

            <div className="bg-[#F7F7F5] p-12 border border-[#E4E4E4] space-y-8">
              <h3 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Why choose Varban?</h3>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-[#0055FF] shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] mb-1">Fund Security</h5>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold">Negative Balance Protection and segregated client accounts in Tier-1 banks.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MousePointer2 className="w-6 h-6 text-[#16835B] shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] mb-1">Stable Spreads</h5>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold">Trade the forex CFD market with the most stable spreads on EURUSD, GBPUSD, and USDJPY.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Zap className="w-6 h-6 text-[#0055FF] shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A] mb-1">Fast Execution</h5>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed uppercase font-bold">Execution speeds under 45ms across all available trading terminal nodes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATIONAL SECTION */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Master the art of FX trading</h2>
            <p className="text-xs text-[#6B7280] uppercase tracking-[0.2em] font-bold">Curated Intelligence for Professional Growth</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Forex trading: How it works and how to start", hint: "forex tutorial", imgId: 101 },
              { title: "Leverage in forex — how to use it wisely", hint: "financial chart", imgId: 102 },
              { title: "Understanding spreads — a look at fees", hint: "trading terminal", imgId: 103 },
              { title: "Forex signals: Can they be trusted?", hint: "data analysis", imgId: 104 }
            ].map((guide, idx) => (
              <Link key={idx} href="/help" className="group block bg-white border border-[#E4E4E4] p-2 hover:shadow-xl transition-all">
                <div className="aspect-[4/3] bg-[#F7F7F5] overflow-hidden mb-4 relative">
                  <Image 
                    src={`https://picsum.photos/seed/fxguide${guide.imgId}/600/450`}
                    alt={guide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    data-ai-hint={guide.hint}
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-[#0A0A0A] leading-relaxed group-hover:text-[#0055FF] transition-colors uppercase tracking-tight">{guide.title}</h4>
                  <div className="mt-4 flex items-center text-[9px] font-bold text-[#6B7280] uppercase tracking-widest border-t border-[#F7F7F5] pt-3">
                    Read Guide <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0055FF] text-white p-12 md:p-20 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="space-y-6 text-center md:text-left relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">Start trading <br /> with Varban.</h2>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-md uppercase tracking-widest font-bold">
                Join thousands of professional traders using our ultra-low latency infrastructure and raw spreads.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
              <Link href="/register" className="bg-white text-[#0055FF] px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0A0A0A] hover:text-white transition-all text-center">Open Account</Link>
              <Link href="/accounts/demo" className="bg-[#0A0A0A]/20 backdrop-blur-md border border-white/20 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-center">Try Demo</Link>
            </div>
          </div>
        </section>

      </div>
    </AuthedLayout>
  );
}
