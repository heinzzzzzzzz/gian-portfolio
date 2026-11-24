'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Phone, PhoneOff, Send } from 'lucide-react';
import type { GianAgent } from '@/lib/useGianAgent';

// Live AI clone card for the hero collage. It is the real thing: typing a
// question or tapping Call starts the same agent the full chat uses, then opens
// the chat so the conversation continues there.
export default function HeroAiCard({ agent, onOpen, className = '' }: { agent: GianAgent; onOpen: () => void; className?: string }) {
  const [text, setText] = useState('');
  const onCall = agent.call.status === 'active';
  const connecting = agent.call.status === 'connecting';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    if (!q || agent.thinking) return;
    onOpen();
    agent.send(q);
    setText('');
  };

  return (
    <div className={`relative ${className}`} data-ai-card>
      {/* Brand neon callout, same as the AI pages */}
      <div aria-hidden className="pointer-events-none absolute -top-[2.6em] left-[4%] flex items-end gap-1 text-[clamp(22px,1.9vw,34px)]">
        <span className="script neon neon-live leading-none -rotate-[4deg] whitespace-nowrap">Talk to my AI self</span>
        <svg viewBox="0 0 80 50" className="w-10 h-auto text-accent-ink mb-[-0.5em] shrink-0" fill="none">
          <path d="M4 8 C 30 2, 58 10, 64 38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M54 30 L 64 40 L 72 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Nested radius: 18px outer, 1.5px glow ring, 16.5px inner */}
      <div className="rounded-[18px] p-[1.5px] glow-border shadow-[0_30px_70px_-30px_rgb(255_111_166/0.75)]">
        <div className="overflow-hidden rounded-[16.5px] bg-card">
          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 border-b ${onCall ? 'bg-accent border-accent' : 'bg-cardhi/70 border-[rgb(71_67_41/0.10)]'}`}>
            <div className="relative shrink-0">
              <Image src="/avatar.jpg" alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-full object-cover ring-2 ring-accent/60" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#34C76F] ring-2 ring-card" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[14px] font-bold text-ink">Gian&apos;s AI clone</div>
              <div className={`text-[12px] ${onCall ? 'text-on-accent' : 'text-mute'}`}>
                {onCall ? 'On call, speak now' : connecting ? 'Calling…' : 'Online · voice or text'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                agent.call.toggle();
                onOpen();
              }}
              aria-label={onCall ? 'End call' : "Call Gian's AI"}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 text-[13px] font-semibold text-on-accent shadow-[0_0_18px_rgb(255_111_166/0.6)] transition-colors duration-200 hover:bg-accent-deep"
            >
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : onCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              {onCall ? 'End' : 'Call'}
            </button>
          </div>

          <div className="px-3.5 pt-3 pb-3.5">
            <p className="max-w-[92%] rounded-2xl rounded-bl-md border border-[rgb(71_67_41/0.10)] bg-cardhi px-3 py-2 text-[13px] leading-relaxed text-ink">
              Hi, I&apos;m Gian&apos;s AI self. Ask me what I build or how a project starts.
            </p>
            <form onSubmit={submit} className="mt-3 flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask my AI anything…"
                aria-label="Ask Gian's AI"
                className="min-w-0 flex-1 rounded-full border border-[rgb(71_67_41/0.14)] bg-white px-3.5 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={!text.trim() || agent.thinking}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition-colors duration-200 hover:bg-accent hover:text-on-accent disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
