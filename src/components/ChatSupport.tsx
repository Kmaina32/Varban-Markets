'use client';

/**
 * @fileOverview Refined Varban Assistant AI.
 * Persists history to Firestore for Admin monitoring and takeover.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, Loader2, MessageSquare, ChevronDown, GripVertical, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { supportChat } from '@/ai/flows/support-chat-flow';
import { useTranslation } from '@/app/lib/i18n-context';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { 
  Message, 
  MessageAvatar, 
  MessageContent, 
  MessageHeader,
  MessageFooter
} from '@/components/ui/message';
import { 
  MessageScroller, 
  MessageScrollerButton, 
  MessageScrollerContent, 
  MessageScrollerItem, 
  MessageScrollerProvider, 
  MessageScrollerViewport 
} from '@/components/ui/message-scroller';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const TypewriterResponse = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const words = text.split(" ");
  const index = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (index.current < words.length) {
        setDisplayedText((prev) => (prev ? prev + " " + words[index.current] : words[index.current]));
        index.current++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, 45);

    return () => clearInterval(timer);
  }, [text, words.length, onComplete]);

  return <span>{displayedText}</span>;
};

export default function ChatSupport() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { user } = useUser();
  const db = useFirestore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [typingId, setTypingId] = useState<string | null>(null);

  // Firestore Sync
  const sessionId = useMemo(() => user?.uid ? `sess_${user.uid}` : null, [user?.uid]);
  const { data: convData } = useDoc<any>(db, sessionId ? `conversations/${sessionId}` : null);
  
  const messagesQuery = useMemo(() => {
    if (!db || !sessionId) return null;
    return query(collection(db, `conversations/${sessionId}/messages`), orderBy('timestamp', 'asc'), limit(50));
  }, [db, sessionId]);
  
  const { data: remoteMessages } = useCollection<any>(messagesQuery);

  useEffect(() => {
    const now = new Date();
    setStartTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !db || !user || !sessionId) return;

    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // 1. Log User Message to Firestore
      await addDoc(collection(db, `conversations/${sessionId}/messages`), {
        role: 'user',
        content: currentInput,
        timestamp: serverTimestamp()
      });

      await setDoc(doc(db, "conversations", sessionId), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "Trader",
        lastMessage: currentInput,
        updatedAt: serverTimestamp(),
        status: convData?.status || 'ai'
      }, { merge: true });

      // 2. Conditional AI Response (Only if not in Human Mode)
      if (convData?.status !== 'human') {
        const history = remoteMessages.map(m => ({ role: m.role, content: m.content }));
        const response = await supportChat({ message: currentInput, locale, history });
        
        await addDoc(collection(db, `conversations/${sessionId}/messages`), {
          role: 'model',
          content: response || "I encountered a synchronization error.",
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("AI Node Failure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!db || !sessionId) return;
    // Logic to clear or archive session could go here
  };

  const isTerminal = pathname?.includes('/terminal');
  const isAdmin = pathname?.startsWith('/admin');
  if (isTerminal || isAdmin) return null;

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 bg-[#0A0A0A] text-white flex items-center justify-center shadow-xl z-[150] rounded-full transition-all duration-300 hover:scale-110 cursor-pointer",
          isOpen && "bg-[#0055FF] rotate-90"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-[420px] h-[600px] bg-white border border-[#E4E4E4] shadow-2xl z-[140] flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-none overflow-hidden origin-bottom-right">
          {/* Header */}
          <div className="p-4 border-b border-[#F7F7F5] bg-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
               <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#F7F7F5] border border-[#E4E4E4] overflow-hidden">
                    <img src="/assets/pwa.png" alt="Icon" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#16835B] rounded-full border-2 border-white"></div>
               </div>
               <div>
                  <h3 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest leading-none mb-1">Varban Assistant</h3>
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-tighter",
                    convData?.status === 'human' ? "text-[#0055FF]" : "text-[#16835B]"
                  )}>
                    {convData?.status === 'human' ? "Support Desk Connected" : "AI Node Operational"}
                  </span>
               </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"><X className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-hidden bg-white">
            <MessageScrollerProvider autoScroll>
              <MessageScroller>
                <MessageScrollerViewport className="px-0">
                  <MessageScrollerContent>
                    <div className="flex flex-col items-center justify-center py-6 opacity-30">
                      <Sparkles className="w-4 h-4 mb-2" />
                      <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-[0.3em]">
                        Session Established {startTime}
                      </span>
                    </div>

                    {!user && (
                      <div className="p-8 text-center space-y-4">
                        <Lock className="w-8 h-8 text-[#E4E4E4] mx-auto" />
                        <p className="text-[11px] text-[#6B7280] uppercase font-bold leading-relaxed">
                          Identification required for personalized assistance. Please sign in to activate the support conduit.
                        </p>
                        <Link href="/login" className="btn-institutional-primary inline-flex">Sign In</Link>
                      </div>
                    )}

                    {remoteMessages?.map((msg: any, idx: number) => (
                      <MessageScrollerItem key={idx}>
                        <Message align={msg.role === 'user' ? 'end' : 'start'}>
                          {msg.role === 'model' && (
                            <MessageAvatar>
                              <div className="w-8 h-8 rounded-full bg-white border border-[#E4E4E4] overflow-hidden">
                                <img src="/assets/pwa.png" alt="Bot" className="w-full h-full object-cover" />
                              </div>
                            </MessageAvatar>
                          )}
                          <MessageContent>
                            {msg.role === 'model' && (
                              <MessageHeader className="mb-2">
                                {msg.isAdmin ? 'Technical Desk' : 'Varban Assistant'}
                              </MessageHeader>
                            )}
                            <Bubble align={msg.role === 'user' ? 'end' : 'start'} variant={msg.role === 'user' ? 'tinted' : 'default'}>
                              <BubbleContent className={cn("font-medium", msg.role === 'model' && "bg-[#0A0A0A] border-none text-white")}>
                                {msg.content}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                    
                    {isLoading && (
                      <div className="px-14 py-4 italic font-bold tracking-[0.2em] uppercase text-[9px] text-[#0055FF] animate-pulse">
                         Analyzing Protocol...
                      </div>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#F7F7F5] bg-white shrink-0">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? "Transmit message..." : "Identification Locked"}
                disabled={isLoading || !user}
                className="w-full border-2 border-[#0A0A0A] p-4 pr-12 text-xs focus:outline-none focus:border-[#0055FF] placeholder:text-[#6B7280] bg-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading || !user}
                  className="text-[#0055FF] disabled:opacity-20 hover:text-[#0A0A0A] transition-all p-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}