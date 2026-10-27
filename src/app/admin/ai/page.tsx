'use client';

/**
 * @fileOverview AI Command Center (Admin).
 * View all conversations, settings, and handle Human Takeover.
 */

import React, { useState, useMemo, useEffect } from 'react';
import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  MessageSquare, 
  User, 
  Power, 
  Settings, 
  ShieldCheck, 
  Search, 
  Loader2, 
  ArrowRight,
  Send,
  Lock,
  Pause,
  Play
} from "lucide-react";
import { useFirestore, useUser, useCollection, useDoc } from "@/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp, 
  setDoc 
} from "firebase/firestore";
import { cn } from "@/app/lib/utils";
import { useTranslation } from "@/app/lib/i18n-context";

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  status: 'ai' | 'human' | 'closed';
  updatedAt: any;
}

export default function AdminAICenter() {
  const db = useFirestore();
  const { user: admin } = useUser();
  const { formatDate } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'CHATS' | 'SETTINGS'>('CHATS');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 1. Conversations List
  const convsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "conversations"), orderBy("updatedAt", "desc"), limit(20));
  }, [db]);
  const { data: conversations, loading: convsLoading } = useCollection<Conversation>(convsQuery);

  // 2. Active Chat Messages
  const messagesQuery = useMemo(() => {
    if (!db || !selectedConvId) return null;
    return query(collection(db, `conversations/${selectedConvId}/messages`), orderBy("timestamp", "asc"), limit(50));
  }, [db, selectedConvId]);
  const { data: messages } = useCollection<any>(messagesQuery);

  // 3. AI Config
  const { data: aiConfig, loading: configLoading } = useDoc<any>(db, "settings/ai_config");
  const [configForm, setForm] = useState({
    systemPrompt: "",
    enabled: true
  });

  useEffect(() => {
    if (aiConfig) {
      setForm({
        systemPrompt: aiConfig.systemPrompt || "",
        enabled: aiConfig.enabled ?? true
      });
    }
  }, [aiConfig]);

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedConvId || !db || !admin) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, `conversations/${selectedConvId}/messages`), {
        role: 'model', // Admins reply as the model role in the UI for consistent display
        content: adminReply.trim(),
        timestamp: serverTimestamp(),
        isAdmin: true,
        adminEmail: admin.email
      });
      await updateDoc(doc(db, "conversations", selectedConvId), {
        lastMessage: adminReply.trim(),
        updatedAt: serverTimestamp()
      });
      setAdminReply("");
    } catch (e) {
      console.error("Transmission Error:", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleTakeover = async () => {
    if (!selectedConvId || !db || !selectedConv) return;
    const newStatus = selectedConv.status === 'human' ? 'ai' : 'human';
    await updateDoc(doc(db, "conversations", selectedConvId), { status: newStatus });
  };

  const handleSaveConfig = async () => {
    if (!db) return;
    await setDoc(doc(db, "settings", "ai_config"), configForm, { merge: true });
    alert("AI Configuration synchronized.");
  };

  return (
    <AuthedLayout 
      title="AI Command Center" 
      subtitle="Oversight for generative intelligence and trader assistance"
    >
      <div className="space-y-6 h-[calc(100vh-180px)] flex flex-col">
        {/* Navigation */}
        <div className="flex border-b border-[#E4E4E4] bg-white shrink-0">
          <button 
            onClick={() => setActiveTab('CHATS')}
            className={cn(
              "px-8 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all",
              activeTab === 'CHATS' ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]"
            )}
          >
            Live Conversations
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={cn(
              "px-8 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all",
              activeTab === 'SETTINGS' ? "border-[#0055FF] text-[#0055FF] bg-[#0055FF]/5" : "border-transparent text-[#6B7280] hover:bg-[#F7F7F5]"
            )}
          >
            AI Engine Settings
          </button>
        </div>

        <div className="flex-grow min-h-0">
          {activeTab === 'CHATS' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Sidebar: Conv List */}
              <Card className="lg:col-span-4 bg-white border-[#E4E4E4] flex flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#F7F7F5] bg-[#F7F7F5]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                    <input placeholder="Filter traders..." className="w-full pl-9 py-2 text-[10px] uppercase font-bold border border-[#E4E4E4] bg-white outline-none focus:border-[#0055FF]" />
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar divide-y divide-[#F7F7F5]">
                  {convsLoading ? (
                    <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0055FF]" /></div>
                  ) : conversations.length === 0 ? (
                    <div className="p-10 text-center text-[10px] font-bold uppercase text-[#D1D5DB]">No active sessions</div>
                  ) : conversations.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setSelectedConvId(c.id)}
                      className={cn(
                        "w-full text-left p-5 transition-all group flex items-start gap-4",
                        selectedConvId === c.id ? "bg-[#0055FF]/5 border-l-4 border-l-[#0055FF]" : "border-l-4 border-l-transparent hover:bg-[#F7F7F5]"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {c.userName.charAt(0)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold uppercase text-[#0A0A0A] truncate">{c.userName}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 border text-[8px] font-bold uppercase",
                            c.status === 'human' ? "bg-[#C43D3D] text-white border-[#C43D3D]" : "bg-[#16835B]/10 text-[#16835B] border-[#16835B]"
                          )}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] truncate">{c.lastMessage}</p>
                        <span className="text-[8px] text-[#D1D5DB] font-mono block mt-1">{c.updatedAt?.toDate ? formatDate(c.updatedAt.toDate()) : 'Active'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Main: Chat View */}
              <Card className="lg:col-span-8 bg-white border-[#E4E4E4] flex flex-col overflow-hidden shadow-sm relative">
                {selectedConv ? (
                  <>
                    <div className="p-5 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#0055FF] text-white flex items-center justify-center font-bold text-[10px]">
                            {selectedConv.userName.charAt(0)}
                         </div>
                         <div>
                            <h4 className="text-[11px] font-bold uppercase text-[#0A0A0A] tracking-tight">{selectedConv.userName}</h4>
                            <span className="text-[8px] text-[#6B7280] uppercase tracking-widest font-mono">UID: {selectedConv.userId.slice(0,10)}</span>
                         </div>
                      </div>
                      
                      <button 
                        onClick={handleToggleTakeover}
                        className={cn(
                          "px-4 py-2 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border transition-all",
                          selectedConv.status === 'human' 
                            ? "bg-[#16835B] text-white border-[#16835B]" 
                            : "bg-white text-[#C43D3D] border-[#C43D3D] hover:bg-[#C43D3D] hover:text-white"
                        )}
                      >
                        {selectedConv.status === 'human' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        <span>{selectedConv.status === 'human' ? "Resume AI Mode" : "Takeover Session"}</span>
                      </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar bg-[#F7F7F5]/30">
                      {messages?.map((msg: any) => (
                        <div key={msg.id} className={cn(
                          "max-w-[85%] p-4 text-[11px] leading-relaxed border shadow-sm",
                          msg.role === 'user' 
                            ? "ml-auto bg-white border-[#E4E4E4] text-[#0A0A0A]" 
                            : "mr-auto bg-[#0055FF] text-white border-[#0055FF]"
                        )}>
                          {msg.content}
                          {msg.isAdmin && (
                            <div className="mt-2 pt-2 border-t border-white/20 text-[8px] font-bold uppercase opacity-80 flex justify-between">
                              <span>Manual Response</span>
                              <span>{msg.adminEmail}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-[#E4E4E4] bg-white">
                      <form onSubmit={handleSendAdminMessage} className="relative">
                        <input 
                          disabled={selectedConv.status !== 'human'}
                          value={adminReply}
                          onChange={e => setAdminReply(e.target.value)}
                          placeholder={selectedConv.status === 'human' ? "Type manual response..." : "Human Mode required for manual response"}
                          className="w-full p-4 pr-12 border-2 border-[#0A0A0A] text-xs font-bold outline-none focus:border-[#0055FF] disabled:opacity-20 disabled:grayscale"
                        />
                        <button 
                          disabled={!adminReply.trim() || isSending || selectedConv.status !== 'human'}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0055FF] disabled:opacity-20"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30 grayscale p-12 text-center">
                     <MessageSquare className="w-16 h-16 text-[#0055FF]" />
                     <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Select Conversation</h4>
                        <p className="text-[10px] text-[#6B7280] max-w-xs mx-auto">Monitor live trader telemetry and handle handovers from this command bridge.</p>
                     </div>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="p-8 bg-white border-[#E4E4E4] shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-[#F7F7F5] pb-4">
                  <Settings className="w-5 h-5 text-[#0055FF]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Universal Engine Personality</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F7F7F5] border border-[#E4E4E4]">
                    <div>
                      <span className="text-[10px] font-bold uppercase block text-[#0A0A0A]">AI Node Status</span>
                      <p className="text-[9px] text-[#6B7280]">Enable or disable the Varban Assistant globally.</p>
                    </div>
                    <button 
                      onClick={() => setForm({...configForm, enabled: !configForm.enabled})}
                      className={cn(
                        "p-2 border transition-all",
                        configForm.enabled ? "bg-[#16835B] text-white border-[#16835B]" : "bg-[#6B7280] text-white border-[#6B7280]"
                      )}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">Core System Prompt</label>
                    <textarea 
                      rows={10}
                      value={configForm.systemPrompt}
                      onChange={e => setForm({...configForm, systemPrompt: e.target.value})}
                      className="w-full p-4 border border-[#E4E4E4] bg-[#F7F7F5] text-[11px] font-medium leading-relaxed outline-none focus:border-[#0055FF]"
                      placeholder="You are the Varban Markets AI Assistant..."
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveConfig}
                  className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#0055FF] transition-all"
                >
                  Synchronize Engine State
                </button>
              </Card>

              <div className="p-6 bg-[#0055FF]/5 border border-[#0055FF]/20 flex items-start gap-4">
                 <ShieldCheck className="w-6 h-6 text-[#0055FF] shrink-0" />
                 <p className="text-[10px] text-[#6B7280] leading-relaxed uppercase font-bold">
                   Platform intelligence configurations are logged in the cryptographic audit ledger. Changes to the system prompt will propagate to new user turns instantly.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthedLayout>
  );
}