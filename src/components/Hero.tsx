'use client';

import { useSyncExternalStore } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useGianAgent } from '@/lib/useGianAgent';
import Portrait from './Portrait';
import VoiceButton from './VoiceButton';
import ChatPanel from './ChatPanel';

const EASE = [0.16, 1, 0.3, 1] as const;
const LINES = ['Built', 'once.', 'Runs', 'forever.'];
// Same three-column template for the meta row and the stage so everything lines up.
const COLS = 'md:grid-cols-[1.1fr_0.9fr_1fr]';

// The pinned, fading hero is a desktop effect; on phones the hero scrolls normally.
const DESKTOP = '(min-width: 768px)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useIsDesktop = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

export default function Hero() {
  const reduce = useReducedMotion();
  const agent = useGianAgent();
  const isDesktop = useIsDesktop();

  // The hero stays pinned on desktop and dims as the next slide covers it.
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 650], [1, 0.1]);
  const scale = useTransform(scrollY, [0, 650], [1, 0.96]);

  return (
    <section className="relative md:sticky md:top-0 z-0 w-full md:h-[100svh] overflow-hidden bg-bg">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(71,67,41,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(71,67,41,0.06)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_25%,transparent_100%)]" />

      <motion.div
        style={isDesktop ? { opacity: fade, scale } : undefined}
        className="relative flex flex-col md:h-full px-5 md:px-10 pt-24 md:pt-24 pb-10 md:pb-6"
      >
        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className={`relative z-30 grid grid-cols-2 ${COLS} gap-x-8 gap-y-4 items-start`}
        >
          <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-mute leading-[2]">
            <div className="text-ink">Gian Benedict Bigay</div>
            <div>Automation Engineer · n8n</div>
          </div>
          <p className="hidden md:block text-[14px] leading-relaxed text-mute max-w-[42ch] mx-auto text-center">
            I build content pipelines, CRM systems, apps and websites that keep running after I log off.
          </p>
          <div className="text-right font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-mute leading-[2]">
            <div>Quezon City, PH · GMT+8</div>
            <div className="flex items-center justify-end gap-2 text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              Open for projects
            </div>
          </div>
        </motion.div>

        {/* Stage */}
        <div className={`relative z-20 mt-8 md:mt-6 grid grid-cols-1 ${COLS} gap-x-8 gap-y-10 md:flex-1 md:min-h-0`}>
          {/* Left: headline + neon signature */}
          <div className="relative min-w-0 flex flex-col justify-between md:min-h-0">
            <div className="relative text-[19vw] md:text-[min(7vw,13.5vh)] md:mt-[2vh]">
              <h1
                className="headline font-extrabold uppercase text-olive leading-[0.84] select-none"
                aria-label="Built once. Runs forever. Gian Benedict."
              >
                {LINES.map((line, i) => (
                  <span key={line} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
                    <motion.span
                      initial={{ y: '105%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 1, delay: 0.1 + i * 0.1, ease: EASE }}
                      className={`block ${i === 3 ? 'outline-text' : ''}`}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <span
                aria-hidden
                className="script neon neon-live absolute z-30 left-[22%] md:left-[42%] top-[1.02em] text-[0.5em] md:text-[0.62em] leading-none whitespace-nowrap -rotate-[8deg] pointer-events-none"
              >
                Gian Benedict
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="hidden md:flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-faint"
            >
              Scroll
              <motion.span
                animate={reduce ? undefined : { y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="inline-block w-px h-6 bg-gradient-to-b from-accent to-transparent"
              />
              <span className="ml-3">08 automations · 01 app · 02 websites</span>
            </motion.div>
          </div>

          {/* Center: studio portrait + voice call */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
            className="min-w-0 flex flex-col md:min-h-0"
          >
            <div className="relative h-[118vw] md:h-auto md:flex-1 md:min-h-0 [container-type:size]">
              <Portrait priority className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[min(100cqw,72cqh)] h-[min(139cqw,100cqh)]" />
            </div>
            <VoiceButton agent={agent} className="mt-5 md:mt-4 w-full max-w-[420px] mx-auto" />
          </motion.div>

          {/* Right: live chat with the AI clone */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
            className="min-w-0 flex flex-col md:min-h-0"
          >
            <div className="flex items-end gap-2 pl-1 pb-1">
              <span className="script neon neon-live text-[38px] md:text-[clamp(30px,3.1vw,46px)] leading-[1.15] -rotate-[3deg] whitespace-nowrap">
                Talk to my AI self
              </span>
              <svg aria-hidden viewBox="0 0 80 50" className="w-12 md:w-14 h-auto text-accent mb-[-6px] shrink-0" fill="none">
                <path d="M4 8 C 30 2, 58 10, 64 38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M54 30 L 64 40 L 72 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <ChatPanel agent={agent} className="h-[480px] md:h-auto md:flex-1 md:min-h-0" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
