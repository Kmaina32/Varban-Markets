
'use client';

/**
 * @fileOverview Admin Intelligence Desk.
 * Allows administrators to author market insights, strategies, and technical briefings.
 */

import { useState, useMemo } from "react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  FileText, 
  Edit3, 
  Trash2, 
  Globe, 
  Eye, 
  X, 
  Save, 
  CheckCircle2, 
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

  // Load articles from Firestore
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
    const id = editingArticle.id || doc(collection(db, "articles")).id;

    try {
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
      alert("Handshake Failure: Could not synchronize article state.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !window.confirm("Confirm permanent removal of this briefing from the intelligence registry?")) return;
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (err) {
      alert("Authority Failure: Could not delete record.");
    }
  };

  const filteredArticles = articles?.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.assetTag.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AuthedLayout title="Intelligence Desk" subtitle="Author proprietary briefings and market strategies">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Search briefings by title or asset tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E4E4E4] text-xs focus:outline-none focus:border-[#0055FF] shadow-sm"
            />
          </div>
          <button 
            onClick={handleOpenCreate}
            className="w-full md:w-auto bg-[#0055FF] text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm hover:bg-[#0A0A0A] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Briefing</span>
          </button>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-white border-[#E4E4E4] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F7F7F5] border-b border-[#E4E4E4]">
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Document</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Category</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">Asset</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Status</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-right">Published</th>
                    <th className="p-4 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E4] text-xs">
                  {loading ? (
                    <tr><td colSpan={6} className="p-12 text-center text-[#6B7280] font-mono italic">Accessing Intelligence Registry...</td></tr>
                  ) : filteredArticles.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-[#6B7280]">No briefings detected in current search scope.</td></tr>
                  ) : filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-[#F7F7F5] transition-colors group">
                      <td className="p-4">
                        <span className="font-bold block text-[#0A0A0A] truncate max-w-xs">{article.title}</span>
                        <span className="text-[9px] text-[#6B7280] uppercase font-mono tracking-tighter">ID: {article.id.slice(0, 10)}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-[#F7F7F5] border border-[#E4E4E4] text-[9px] font-bold uppercase text-[#0A0A0A]">
                          {article.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[#0055FF] font-bold">{article.assetTag || "GLOBAL"}</span>
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
                          <button 
                            onClick={() => handleOpenEdit(article)}
                            className="p-1.5 border border-[#E4E4E4] bg-white text-[#6B7280] hover:text-[#0055FF] transition-colors shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(article.id)}
                            className="p-1.5 border border-[#E4E4E4] bg-white text-[#6B7280] hover:text-[#C43D3D] transition-colors shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="p-4 bg-[#F7F7F5] border border-[#E4E4E4] flex items-start space-x-3 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
            Proprietary briefings authored here propagate to all trader news feeds instantly upon publishing. Ensure all data citations are verified against institutional sources.
          </p>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingArticle && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl bg-white border-[#E4E4E4] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E4E4E4] flex justify-between items-center bg-[#F7F7F5] shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0055FF]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
                  Briefing Editor
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-grow no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Article Title</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    className="w-full text-xs p-3 border border-[#E4E4E4] bg-white focus:outline-none focus:border-[#0055FF]"
                    placeholder="e.g. BTC Market Dynamics Q3 Technical Update"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Category</label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value as any })}
                    className="w-full text-xs p-3 border border-[#E4E4E4] bg-[#F7F7F5] focus:outline-none appearance-none"
                  >
                    <option value="Insight">Insight</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Market Update">Market Update</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Primary Asset Tag</label>
                  <input
                    type="text"
                    value={editingArticle.assetTag}
                    onChange={(e) => setEditingArticle({ ...editingArticle, assetTag: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-3 border border-[#E4E4E4] bg-white focus:outline-none focus:border-[#0055FF] font-mono"
                    placeholder="e.g. BTC, EUR/USD"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] block mb-1.5">Briefing Body (Full Content)</label>
                <textarea
                  required
                  rows={10}
                  value={editingArticle.body}
                  onChange={(e) => setEditingArticle({ ...editingArticle, body: e.target.value })}
                  className="w-full text-xs p-4 border border-[#E4E4E4] bg-white focus:outline-none focus:border-[#0055FF] leading-relaxed"
                  placeholder="Draft your professional market analysis here..."
                ></textarea>
              </div>

              <div className="p-4 border border-[#E4E4E4] bg-[#F7F7F5] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase block text-[#0A0A0A]">Visibility Status</span>
                  <p className="text-[8px] text-[#6B7280] uppercase tracking-wider">Controls broadcast to trader terminals</p>
                </div>
                <div className="flex bg-white border border-[#E4E4E4] rounded-none overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setEditingArticle({...editingArticle, status: 'Draft'})}
                    className={cn(
                      "px-4 py-2 text-[9px] font-bold uppercase transition-colors",
                      editingArticle.status === 'Draft' ? "bg-[#0A0A0A] text-white" : "text-[#6B7280] hover:bg-[#F7F7F5]"
                    )}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingArticle({...editingArticle, status: 'Published'})}
                    className={cn(
                      "px-4 py-2 text-[9px] font-bold uppercase transition-colors border-l",
                      editingArticle.status === 'Published' ? "bg-[#16835B] text-white border-[#16835B]" : "text-[#6B7280] hover:bg-[#F7F7F5]"
                    )}
                  >
                    Publish
                  </button>
                </div>
              </div>
            </form>

            <div className="p-5 border-t border-[#E4E4E4] flex justify-end items-center bg-[#F7F7F5] gap-4 shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-[#0A0A0A]"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#0A0A0A] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 shadow-md hover:bg-[#0055FF] transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Synchronizing..." : "Save Record"}</span>
              </button>
            </div>
          </Card>
        </div>
      )}
    </AuthedLayout>
  );
}
