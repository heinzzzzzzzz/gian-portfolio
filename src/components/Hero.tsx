'use client';

import { useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { useGianAgent } from '@/lib/useGianAgent';
import { useIntroDone } from '@/lib/intro';
import Portrait from './Portrait';
import VoiceButton from './VoiceButton';
import ChatPanel from './ChatPanel';
import NightGlam from './NightGlam';
import { ArrowRight } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;
const BOOKING = 'https://cal.com/gian-benedict-ctcofe/discovery-call';
const LINES = ['Built', 'once.', 'Runs', 'forever.'];
const COLS = 'md:grid-cols-[1.1fr_0.9fr_1fr]';

// The pinned, receding hero is a desktop effect; on phones the hero scrolls normally.
const DESKTOP = '(min-width: 768px)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useIsDesktop = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);

export default function Hero() {
  const agent = useGianAgent();
  const isDesktop = useIsDesktop();
  const ready = useIntroDone();

  // Scene exit: the hero pushes back and fades out while the next scene slides over it.
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 550], [1, 0]);
  const recede = useTransform(scrollY, [0, 900], [1, 0.9]);
  const drift = useTransform(scrollY, [0, 900], [0, -60]);
  const [covered, setCovered] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > window.innerHeight * 1.05;
    setCovered((c) => (c === next ? c : next));
  });

  const rise = (delay: number, y = 40) => ({
    initial: { opacity: 0, y },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { delay, duration: 1, ease: EASE },
  });

  return (
    <section
      className="relative md:sticky md:top-0 z-0 w-full md:h-[100svh] overflow-hidden bg-bg"
      style={isDesktop && covered ? { visibility: 'hidden' } : undefined}
    >
      <NightGlam />
      <div className="wall-grid absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgb(71_67_41/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(71_67_41/0.06)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_25%,transparent_100%)]" />

      <motion.div
        style={isDesktop ? { opacity: fade, scale: recede, y: drift, transformOrigin: '50% 40%' } : undefined}
        className="relative flex flex-col md:h-full px-5 md:px-10 pt-28 md:pt-24 pb-12 md:pb-6"
      >
        <div className={`relative z-20 grid grid-cols-1 ${COLS} gap-x-8 gap-y-12 md:flex-1 md:min-h-0`}>
          {/* Left: headline, one line, one button */}
          <div className="relative min-w-0 flex flex-col justify-between gap-10 md:min-h-0">
            <div className="relative text-[19vw] md:text-[min(7vw,13.5vh)] md:mt-[2vh]">
              <h1
                data-dim
                className="headline font-extrabold uppercase text-ink leading-[0.84] select-none"
                aria-label="Built once. Runs forever."
              >
                {LINES.map((line, i) => (
                  <span key={line} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
                    <motion.span
                      initial={{ y: '110%' }}
                      animate={ready ? { y: 0 } : { y: '110%' }}
                      transition={{ duration: 1.1, delay: 0.1 + i * 0.09, ease: EASE }}
                      className={`block ${i === 3 ? 'outline-text' : ''}`}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.span
                aria-hidden
                initial={{ opacity: 0 }}
                animate={ready ? { opacity: [0, 1, 0.35, 1, 0.6, 1] } : { opacity: 0 }}
                transition={{ delay: 0.75, duration: 0.9, times: [0, 0.2, 0.32, 0.5, 0.62, 1], ease: 'easeOut' }}
                className="script neon neon-live absolute z-30 left-[22%] md:left-[42%] top-[1.02em] text-[0.5em] md:text-[0.62em] leading-none whitespace-nowrap -rotate-[8deg] pointer-events-none"
              >
                Gian Benedict
              </motion.span>
            </div>

            <motion.div {...rise(0.6, 16)}>
              <p data-dim style={{ ['--dim-delay' as string]: '0.15s' }} className="max-w-[34ch] text-[15px] md:text-base leading-relaxed text-mute">
                I build n8n workflows and AI agents for agencies and founders. The AI on this page is one of them. Go ahead, talk to it.
              </p>
              <a
                href={BOOKING}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="book"
                data-dim
                style={{ ['--dim-delay' as string]: '0.25s' }}
                className="group mt-4 inline-flex h-12 items-center gap-3 rounded-full bg-ink pl-6 pr-1.5 text-[15px] font-semibold text-bg transition-colors duration-200 ease-out hover:bg-accent hover:text-on-accent"
              >
                Book a discovery call
                <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-bg text-ink">
                  <ArrowRight className="h-4 w-4 transition-transform duration-[250ms] ease-out motion-safe:group-hover:translate-x-8" />
                  <ArrowRight className="absolute h-4 w-4 -translate-x-8 transition-transform duration-[250ms] ease-out motion-safe:group-hover:translate-x-0" />
                </span>
              </a>
            </motion.div>
          </div>

          {/* Center: the big portrait, and the voice AI as the loudest button on the page */}
          <motion.div {...rise(0.2)} className="min-w-0 flex flex-col md:min-h-0">
            <div className="relative h-[118vw] md:h-auto md:flex-1 md:min-h-0 [container-type:size]">
              {/* Portrait's own root is position:relative, so the anchoring lives on this wrapper */}
              <div data-dim style={{ ['--dim-delay' as string]: '0.3s' }} className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[min(100cqw,72cqh)] h-[min(139cqw,100cqh)]">
                <Portrait priority className="h-full w-full" />
              </div>
            </div>
            {/* The bubble sits right above the call button it points to, over the
                empty floor of the portrait, so it never lands on the headline or face. */}
            <div className="relative mt-5 md:mt-4 w-full max-w-[440px] mx-auto">
              <SpeechBubble ready={ready} />
              <VoiceButton agent={agent} big className="w-full" />
            </div>
          </motion.div>

          {/* Right: live text chat with the same agent */}
          <motion.div {...rise(0.4)} className="min-w-0 flex flex-col md:min-h-0">
            <div className="flex items-end gap-2 pl-1 pb-1">
              <span className="script neon neon-live text-[38px] md:text-[clamp(30px,3.1vw,46px)] leading-[1.15] -rotate-[3deg] whitespace-nowrap">
                Talk to my AI self
              </span>
              <svg aria-hidden viewBox="0 0 80 50" className="w-12 md:w-14 h-auto text-accent-ink mb-[-6px] shrink-0" fill="none">
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

// A speech bubble pops up over the call button: typing dots first, then the line.
// It points people at the two ways in before they read anything else.
function SpeechBubble({ ready }: { ready: boolean }) {
  const [typed, setTyped] = useState(false);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-full z-10 mb-3 flex justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 10 }}
      animate={ready ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.6, y: 10 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
      onAnimationComplete={() => {
        if (ready) setTimeout(() => setTyped(true), 900);
      }}
      style={{ transformOrigin: '50% 100%' }}
      className="relative rounded-2xl bg-card border border-accent/40 px-3.5 py-2 text-center shadow-[0_16px_40px_-14px_rgb(255_111_166/0.8)] text-[13px] font-semibold text-ink whitespace-nowrap"
    >
      {/* tail pointing down at the call button */}
      <span className="absolute left-1/2 -bottom-[6px] h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-accent/40 bg-card" />
      <AnimatePresence mode="wait" initial={false}>
        {typed ? (
          <motion.span key="t" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="block">
            Call me or text me.
            <span className="block text-[11px] font-normal text-mute">I&apos;m Gian&apos;s AI. I pick up.</span>
          </motion.span>
        ) : (
          <motion.span key="d" exit={{ opacity: 0 }} className="flex gap-1.5 py-1">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.15 }}
                className="h-1.5 w-1.5 rounded-full bg-accent"
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
