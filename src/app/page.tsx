
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, MessageSquare } from "lucide-react";
import { MarketIcon } from "@/components/MarketIcon";
import { fetchMarketNews, NewsItem } from "@/app/lib/news-service";

export default function HomePage() {
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

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
  }, []);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Top Risk Disclaimer */}
      <div className="bg-[#0A0A0A] text-white py-2.5 px-4 text-center">
        <p className="text-[10px] md:text-[11px] leading-relaxed max-w-5xl mx-auto opacity-90">
          Online Forex/CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. 
          <span className="font-bold"> 82.18% of retail investor accounts lose money </span> 
          when trading Online Forex/CFDs with this provider. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money. 
          <Link href="/terms/risk-disclosure" className="text-[#FFDE00] font-bold underline ml-1">Learn more.</Link>
        </p>
      </div>

      {/* Main Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        {/* Abstract Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
          <svg width="600" height="600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-12 scale-150">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" />
            <path d="M2 12L12 17L22 12" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-[#0A0A0A] font-display leading-[1.05]">
            Trade online Global <br />
            with a leading broker
          </h1>
          
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Trade with a reliable licensed broker. Experience Varban Markets' leading online trading platform with tight spreads and fast execution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-[#FFDE00] hover:bg-[#F2D200] text-[#0A0A0A] font-bold text-sm uppercase tracking-widest px-10 py-4 shadow-sm transition-all transform active:scale-[0.98]"
            >
              Register
            </Link>
            <Link 
              href="/terminal" 
              className="w-full sm:w-auto bg-[#F2F2F2] hover:bg-[#EAEAEA] text-[#0A0A0A] font-bold text-sm uppercase tracking-widest px-10 py-4 transition-all"
            >
              Try free demo
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#FFDE00] text-[#0A0A0A] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-[100]">
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Markets Preview Section */}
      <section className="py-24 bg-[#F9F9F9] border-t border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">Global Registry</span>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Active Markets</h2>
            </div>
            <Link href="/markets" className="text-[11px] font-bold uppercase tracking-widest text-[#0055FF] flex items-center gap-1 hover:underline">
              View All Instruments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { symbol: "XAU/USD", name: "Gold Spot", price: "2,743.21", change: "+1.25%", isUp: true },
              { symbol: "EUR/USD", name: "Euro / USD", price: "1.0512", change: "+0.45%", isUp: true },
              { symbol: "BTC/USD", name: "Bitcoin", price: "67,842.20", change: "+2.50%", isUp: true },
              { symbol: "AAPL", name: "Apple Inc.", price: "189.47", change: "+1.15%", isUp: true }
            ].map((ticker) => (
              <div key={ticker.symbol} className="bg-white border border-[#E4E4E4] p-6 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <MarketIcon symbol={ticker.symbol} size="md" />
                  <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-tighter font-mono">{ticker.symbol}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">{ticker.name}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#0A0A0A] font-display">{ticker.price}</span>
                    <span className={`text-[10px] font-bold ${ticker.isUp ? 'text-[#16835B]' : 'text-[#C43D3D]'}`}>
                      {ticker.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Market Intelligence</h2>
            <p className="text-sm text-[#6B7280] max-w-xl mx-auto leading-relaxed">
              Stay ahead with real-time headlines from our institutional data nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newsLoading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="bg-[#F7F7F5] h-64 animate-pulse border border-[#E4E4E4]" />)
            ) : trendingNews.map((item) => (
              <Link href={`/news/${item.uuid}`} key={item.uuid} className="group block space-y-4">
                <div className="aspect-video bg-[#F7F7F5] border border-[#E4E4E4] overflow-hidden relative">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[8px] font-bold uppercase tracking-widest text-[#0055FF] border border-[#E4E4E4]">
                    {item.publisher}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-[#0A0A0A] leading-snug group-hover:text-[#0055FF] transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
                  Read Report <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
