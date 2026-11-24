'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { MessageCircle, PhoneOff } from 'lucide-react';
import type { GianAgent } from '@/lib/useGianAgent';
import { stage } from '@/lib/stage';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/*
 * After the hero, the 3D phone rides in the bottom-right corner (drawn by the
 * 3D stage). This puts real, clickable controls next to it: tap the phone to
 * call, or the pill to text. During a call the pill becomes the hang-up.
 */
export default function FloatingAI({ agent, onChat }: { agent: GianAgent; onChat: () => void }) {
  const { status, seconds, toggle } = agent.call;
  const active = status === 'active';
  const connecting = status === 'connecting';
  const { scrollY } = useScroll();
  const [past, setPast] = useState(false);
  useEffect(() => stage.subscribe(() => {
    const next = window.scrollY > window.innerHeight * 0.85 && stage.get().docked;
    setPast((v) => (v === next ? v : next));
  }), []);
  useMotionValueEvent(scrollY, 'change', (y) => {
    // hidden while the Work shelf fills the screen (the phone is busy being folders)
    // only while the phone rests in the corner (it is busy elsewhere during chapters)
    const next = y > window.innerHeight * 0.85 && stage.get().docked;
    setPast((s) => (s === next ? s : next));
  });

  return (
    <AnimatePresence>
      {past && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-0 z-50 flex items-end"
        >
          {active || connecting ? (
            <button
              type="button"
              onClick={toggle}
              className="mb-6 mr-2 flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-bg shadow-lg"
            >
              <PhoneOff className="h-4 w-4" /> {connecting ? 'Connecting…' : `On call ${fmt(seconds)} · hang up`}
            </button>
          ) : (
            <button
              type="button"
              onClick={onChat}
              className="mb-6 mr-2 flex h-12 items-center gap-2 rounded-full bg-card px-5 text-sm font-bold text-ink shadow-[0_14px_30px_-12px_rgba(255,111,166,0.9)] ring-2 ring-accent transition-transform duration-200 ease-out hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" /> Text my AI
            </button>
          )}
          {/* sits exactly over the 3D phone in the corner */}
          <button
            type="button"
            onClick={toggle}
            data-phone-grab
            aria-label={active ? 'End the call with Gian’s AI' : 'Call Gian’s AI'}
            title={active ? 'End the call' : 'Tap the phone to call my AI'}
            className="mr-1 h-[130px] w-[72px] rounded-[18px] md:mr-[22px] md:h-[170px] md:w-[90px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
