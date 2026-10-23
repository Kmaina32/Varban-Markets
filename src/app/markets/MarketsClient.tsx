"use client";

/**
 * @fileOverview Public Market Registry page (landing chrome: Navbar + Footer).
 * The authenticated equivalent lives at /client/markets.
 */

import Link from "next/link";
import Image from "next/image";
import MarketRegistry from "@/components/markets/MarketRegistry";

export default function MarketsClient() {
  return (
    <div className="bg-[#F7F7F5] min-h-screen text-[#0A0A0A] pb-24">
      {/* 1. FULL WIDTH BANNER HERO */}
      <section className="relative h-[400px] md:h-[500px] bg-[#0A0A0A] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/markets_hub/1920/800" 
            alt="Global Markets Hub" 
            fill 
            className="object-cover opacity-50 grayscale" 
            priority
            data-ai-hint="stock market board"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full text-white">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <span className="text-[10px] font-bold text-[#0055FF] uppercase tracking-[0.4em] block">Market Domain</span>
            <h1 className="text-4xl md:text-7xl font-normal tracking-tight font-display leading-[1.1]">The global market <br /> registry.</h1>
            <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-medium uppercase tracking-tight">
              Access over 150 financial instruments across Forex, Equities, Commodities and Digital Assets with deterministic execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="bg-[#0055FF] hover:bg-[#0044cc] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl text-center">
                Open Account
              </Link>
              <Link href="/accounts/demo" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-center">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <MarketRegistry variant="public" />
      </div>
    </div>
  );
}
