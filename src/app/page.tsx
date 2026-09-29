
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, CheckCircle2, ArrowRight, Newspaper, Clock, FileText, AlertTriangle, ShieldCheck } from "lucide-react";
import placeholderImages from "@/app/lib/placeholder-images.json";
import { MarketIcon } from "@/components/MarketIcon";
import { fetchMarketNews, NewsItem } from "@/app/lib/news-service";
import { useUser } from "@auth0/nextjs-auth0/client";
import LoginButton from "@/components/auth0/LoginButton";
import LogoutButton from "@/components/auth0/LogoutButton";
import Profile from "@/components/auth0/Profile";

export default function HomePage() {
  const { user: auth0User, isLoading: isAuth0Loading } = useUser();
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
      {/* Auth0 Integration Section */}
      <section className="bg-[#F7F7F5] border-b border-[#E4E4E4] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E4E4E4] p-8 shadow-sm flex flex-col items-center text-center gap-6 max-w-lg mx-auto">
            <ShieldCheck className="w-10 h-10 text-[#0055FF]" />
            {!isAuth0Loading && auth0User ? (
              <>
                <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Your Auth0 Account</h2>
                <div className="w-full h-px bg-[#F7F7F5]" />
                <Profile />
                <LogoutButton />
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">Auth0 Gateway</h2>
                  <p className="text-[11px] text-[#6B7280] uppercase font-bold tracking-widest mt-1">Institutional Identity Provider</p>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Access your Varban Markets account using our secure Auth0 authentication node.
                </p>
                <LoginButton />
              </>
            )}
          </div>
        </div>
      </section>

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
      
      {/* ... Rest of existing sections ... */}
    </div>
  );
}
