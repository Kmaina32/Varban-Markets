
'use client';

/**
 * @fileOverview Varban Assistant Chatbot.
 * Redesigned to match high-precision institutional standards with robot avatars, 
 * character counters, and brand-yellow accents.
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, ThumbsUp, ChevronDown, MessageSquare } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { supportChat } from '@/ai/flows/support-chat-flow';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Hi there 👋 I\'m the Varban AI Assistant. You can log in [https://varbanmarkets.com/login] for tailored support, or just ask me a question to get started.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (!input.trim() || isLoading || input.length > 400) return;

    const userMsg = input.trim();
    const newHistory = [...messages, { role: 'user', content: userMsg } as Message];
    
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await supportChat({
        history: messages,
        message: userMsg
      });
      
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "Handshake failure: I'm having trouble connecting to our system nodes." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Institutional FAB */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FFDE00] text-[#0A0A0A] flex items-center justify-center shadow-xl hover:scale-105 transition-all z-[120] rounded-full"
        aria-label="Toggle Assistant"
      >
        {isOpen ? <ChevronDown className="w-7 h-7" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Assistant Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-[380px] h-[520px] bg-white border border-[#E4E4E4] shadow-2xl z-[130] flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#F7F7F5] bg-white flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-tight">Varban Assistant</h3>
            <div className="flex items-center space-x-3 text-[#6B7280]">
              <button className="hover:text-[#0A0A0A] transition-colors"><ThumbsUp className="w-4 h-4" /></button>
              <button onClick={() => setIsOpen(false)} className="hover:text-[#0A0A0A] transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-6 no-scrollbar bg-white">
            <div className="flex items-center justify-center">
              <div className="flex items-center w-full">
                <div className="flex-grow h-px bg-[#E4E4E4]"></div>
                <span className="px-3 text-[10px] text-[#6B7280] font-medium">Chat started at {startTime}</span>
                <div className="flex-grow h-px bg-[#E4E4E4]"></div>
              </div>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={cn("flex items-start", msg.role === 'user' ? "justify-end" : "justify-start")}>
                {msg.role === 'model' && (
                  <div className="mr-3 mt-1 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#FFDE00] flex items-center justify-center border border-[#E4E4E4] overflow-hidden">
                      <img src="https://picsum.photos/seed/varbanbot/80/80" alt="Bot" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <div className="max-w-[80%] flex flex-col">
                  <div className={cn(
                    "p-3.5 text-xs leading-relaxed border shadow-sm",
                    msg.role === 'user' 
                      ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" 
                      : "bg-[#F3F4F6] text-[#0A0A0A] border-[#F3F4F6]"
                  )}>
                    {msg.content}
                  </div>
                  {msg.role === 'model' && (
                    <span className="text-[9px] text-[#6B7280] mt-1.5 font-medium ml-1">
                      Bot • Just now
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] border border-[#E4E4E4] flex items-center justify-center shrink-0">
                  <div className="w-4 h-4 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Assistant is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Interface */}
          <div className="p-4 border-t border-[#F7F7F5] bg-white shrink-0">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message"
                disabled={isLoading}
                maxLength={400}
                className="w-full border border-[#0A0A0A] p-3.5 pr-20 text-xs focus:outline-none placeholder:text-[#6B7280] bg-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <span className="text-[9px] font-mono font-bold text-[#6B7280]">{input.length}/400</span>
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="text-[#FFDE00] disabled:opacity-20 hover:text-[#0A0A0A] transition-colors"
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
