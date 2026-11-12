'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, Phone, PhoneOff } from 'lucide-react';
import type { GianAgent } from '@/lib/useGianAgent';

function Bars({ level, live }: { level: number; live: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="flex items-center gap-[3px] h-5" aria-hidden>
      {[0.6, 1, 0.75, 0.95, 0.55].map((w, i) =>
        live ? (
          <span
            key={i}
            className="w-[3px] rounded-full bg-current transition-[height] duration-100"
            style={{ height: `${Math.max(18, Math.min(100, level * 260 * w + 18))}%` }}
          />
        ) : (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-current"
            animate={reduce ? { height: '40%' } : { height: ['30%', `${60 + w * 40}%`, '30%'] }}
            transition={{ repeat: Infinity, duration: 1.1 + i * 0.12, ease: 'easeInOut', delay: i * 0.08 }}
          />
        )
      )}
    </span>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function VoiceButton({ agent, className = '' }: { agent: GianAgent; className?: string }) {
  const { status, error, volume, speaking, seconds, toggle } = agent.call;
  const active = status === 'active';
  const connecting = status === 'connecting';

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        aria-label={active ? 'End the voice call' : 'Start a voice call with Gian\'s AI'}
        className={`group relative w-full h-14 rounded-full flex items-center justify-center gap-3 px-5 font-semibold text-[14px] lg:text-[15px] transition-all duration-300 ${
          active
            ? 'bg-ink text-bg shadow-[0_0_0_4px_rgba(255,111,166,0.35),0_0_40px_rgba(255,111,166,0.55)]'
            : 'bg-accent text-white shadow-[0_14px_40px_-10px_rgba(255,111,166,0.9)] hover:shadow-[0_0_0_6px_rgba(255,111,166,0.25),0_18px_50px_-10px_rgba(255,111,166,1)] hover:-translate-y-0.5'
        }`}
      >
        {/* idle pulse rings */}
        {!active && !connecting && <span className="pulse-ring absolute inset-0 rounded-full pointer-events-none" />}
        <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : active ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
        </span>
        <span className="relative whitespace-nowrap">
          {connecting ? 'Connecting…' : active ? `On call · ${fmt(seconds)} · tap to end` : 'Talk to me · voice AI'}
        </span>
        <span className="relative">
          <Bars level={active ? volume : 0} live={active} />
        </span>
      </button>
      <p className="mt-2 text-center text-[12px] text-mute min-h-[1.25rem]">
        {status === 'error'
          ? `Couldn't connect: ${error}. Check that your mic is allowed, then tap again.`
          : active
            ? speaking
              ? 'My AI is talking. Interrupt any time.'
              : 'Listening. Just speak naturally.'
            : 'One tap. It picks up and answers like me, out loud.'}
      </p>
    </div>
  );
}
