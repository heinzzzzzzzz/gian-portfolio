'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mic, MessageSquare, ChevronLeft } from 'lucide-react';
import AiOrb from '@/components/AiOrb';

export default function AiGateway() {
  return (
    <main className="theme-dark relative min-h-[100dvh] bg-bg text-ink flex flex-col items-center justify-center overflow-hidden selection:bg-accent/30 py-24">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#5e5838_1px,transparent_1px),linear-gradient(to_bottom,#5e5838_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <Link href="/" className="absolute top-8 left-6 md:left-8 flex items-center gap-2 text-mute hover:text-accent transition-colors z-50">
        <ChevronLeft className="w-4 h-4" />
        <span className="font-mono text-xs uppercase tracking-widest">Back to site</span>
      </Link>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 md:mb-20"
        >
          <div className="scale-75 md:scale-100">
            <AiOrb scale={1.2} text={'GIAN AI\nCLONE'} />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-6"
        >
          Pick a channel
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full"
        >
          <Link
            href="/ai-link/chat"
            className="group relative w-full rounded-2xl overflow-hidden border border-line bg-surface/60 backdrop-blur-xl p-8 hover:border-accent/60 transition-all duration-500 flex flex-col items-center text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <MessageSquare className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform duration-500" />
            <h2 className="font-head font-bold text-xl text-ink mb-3">Text</h2>
            <p className="text-mute text-sm">
              Chat with my AI self. Ask about systems, how a project runs, or availability. Answers stream in as they are written.
            </p>
          </Link>

          <Link
            href="/ai-link/call"
            className="group relative w-full rounded-2xl overflow-hidden border border-line bg-surface/60 backdrop-blur-xl p-8 hover:border-accent/60 transition-all duration-500 flex flex-col items-center text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Mic className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform duration-500" />
            <h2 className="font-head font-bold text-xl text-ink mb-3">Voice</h2>
            <p className="text-mute text-sm">
              Talk to the clone out loud, powered by Vapi. Natural conversation, interrupt any time. Needs a microphone.
            </p>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
