'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { MessageCircle, Phone, PhoneOff, Loader2, ArrowRight } from 'lucide-react';
import { useGianAgent } from '@/lib/useGianAgent';
import { useIntroDone } from '@/lib/intro';
import { stage, useStage } from '@/lib/stage';
import NightGlam from './NightGlam';
import ChatDialog from './ChatDialog';
import FloatingAI from './FloatingAI';
import CallPanel from './CallPanel';

const EASE = [0.16, 1, 0.3, 1] as const;
const BOOKING = 'https://cal.com/gian-benedict-ctcofe/discovery-call';
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const DESKTOP = '(min-width: 1024px)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useIsDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);
const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false);

/*
 * Hero: Gian's AI is calling you. The 3D phone (drawn by Stage3D) rings in the
 * slot on the right; tap it, or press Answer, to start the real voice call.
 * Text opens the chat panel. After the hero the phone rides in the corner.
 */
export default function Hero() {
  const agent = useGianAgent();
  const isDesktop = useIsDesktop();
  const mounted = useMounted();
  const ready = useIntroDone();
  const has3D = useStage((s) => s.ready);
  const chatRef = useRef<HTMLDialogElement>(null);
  const openChat = useCallback(() => chatRef.current?.showModal(), []);
  const { status, seconds, volume, speaking, toggle } = agent.call;
  const active = status === 'active';
  const connecting = status === 'connecting';

  // a call opens the call panel (and the 3D phone flies over to its left)
  const [callOpen, setCallOpen] = useState(false);
  const [lastStatus, setLastStatus] = useState(status);
  if (status !== lastStatus) {
    setLastStatus(status);
    if (status === 'connecting') setCallOpen(true);
  }
  const closeCall = useCallback(() => setCallOpen(false), []);
  // dev only: lets the screenshot scripts open the call panel without a real (paid) Vapi call
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    (window as unknown as { __demoCall?: () => void }).__demoCall = () => setCallOpen(true);
  }, []);
  useEffect(() => {
    if (callOpen) chatRef.current?.close(); // the call panel replaces the chat window
  }, [callOpen]);
  useEffect(() => {
    stage.set({ callPanel: callOpen });
  }, [callOpen]);

  // the 3D phone shows the call state on its screen
  useEffect(() => {
    stage.set({ call: { status: status === 'error' ? 'error' : active ? 'active' : connecting ? 'connecting' : 'idle', seconds, volume, speaking } });
  }, [status, active, connecting, seconds, volume, speaking]);

  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 500], [1, 0]);
  const [covered, setCovered] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > window.innerHeight * 1.05;
    setCovered((c) => (c === next ? c : next));
  });

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { delay, duration: 0.9, ease: EASE },
  });

  return (
    <section
      className="relative z-0 w-full overflow-hidden bg-bg lg:sticky lg:top-0 lg:h-[100svh] lg:min-h-[620px]"
      style={isDesktop && covered ? { visibility: 'hidden' } : undefined}
    >
      <NightGlam />
      <motion.div
        style={isDesktop ? { opacity: fade } : undefined}
        className="relative mx-auto grid max-w-7xl items-center gap-6 px-5 pb-16 pt-24 lg:h-full lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10 lg:pb-8 lg:pt-20"
      >
        {/* Who he is, and the two ways in */}
        <div className="order-2 lg:order-none">
          <motion.p {...rise(0.1)} className="script neon neon-live -rotate-[4deg] text-[40px] leading-none lg:text-[clamp(36px,3.4vw,54px)]">
            Gian Benedict
          </motion.p>
          <motion.h1 {...rise(0.18)} className="headline mt-3 text-[clamp(46px,12vw,64px)] font-extrabold leading-[0.9] tracking-[-0.045em] text-ink lg:text-[clamp(52px,6vw,96px)]">
            Automation specialist<span className="text-accent-ink">.</span>
          </motion.h1>
          <motion.p {...rise(0.26)} className="mt-5 max-w-[38ch] text-[17px] leading-relaxed text-mute lg:text-lg">
            I build n8n workflows and AI agents for agencies and founders. That phone is my AI calling you. Pick up, or text it back.
          </motion.p>
          <motion.div {...rise(0.34)} className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggle}
              className={`inline-flex h-14 items-center gap-2.5 rounded-full px-6 text-base font-bold transition-transform duration-200 ease-out hover:-translate-y-0.5 ${
                active ? 'bg-ink text-bg' : 'bg-accent text-on-accent shadow-[0_16px_36px_-10px_rgba(255,111,166,1)]'
              }`}
            >
              {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : active ? <PhoneOff className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              {connecting ? 'Connecting…' : active ? `Hang up · ${fmt(seconds)}` : 'Answer the call'}
            </button>
            <button
              type="button"
              onClick={openChat}
              className="inline-flex h-14 items-center gap-2.5 rounded-full bg-card px-6 text-base font-bold text-ink ring-2 ring-ink/15 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:ring-accent"
            >
              <MessageCircle className="h-5 w-5" /> Text it back
            </button>
          </motion.div>
          {status === 'error' && (
            <p className="mt-3 text-sm text-accent-ink" role="alert">
              Couldn&apos;t connect: {agent.call.error}. Allow the mic, then try again.
            </p>
          )}
          <motion.a
            {...rise(0.42)}
            href={BOOKING}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="book"
            className="group mt-6 inline-flex items-center gap-2 border-b-2 border-ink/25 pb-1 text-[15px] font-bold text-ink transition-colors hover:border-accent hover:text-accent-ink"
          >
            Or book 20 minutes with the real me
            <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1" />
          </motion.a>
        </div>

        {/* Where the 3D phone rings. The phone itself is the answer button. */}
        <div className="relative order-1 lg:order-none">
          <button
            type="button"
            data-phone-slot
            onClick={toggle}
            aria-label={active ? 'End the call with Gian’s AI' : 'Answer the call from Gian’s AI'}
            className="relative mx-auto block h-[min(440px,58svh)] w-full touch-pan-y rounded-[40px] lg:h-[min(76svh,720px)]"
          >
            {/* flat fallback while 3D loads, or if the device has no WebGL */}
            {!has3D && (
              <span className="absolute left-1/2 top-1/2 block aspect-[1/2.04] h-[88%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[36px] bg-ink p-2 shadow-2xl">
                <span className="relative block h-full w-full overflow-hidden rounded-[30px] bg-[linear-gradient(160deg,#FFE9F1,#F2B8CF)]">
                  <span className="absolute left-1/2 top-[22%] block h-28 w-28 -translate-x-1/2 overflow-hidden rounded-full ring-4 ring-accent/50">
                    <Image src="/avatar.jpg" alt="" fill sizes="112px" className="object-cover" />
                  </span>
                  <span className="absolute inset-x-0 top-[52%] text-center text-2xl font-extrabold text-ink">Gian&apos;s AI</span>
                </span>
              </span>
            )}
          </button>
          <p className="mt-2 text-center text-[13px] font-semibold text-mute" aria-hidden>
            {active ? 'On a call. Tap the phone to hang up.' : 'Tap the phone to answer, or grab it and spin it'}
          </p>
        </div>
      </motion.div>

      {mounted &&
        createPortal(
          <>
            <ChatDialog ref={chatRef} agent={agent} />
            <CallPanel agent={agent} open={callOpen} onClose={closeCall} />
            <FloatingAI agent={agent} onChat={openChat} />
          </>,
          document.body,
        )}
    </section>
  );
}
