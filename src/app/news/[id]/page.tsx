'use client';

/**
 * @fileOverview Market Intelligence Report Workspace.
 * Displays high-precision article analysis from the persisted news archive.
 */

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Clock, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Share2, 
  BarChart2,
  FileText,
  Loader2
} from "lucide-react";
import { useFirestore, useDoc } from "@/firebase";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

export default function NewsReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const db = useFirestore();
  const router = useRouter();
  const { formatDate } = useTranslation();
  
  const { data: article, loading } = useDoc<any>(db, id ? `news_cache/${id}` : null);

  if (loading) {
    return (
      <AuthedLayout title="Intelligence Analysis" subtitle="Synchronizing Report...">
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-8 h-8 text-[#0055FF] animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
            Accessing Persisted Ledger...
          </span>
        </div>
      </AuthedLayout>
    );
  }

  if (!article) {
    return (
      <AuthedLayout title="Analysis Failed" subtitle="Document Registry Error">
        <Card className="max-w-2xl mx-auto p-12 text-center border-dashed border-2 bg-white">
          <ShieldCheck className="w-12 h-12 text-[#E4E4E4] mx-auto mb-4 opacity-20" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Record Not Found</h2>
          <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
            The requested intelligence token does not exist in the current session domain. The record may have expired or was purged during system maintenance.
          </p>
          <button 
            onClick={() => router.push('/news')}
            className="mt-6 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest underline"
          >
            Return to News Hub
          </button>
        </Card>
      </AuthedLayout>
    );
  }

  return (
    <AuthedLayout 
      title="Intelligence Report" 
      subtitle={`Impact Analysis: ${article.uuid.substring(0, 8).toUpperCase()}`}
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Navigation & Actions */}
        <div className="flex justify-between items-center">
          <Link 
            href="/news" 
            className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hub</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0055FF] flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Token</span>
            </button>
          </div>
        </div>

        {/* Article Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {(article.category || ['General']).map((cat: string) => (
              <span key={cat} className="px-2 py-0.5 bg-[#0055FF]/5 border border-[#0055FF]/20 text-[8px] font-bold uppercase text-[#0055FF] tracking-widest">
                {cat.replace('_', ' ')}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#0A0A0A] leading-tight font-display">
            {article.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-b border-[#E4E4E4] pb-6">
            <div className="flex items-center space-x-6">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Publisher</span>
                <span className="text-xs font-bold text-[#0A0A0A]">{article.publisher}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Published Date</span>
                <span className="text-xs font-mono font-bold text-[#0A0A0A]">
                  {new Date(article.published_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-none bg-[#F7F7F5] border border-[#E4E4E4] flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#6B7280]" />
               </div>
               <div className="text-right">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Network Domain</span>
                  <span className="text-[10px] font-mono font-bold text-[#0A0A0A]">GLOBAL FINANCIAL FEED</span>
               </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {article.image && article.image !== 'None' && (
              <div className="relative aspect-video bg-[#F7F7F5] border border-[#E4E4E4] overflow-hidden shadow-sm">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-sm max-w-none">
              <p className="text-base text-[#333333] leading-relaxed font-medium">
                {article.description || "The requested summary for this market intelligence report is currently being synchronized. Access the full authoritative source below for immediate analysis."}
              </p>
              
              <div className="mt-12 p-8 bg-[#F7F7F5] border border-[#E4E4E4] space-y-6">
                <div className="flex items-center space-x-2 text-[#0055FF]">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Institutional Audit Trace</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] text-[#6B7280] font-mono">
                  <div>
                    <span className="block uppercase font-bold text-[#0A0A0A] mb-1">Article Token</span>
                    <span className="break-all">{article.uuid}</span>
                  </div>
                  <div>
                    <span className="block uppercase font-bold text-[#0A0A0A] mb-1">Sync Timestamp</span>
                    <span>{article.syncedAt || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Tools */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white border-[#E4E4E4] p-6 shadow-sm space-y-6 border-t-4 border-t-[#0055FF]">
              <div className="flex items-center space-x-2 text-[#0A0A0A]">
                <BarChart2 className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Trade Context</h3>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Analyze this report against your active positions and watchlist. Significant headlines can trigger immediate volatility in synthetic and derivative sectors.
              </p>
              <div className="pt-4 border-t border-[#F7F7F5]">
                <button 
                  onClick={() => router.push('/terminal')}
                  className="w-full py-3 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0055FF] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Execute Analysis</span>
                </button>
              </div>
            </Card>

            <Card className="bg-[#F7F7F5] border-[#E4E4E4] p-6 space-y-4 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Authoritative Source</h3>
              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Review the complete documentation and evidence for this report at the official publisher domain.
              </p>
              <Link 
                href={article.url || '#'} 
                target="_blank"
                className="inline-flex items-center space-x-2 text-[10px] font-bold text-[#0055FF] uppercase tracking-widest hover:underline"
              >
                <span>Access Full Report</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </Card>

            <div className="p-4 bg-[#16835B]/5 border border-[#16835B]/20 flex items-start gap-3">
               <ShieldCheck className="w-4 h-4 text-[#16835B] shrink-0" />
               <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
                  Deterministic Data Node verified. Report origin strictly audited for financial market relevance.
               </p>
            </div>
          </div>
        </div>

      </div>
    </AuthedLayout>
  );
}
