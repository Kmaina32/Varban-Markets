
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, CheckCircle2, ArrowRight, Newspaper, Clock, FileText, AlertTriangle, ShieldCheck, Lock, Shield, ShieldAlert, Award } from "lucide-react";
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

  const certifications = [
    { name: "ISO/IEC 27001", subtitle: "Information Security", url: "https://cdn.simpleicons.org/standard-chartered/16835B" },
    { name: "PCI DSS v4.0", subtitle: "Payment Security", url: "https://cdn.simpleicons.org/visa/1A1F71" },
    { name: "SOC2 Type II", subtitle: "System & Controls", url: "https://cdn.simpleicons.org/securityscorecard/0055FF" },
    { name: "GDPR Compliant", subtitle: "Data Privacy", url: "https://cdn.simpleicons.org/ethereum/3C3C3D" }
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

      {/* Security & Trust Section */}
      <section className="py-24 bg-[#F7F7F5] border-t border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF]">Industry Trusted</span>
            <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">
              Certifications & Recognition
            </h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              We operate according to the highest global standards for financial security and data privacy. Our platform is independently audited to ensure total institutional integrity.
            </p>
            
            {/* Certifications Row */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-6 md:gap-12">
              {certifications.map((cert) => (
                <div key={cert.name} className="flex items-center gap-3 bg-white border border-[#E4E4E4] p-3 md:p-4 shadow-sm transition-all duration-300 hover:border-[#0055FF] hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0">
                    <img 
                      src={cert.url} 
                      alt={cert.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#0A0A0A] block leading-none">
                      {cert.name}
                    </span>
                    <span className="text-[8px] md:text-[9px] font-bold text-[#6B7280] uppercase tracking-tighter mt-1 block">
                      {cert.subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white border border-[#E4E4E4] p-8 shadow-sm space-y-4">
              <ShieldCheck className="w-10 h-10 text-[#0055FF]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Capital Protection</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Client funds are held in segregated Tier-1 banking accounts, strictly separated from our company operational assets.
              </p>
            </div>
            <div className="bg-white border border-[#E4E4E4] p-8 shadow-sm space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#16835B]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Deterministic Execution</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Our engine ensures 100% accurate trade settlement at the millisecond of expiration, with zero price manipulation.
              </p>
            </div>
            <div className="bg-white border border-[#E4E4E4] p-8 shadow-sm space-y-4">
              <AlertTriangle className="w-10 h-10 text-[#C9A227]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Regulatory Compliance</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Operating under the laws of Saint Lucia, we maintain strict KYC/AML protocols to ensure a clean and secure ecosystem.
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
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0055FF] block mb-4">Real-time Intelligence</span>
              <h2 className="text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] font-display">Market Updates</h2>
            </div>
            <Link href="/news" className="text-[11px] font-bold uppercase tracking-widest text-[#0055FF] flex items-center gap-1 hover:underline">
              View News Hub <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#F7F7F5] border border-[#E4E4E4] p-6 h-64 animate-pulse" />
              ))
            ) : newsError ? (
              <div className="col-span-full py-12 text-center border border-dashed border-[#E4E4E4]">
                <p className="text-[10px] uppercase font-bold text-[#6B7280]">Intelligence feed temporarily unavailable</p>
              </div>
            ) : trendingNews.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-[#E4E4E4]">
                <p className="text-[10px] uppercase font-bold text-[#6B7280]">No active news detected in this region</p>
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
              Open your professional trading account today and get access to the world's most stable derivatives infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto btn-institutional-primary bg-[#0055FF] border-[#0055FF] hover:bg-white hover:text-[#0055FF] text-white">
                Create Live Account
              </Link>
              <Link href="/login" className="w-full sm:w-auto btn-institutional-secondary bg-transparent text-white border-white/20 hover:bg-white/5">
                Back to Terminal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
