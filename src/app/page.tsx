
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, MessageSquare, Download, Check, ShieldCheck, Zap, Globe } from "lucide-react";
import { MarketIcon } from "@/components/MarketIcon";
import { fetchMarketNews, NewsItem } from "@/app/lib/news-service";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { detectLocation } from "@/app/lib/geolocation-service";

export default function HomePage() {
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [location, setLocation] = useState("Globally");

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

    async function loadLoc() {
      const geo = await detectLocation();
      if (geo?.country_name) {
        setLocation(`in ${geo.country_name}`);
      }
    }

    loadNews();
    loadLoc();
  }, []);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Top Risk Disclaimer */}
      <div className="bg-[#0A0A0A] text-white py-2.5 px-4 text-center z-[110]">
        <p className="text-[10px] md:text-[11px] leading-relaxed max-w-7xl mx-auto opacity-90">
          Online Forex/CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. 
          <span className="font-bold text-[#FFDE00]"> 82.18% of retail investor accounts lose money </span> 
          when trading Online Forex/CFDs with this provider. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money. 
          <Link href="/terms/risk-disclosure" className="text-[#FFDE00] font-bold underline ml-1">Learn more.</Link>
        </p>
      </div>

      {/* MAIN HERO SECTION - Institutional White */}
      <section className="relative pt-24 pb-28 bg-white overflow-hidden border-b border-[#E4E4E4]">
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tight text-[#0A0A0A] font-display leading-[0.95]">
            Trade Online <br />
            <span className="text-[#0055FF]">{location}</span>
          </h1>
          
          <p className="text-base md:text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed font-medium">
            Discover the world's most stable derivative infrastructure. <br className="hidden md:block" />
            Engineered for precision, speed, and total financial integrity.
          </p>

          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 pt-4 px-2">
            <Link 
              href="/register" 
              className="flex-1 sm:flex-none bg-[#FFDE00] hover:bg-[#F2D200] text-[#0A0A0A] px-4 sm:px-12 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-md sm:min-w-[220px] text-center"
            >
              Open Account
            </Link>
            <Link 
              href="/terminal" 
              className="flex-1 sm:flex-none bg-white border border-[#E4E4E4] hover:bg-[#F7F7F5] text-[#0A0A0A] px-4 sm:px-12 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all sm:min-w-[220px] text-center"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* SECONDARY HERO SECTION - Dark Institutional Style */}
      <section className="relative pt-24 pb-40 bg-[#010813] overflow-hidden text-center px-4">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/20 rounded-full"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <h2 className="text-3xl md:text-7xl font-bold tracking-tight text-white font-display leading-[1.1]">
            Discover better-than-market <br />
            conditions
          </h2>
          
          <p className="text-base md:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed font-medium">
            Trading conditions can make or break a strategy, <br className="hidden md:block" />
            that's why you need the best in Varban Markets.
          </p>

          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 pt-6 max-w-full overflow-hidden">
            <Link 
              href="https://apps.apple.com" 
              className="flex-1 sm:flex-none bg-[#141414] border border-white/10 hover:bg-[#1A1A1A] text-white px-3 sm:px-6 py-3 rounded-lg flex items-center gap-2 sm:gap-3 transition-all sm:min-w-[200px]"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-14.7 0-51.4-22.2-84.6-21.8-44.1.6-84.6 28.5-107.1 68.8-46.3 80.2-11.9 198.4 33 263.2 22 31.8 48.6 67.1 82.9 65.9 32.5-1.2 44.7-21.8 84.1-21.8 39.4 0 50.4 21.8 84.5 21.1 35.3-.6 58.7-31.4 80.6-63.3 25.4-36.9 35.9-72.7 36.1-74.5-.8-.3-69.1-26.5-69.3-105.7zM271.8 81.6c19-23 31.9-55.1 28.4-87.1-27.6 1.1-61.1 18.3-80.9 41.5-17.7 20.6-33.2 53.3-29 84.5 30.7 2.4 62.6-15.9 81.5-38.9z"/></svg>
              </div>
              <div className="text-left">
                <span className="text-[7px] sm:text-[10px] uppercase font-bold block leading-none mb-0.5 sm:mb-1">App Store</span>
                <span className="text-[10px] sm:text-base font-bold block leading-none">Download</span>
              </div>
            </Link>
            
            <Link 
              href="https://play.google.com" 
              className="flex-1 sm:flex-none bg-[#141414] border border-white/10 hover:bg-[#1A1A1A] text-white px-3 sm:px-6 py-3 rounded-lg flex items-center gap-2 sm:gap-3 transition-all sm:min-w-[200px]"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-103 18-28.5-1.2-40.8zM325.3 277.7l-52.1-52.1-256.6 256.6 204.1-117.3 104.6-104.6z"/></svg>
              </div>
              <div className="text-left">
                <span className="text-[7px] sm:text-[10px] uppercase font-bold block leading-none mb-0.5 sm:mb-1">Google Play</span>
                <span className="text-[10px] sm:text-base font-bold block leading-none">Get it on</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

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
                  src="/assets/mobile.jpg" 
                  alt="Varban Mobile App" 
                  fill 
                  className="object-contain" 
                  priority
                  data-ai-hint="trading mobile app"
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
                          className="inline-flex items-center px-6 py-2 bg-[#FFDE00] hover:bg-[#F2D200] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
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

      {/* NEW SECTION: Lowest Forex Spreads Section */}
      <section className="relative w-full bg-white pt-12 pb-32">
        <div className="max-w-[1440px] mx-auto px-0 md:px-4">
          <div className="relative w-full aspect-[21/9] md:aspect-[32/9] overflow-hidden">
            <Image 
              src="/assets/footer.png" 
              alt="Institutional Banner"
              fill
              className="object-cover"
              priority
              data-ai-hint="gold particles abstract"
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
                  className="flex-1 md:flex-none bg-[#FFDE00] hover:bg-[#F2D200] text-[#0A0A0A] px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all text-center"
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
