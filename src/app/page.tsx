"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, CheckCircle2, ArrowRight, Newspaper, Clock, ExternalLink, FileText } from "lucide-react";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { MarketIcon } from "@/components/MarketIcon";
import { fetchMarketNews, NewsItem } from "@/app/lib/news-service";
import { cn } from "@/app/lib/utils";

export default function HomePage() {
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const marketTickers = [
    { symbol: "XAU/USD", name: "Gold Spot", price: "2,743.21", change: "+1.25%", isUp: true },
    { symbol: "EUR/USD", name: "Euro / US Dollar", price: "1.0512", change: "+0.45%", isUp: true },
    { symbol: "GBP/USD", name: "British Pound / USD", price: "1.2734", change: "-0.12%", isUp: false },
    { symbol: "BTC/USD", name: "Bitcoin", price: "67,842.20", change: "+2.50%", isUp: true },
    { symbol: "AAPL", name: "Apple Inc.", price: "189.47", change: "+1.15%", isUp: true },
    { symbol: "TSLA", name: "Tesla, Inc.", price: "241.73", change: "+2.37%", isUp: true },
    { symbol: "US30", name: "Dow Jones 30", price: "38,742.63", change: "-0.25%", isUp: false },
    { symbol: "NAS100", name: "Nasdaq 100", price: "15,434.20", change: "+1.42%", isUp: true }
  ];

  useEffect(() => {
    async function loadNews() {
      try {
        const news = await fetchMarketNews();
        setTrendingNews(news.slice(0, 4));
      } catch (e) {
        console.error("Failed to load trending news:", e);
      } finally {
        setNewsLoading(false);
      }
    }
    loadNews();
  }, []);

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#0A0A0A] text-white min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={placeholderImages.hero.url}
            alt="Varban Markets Terminal"
            fill
            className="object-cover opacity-50"
            priority
            data-ai-hint={placeholderImages.hero.hint}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 py-20">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0055FF] block mb-4">
              Varban Markets
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white uppercase mb-6 leading-[1.1] font-display">
              Professional Trading for Global Markets.
            </h1>
            <p className="text-sm sm:text-base text-[#D1D5DB] mb-8 leading-relaxed max-w-2xl">
              Trade global markets using a professional system. Get clear results, reliable prices, and manage your money with ease using our high-performance trading tools.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-institutional-primary bg-[#0055FF] text-white border-[#0055FF] hover:bg-white hover:text-[#0055FF] px-8">
                Open Account
              </Link>
              <Link href="/markets" className="btn-institutional-secondary bg-transparent text-white border-white/20 hover:bg-white/5 px-8">
                View Markets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Market Access Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">Outstanding Markets</span>
              <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display leading-[1.1]">
                Global Market Access
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Access 25+ global markets including Forex, Stocks, Indices, Commodities and Digital Currencies. Trade with real-time data and low execution time-frames across the world's leading financial markets.
              </p>
              <Link href="/markets" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-[#0A0A0A] hover:border-[#0A0A0A] inline-flex items-center gap-2 group">
                <span>View Markets</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {marketTickers.map((ticker) => (
                  <div key={ticker.symbol} className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 group hover:border-[#0055FF] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <MarketIcon symbol={ticker.symbol} />
                      <span className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-tighter font-display">{ticker.symbol}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">{ticker.name}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-[#0A0A0A] font-display">{ticker.price}</span>
                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${ticker.isUp ? 'text-[#16835B]' : 'text-[#C43D3D]'}`}>
                          {ticker.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{ticker.change}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending News Section */}
      <section className="py-24 bg-[#F7F7F5] border-t border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-2">Market Intelligence</span>
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Trending Insights</h2>
              <p className="text-sm text-[#6B7280] mt-3">Stay ahead of the curve with real-time headlines from global financial nodes.</p>
            </div>
            <Link href="/news" className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0055FF] hover:text-[#0A0A0A] transition-colors flex items-center gap-2 pb-1 border-b border-[#0055FF] hover:border-[#0A0A0A]">
              View All Intelligence <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-[#E4E4E4] p-6 h-64 animate-pulse">
                  <div className="h-4 bg-[#F7F7F5] w-1/3 mb-4"></div>
                  <div className="h-6 bg-[#F7F7F5] w-full mb-2"></div>
                  <div className="h-20 bg-[#F7F7F5] w-full"></div>
                </div>
              ))
            ) : trendingNews.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#6B7280]">
                < Newspaper className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-xs uppercase font-bold tracking-widest">No active headlines detected</p>
              </div>
            ) : (
              trendingNews.map((item) => (
                <div key={item.uuid} className="bg-white border border-[#E4E4E4] p-6 flex flex-col justify-between hover:border-[#0055FF] transition-all group shadow-sm">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono font-bold text-[#0055FF] uppercase tracking-tighter truncate max-w-[100px]">
                        {item.publisher}
                      </span>
                      <div className="flex items-center gap-1 text-[8px] font-bold text-[#6B7280] uppercase">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(item.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-[#0A0A0A] leading-tight group-hover:text-[#0055FF] transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                  </div>
                  <div className="pt-6 mt-6 border-t border-[#F7F7F5]">
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full text-[9px] font-bold uppercase tracking-widest text-[#0A0A0A] hover:text-[#0055FF] transition-colors"
                    >
                      <span className="flex items-center gap-1.5"><ExternalLink className="w-3 h-3" /> Analyze Report</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Powerful Trading Technology Section */}
      <section className="py-24 bg-white text-[#0A0A0A] border-t border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative z-10 rounded-none border border-[#E4E4E4] overflow-hidden shadow-2xl">
                <Image 
                  src={placeholderImages.terminal_showcase.url}
                  alt="Terminal Interface"
                  width={placeholderImages.terminal_showcase.width}
                  height={placeholderImages.terminal_showcase.height}
                  className="w-full h-auto object-cover"
                  data-ai-hint={placeholderImages.terminal_showcase.hint}
                />
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0055FF] opacity-5 blur-[80px]"></div>
            </div>

            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">Platform</span>
                <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display leading-[1.1]">
                  Powerful Trading Technology
                </h2>
                <p className="text-sm text-[#6B7280] leading-relaxed max-w-xl">
                  Get advanced trading software give you the edge. Charts and insights you need to make profitable decisions. Trade anywhere from desktop, mobile, anywhere, anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  "Personalized interface",
                  "Fast execution",
                  "Powerful platform",
                  "Multi-platform access"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-none bg-[#0055FF]/10 flex items-center justify-center border border-[#0055FF]/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0055FF]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/technology" className="btn-institutional-primary bg-[#0A0A0A] text-white border-[#0A0A0A] hover:bg-[#0055FF] hover:border-[#0055FF] px-10">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blue CTA Section */}
      <section className="py-24 bg-[#0055FF] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-8 font-display">
            Start Trading with Varban Markets Today.
          </h3>
          <div className="flex justify-center gap-4">
            <Link href="/markets" className="btn-institutional-primary bg-[#0A0A0A] text-white border-[#0A0A0A] hover:bg-[#141414] px-10">
              Explore Markets
            </Link>
            <Link href="/register" className="btn-institutional-secondary bg-white text-[#0A0A0A] border-white hover:bg-[#F7F7F5] px-10">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
