'use client';

/**
 * @fileOverview Varban Assistant Chatbot.
 * Refactored with Message and MessageScroller for an institutional streaming experience.
 * Updated: Draggable trigger with side-wall snapping and adaptive window alignment.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, Loader2, MessageSquare, ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { supportChat } from '@/ai/flows/support-chat-flow';
import { useTranslation } from '@/app/lib/i18n-context';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { 
  Message, 
  MessageAvatar, 
  MessageContent, 
  MessageHeader 
} from '@/components/ui/message';
import { 
  MessageScroller, 
  MessageScrollerButton, 
  MessageScrollerContent, 
  MessageScrollerItem, 
  MessageScrollerProvider, 
  MessageScrollerViewport 
} from '@/components/ui/message-scroller';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function ChatSupport() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  
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
      { role: 'model', content: t('chat.starter') }
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
    
    // Calculate current position if not set
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

    // Bounds checking
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
      // SNAPPING LOGIC: Snap to nearest side wall
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

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
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
        locale,
        history
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        content: response || "Processing error." 
      }]);
    } catch (error) {
      console.error("Assistant Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: t('chat.error')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isTerminal = pathname?.includes('/terminal');
  if (isTerminal) return null;

  // Calculate Window Position relative to trigger
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
      {/* Floating Draggable Trigger */}
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
        
        {/* Subtle Drag Handle Visual */}
        <div className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <GripVertical className="w-3 h-3 text-white/40" />
        </div>
      </div>

      {/* Adaptive Chat Window */}
      {isOpen && (
        <div 
          style={getWindowStyles()}
          className={cn(
            "fixed w-80 sm:w-[400px] h-[580px] bg-white border border-[#E4E4E4] shadow-2xl z-[140] flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-sm overflow-hidden",
            (position?.x ?? window.innerWidth) < window.innerWidth / 2 ? "origin-bottom-left" : "origin-bottom-right"
          )}
        >
          <div className="p-4 border-b border-[#F7F7F5] bg-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
               <h3 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">{t('chat.title')}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-grow overflow-hidden bg-white">
            <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor" scrollPreviousItemPeek={32}>
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent>
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center w-full max-w-[200px]">
                        <div className="flex-grow h-px bg-[#F7F7F5]"></div>
                        <span className="px-3 text-[9px] font-bold text-[#6B7280] uppercase tracking-widest whitespace-nowrap">
                          {t('chat.started')} {startTime}
                        </span>
                        <div className="flex-grow h-px bg-[#F7F7F5]"></div>
                      </div>
                    </div>

                    {messages.map((msg, i) => (
                      <MessageScrollerItem 
                        key={i} 
                        messageId={`msg-${i}`} 
                        scrollAnchor={msg.role === 'user'}
                      >
                        <Message align={msg.role === 'user' ? 'end' : 'start'}>
                          {msg.role === 'model' && (
                            <MessageAvatar>
                              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#E4E4E4] flex items-center justify-center overflow-hidden">
                                <img src="https://picsum.photos/seed/varbanbot/60/60" alt="Bot" className="w-full h-full object-cover" />
                              </div>
                            </MessageAvatar>
                          )}
                          <MessageContent>
                            {msg.role === 'model' && (
                              <MessageHeader>
                                <span>Varban Assistant</span>
                              </MessageHeader>
                            )}
                            <Bubble variant={msg.role === 'user' ? 'default' : 'secondary'}>
                              <BubbleContent className="rounded-none text-[11px] leading-relaxed">
                                {msg.content}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                    
                    {isLoading && (
                      <MessageScrollerItem messageId="loading-indicator">
                        <Message align="start">
                          <MessageAvatar>
                            <div className="w-8 h-8 rounded-full bg-[#F3F4F6] border border-[#E4E4E4] flex items-center justify-center">
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

          <div className="p-4 border-t border-[#F7F7F5] bg-white shrink-0">
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
            <div className="mt-2 text-center">
               <span className="text-[8px] font-bold text-[#D1D5DB] uppercase tracking-[0.2em]">Institutional Intelligence Node</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
