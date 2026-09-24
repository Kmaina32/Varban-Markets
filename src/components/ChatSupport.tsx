
'use client';

/**
 * @fileOverview AI-Powered Floating Chat Support Component.
 * Integrates with the supportChat Genkit flow for context-aware assistance.
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { supportChat } from '@/ai/flows/support-chat-flow';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Hello! I am your Varban assistant. How can I help you with your account or trading today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
        content: "I'm having trouble connecting to our system. Please try again or visit our Help Center." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-[#0A0A0A] flex items-center justify-center shadow-2xl hover:bg-[#0055FF] hover:text-white transition-all z-[100] border-2 border-[#E4E4E4]"
        aria-label="Toggle Chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-80 sm:w-96 h-[500px] bg-white border border-[#E4E4E4] shadow-2xl z-[110] flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Live Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#6B7280] hover:text-[#0A0A0A]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar bg-white">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-3 text-[11px] leading-relaxed shadow-sm border",
                  msg.role === 'user' 
                    ? "bg-[#0055FF] text-white border-[#0055FF]" 
                    : "bg-[#F7F7F5] text-[#0A0A0A] border-[#E4E4E4]"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F7F7F5] text-[#6B7280] border border-[#E4E4E4] p-3 rounded-none flex items-center space-x-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Checking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-[#E4E4E4] flex gap-2 bg-white shrink-0">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-grow bg-[#F7F7F5] border border-[#E4E4E4] p-2.5 text-[11px] focus:outline-none focus:border-[#0055FF] rounded-none disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-[#0A0A0A] text-white hover:bg-[#0055FF] transition-colors disabled:opacity-20 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
