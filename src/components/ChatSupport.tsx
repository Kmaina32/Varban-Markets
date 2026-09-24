'use client';

/**
 * @fileOverview Floating Chat Support Component.
 * Provides a functional, state-managed chat window for user assistance.
 */

import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: 'Hello! How can I help you with your account or trading today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    // Simulated assistant response in Natural English
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "Thank you for your message. A support agent will review your inquiry shortly. In the meantime, you might find answers in our Help Center." 
      }]);
    }, 1000);
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
        <div className="fixed bottom-24 right-8 w-80 sm:w-96 h-[500px] bg-white border border-[#E4E4E4] shadow-2xl z-[110] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-[#E4E4E4] bg-[#F7F7F5] flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#16835B] animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]">Support Chat</span>
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
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-[#E4E4E4] flex gap-2 bg-white">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow bg-[#F7F7F5] border border-[#E4E4E4] p-2.5 text-[11px] focus:outline-none focus:border-[#0055FF] rounded-none"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="p-2.5 bg-[#0A0A0A] text-white hover:bg-[#0055FF] transition-colors disabled:opacity-20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
