'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Phone, PhoneOff, Send, Loader2 } from 'lucide-react';
import type { GianAgent } from '@/lib/useGianAgent';

const CHIPS = ['What do you build?', 'How does a project start?', 'Are you available?', 'What is Octi?', 'Show me your automations'];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function ChatPanel({
  agent,
  initialQuestion,
  className = '',
  autoFocus = false,
}: {
  agent: GianAgent;
  initialQuestion?: string | null;
  className?: string;
  autoFocus?: boolean;
}) {
  const { messages, thinking, send, call } = agent;
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  // Scroll the thread itself (never the page) to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    if (initialQuestion && !sentInitial.current) {
      sentInitial.current = true;
      send(initialQuestion);
    }
  }, [initialQuestion, send]);

  const onCall = call.status === 'active';
  const connecting = call.status === 'connecting';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (thinking || !text.trim()) return;
    send(text);
    setText('');
  };

  return (
    <div className={`relative rounded-[22px] p-[1.5px] glow-border shadow-[0_30px_80px_-30px_rgba(255,111,166,0.75)] ${className}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-[21px] bg-card">
        {/* Header */}
        <div
          className={`flex items-center gap-3 px-4 py-3 border-b transition-colors duration-300 ${
            onCall ? 'bg-accent text-white border-accent' : 'bg-cardhi/70 border-line'
          }`}
        >
          <div className="relative shrink-0">
            <Image src="/avatar.jpg" alt="Gian" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-accent/60" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#34C76F] ring-2 ring-card" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-head font-bold text-[15px] ${onCall ? 'text-white' : 'text-ink'}`}>Gian Bigay</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] ${
                  onCall ? 'bg-white/25 text-white' : 'bg-accent/15 text-accent-deep'
                }`}
              >
                AI clone
              </span>
            </div>
            <div className={`text-[12px] ${onCall ? 'text-white/90' : 'text-mute'}`}>
              {onCall
                ? `On call · ${fmt(call.seconds)} · ${call.speaking ? 'speaking' : 'listening'}`
                : connecting
                  ? 'Calling…'
                  : 'Online · replies in about a second'}
            </div>
          </div>
          <button
            type="button"
            onClick={call.toggle}
            aria-label={onCall ? 'End call' : 'Call Gian\'s AI'}
            className={`shrink-0 flex items-center gap-2 h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
              onCall ? 'bg-white text-accent-deep hover:bg-white/90' : 'bg-accent text-white hover:bg-accent-deep shadow-[0_0_18px_rgba(255,111,166,0.6)]'
            }`}
          >
            {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : onCall ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            <span className="hidden sm:inline">{onCall ? 'End' : 'Call'}</span>
          </button>
        </div>

        {/* Thread */}
        <div ref={scrollRef} data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-[radial-gradient(ellipse_at_top,rgba(255,111,166,0.06),transparent_60%)]">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-ink text-bg rounded-br-md'
                      : 'bg-cardhi border border-line text-ink rounded-bl-md'
                  }`}
                >
                  {m.via === 'voice' && (
                    <span className={`mb-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] ${m.role === 'user' ? 'text-bg/60' : 'text-accent-deep'}`}>
                      <Mic className="w-3 h-3" /> voice
                    </span>
                  )}
                  {m.content || <span className="text-faint">…</span>}
                </div>
              </motion.div>
            ))}
            {thinking && (
              <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="bg-cardhi border border-line rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.15 }}
                      className="h-1.5 w-1.5 rounded-full bg-accent"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions + input */}
        <div className="border-t border-line bg-cardhi/60 px-3 pt-3 pb-3">
          <div data-lenis-prevent className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                disabled={thinking}
                onClick={() => send(c)}
                className="shrink-0 whitespace-nowrap rounded-full border border-line bg-card px-3 py-1.5 text-[12px] text-mute hover:border-accent hover:text-accent-deep transition-colors disabled:opacity-40"
              >
                {c}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus={autoFocus}
              placeholder="Type a message…"
              aria-label="Message Gian's AI"
              className="flex-1 min-w-0 rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={thinking || !text.trim()}
              aria-label="Send"
              className="shrink-0 h-10 w-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-deep transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
