'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useGianAgent } from '@/lib/useGianAgent';
import Portrait from './Portrait';
import VoiceButton from './VoiceButton';
import ChatPanel from './ChatPanel';

const EASE = [0.16, 1, 0.3, 1] as const;

const KNOWS = [
  'Every build on this site and how it works',
  'How a project with me runs, start to finish',
  'My stack: n8n, GoHighLevel, Flutter, Next.js and more',
  'Whether I am free and how to reach me',
];

// Full-page version of the hero's AI corner: the same conversation, more room.
export default function AiRoom({ initialQuestion, focusChat = false }: { initialQuestion?: string | null; focusChat?: boolean }) {
  const agent = useGianAgent();

  return (
    <main className="relative min-h-[100svh] lg:h-[100svh] bg-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(71,67,41,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(71,67,41,0.06)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_25%,transparent_100%)]" />

      <div className="relative flex flex-col lg:h-full px-5 md:px-10 pt-6 pb-8 lg:pb-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </Link>
          <Link href="/" className="script neon text-[34px] leading-none -rotate-[6deg]" aria-label="Gian Bigay, home">
            GB
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[0.95fr_1.25fr] gap-10 lg:flex-1 lg:min-h-0">
          {/* Left: portrait, voice, what it knows */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="min-w-0 grid grid-cols-1 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:grid-cols-1 lg:grid-rows-[auto_1fr_auto] gap-6 lg:min-h-0"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">The AI room</p>
              <h1 className="mt-2 script neon neon-live text-[52px] md:text-[64px] leading-[1.05] -rotate-[2deg]">Talk to my AI self</h1>
              <p className="mt-3 text-mute leading-relaxed max-w-[48ch]">
                It&apos;s trained on my work and answers the way I would. Type below, or tap the pink button and just talk.
                Voice transcripts show up in the same chat.
              </p>
              <ul className="mt-4 space-y-2">
                {KNOWS.map((k) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /> {k}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[110vw] sm:h-auto sm:min-h-[420px] lg:min-h-0 [container-type:size] sm:row-span-2 lg:row-span-1">
              <Portrait priority className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[min(100cqw,72cqh)] h-[min(139cqw,100cqh)]" />
            </div>
            <VoiceButton agent={agent} className="w-full max-w-[420px] mx-auto" />
          </motion.div>

          {/* Right: the conversation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="min-w-0 flex flex-col lg:min-h-0"
          >
            <ChatPanel agent={agent} initialQuestion={initialQuestion} autoFocus={focusChat} className="h-[70svh] lg:h-auto lg:flex-1 lg:min-h-0" />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
