'use client';

/**
 * @fileOverview Refined Varban Assistant AI.
 * Persists history to Firestore for Admin monitoring and takeover.
 * Enhanced: Side-drawer mode, Image upload, and Higher visibility font.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  X, 
  Send, 
  Loader2, 
  MessageSquare, 
  ChevronDown, 
  GripVertical, 
  Copy, 
  RotateCcw, 
  Sparkles,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Paperclip,
  ShieldAlert,
  Lock
} from 'lucide-react';
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

export default function ChatSupport() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { user } = useUser();
  const db = useFirestore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [selectedImage, setSelectedAsset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAsset(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading || !db || !user || !sessionId) return;

    const currentInput = input.trim();
    const currentImage = selectedImage;
    setInput('');
    setSelectedAsset(null);
    setIsLoading(true);

    try {
      // 1. Ensure parent document exists FIRST so sub-collection rules pass
      await setDoc(doc(db, "conversations", sessionId), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "Trader",
        lastMessage: currentInput || "Transmitted an image for analysis.",
        updatedAt: serverTimestamp(),
        status: convData?.status || 'ai'
      }, { merge: true });

      // 2. Log User Message to Firestore
      await addDoc(collection(db, `conversations/${sessionId}/messages`), {
        role: 'user',
        content: currentInput || "Transmitted an image for analysis.",
        hasImage: !!currentImage,
        timestamp: serverTimestamp()
      });

      // 3. Conditional AI Response (Only if not in Human Mode)
      if (convData?.status !== 'human') {
        const history = remoteMessages?.map(m => ({ role: m.role, content: m.content })) || [];
        const response = await supportChat({ 
          message: currentInput || "Please analyze this image.", 
          locale, 
          history,
          photoDataUri: currentImage || undefined,
          userId: user.uid,
          userEmail: user.email || ""
        });
        
        await addDoc(collection(db, `conversations/${sessionId}/messages`), {
          role: 'model',
          content: response || "I encountered a synchronization error.",
          timestamp: serverTimestamp()
        });

        // Update the last message preview
        await setDoc(doc(db, "conversations", sessionId), {
          lastMessage: response || "Error response",
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error("AI Node Failure:", error);
    } finally {
      setIsLoading(false);
    }
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
          isOpen && "hidden"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </div>

      {isOpen && (
        <div className={cn(
          "fixed bg-white border-[#E4E4E4] shadow-2xl z-[140] flex flex-col animate-in duration-300 rounded-none overflow-hidden",
          isExpanded 
            ? "inset-y-0 right-0 w-full sm:w-[480px] border-l slide-in-from-right" 
            : "bottom-24 right-6 w-80 sm:w-[420px] h-[600px] border slide-in-from-bottom-4 origin-bottom-right"
        )}>
          {/* Header */}
          <div className="p-4 border-b border-[#F7F7F5] bg-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
               <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#0055FF] text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
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
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
                title={isExpanded ? "Collapse" : "Expand to Side Drawer"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
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
                        Secure Session Active
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
                              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
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
                              <BubbleContent className={cn(
                                "font-medium text-[14px]", 
                                msg.role === 'model' && "bg-[#0A0A0A] border-none text-white shadow-lg"
                              )}>
                                {msg.content}
                                {msg.hasImage && (
                                  <div className="mt-2 pt-2 border-t border-black/10 flex items-center gap-2 text-[10px] uppercase font-bold">
                                     <ImageIcon className="w-3 h-3" /> Image Attachment Included
                                  </div>
                                )}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                    
                    {isLoading && (
                      <div className="px-14 py-4 italic font-bold tracking-[0.2em] uppercase text-[9px] text-[#0055FF] animate-pulse">
                         Thinking...
                      </div>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#F7F7F5] bg-white shrink-0 space-y-3">
            {selectedImage && (
              <div className="flex items-center gap-2 p-2 bg-[#F7F7F5] border border-[#E4E4E4] animate-in slide-in-from-bottom-1">
                 <div className="relative w-10 h-10 border border-[#D1D5DB] overflow-hidden">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSelectedAsset(null)}
                      className="absolute top-0 right-0 bg-black/60 text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                 </div>
                 <span className="text-[9px] font-bold uppercase text-[#6B7280]">Image Ready for Analysis</span>
              </div>
            )}

            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? "Transmit message..." : "Identification Locked"}
                disabled={isLoading || !user}
                className="w-full border-2 border-[#0A0A0A] p-5 pr-24 text-[14px] font-medium focus:outline-none focus:border-[#0055FF] placeholder:text-[#6B7280] bg-white"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button 
                  type="button"
                  disabled={isLoading || !user}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#6B7280] hover:text-[#0A0A0A] p-2 transition-all"
                  title="Upload Image"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  type="submit" 
                  disabled={(!input.trim() && !selectedImage) || isLoading || !user}
                  className="text-[#0055FF] disabled:opacity-20 hover:text-[#0A0A0A] transition-all p-2"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </form>
            
            <div className="flex items-center justify-between px-1">
               <span className="text-[8px] font-bold text-[#D1D5DB] uppercase tracking-[0.2em]">Secure Support</span>
               <div className="flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5 text-[#16835B]" />
                  <span className="text-[8px] font-bold text-[#16835B] uppercase">Audited</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
