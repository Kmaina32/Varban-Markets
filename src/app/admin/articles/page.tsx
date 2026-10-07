'use client';

/**
 * @fileOverview Admin Intelligence Desk.
 * Allows administrators to author market insights, strategies, and technical briefings.
 * Hardened against null database references and refactored to resolve syntax errors.
 */

import React, { useState, useMemo, useEffect } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  FileText, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Clock,
  AlertTriangle
} from "lucide-react";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "@/app/lib/i18n-context";
import { cn } from "@/app/lib/utils";

interface Article {
  id: string;
  title: string;
  body: string;
  category: 'Insight' | 'Strategy' | 'Market Update';
  assetTag: string;
  status: 'Draft' | 'Published';
  author: string;
  timestamp: any;
  updatedAt: any;
}

export default function AdminArticlesPage() {
  const { formatDate } = useTranslation();
  const db = useFirestore();
  const { user } = useUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load articles from Firestore (Guarded)
  const articlesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "articles"), orderBy("timestamp", "desc"));
  }, [db]);

  const { data: articles, loading } = useCollection<Article>(articlesQuery);

  const handleOpenCreate = () => {
    setEditingArticle({
      title: "",
      body: "",
      category: "Insight",
      assetTag: "",
      status: "Draft"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingArticle || isSaving) return;

    setIsSaving(true);
    try {
      const articlesRef = collection(db, "articles");
      const id = editingArticle.id || doc(articlesRef).id;
      
      await setDoc(doc(db, "articles", id), {
        ...editingArticle,
        id,
        author: editingArticle.author || user?.email || "Admin",
        timestamp: editingArticle.timestamp || serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setIsModalOpen(false);
      setEditingArticle(null);
    } catch (err) {
      console.error("Save failure:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!window.confirm("Confirm permanent removal?")) return;
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (err) {
      console.error("Delete failure:", err);
    }
  };

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    const queryLower = searchQuery.toLowerCase();
    return articles.filter(a => 
      (a.title || "").toLowerCase().includes(queryLower) || 
      (a.assetTag || "").toLowerCase().includes(queryLower)
    );
  }, [articles, searchQuery]);

  return (
    <AuthedLayout title="Intelligence Desk" subtitle="Author proprietary briefings and market strategies">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search briefings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF] shadow-sm"
            />
          </div>
          <button 
            onClick={handleOpenCreate}
            className="w-full md:w-auto bg-[#0A0A0A] text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm hover:bg-[#0055FF] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Briefing</span>
          </button>
        </div>

        <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Document</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Status</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">Published</th>
                  <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4] text-xs">
                {loading ? (
                  <tr><td colSpan={4} className="p-12 text-center text-[#6B7280] font-mono italic">Syncing Ledger...</td></tr>
                ) : filteredArticles.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-[#6B7280]">No active briefings detected.</td></tr>
                ) : filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="p-4">
                      <span className="font-bold block text-[#0A0A0A] truncate max-w-xs">{article.title}</span>
                      <span className="text-[9px] text-[#6B7280] font-mono">REF: {article.id.slice(0, 8)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 border text-[9px] font-bold uppercase",
                        article.status === 'Published' ? "border-[#16835B] text-[#16835B] bg-[#16835B]/5" : "border-[#6B7280] text-[#6B7280] bg-[#F7F7F5]"
                      )}>
                        {article.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[#6B7280] font-mono text-[10px]">
                      {article.timestamp?.toDate ? formatDate(article.timestamp.toDate()) : 'Draft'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleOpenEdit(article)} className="p-1.5 border border-[#E4E4E4] bg-white hover:text-[#0055FF]"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(article.id)} className="p-1.5 border border-[#E4E4E4] bg-white hover:text-[#C43D3D]"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {!db && (
          <div className="p-4 bg-[#C43D3D]/5 border border-[#C43D3D]/20 flex items-center space-x-3">
            <AlertTriangle className="w-4 h-4 text-[#C43D3D]" />
            <p className="text-[10px] font-bold text-[#C43D3D] uppercase tracking-widest">
              Firebase Node Offline: Synchronize Supabase connection to enable authoring.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && editingArticle && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5]">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Briefing Editor</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#0A0A0A]"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Title</label>
                <input required value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} className="w-full text-xs p-3 border border-[#E4E4E4] outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Content</label>
                <textarea required rows={8} value={editingArticle.body} onChange={e => setEditingArticle({...editingArticle, body: e.target.value})} className="w-full text-xs p-4 border border-[#E4E4E4] outline-none" />
              </div>
              <button type="submit" disabled={isSaving || !db} className="w-full btn-institutional-primary py-4">
                {isSaving ? "Authorizing..." : "Finalize Briefing"}
              </button>
            </form>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
