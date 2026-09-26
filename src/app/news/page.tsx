
'use client';

/**
 * @fileOverview News Intelligence Hub.
 * Comprehensive financial news feed with AI sentiment analysis and impact briefings.
 */

import { useState, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Newspaper, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Loader2, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart2
} from "lucide-react";
import { getMarketNewsAnalysis, NewsSummaryOutput } from "@/ai/flows/market-news-flow";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

export default function NewsHubPage() {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsSummaryOutput>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAsset, setActiveAsset] = useState<string | undefined>(undefined);

  const loadNews = async (asset?: string) => {
    setIsLoading(true);
    try {
      const analyzedNews = await getMarketNewsAnalysis({ asset });
      setNews(analyzedNews);
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

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish':
        return { color: 'text-[#16835B]', bg: 'bg-[#16835B]/5', icon: TrendingUp, border: 'border-[#16835B]' };
      case 'Bearish':
        return { color: 'text-[#C43D3D]', bg: 'bg-[#C43D3D]/5', icon: TrendingDown, border: 'border-[#C43D3D]' };
      default:
        return { color: 'text-[#6B7280]', bg: 'bg-[#F7F7F5]', icon: Minus, border: 'border-[#E4E4E4]' };
    }
  };

  return (
    <AuthedLayout 
      title={t('nav.news')} 
      subtitle="AI-Powered Financial Intelligence Hub"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Intelligence Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-[#E4E4E4] p-4 shadow-sm">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search news by asset (e.g. BTC, Gold, EUR)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF] transition-all"
            />
          </form>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase bg-[#0055FF]/5 border border-[#0055FF]/20 px-3 py-1.5 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>AI Analysis Enabled</span>
            </div>
            <button 
              onClick={() => { setSearchQuery(""); setActiveAsset(undefined); loadNews(); }}
              className="p-2 border border-[#E4E4E4] bg-white hover:bg-[#F7F7F5] transition-colors"
              title="Refresh Intelligence Feed"
            >
              <Clock className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {activeAsset && (
          <div className="flex items-center space-x-2 px-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Filtering for:</span>
            <span className="bg-[#0A0A0A] text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">{activeAsset}</span>
            <button onClick={() => { setSearchQuery(""); setActiveAsset(undefined); loadNews(); }} className="text-[10px] font-bold text-[#0055FF] uppercase hover:underline ml-2">Clear Filter</button>
          </div>
        )}

        {/* Intelligence Feed */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A0A0A] block">Synchronizing Global Feed</span>
                <p className="text-[10px] text-[#6B7280] mt-1 uppercase font-bold">Applying AI Sentiment Matrix...</p>
              </div>
            </div>
          ) : news.length === 0 ? (
            <Card className="p-20 text-center border-dashed border-2 bg-white">
              <Newspaper className="w-12 h-12 text-[#E4E4E4] mx-auto mb-4" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">No Intelligence Detected</h3>
              <p className="text-xs text-[#6B7280] max-w-xs mx-auto mt-2 leading-relaxed">
                We couldn't find any significant news records for <span className="font-bold text-[#0A0A0A]">"{activeAsset}"</span> in the current session. Try a broader search.
              </p>
              <button onClick={() => { setSearchQuery(""); setActiveAsset(undefined); loadNews(); }} className="mt-6 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline">View General Markets Feed</button>
            </Card>
          ) : (
            <div className="space-y-4">
              {news.map((item) => {
                const styles = getSentimentStyles(item.sentiment);
                const Icon = styles.icon;
                return (
                  <Card key={item.id} className="bg-white border-[#E4E4E4] p-6 hover:border-[#0055FF] transition-all group shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Sentiment & Metadata Sidebar */}
                      <div className="lg:w-48 shrink-0 space-y-4 border-b lg:border-b-0 lg:border-r border-[#E4E4E4] pb-4 lg:pb-0 lg:pr-6">
                        <div className={cn(
                          "px-3 py-2 border flex items-center justify-center space-x-2 shadow-sm",
                          styles.color, styles.bg, styles.border
                        )}>
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{item.sentiment}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[9px] font-bold uppercase text-[#6B7280] tracking-wider">
                            <span>Source</span>
                            <span className="text-[#0A0A0A]">{item.source}</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-bold uppercase text-[#6B7280] tracking-wider">
                            <span>Time</span>
                            <span className="text-[#0A0A0A]">{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-bold uppercase text-[#6B7280] tracking-wider">
                            <span>Date</span>
                            <span className="text-[#0A0A0A]">{new Date(item.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-grow space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <h2 className="text-lg font-bold text-[#0A0A0A] leading-tight group-hover:text-[#0055FF] transition-colors">
                            {item.title}
                          </h2>
                          <div className="p-1.5 border border-[#E4E4E4] bg-[#F7F7F5] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <BarChart2 className="w-4 h-4 text-[#0055FF]" />
                          </div>
                        </div>

                        <p className="text-sm text-[#333333] leading-relaxed">
                          {item.summary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="bg-[#F7F7F5] border-l-4 border-[#0055FF] p-4 space-y-2 shadow-sm">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-3 h-3 text-[#0055FF]" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#0055FF]">Impact Assessment</span>
                            </div>
                            <p className="text-[11px] font-bold text-[#0A0A0A] uppercase leading-snug">
                              {item.impact}
                            </p>
                          </div>
                          
                          <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-4 flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">Platform Telemetry</span>
                              <span className="text-[8px] font-mono text-[#6B7280]">{item.id.substring(0,8).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E4E4E4]">
                              <span className="text-[10px] font-bold uppercase text-[#0A0A0A]">Deterministic Signal</span>
                              <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Intelligence Footer */}
        <div className="bg-[#0A0A0A] text-white p-8 border-b-4 border-[#0055FF] shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase tracking-widest">Global Intelligence Oversight</h4>
              <p className="text-[10px] text-[#9CA3AF] uppercase font-bold leading-relaxed max-w-xl">
                Intelligence data is derived from deterministic multi-source feeds and subjected to high-precision AI processing. Trading signals should be used for informational purposes only.
              </p>
            </div>
            <button className="px-8 py-3 bg-[#0055FF] hover:bg-white hover:text-[#0055FF] text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-md">
              Synchronize Data
            </button>
          </div>
        </div>

      </div>
    </AuthedLayout>
  );
}
