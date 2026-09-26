'use client';

/**
 * @fileOverview Institutional Market News Feed Component.
 * Displays raw financial news headlines without AI processing.
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Newspaper, Clock, ExternalLink, Loader2, BarChart2 } from 'lucide-react';
import { fetchMarketNews, NewsItem } from '@/app/lib/news-service';
import { cn } from '@/app/lib/utils';

export default function MarketNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsItems = await fetchMarketNews();
        setNews(newsItems.slice(0, 5));
      } catch (err) {
        console.error("Dashboard news sync failure:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  return (
    <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-4 h-4 text-[#0055FF]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Market News</h3>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 text-[#0055FF] animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Loading Headlines...</span>
          </div>
        ) : news.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280]">
            <p className="text-[10px] font-bold uppercase tracking-wider">No recent headlines found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E4]">
            {news.map((item) => (
              <div key={item.uuid} className="p-5 hover:bg-[#F7F7F5] transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] text-[#6B7280] font-mono uppercase tracking-tighter font-bold">
                    {item.publisher}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[8px] text-[#6B7280] font-bold uppercase">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <h4 className="text-[11px] font-bold text-[#0A0A0A] leading-tight mb-2 group-hover:text-[#0055FF] transition-colors">
                  {item.title}
                </h4>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F7F7F5]">
                   <span className="text-[8px] font-mono text-[#E4E4E4] uppercase">{item.uuid.substring(0,8)}</span>
                   <BarChart2 className="w-3.5 h-3.5 text-[#E4E4E4] group-hover:text-[#0055FF] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#E4E4E4] bg-[#F7F7F5] text-center">
        <button className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors flex items-center justify-center gap-1.5 mx-auto">
          <span>View Full News Hub</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
}
