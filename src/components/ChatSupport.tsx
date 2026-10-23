'use client';

/**
 * @fileOverview Varban Assistant Chatbot.
 * Adheres strictly to the Institutional Chat pattern using Message Scroller and Bubbles.
 * 
 * BEST PRACTICES:
 * 1. Legal Disclaimer: Persistent notice regarding financial advice.
 * 2. User Context: Passes user profile data to the AI flow.
 * 3. Graceful Failure: Handles service interruptions without crashing.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, Loader2, MessageSquare, ChevronDown, GripVertical, Copy, ShieldAlert } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { supportChat } from '@/ai/flows/support-chat-flow';
import { useTranslation } from '@/app/lib/i18n-context';
import { useUser, useFirestore, useDoc } from '@/firebase';
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

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function ChatSupport() {
  const pathname = usePathname();
  const { user } = useUser();
  const db = useFirestore();
  const { t, locale } = useTranslation();
  const { data: profile } = useDoc<any>(db, user ? `users/${user.uid}` : null);
  
  // Chat State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState('');

  // Drag & Position State
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);

  // Initialize localized starter
  useEffect(() => {
    setMessages([
      { id: 'starter', role: 'model', content: t('chat.starter') }
    ]);
  }, [locale, t]);

  useEffect(() => {
    const now = new Date();
    setStartTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // DRAG LOGIC
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const currentX = position?.x ?? window.innerWidth - 80;
    const currentY = position?.y ?? window.innerHeight - 80;

    setDragStart({
      x: clientX - currentX,
      y: clientY - currentY
    });
    setHasMoved(false);
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragOffset) return;
    
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;

    const boundedX = Math.max(10, Math.min(window.innerWidth - 64, newX));
    const boundedY = Math.max(10, Math.min(window.innerHeight - 64, newY));

    if (!hasMoved && (Math.abs(newX - (position?.x ?? 0)) > 5 || Math.abs(newY - (position?.y ?? 0)) > 5)) {
      setHasMoved(true);
      setIsDragging(true);
    }

    setPosition({ x: boundedX, y: boundedY });
  }, [dragOffset, hasMoved, position]);

  const handleMouseUp = useCallback(() => {
    if (dragOffset && isDragging) {
      if (position) {
        const snapX = position.x < window.innerWidth / 2 ? 24 : window.innerWidth - 80;
        setPosition({ x: snapX, y: position.y });
      }
    }
    
    setDragStart(null);
    setTimeout(() => setIsDragging(false), 50);
  }, [dragOffset, isDragging, position]);

  useEffect(() => {
    if (dragOffset) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragOffset, handleMouseMove, handleMouseUp]);

  const handleTriggerClick = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input.trim() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const response = await supportChat({
        message: currentInput,
        userName: profile?.profile?.firstName,
        locale,
        history
      });

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'model', 
        content: response || "Handshake error." 
      }]);
    } catch (error) {
      console.error("Assistant Error:", error);
      setMessages(prev => [...prev, { 
        id: 'error-' + Date.now(),
        role: 'model', 
        content: t('chat.error')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const isTerminal = pathname?.includes('/terminal');
  if (isTerminal) return null;

  const getWindowStyles = () => {
    const isLeft = (position?.x ?? window.innerWidth) < window.innerWidth / 2;
    const triggerX = position?.x ?? window.innerWidth - 80;
    const triggerY = position?.y ?? window.innerHeight - 80;

    return {
      left: isLeft ? `${triggerX}px` : 'auto',
      right: !isLeft ? `${window.innerWidth - triggerX - 56}px` : 'auto',
      bottom: `${window.innerHeight - triggerY + 12}px`
    };
  };

  return (
    <>
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onClick={handleTriggerClick}
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : { bottom: '24px', right: '24px' }}
        className={cn(
          "fixed w-14 h-14 bg-[#0055FF] text-white flex items-center justify-center shadow-xl z-[150] rounded-full transition-shadow duration-200 cursor-grab active:cursor-grabbing group",
          isDragging && "shadow-2xl scale-110",
          !dragOffset && "transition-all duration-300 ease-out"
        )}
      >
        {isOpen ? <ChevronDown className="w-7 h-7" /> : <MessageSquare className="w-6 h-6" />}
        <div className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <GripVertical className="w-3 h-3 text-white/40" />
        </div>
      </div>

      {isOpen && (
        <div 
          style={getWindowStyles()}
          className={cn(
            "fixed w-80 sm:w-[420px] h-[600px] bg-white border border-[#E4E4E4] shadow-2xl z-[140] flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-none overflow-hidden",
            (position?.x ?? window.innerWidth) < window.innerWidth / 2 ? "origin-bottom-left" : "origin-bottom-right"
          )}
        >
          <div className="p-4 border-b border-[#F7F7F5] bg-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
               <h3 className="text-[10px] font-bold text-[#0A0A0A] uppercase tracking-widest">{t('chat.title')}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-grow overflow-hidden bg-white">
            <MessageScrollerProvider autoScroll>
              <MessageScroller>
                <MessageScrollerViewport className="px-0">
                  <MessageScrollerContent>
                    <div className="flex items-center justify-center py-4 opacity-50">
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest">
                        {t('chat.started')} {startTime}
                      </span>
                    </div>

                    {messages.map((msg) => (
                      <MessageScrollerItem 
                        key={msg.id} 
                        messageId={msg.id} 
                        scrollAnchor={msg.role === 'user'}
                      >
                        <Message align={msg.role === 'user' ? 'end' : 'start'}>
                          {msg.role === 'model' && (
                            <MessageAvatar>
                              <div className="w-8 h-8 rounded-none bg-[#0A0A0A] border border-[#E4E4E4] flex items-center justify-center overflow-hidden">
                                <img src="https://picsum.photos/seed/varbanbot/60/60" alt="Bot" className="w-full h-full object-cover" />
                              </div>
                            </MessageAvatar>
                          )}
                          <MessageContent>
                            {msg.role === 'model' && (
                              <MessageHeader>Varban Assistant</MessageHeader>
                            )}
                            {msg.role === 'user' ? (
                              <Bubble align="end" variant="muted">
                                <BubbleContent>{msg.content}</BubbleContent>
                              </Bubble>
                            ) : (
                              <div className="px-1 text-[11px] font-medium leading-relaxed text-[#333333]">
                                {msg.content}
                                <MessageFooter>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleCopy(msg.content)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </MessageFooter>
                              </div>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                    
                    {isLoading && (
                      <MessageScrollerItem messageId="loading">
                        <Message align="start">
                          <MessageAvatar>
                            <div className="w-8 h-8 bg-[#F3F4F6] border border-[#E4E4E4] flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-[#0055FF] animate-spin" />
                            </div>
                          </MessageAvatar>
                          <MessageContent>
                            <div className="italic font-bold tracking-widest uppercase text-[9px] text-[#6B7280] px-1 py-2">
                                {t('chat.typing')}
                            </div>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

          <div className="p-4 border-t border-[#F7F7F5] bg-[#F7F7F5]/30 shrink-0 space-y-3">
            <div className="flex items-start gap-2 p-3 bg-white border border-[#E4E4E4] shadow-sm">
               <ShieldAlert className="w-4 h-4 text-[#0055FF] shrink-0 mt-0.5" />
               <p className="text-[9px] text-[#6B7280] uppercase font-bold leading-relaxed">
                 Institutional Notice: This assistant provides platform guidance only and strictly declines financial advice.
               </p>
            </div>
            
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder')}
                disabled={isLoading}
                className="w-full border border-[#0A0A0A] p-4 pr-12 text-xs focus:outline-none placeholder:text-[#6B7280] bg-white shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="text-[#0055FF] disabled:opacity-20 hover:text-[#0A0A0A] transition-colors p-2"
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
