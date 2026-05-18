import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const QUICK_CHIPS = ["Can I transfer?", "Injury terms", "IP rights", "Is it fair?"];

export default function ChatPanel({ messages, onSendMessage, isLoading }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-bg-surface border-l border-white/5 sticky top-24">
      <div className="p-4 border-b border-white/5 bg-bg-surface/50 backdrop-blur-sm flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400">Coach Chat</h3>
        <Sparkles className="w-4 h-4 text-brand animate-pulse" />
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-brand/20"
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-brand/20 mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-serif italic">
              "Ask me anything about these terms. I'm direct, blunt, and here to protect you."
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-3 rounded-none text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-brand text-bg-base font-medium" 
                : "bg-white/5 text-gray-300 border border-white/5"
            )}>
               <div className="markdown-body prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-brand font-mono text-xs animate-pulse">
            <span className="w-2 h-2 bg-brand rounded-full animate-ping" />
            <span>Coach is typing...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-bg-surface/80">
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => onSendMessage(chip)}
              disabled={isLoading}
              className="px-3 py-1 bg-white/5 hover:bg-brand/10 hover:text-brand border border-white/10 rounded-none font-mono text-[10px] uppercase tracking-tighter transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up..."
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/10 p-3 text-sm focus:border-brand/40 outline-none font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-brand text-bg-base disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
