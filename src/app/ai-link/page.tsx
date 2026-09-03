'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mic, MessageSquare, ChevronLeft } from 'lucide-react';
import AiOrb from '@/components/AiOrb';

export default function AiGateway() {
  return (
    <main className="relative min-h-screen bg-bg flex flex-col items-center justify-center overflow-hidden selection:bg-cyan/30">
      
      {/* Background ambient grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-mute hover:text-cyan transition-colors z-50">
        <ChevronLeft className="w-4 h-4" />
        <span className="font-mono text-xs uppercase tracking-widest">Return to Base</span>
      </Link>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6">
        
        {/* The Orb - Expanding in from Hero */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 md:mb-24"
        >
          <div className="scale-75 md:scale-100">
            <AiOrb scale={1.2} />
          </div>
        </motion.div>

        {/* Interface Menu */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
        >
          {/* Chat Option */}
          <Link href="/ai-link/chat" className="group relative w-full rounded-2xl overflow-hidden border border-line/50 bg-white/[0.02] backdrop-blur-xl p-8 hover:bg-white/[0.04] transition-all duration-500 flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <MessageSquare className="w-8 h-8 text-cyan mb-4 group-hover:scale-110 transition-transform duration-500" />
            <h2 className="font-mono text-xl text-ink uppercase tracking-widest mb-3">Initialize Text</h2>
            <p className="text-mute text-sm font-sans">
              Open a secure terminal to chat with the Gian AI Clone. Ask questions about systems, architectures, or availability.
            </p>
            <div className="mt-6 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </Link>

          {/* Voice Option */}
          <Link href="/ai-link/call" className="group relative w-full rounded-2xl overflow-hidden border border-line/50 bg-white/[0.02] backdrop-blur-xl p-8 hover:bg-white/[0.04] transition-all duration-500 flex flex-col items-center text-center hover:border-teal/30 hover:shadow-[0_0_30px_rgba(45,212,191,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-b from-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Mic className="w-8 h-8 text-teal mb-4 group-hover:scale-110 transition-transform duration-500" />
            <h2 className="font-mono text-xl text-ink uppercase tracking-widest mb-3">Initialize Voice</h2>
            <p className="text-mute text-sm font-sans">
              Establish a direct neural link via Vapi. Speak naturally with the AI clone for real-time strategic consultation.
            </p>
            <div className="mt-6 w-full h-[1px] bg-gradient-to-r from-transparent via-teal/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </Link>

        </motion.div>
      </div>
    </main>
  );
}
