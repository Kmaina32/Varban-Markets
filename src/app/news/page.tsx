'use client';

/**
 * @fileOverview News Hub Workspace.
 * Professional financial news feed delivering real-time headlines.
 * Strictly accessible for authenticated users. AI analysis disabled.
 */

import { useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Newspaper, 
  Search, 
  Loader2, 
  ExternalLink,
  BarChart2
} from "lucide-react";
import { fetchMarketNews, NewsItem } from "@/app/lib/news-service";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";

export default function NewsHubPage() {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAsset, setActiveAsset] = useState<string | undefined>(undefined);

  const loadNews = async (asset?: string) => {
    setIsLoading(true);
    try {
      const newsItems = await fetchMarketNews(asset);
      setNews(newsItems);
    } catch (err) {
      console.error("News sync failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveAsset(searchQuery.trim());
      loadNews(searchQuery.trim());
    } else {
      setActiveAsset(undefined);
      loadNews();
    }
  };

  const tutorialSteps: TutorialStep[] = [
    {
      selector: "#tour-news-banner",
      title: "Live Intelligence",
      description: "Monitor high-precision headlines from tier-1 financial data nodes worldwide."
    },
    {
      selector: "#tour-news-search",
      title: "Asset-Aware Filtering",
      description: "Search for specific assets like 'Gold', 'BTC', or 'EUR' to view relevant market-moving events."
    },
    {
      selector: "#tour-news-feed",
      title: "Real-time Telemetry",
      description: " हेडलाइंस are timestamped and source-verified to ensure maximum data integrity for your trades."
    }
  ];

  return (
    <AuthedLayout 
      title={t('nav.news')} 
      subtitle="Institutional Market Intelligence Hub"
    >
      <PageTutorial steps={tutorialSteps} storageKey="varban_news_tutorial" />

      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        
        <div id="tour-news-banner" className="p-6 bg-[#0055FF] text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-[#0A0A0A]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Global Financial Headlines</h1>
            <p className="text-[10px] uppercase font-bold text-white/70 mt-1">Real-time telemetry from top tier-1 financial data nodes</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setSearchQuery(""); setActiveAsset(undefined); loadNews(); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border border-white/20"
            >
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        <Card id="tour-news-search" className="bg-white border-[#E4E4E4] p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input 
                type="text" 
                placeholder="Search by asset (e.g. BTC, Gold, EUR, NVDA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF] transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="px-8 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-colors"
            >
              Fetch Market News
            </button>
          </form>
        </Card>

        {activeAsset && (
          <div className="flex items-center space-x-2 px-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Active Scope:</span>
            <span className="bg-[#0A0A0A] text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">{activeAsset}</span>
            <button 
              onClick={() => { setSearchQuery(""); setActiveAsset(undefined); loadNews(); }} 
              className="text-[9px] font-bold text-[#0055FF] uppercase hover:underline ml-2 flex items-center gap-1"
            >
              Clear Scope
            </button>
          </div>
        )}

        <div id="tour-news-feed" className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A0A0A] block">Synchronizing Global Feed</span>
                <p className="text-[10px] text-[#6B7280] mt-1 uppercase font-bold">Accessing External Data Nodes...</p>
              </div>
            </div>
          ) : news.length === 0 ? (
            <Card className="p-20 text-center border-dashed border-2 bg-white">
              <Newspaper className="w-12 h-12 text-[#E4E4E4] mx-auto mb-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">No News Records Detected</h3>
              <p className="text-xs text-[#6B7280] max-w-xs mx-auto mt-2 leading-relaxed">
                We couldn't find any significant news records for <span className="font-bold text-[#0A0A0A]">"{activeAsset}"</span> in the current session.
              </p>
              <button onClick={() => { setSearchQuery(""); setActiveAsset(undefined); loadNews(); }} className="mt-6 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline">View General Markets Feed</button>
            </Card>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <Card key={item.uuid} className="bg-white border-[#E4E4E4] p-6 hover:border-[#0055FF] transition-all group shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-48 shrink-0 space-y-4 border-b lg:border-b-0 lg:border-r border-[#E4E4E4] pb-4 lg:pb-0 lg:pr-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase text-[#6B7280] tracking-wider">
                          <span>Publisher</span>
                          <span className="text-[#0A0A0A] font-bold">{item.publisher}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase text-[#6B7280] tracking-wider">
                          <span>Timestamp</span>
                          <span className="text-[#0A0A0A]">{new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase text-[#6B7280] tracking-wider">
                          <span>Date</span>
                          <span className="text-[#0A0A0A]">{new Date(item.published_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <h2 className="text-lg font-bold text-[#0A0A0A] leading-tight group-hover:text-[#0055FF] transition-colors">
                          {item.title}
                        </h2>
                        <div className="p-1.5 border border-[#E4E4E4] bg-[#F7F7F5] shrink-0">
                          <BarChart2 className="w-4 h-4 text-[#6B7280] group-hover:text-[#0055FF] transition-colors" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F7F7F5]">
                        <span className="text-[8px] font-mono text-[#6B7280] uppercase">Token ID: {item.uuid.substring(0,8).toUpperCase()}</span>
                        <button className="text-[10px] font-bold uppercase tracking-widest text-[#0055FF] hover:underline flex items-center gap-1">
                          <span>Analyze Full Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start space-x-3">
          <div className="w-2 h-2 rounded-full bg-[#16835B] mt-1 shrink-0 animate-pulse"></div>
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            Market intelligence data is sourced from global exchanges and tier-1 news providers. All headlines are timestamped and logged for internal auditing. Varban Markets delivers raw information without speculative processing.
          </p>
        </div>

      </div>
    </AuthedLayout>
  );
}
