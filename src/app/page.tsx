
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Headset, 
  Lock
} from "lucide-react";
import { MarketIcon } from "@/components/MarketIcon";
import { fetchMarketNews, NewsItem } from "@/app/lib/news-service";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { detectLocation } from "@/app/lib/geolocation-service";
import { cn } from "@/app/lib/utils";

export default function HomePage() {
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const heroImages = [
    placeholderImages.hero.url,
    placeholderImages.hero_alt.url
  ];

  useEffect(() => {
    async function loadNews() {
      try {
        const response = await fetchMarketNews();
        if (!response.error) {
          setTrendingNews(response.data?.slice(0, 4) || []);
        }
      } catch (e) {} finally {
        setNewsLoading(false);
      }
    }

    loadNews();

    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Top Risk Disclaimer */}
      <div className="bg-[#0A0A0A] text-white py-2.5 px-4 text-center z-[100] relative">
        <p className="text-[10px] md:text-[11px] leading-relaxed max-w-7xl mx-auto opacity-90 uppercase tracking-widest font-bold">
          Online Forex/CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. 
          <span className="text-[#FFDE00]"> 82.18% of retail investor accounts lose money </span> 
          when trading online Forex/CFDs with this provider. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money. 
          <Link href="/terms/risk-disclosure" className="text-[#FFDE00] underline ml-1">Learn more.</Link>
        </p>
      </div>

      {/* MAIN HERO SECTION - Slideshow Architecture */}
      <section className="relative bg-[#0A0A0A] overflow-hidden pt-20 lg:pt-32 pb-24 lg:pb-16 min-h-[650px] flex items-center">
        {/* Background Slideshow Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {heroImages.map((src, idx) => (
            <div 
              key={src}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                idx === currentHeroIndex ? "opacity-100" : "opacity-0"
              )}
            >
              <Image 
                src={src} 
                alt={`Hero Background ${idx}`} 
                fill 
                className="object-cover"
                priority={idx === 0}
                data-ai-hint="trading background"
              />
            </div>
          ))}
          {/* Subtle Dark Overlay for White Text Readability */}
          <div className="absolute inset-0 bg-black/40 z-[5]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-[64px] font-normal tracking-tight text-white font-display leading-[1.1]">
              Trade online <br className="hidden md:block" /> with a leading broker
            </h1>
            
            <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Trade with a reliable licensed broker. Experience Varban&apos;s leading online trading platform with tight spreads and fast execution.
            </p>

            <div className="flex flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4 pt-4">
              <Link 
                href="/register" 
                className="flex-1 sm:flex-none bg-[#0055FF] hover:bg-[#0044cc] text-white px-4 sm:px-12 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-md sm:min-w-[180px] text-center"
              >
                Register
              </Link>
              <Link 
                href="/accounts/demo" 
                className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 px-4 sm:px-12 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all sm:min-w-[180px] text-center"
              >
                Try free demo
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile App Icons - Adaptive Position */}
        <div className="absolute bottom-8 left-0 right-0 lg:left-auto lg:bottom-12 lg:right-12 flex justify-center lg:justify-end items-center space-x-4 z-20 px-4">
          <Link href="#" className="opacity-90 hover:opacity-100 transition-opacity">
            <Image 
              src={placeholderImages.app_store.url} 
              alt="Download on App Store" 
              width={placeholderImages.app_store.width} 
              height={placeholderImages.app_store.height} 
              className="h-9 md:h-10 w-auto"
              data-ai-hint={placeholderImages.app_store.hint}
            />
          </Link>
          <Link href="#" className="opacity-90 hover:opacity-100 transition-opacity">
            <Image 
              src={placeholderImages.google_play.url} 
              alt="Get it on Google Play" 
              width={placeholderImages.google_play.width} 
              height={placeholderImages.google_play.height} 
              className="h-9 md:h-10 w-auto"
              data-ai-hint={placeholderImages.google_play.hint}
            />
          </Link>
        </div>
      </section>

      {/* Trust Indicators Bar */}
      <div className="relative z-10 border-y border-[#E4E4E4] bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[850px] md:min-w-0 gap-8">
            <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
               <ShieldCheck className="w-4 h-4 text-[#0A0A0A] opacity-30" />
               <span>Trusted since 2008</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
               <FileText className="w-4 h-4 text-[#0A0A0A] opacity-30" />
               <span>Authorized by FSA in Saint Lucia</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
               <Headset className="w-4 h-4 text-[#0A0A0A] opacity-30" />
               <span>24/7 customer support</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
               <Lock className="w-4 h-4 text-[#0A0A0A] opacity-30" />
               <span>PCI DSS certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Showcase Section */}
      <section className="bg-[#010813] pt-10 pb-32 px-4 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-0">
            {/* Left Features */}
            <div className="lg:col-span-4 space-y-12 sm:space-y-24 order-2 lg:order-1 text-center lg:text-right">
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">Instant withdrawals</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm mx-auto lg:ml-auto">
                  Withdraw and deposit funds within seconds using popular payment options.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">Unmatched pricing</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm mx-auto lg:ml-auto">
                  Trade with tightest spreads in the industry, powered by our multi-source liquidity.
                </p>
              </div>
            </div>

            {/* Mobile Image */}
            <div className="lg:col-span-4 flex justify-center order-1 lg:order-2">
              <div className="relative w-[280px] h-[560px] sm:w-[350px] sm:h-[700px] transition-transform duration-1000 hover:scale-105">
                <Image 
                  src={placeholderImages.mobile_app.url} 
                  alt="Varban Mobile App" 
                  fill 
                  className="object-contain" 
                  priority
                  data-ai-hint={placeholderImages.mobile_app.hint}
                />
              </div>
            </div>

            {/* Right Features */}
            <div className="lg:col-span-4 space-y-12 sm:space-y-24 order-3 lg:order-3 text-center lg:text-left">
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">Ultra-fast execution</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm mx-auto lg:mr-auto">
                  Execute trades in milliseconds, no matter the size, for precise market entries.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">Swap-free trading</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm mx-auto lg:mr-auto">
                  Hold positions overnight without incurring interest charges on major instruments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Markets Section - Clean Table Design */}
      <section className="py-24 bg-white border-t border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">Global Market Registry</span>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Active Instruments</h2>
            </div>
            <Link href="/markets" className="text-[11px] font-bold uppercase tracking-widest text-[#0055FF] flex items-center gap-1.5 hover:underline">
              View All 150+ Symbols <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-[#E4E4E4] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                    <th className="p-5">Instrument</th>
                    <th className="p-5">Last Price</th>
                    <th className="p-5">24h Change</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E4]">
                  {[
                    { symbol: "BTC/USD", name: "Bitcoin", price: "97,842.20", change: "+2.50%", isUp: true },
                    { symbol: "XAU/USD", name: "Gold Spot", price: "2,743.21", change: "+1.25%", isUp: true },
                    { symbol: "EUR/USD", name: "Euro / US Dollar", price: "1.0512", change: "-0.45%", isUp: false },
                    { symbol: "AAPL", name: "Apple Inc.", price: "189.47", change: "+1.15%", isUp: true },
                    { symbol: "WTI/USD", name: "Crude Oil", price: "72.18", change: "-0.82%", isUp: false }
                  ].map((ticker) => (
                    <tr key={ticker.symbol} className="hover:bg-[#F7F7F5] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center space-x-4">
                          <MarketIcon symbol={ticker.symbol} size="md" />
                          <div>
                            <span className="text-xs font-bold text-[#0A0A0A] block uppercase font-mono">{ticker.symbol}</span>
                            <span className="text-[10px] text-[#6B7280] uppercase font-bold tracking-tight">{ticker.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-lg font-bold text-[#0A0A0A] font-mono">{ticker.price}</span>
                      </td>
                      <td className="p-5">
                        <span className={`text-xs font-bold font-mono ${ticker.isUp ? 'text-[#16835B]' : 'text-[#C43D3D]'}`}>
                          {ticker.isUp ? '+' : ''}{ticker.change}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <Link 
                          href={`/terminal?symbol=${ticker.symbol}`}
                          className="inline-flex items-center px-6 py-2 bg-[#0055FF] hover:bg-[#0044cc] text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
                        >
                          Trade
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section className="py-24 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Market Intelligence</h2>
            <p className="text-sm text-[#6B7280] max-w-xl mx-auto leading-relaxed">
              Stay ahead with real-time headlines from our institutional data nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newsLoading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="bg-white h-64 animate-pulse border border-[#E4E4E4]" />)
            ) : trendingNews.map((item) => (
              <Link href={`/news/${item.uuid}`} key={item.uuid} className="group block bg-white border border-[#E4E4E4] p-2 hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-[#F7F7F5] overflow-hidden relative">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[8px] font-bold uppercase tracking-widest text-[#0055FF] border border-[#E4E4E4]">
                    {item.publisher}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#0A0A0A] leading-snug group-hover:text-[#0055FF] transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center text-[9px] font-bold text-[#6B7280] uppercase tracking-widest pt-2 border-t border-[#F7F7F5]">
                    Read Report <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Spreads Section */}
      <section className="relative w-full bg-white pt-12 pb-32">
        <div className="max-w-[1440px] mx-auto px-0 md:px-4">
          <div className="relative w-full aspect-[21/9] md:aspect-[32/9] overflow-hidden bg-[#F7F7F5]">
            <Image 
              src={placeholderImages.footer_banner.url} 
              alt="Institutional Banner"
              fill
              className="object-cover"
              priority
              data-ai-hint={placeholderImages.footer_banner.hint}
            />
          </div>
          
          <div className="relative -mt-16 md:-mt-24 z-10 max-w-5xl mx-auto px-4">
            <div className="bg-[#010813] text-white p-8 md:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 border border-white/5">
              <div className="space-y-4 max-w-xl">
                <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight leading-tight">
                  The lowest forex spreads on the market
                </h2>
                <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed">
                  Cut your trading costs in half on 28 FX majors and minors with 50% lower spreads than the industry average.²
                </p>
              </div>
              
              <div className="flex flex-row items-center gap-3 w-full md:w-auto shrink-0">
                <Link 
                  href="/register" 
                  className="flex-1 md:flex-none bg-[#0055FF] hover:bg-[#0044cc] text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all text-center"
                >
                  Register
                </Link>
                <Link 
                  href="/accounts/demo" 
                  className="flex-1 md:flex-none bg-[#1A2333] border border-white/10 hover:bg-[#252E3F] text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all text-center"
                >
                  Try free demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
