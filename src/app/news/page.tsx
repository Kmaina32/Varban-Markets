'use client';

/**
 * @fileOverview News Hub Workspace.
 * Professional financial news feed with integrated category filters and internal reading conduit.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Newspaper, 
  Search, 
  Loader2, 
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Globe,
  Filter
} from "lucide-react";
import { fetchMarketNews, NewsItem } from "@/app/lib/news-service";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";
import PageTutorial, { TutorialStep } from "@/components/shared/PageTutorial";

const CATEGORIES = [
  { id: 'all', label: 'Global Feed' },
  { id: 'forex', label: 'Forex' },
  { id: 'crypto', label: 'Digital Assets' },
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'geopolitics', label: 'Geopolitics' },
  { id: 'commodity', label: 'Commodities' }
];

export default function NewsHubPage() {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState('all');

  const loadNews = useCallback(async (query?: string, category?: string, silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    
    try {
      // Logic for fetching with query and category handled by the proxy
      const endpoint = `/api/news?${query ? `query=${encodeURIComponent(query)}&` : ''}${category ? `category=${category}` : ''}`;
      const res = await fetch(endpoint);
      const json = await res.json();
      
      if (!res.ok) {
        setError({ code: json.status || res.status.toString(), message: json.msg || "Unable to synchronize news feed." });
      } else {
        setNews(json.data || []);
      }
    } catch (err) {
      setError({ code: "500", message: "Unexpected synchronization failure." });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNews(searchQuery || undefined, activeCategory);
  }, [activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadNews(searchQuery.trim() || undefined, activeCategory);
  };

  const tutorialSteps: TutorialStep[] = [
    {
      selector: "#tour-news-banner",
      title: "Live Intelligence",
      description: "Monitor high-precision headlines from global financial data nodes."
    },
    {
      selector: "#tour-news-categories",
      title: "Sector Filters",
      description: "Filter headlines by market domain to focus on your preferred trading assets."
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
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Market Intelligence</span>
              {isRefreshing && (
                <span className="flex items-center gap-1.5 text-[8px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Syncing
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Global Trading Feed</h1>
          </div>
          <button 
            onClick={() => loadNews(searchQuery, activeCategory)}
            disabled={isLoading || isRefreshing}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border border-white/20 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
            <span>Refresh Hub</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div id="tour-news-categories" className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2 pr-4 border-r border-[#E4E4E4] mr-2 shrink-0">
             <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
             <span className="text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">Sectors:</span>
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap",
                activeCategory === cat.id 
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-sm" 
                  : "bg-white text-[#6B7280] border-[#E4E4E4] hover:bg-[#F7F7F5] hover:text-[#0A0A0A]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <Card className="bg-white border-[#E4E4E4] p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input 
                type="text" 
                placeholder="Search asset intelligence (e.g. BTC, Trump, Oil)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F7F7F5] border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF]"
              />
            </div>
            <button 
              type="submit" 
              className="px-8 py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-colors"
            >
              Update Search
            </button>
          </form>
        </Card>

        {error ? (
          <Card className="p-12 border-dashed border-2 bg-white flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 bg-[#C43D3D]/10 border border-[#C43D3D] flex items-center justify-center rounded-none">
              <AlertTriangle className="w-6 h-6 text-[#C43D3D]" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Sync Interrupted</h3>
              <p className="text-xs text-[#6B7280] mt-2 max-w-md mx-auto">{error.message}</p>
            </div>
            <button 
              onClick={() => loadNews(searchQuery, activeCategory)}
              className="px-6 py-2 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-colors"
            >
              Retry Handshake
            </button>
          </Card>
        ) : isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Accessing Global Intelligence Nodes...</span>
          </div>
        ) : news.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-2 bg-white">
            <Newspaper className="w-12 h-12 text-[#E4E4E4] mx-auto mb-4 opacity-20" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">No Intelligence Records Detected</h3>
            <p className="text-[10px] text-[#6B7280] uppercase mt-1">Try broadening your search query or sector</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {news.map((item) => (
              <Card key={item.uuid} className="bg-white border-[#E4E4E4] p-6 hover:border-[#0055FF] transition-all group shadow-sm">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-48 shrink-0 border-b lg:border-b-0 lg:border-r border-[#E4E4E4] pb-4 lg:pb-0 lg:pr-6">
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">Source</span>
                        <span className="text-xs font-bold text-[#0A0A0A] truncate">{item.publisher}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-[#6B7280] tracking-widest">Time</span>
                        <span className="text-xs font-mono text-[#0A0A0A]">{new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                         <Globe className="w-2.5 h-2.5 text-[#0055FF]" />
                         <span className="text-[8px] font-bold uppercase text-[#0055FF]">Verified Feed</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow space-y-3">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(item.category || ['Market Update']).slice(0, 3).map((cat) => (
                        <span key={cat} className="px-1.5 py-0.5 bg-[#F7F7F5] border border-[#E4E4E4] text-[8px] font-bold uppercase text-[#6B7280]">
                          {cat.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-lg font-bold text-[#0A0A0A] leading-tight group-hover:text-[#0055FF] transition-colors line-clamp-2">{item.title}</h2>
                    <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#F7F7F5]">
                      <Link href={`/news/${item.uuid}`} className="text-[10px] font-bold uppercase tracking-widest bg-[#0A0A0A] text-white px-4 py-2 hover:bg-[#0055FF] transition-all flex items-center gap-2 shadow-sm">
                        <span>Analyze Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthedLayout>
  );
}
