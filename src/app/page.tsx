"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, ArrowRight, Newspaper, Clock, FileText, Globe, ShieldCheck } from "lucide-react";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { MarketIcon } from "@/components/MarketIcon";
import { fetchMarketNews, NewsItem } from "@/app/lib/news-service";

export default function HomePage() {
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);

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

  const trustedCompanies = [
    { name: "Twelve Data", url: "https://cdn.simpleicons.org/databricks/E44126" },
    { name: "Binance", url: "https://cdn.simpleicons.org/binance/F0B90B" },
    { name: "Coinbase", url: "https://cdn.simpleicons.org/coinbase/0052FF" },
    { name: "TradingView", url: "https://cdn.simpleicons.org/tradingview/131722" },
    { name: "Cloudflare", url: "https://cdn.simpleicons.org/cloudflare/F38020" }
  ];

  const certifications = [
    { name: "ISO/IEC 27001", subtitle: "Information Security", url: "/assets/iso.png" },
    { name: "PCI DSS v4.0", subtitle: "Payment Security", url: "https://cdn.simpleicons.org/visa/1A1F71" },
    { name: "SOC2 Type II", subtitle: "System & Controls", url: "https://cdn.simpleicons.org/securityscorecard/0055FF" },
    { name: "GDPR Compliant", subtitle: "Data Privacy", url: "https://cdn.simpleicons.org/ethereum/000000" }
  ];

  useEffect(() => {
    async function loadNews() {
      try {
        const response = await fetchMarketNews();
        if (response.error) {
          setNewsError(true);
        } else {
          setTrendingNews(response.data?.slice(0, 4) || []);
        }
      } catch (e) {
        setNewsError(true);
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
              The Easiest Way to Trade Global Markets.
            </h1>
            <p className="text-sm sm:text-base text-[#D1D5DB] mb-8 leading-relaxed max-w-2xl">
              Start trading with a system you can trust. Simple to use, fast execution, and expert support whenever you need it. Perfect for both beginners and experienced traders.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-institutional-primary bg-[#0055FF] text-white border-[#0055FF] hover:bg-white hover:text-[#0055FF] px-8">
                Start Trading
              </Link>
              <Link href="/markets" className="btn-institutional-secondary bg-transparent text-white border-white/20 hover:bg-white/5 px-8">
                View All Markets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Access Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">Outstanding Markets</span>
              <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display leading-[1.1]">
                Global Market Access
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Trade over 25 global markets including Forex, Stocks, Gold, and Crypto. We offer real-time data and a beginner-friendly interface so you can start trading in minutes.
              </p>
              <Link href="/markets" className="btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-[#0A0A0A] hover:border-[#0A0A0A] inline-flex items-center gap-2 group">
                <span>Browse Market List</span>
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

      {/* Industry Trusted Section */}
      <section className="py-16 bg-white border-t border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">Infrastructure Partners</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
              Industry Trusted
            </h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {trustedCompanies.map((company) => (
              <div key={company.name} className="group transition-all duration-300 hover:scale-105">
                <img 
                  src={company.url} 
                  alt={company.name} 
                  className="h-8 md:h-10 object-contain"
                  title={company.name}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Trust Section */}
      <section className="py-24 bg-[#F7F7F5] border-t border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">Compliance & Verification</span>
            <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
              Certifications & Recognition
            </h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              We follow the highest security standards to keep your money and data safe. Our certifications prove our commitment to a fair and reliable trading environment.
            </p>
            
            {/* Certifications Row */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {certifications.map((cert) => (
                <div key={cert.name} className="bg-white border border-[#E4E4E4] p-4 flex flex-col items-center justify-center space-y-3 shadow-sm hover:border-[#0055FF] transition-colors group">
                  <img src={cert.url} alt={cert.name} className="h-8 md:h-10 object-contain" />
                  <div className="text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#0A0A0A] block">{cert.name}</span>
                    <span className="text-[8px] text-[#6B7280] uppercase block">{cert.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist Trust Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 pt-16 border-t border-[#E4E4E4]">
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] border-l-2 border-[#0055FF] pl-4">Safe Money Management</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed pl-4">
                Your funds are held in separate bank accounts from our company money, ensuring they are always available to you.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] border-l-2 border-[#16835B] pl-4">Fair Trade Execution</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed pl-4">
                Our system uses accurate, real-time prices so you always get the best entry point without any hidden delays.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] border-l-2 border-[#C9A227] pl-4">Verified & Legal</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed pl-4">
                We operate legally under the laws of Saint Lucia, following strict rules to keep the trading community clean and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Feed Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-4">Latest Market News</span>
              <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Stay Informed</h2>
            </div>
            <Link href="/news" className="text-[11px] font-bold uppercase tracking-widest text-[#0055FF] flex items-center gap-1 hover:underline">
              Go to News Hub <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#F7F7F5] border border-[#E4E4E4] p-6 h-64 animate-pulse" />
              ))
            ) : newsError ? (
              <div className="col-span-full py-12 text-center border border-dashed border-[#E4E4E4]">
                <p className="text-[10px] uppercase font-bold text-[#6B7280]">News feed temporarily offline</p>
              </div>
            ) : trendingNews.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-[#E4E4E4]">
                <p className="text-[10px] uppercase font-bold text-[#6B7280]">No active news reports right now</p>
              </div>
            ) : trendingNews.map((item) => (
              <Link href={`/news/${item.uuid}`} key={item.uuid} className="bg-white border border-[#E4E4E4] p-6 hover:border-[#0055FF] transition-all group flex flex-col justify-between h-full shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-bold text-[#0055FF] uppercase tracking-widest">{item.publisher}</span>
                    <span className="text-[8px] text-[#6B7280]">&bull;</span>
                    <span className="text-[9px] font-mono text-[#6B7280]">{new Date(item.published_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0A0A0A] leading-snug group-hover:text-[#0055FF] transition-colors">{item.title}</h4>
                </div>
                <div className="mt-6 pt-4 border-t border-[#F7F7F5] flex items-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest gap-2 group-hover:text-[#0A0A0A]">
                  <FileText className="w-3.5 h-3.5" /> <span>Read Analysis</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0A0A0A] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0055FF]/10 skew-x-12 transform translate-x-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold uppercase tracking-tight leading-tight">Start Trading in Minutes.</h2>
            <p className="text-sm text-[#D1D5DB] leading-relaxed">
              Open your free account today and join the world's most stable trading platform. It's easy, fast, and secure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-white hover:text-[#0055FF] text-white">
                Create Free Account
              </Link>
              <Link href="/login" className="w-full sm:w-auto btn-institutional-secondary bg-transparent text-white border-white/20 hover:bg-white/5">
                Log In to Terminal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
