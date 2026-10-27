'use client';

/**
 * @fileOverview Refined Varban Assistant AI.
 * Features a modern circular UI, typewriter response effect, and live API integration.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

/**
 * Specialized component for typewriter effect on AI responses.
 */
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
    }, 45); // Speed tuned for institutional readability

    return () => clearInterval(timer);
  }, [text, words.length, onComplete]);

  return <span>{displayedText}</span>;
};

export default function ChatSupport() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  
  // Chat State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [typingId, setTypingId] = useState<string | null>(null);

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
    const now = new Date();
    setStartTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [locale, t]);

  // DRAG LOGIC
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const currentX = position?.x ?? window.innerWidth - 80;
    const currentY = position?.y ?? window.innerHeight - 80;

    setDragStart({ x: clientX - currentX, y: clientY - currentY });
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
    if (!isDragging) setIsOpen(!isOpen);
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
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await supportChat({ message: currentInput, locale, history });
      
      const newId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: newId, role: 'model', content: response || "No response received." }]);
      setTypingId(newId);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'model', content: t('chat.error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ id: 'starter', role: 'model', content: t('chat.starter') }]);
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
          "fixed w-14 h-14 bg-[#0A0A0A] text-white flex items-center justify-center shadow-xl z-[150] rounded-full transition-shadow duration-200 cursor-grab active:cursor-grabbing group",
          isOpen && "bg-[#0055FF]",
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
                  <span className="text-[8px] font-bold text-[#16835B] uppercase tracking-tighter">AI Node Operational</span>
               </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleReset} title="Reset Chat" className="p-1.5 text-[#6B7280] hover:text-[#0A0A0A]"><RotateCcw className="w-3.5 h-3.5" /></button>
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
                              <div className="w-8 h-8 rounded-full bg-white border border-[#E4E4E4] overflow-hidden flex items-center justify-center shadow-sm">
                                <img src="/assets/pwa.png" alt="Bot" className="w-full h-full object-cover" />
                              </div>
                            </MessageAvatar>
                          )}
                          <MessageContent>
                            {msg.role === 'model' && (
                              <MessageHeader className="mb-2">Institutional Support</MessageHeader>
                            )}
                            {msg.role === 'user' ? (
                              <Bubble align="end" variant="tinted">
                                <BubbleContent className="font-medium">{msg.content}</BubbleContent>
                              </Bubble>
                            ) : (
                              <div className="px-1 text-[11px] leading-relaxed text-[#333333] font-medium">
                                {msg.id === typingId ? (
                                  <TypewriterResponse text={msg.content} onComplete={() => setTypingId(null)} />
                                ) : (
                                  msg.content
                                )}
                                <MessageFooter>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 px-1.5 text-[8px] font-bold"
                                    onClick={() => navigator.clipboard.writeText(msg.content)}
                                  >
                                    <Copy className="h-2.5 w-2.5 mr-1" /> Copy Response
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
                            <div className="w-8 h-8 rounded-full bg-[#F3F4F6] border border-[#E4E4E4] flex items-center justify-center">
                              <Loader2 className="w-3.5 h-3.5 text-[#0055FF] animate-spin" />
                            </div>
                          </MessageAvatar>
                          <MessageContent>
                            <div className="italic font-bold tracking-[0.2em] uppercase text-[9px] text-[#0055FF] px-1 py-2 animate-pulse">
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

          {/* Input Area */}
          <div className="p-4 border-t border-[#F7F7F5] bg-white shrink-0">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder')}
                disabled={isLoading}
                className="w-full border-2 border-[#0A0A0A] p-4 pr-12 text-xs focus:outline-none focus:border-[#0055FF] placeholder:text-[#6B7280] bg-white transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="text-[#0055FF] disabled:opacity-20 hover:text-[#0A0A0A] transition-all p-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
            <div className="mt-3 text-center">
               <span className="text-[8px] font-bold text-[#D1D5DB] uppercase tracking-[0.4em]">Varban Intelligence Hub</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
