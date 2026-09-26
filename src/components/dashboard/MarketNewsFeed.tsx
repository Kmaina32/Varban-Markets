'use client';

/**
 * @fileOverview Institutional Market News Feed Component.
 * Displays AI-analyzed financial news with sentiment indicators.
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Newspaper, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { getMarketNewsAnalysis, NewsSummaryOutput } from '@/ai/flows/market-news-flow';
import { cn } from '@/app/lib/utils';

export default function MarketNewsFeed() {
  const [news, setNews] = useState<NewsSummaryOutput>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const analyzedNews = await getMarketNewsAnalysis({});
        setNews(analyzedNews);
      } catch (err) {
        console.error("Dashboard news sync failure:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

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
    <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-4 h-4 text-[#0055FF]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Market Intelligence</h3>
        </div>
        <div className="flex items-center space-x-1 text-[8px] font-bold text-[#0055FF] uppercase bg-white border border-[#0055FF]/20 px-2 py-0.5 shadow-sm">
          <Sparkles className="w-2.5 h-2.5" />
          <span>AI Analyzed</span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 text-[#0055FF] animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Synchronizing Global Feed...</span>
          </div>
        ) : news.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280]">
            <p className="text-[10px] font-bold uppercase tracking-wider">No significant news detected in the current session.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E4]">
            {news.map((item) => {
              const styles = getSentimentStyles(item.sentiment);
              const Icon = styles.icon;
              return (
                <div key={item.id} className="p-5 hover:bg-[#F7F7F5] transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "px-2 py-0.5 text-[8px] font-bold uppercase border flex items-center gap-1",
                        styles.color, styles.bg, styles.border
                      )}>
                        <Icon className="w-2.5 h-2.5" />
                        {item.sentiment}
                      </span>
                      <span className="text-[9px] text-[#6B7280] font-mono uppercase tracking-tighter">
                        {item.source}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[9px] text-[#6B7280]">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <h4 className="text-[11px] font-bold text-[#0A0A0A] leading-tight mb-2 group-hover:text-[#0055FF] transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="text-[10px] text-[#6B7280] leading-relaxed mb-3">
                    {item.summary}
                  </p>

                  <div className="p-3 bg-[#F7F7F5] border-l-2 border-[#0055FF] space-y-1">
                    <span className="text-[8px] font-bold text-[#0055FF] uppercase tracking-widest block">Potential Impact</span>
                    <p className="text-[9px] text-[#0A0A0A] font-bold uppercase leading-snug">{item.impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#E4E4E4] bg-[#F7F7F5] text-center">
        <button className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors flex items-center justify-center gap-1.5 mx-auto">
          <span>View Full Registry</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
}
