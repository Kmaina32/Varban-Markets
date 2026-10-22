'use client';

/**
 * @fileOverview Varban Assistant Chatbot.
 * Redesigned to match high-precision institutional standards.
 * Integrated with the Bubble component system.
 */

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, Loader2, MessageSquare, ChevronDown } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { supportChat } from '@/ai/flows/support-chat-flow';
import { useTranslation } from '@/app/lib/i18n-context';
import { Bubble, BubbleContent, BubbleGroup } from '@/components/ui/bubble';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatSupport() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with localized starter message
  useEffect(() => {
    setMessages([
      { role: 'model', content: t('chat.starter') }
    ]);
  }, [locale, t]);

  const isTerminal = pathname?.includes('/terminal');

  useEffect(() => {
    const now = new Date();
    setStartTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
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

  if (isTerminal) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#0055FF] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all z-[120] rounded-full"
      >
        {isOpen ? <ChevronDown className="w-7 h-7" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-[380px] h-[520px] bg-white border border-[#E4E4E4] shadow-2xl z-[130] flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-sm overflow-hidden">
          <div className="p-4 border-b border-[#F7F7F5] bg-white flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-tight">{t('chat.title')}</h3>
            <div className="flex items-center space-x-3 text-[#6B7280]">
              <button onClick={() => setIsOpen(false)} className="hover:text-[#0A0A0A] transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-6 no-scrollbar bg-white">
            <div className="flex items-center justify-center">
              <div className="flex items-center w-full">
                <div className="flex-grow h-px bg-[#E4E4E4]"></div>
                <span className="px-3 text-[10px] text-[#6B7280] font-medium">{t('chat.started')} {startTime}</span>
                <div className="flex-grow h-px bg-[#E4E4E4]"></div>
              </div>
            </div>

            <BubbleGroup>
              {messages.map((msg, i) => (
                <Bubble 
                  key={i} 
                  align={msg.role === 'user' ? 'end' : 'start'}
                  variant={msg.role === 'user' ? 'default' : 'secondary'}
                >
                  {msg.role === 'model' && (
                    <div className="mr-2 mt-1 shrink-0">
                      <div className="w-6 h-6 rounded-full bg-[#0055FF] flex items-center justify-center border border-[#E4E4E4] overflow-hidden">
                        <img src="https://picsum.photos/seed/varbanbot/60/60" alt="Bot" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  <BubbleContent className={cn(msg.role === 'user' ? "rounded-none" : "rounded-none")}>
                    {msg.content}
                  </BubbleContent>
                </Bubble>
              ))}
            </BubbleGroup>
            
            {isLoading && (
              <Bubble align="start" variant="muted">
                <div className="mr-2 mt-1 shrink-0">
                  <div className="w-6 h-6 rounded-full bg-[#F3F4F6] border border-[#E4E4E4] flex items-center justify-center shrink-0">
                    <Loader2 className="w-3 h-3 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <BubbleContent className="italic font-bold tracking-widest uppercase text-[9px] border-none shadow-none bg-transparent">
                  {t('chat.typing')}
                </BubbleContent>
              </Bubble>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#F7F7F5] bg-white shrink-0">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder')}
                disabled={isLoading}
                maxLength={400}
                className="w-full border border-[#0A0A0A] p-3.5 pr-12 text-xs focus:outline-none placeholder:text-[#6B7280] bg-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="text-[#0055FF] disabled:opacity-20 hover:text-[#0A0A0A] transition-colors"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
