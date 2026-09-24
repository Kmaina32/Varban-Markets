
'use client';

/**
 * @fileOverview Administrative Support Inbox.
 * Displays and manages user contact messages from Firestore.
 */

import AuthedLayout from "@/components/layout/AuthedLayout";
import { Card } from "@/components/ui/card";
import { Mail, Search, Clock, Trash2, CheckCircle2, ChevronRight, User } from "lucide-react";
import { useTranslation } from "@/app/lib/i18n-context";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useState } from "react";
import { cn } from "@/app/lib/utils";

export default function AdminInbox() {
  const { t, formatDate } = useTranslation();
  const db = useFirestore();
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

  const { data: messages, loading } = useCollection<any>(
    db ? query(collection(db, "contact_messages"), orderBy("timestamp", "desc"), limit(50)) : null
  );

  const selectedMessage = messages?.find(m => m.id === selectedMsgId);

  const handleMarkRead = (id: string) => {
    if (!db) return;
    updateDoc(doc(db, "contact_messages", id), { status: "Read" });
  };

  const handleDelete = (id: string) => {
    if (!db || !window.confirm("Confirm deletion from support ledger?")) return;
    deleteDoc(doc(db, "contact_messages", id));
    if (selectedMsgId === id) setSelectedMsgId(null);
  };

  return (
    <AuthedLayout 
      title="Support Inbox" 
      subtitle="Institutional inquiry management and user assistance"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        
        {/* Message List Sidebar */}
        <Card className="bg-white border-[#E4E4E4] flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              <input 
                type="text" 
                placeholder="Filter inquiries..." 
                className="w-full bg-white border border-[#E4E4E4] text-[10px] pl-9 pr-4 py-2 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto divide-y divide-[#E4E4E4] no-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-[#6B7280] text-[10px] font-mono">Synchronizing Inbox...</div>
            ) : messages?.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280] text-[10px]">Inbox clear. No active inquiries.</div>
            ) : messages?.map((msg: any) => (
              <button 
                key={msg.id}
                onClick={() => { setSelectedMsgId(msg.id); handleMarkRead(msg.id); }}
                className={cn(
                  "w-full text-left p-4 hover:bg-[#F7F7F5] transition-colors border-l-2",
                  selectedMsgId === msg.id ? "bg-[#F7F7F5] border-[#0055FF]" : "border-transparent",
                  msg.status === 'New' ? "bg-[#0055FF]/5" : ""
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn("text-[10px] font-bold uppercase truncate max-w-[150px]", msg.status === 'New' ? "text-[#0055FF]" : "text-[#0A0A0A]")}>
                    {msg.fullName}
                  </span>
                  <span className="text-[8px] font-mono text-[#6B7280]">
                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleDateString() : '---'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#0A0A0A] truncate">{msg.topic}</p>
                <p className="text-[10px] text-[#6B7280] truncate mt-1">{msg.message}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Message Content Area */}
        <Card className="lg:col-span-2 bg-white border-[#E4E4E4] flex flex-col overflow-hidden shadow-sm">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-[#0A0A0A]">{selectedMessage.topic}</h3>
                  <div className="flex items-center space-x-3 text-[10px] text-[#6B7280] mt-1">
                    <span className="font-bold text-[#0A0A0A]">{selectedMessage.fullName}</span>
                    <span>&bull;</span>
                    <span className="font-mono">{selectedMessage.email}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 border border-[#E4E4E4] bg-white hover:text-[#C43D3D] transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.topic}`}
                    className="px-4 py-2 bg-[#0055FF] text-white text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-[#0A0A0A] transition-colors"
                  >
                    Reply
                  </a>
                </div>
              </div>

              <div className="p-8 flex-grow overflow-y-auto no-scrollbar">
                <div className="max-w-3xl space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-[10px]">
                      {selectedMessage.fullName.charAt(0)}
                    </div>
                    <div className="flex-grow">
                      <div className="bg-[#F7F7F5] border border-[#E4E4E4] p-6 text-xs leading-relaxed text-[#0A0A0A] whitespace-pre-wrap">
                        {selectedMessage.message}
                      </div>
                      <div className="mt-2 text-[9px] text-[#6B7280] flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>Transmitted: {selectedMessage.timestamp?.toDate ? formatDate(selectedMessage.timestamp.toDate()) : '---'}</span>
                        <span>&bull;</span>
                        <span className="uppercase">User ID: {selectedMessage.userId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-[#E4E4E4] bg-[#F7F7F5] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#6B7280]">Inquiry Reference: {selectedMessage.id.toUpperCase()}</span>
                <span className={cn(
                  "px-2 py-0.5 border text-[8px] font-bold uppercase tracking-widest",
                  selectedMessage.status === 'New' ? "border-[#0055FF] text-[#0055FF]" : "border-[#16835B] text-[#16835B]"
                )}>
                  {selectedMessage.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
              <Mail className="w-12 h-12 text-[#E4E4E4]" />
              <div>
                <h3 className="text-sm font-bold uppercase text-[#0A0A0A]">No message selected</h3>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mt-1">Select an inquiry from the list to view full telemetry</p>
              </div>
            </div>
          )}
        </Card>

      </div>
    </AuthedLayout>
  );
}
