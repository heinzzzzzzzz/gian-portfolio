'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import AiOrb from '@/components/AiOrb';

export default function TextChat() {
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: "SYSTEM INITIALIZED.\n\nI am the digital counterpart to Gian Benedict Bigay. How can I assist you with automation engineering today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: newMsg }]);
    setInputValue('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newMsg,
          history: messages
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'API Error');
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `[SYSTEM ERROR]: ${err.message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <main className="relative h-screen bg-bg flex overflow-hidden">
      
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />

      {/* Back Button */}
      <Link href="/ai-link" className="absolute top-8 left-8 flex items-center gap-2 text-mute hover:text-cyan transition-colors z-50">
        <ChevronLeft className="w-4 h-4" />
        <span className="font-mono text-xs uppercase tracking-widest">Abort Text Protocol</span>
      </Link>

      {/* Left: AI Orb */}
      <div className="w-1/2 h-full flex flex-col items-center justify-center relative z-10 border-r border-line/30 bg-black/20 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <AiOrb scale={1.5} isThinking={isThinking} text={isThinking ? "PROCESSING..." : "GIAN AI\nONLINE"} />
        </motion.div>
        
        {/* Status text */}
        <div className="absolute bottom-12 font-mono text-xs text-cyan tracking-[0.3em] uppercase opacity-70">
          {isThinking ? "Neural Network Active" : "Awaiting Input"}
        </div>
      </div>

      {/* Right: Chat Interface */}
      <div className="w-1/2 h-full flex flex-col relative z-10 bg-surface/50 backdrop-blur-xl">
        
        {/* Chat Header */}
        <div className="w-full h-16 border-b border-line/50 flex items-center px-8 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse shadow-[0_0_10px_#22D3EE]" />
            <span className="font-mono text-sm text-ink tracking-widest uppercase">Secure Terminal</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-tr-2xl rounded-bl-2xl px-5 py-4 text-sm leading-relaxed font-mono ${
                  msg.role === 'user' 
                    ? 'bg-cyan/10 border border-cyan/30 text-cyan rounded-tl-2xl' 
                    : 'bg-card border border-line text-ink rounded-br-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                }`}>
                  <span className="text-[10px] opacity-50 block mb-2 tracking-widest">
                    {msg.role === 'user' ? 'USER_INPUT' : 'SYSTEM_RESPONSE'}
                  </span>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </motion.div>
            ))}
            
            {isThinking && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-line text-cyan rounded-tr-2xl rounded-br-2xl rounded-bl-2xl px-5 py-4 flex gap-2 items-center shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <span className="text-[10px] opacity-50 tracking-widest mr-2">GENERATING</span>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-cyan" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-black/60 border-t border-line/50">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <div className="absolute left-4 text-cyan opacity-50 font-mono text-sm">&gt;</div>
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your command..."
              className="w-full bg-card/50 border border-line rounded-lg pl-10 pr-12 py-4 text-sm text-cyan placeholder:text-faint font-mono focus:outline-none focus:border-cyan/50 focus:bg-card transition-all shadow-inner"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="absolute right-3 p-2 bg-cyan/20 text-cyan rounded-md disabled:opacity-30 hover:bg-cyan/40 transition-colors border border-cyan/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
