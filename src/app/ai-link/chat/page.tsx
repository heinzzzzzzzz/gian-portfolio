'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, Mic } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AiOrb from '@/components/AiOrb';

type Msg = { role: 'user' | 'ai'; content: string };

const FAQ = [
  'What do you build?',
  'How does a project with you start?',
  'Are you available right now?',
  'What is Octi?',
];

const GREETING: Msg = {
  role: 'ai',
  content: "Hi, I'm Gian's AI self. Ask me about the systems I build, how a project runs, or what I'd do with your process.",
};

function TextChatInner() {
  const params = useSearchParams();
  const initialQ = params.get('q');

  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Msg[]>([GREETING]);
  const sentInitial = useRef(false);

  // Keep the serverless function warm so the first answer is not a cold start.
  useEffect(() => {
    fetch('/api/chat', { method: 'GET', cache: 'no-store' }).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    const history = historyRef.current.slice(1); // drop the canned greeting
    const userMsg: Msg = { role: 'user', content: text };
    historyRef.current = [...historyRef.current, userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok || !res.body) {
        let detail = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          detail = data.error || detail;
        } catch {}
        throw new Error(detail);
      }

      // Stream the reply token by token into one AI bubble.
      setIsThinking(false);
      setMessages((prev) => [...prev, { role: 'ai', content: '' }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const snapshot = full;
        setMessages((prev) => {
          const next = prev.slice();
          next[next.length - 1] = { role: 'ai', content: snapshot };
          return next;
        });
      }
      if (!full.trim()) throw new Error('Empty reply from the model.');
      historyRef.current = [...historyRef.current, { role: 'ai', content: full }];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) => {
        const next = prev.slice();
        const last = next[next.length - 1];
        const errorBubble: Msg = {
          role: 'ai',
          content: `I couldn't answer that one (${msg}). Try again in a moment, or email gianbenedict.bigay07@gmail.com.`,
        };
        if (last && last.role === 'ai' && last.content === '') next[next.length - 1] = errorBubble;
        else next.push(errorBubble);
        return next;
      });
    } finally {
      setIsThinking(false);
    }
  }, []);

  // A question typed into the hero bar arrives as ?q= and is sent once.
  useEffect(() => {
    if (initialQ && !sentInitial.current) {
      sentInitial.current = true;
      send(initialQ);
    }
  }, [initialQ, send]);

  return (
    <main className="theme-dark relative h-[100dvh] bg-bg text-ink flex overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#5e5838_1px,transparent_1px),linear-gradient(to_bottom,#5e5838_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <Link href="/ai-link" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-mute hover:text-accent transition-colors z-50">
        <ChevronLeft className="w-4 h-4" />
        <span className="font-mono text-xs uppercase tracking-widest">Back</span>
      </Link>
      <Link href="/ai-link/call" className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-2 text-mute hover:text-accent transition-colors z-50">
        <Mic className="w-4 h-4" />
        <span className="font-mono text-xs uppercase tracking-widest">Switch to voice</span>
      </Link>

      {/* Left: orb */}
      <div className="absolute inset-0 lg:static lg:w-1/2 w-full h-full flex flex-col items-center justify-center z-0 lg:z-10 lg:border-r border-line/40 bg-black/20 backdrop-blur-sm opacity-20 lg:opacity-100 pointer-events-none lg:pointer-events-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
          <AiOrb scale={1.5} isThinking={isThinking} text={isThinking ? 'THINKING' : 'GIAN AI\nONLINE'} />
        </motion.div>
        <div className="absolute bottom-12 font-mono text-xs text-accent tracking-[0.3em] uppercase opacity-70">
          {isThinking ? 'Generating' : 'Ready'}
        </div>
      </div>

      {/* Right: chat */}
      <div className="w-full lg:w-1/2 h-full flex flex-col relative z-10 bg-transparent lg:bg-surface/50 lg:backdrop-blur-xl">
        <div className="w-full h-16 border-b border-line/60 flex items-center justify-center lg:justify-start px-8 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#FF6FA6]" />
            <span className="font-mono text-sm text-ink tracking-widest uppercase">Text link</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-bg rounded-br-md'
                      : 'bg-card border border-line text-ink rounded-bl-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="bg-card border border-line rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 md:p-6 bg-black/60 border-t border-line/60 flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FAQ.map((faq) => (
              <button
                key={faq}
                type="button"
                disabled={isThinking}
                onClick={() => send(faq)}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full border border-line bg-surface text-mute text-xs hover:border-accent/60 hover:text-accent transition-colors disabled:opacity-40"
              >
                {faq}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isThinking) send(inputValue);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about my work"
              autoFocus
              className="w-full bg-card border border-line rounded-xl pl-4 pr-12 py-3.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-accent/60 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              aria-label="Send"
              className="absolute right-2 p-2 bg-accent text-bg rounded-lg disabled:opacity-30 hover:bg-accent-deep transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function TextChat() {
  return (
    <Suspense fallback={<main className="theme-dark h-[100dvh] bg-bg" />}>
      <TextChatInner />
    </Suspense>
  );
}
