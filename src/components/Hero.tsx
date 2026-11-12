'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Mic, Send } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

// Stacked headline, one line per entry. Editorial style: huge, uppercase, tight.
const LINES = ['Built', 'once.', 'Runs', 'forever.'];

export default function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState('');

  // Pointer parallax: figure and type drift in opposite directions.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const photoX = useTransform(sx, (v) => v * 18);
  const photoY = useTransform(sy, (v) => v * 10);
  const typeX = useTransform(sx, (v) => v * -14);
  const typeY = useTransform(sy, (v) => v * -6);

  // Scroll: the hero stays pinned and dims as the next slide covers it.
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 650], [1, 0.1]);
  const scale = useTransform(scrollY, [0, 650], [1, 0.95]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my, reduce]);

  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `/ai-link/chat?q=${encodeURIComponent(t)}` : '/ai-link/chat');
  };

  return (
    <section className="relative md:sticky md:top-0 z-0 w-full min-h-[100svh] md:h-[100svh] overflow-hidden bg-bg">
      {/* Paper texture lines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(47,46,34,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(47,46,34,0.07)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_55%_50%,#000_25%,transparent_100%)]" />

      <motion.div style={{ opacity: fade, scale }} className="relative min-h-[100svh] md:h-full">
        {/* Top meta row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="absolute top-20 md:top-24 inset-x-5 md:inset-x-10 z-30 grid grid-cols-2 md:grid-cols-12 gap-6 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-mute"
        >
          <div className="md:col-span-4 leading-[1.9]">
            <div className="text-ink">Gian Benedict Bigay</div>
            <div>Automation Engineer · n8n</div>
          </div>
          <div className="hidden md:block md:col-span-4 md:col-start-6 leading-[1.9] normal-case tracking-normal font-body text-[13px] text-mute max-w-[34ch]">
            I build content pipelines, CRM systems, apps and websites that keep running after I log off. One engine, retuned per client.
          </div>
          <div className="md:col-span-3 md:col-start-10 text-right leading-[1.9]">
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

        {/* Stacked headline */}
        <motion.h1
          style={{ x: typeX, y: typeY }}
          className="absolute z-10 left-4 md:left-10 top-[21%] md:top-[25%] headline font-extrabold uppercase text-olive leading-[0.82] text-[19vw] md:text-[11.5vw] select-none"
          aria-label="Built once. Runs forever."
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
        </motion.h1>

        {/* Figure: studio photo multiplied onto the paper */}
        <motion.div
          style={{ x: photoX, y: photoY }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
          className="absolute z-20 right-[-12%] md:right-[9%] bottom-[19%] md:bottom-0 h-[46svh] md:h-[86vh] aspect-[1000/1281]"
        >
          <Image
            src="/profile-cutout.png"
            alt="Gian Benedict Bigay"
            fill
            priority
            sizes="(max-width: 768px) 80vw, 45vw"
            className="object-contain object-bottom select-none pointer-events-none drop-shadow-[0_24px_40px_rgba(47,46,34,0.25)]"
          />
        </motion.div>

        {/* Script accent, like a signature across the type */}
        <motion.span
          initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: -7 }}
          transition={{ delay: 0.75, duration: 0.9, ease: EASE }}
          className="absolute z-30 left-[22%] md:left-[26%] top-[50%] md:top-[43%] serif-italic text-accent text-[14vw] md:text-[8vw] leading-none whitespace-nowrap pointer-events-none"
        >
          Gian Bigay
        </motion.span>

        {/* Bottom row: meta left, AI bar under the figure */}
        <div className="absolute z-30 inset-x-4 md:inset-x-10 bottom-5 md:bottom-8 grid md:grid-cols-12 gap-6 items-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="hidden md:block md:col-span-5 font-mono text-[10px] uppercase tracking-[0.22em] text-faint leading-[2]"
          >
            <div>No. 08 — automations</div>
            <div>No. 01 — app &nbsp;·&nbsp; No. 02 — websites</div>
            <div className="mt-3 flex items-center gap-3">
              Scroll
              <motion.span
                animate={reduce ? undefined : { y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="inline-block w-px h-6 bg-gradient-to-b from-accent to-transparent"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8, ease: EASE }}
            className="md:col-span-7 md:col-start-6"
          >
            <div className="rounded-2xl border border-line bg-card/85 backdrop-blur-xl p-3 md:p-4 shadow-[0_30px_80px_-30px_rgba(47,46,34,0.45)]">
              <div className="flex items-center justify-between gap-4 px-1.5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                  </span>
                  <p className="font-head font-bold text-base md:text-lg text-ink">
                    Talk to my <span className="serif-italic text-accent text-[1.25em]">AI self</span> right now.
                  </p>
                </div>
                <Link
                  href="/ai-link"
                  className="hidden sm:flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-mute hover:text-accent transition-colors"
                >
                  Open the link <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <form onSubmit={ask} className="flex items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ask about my systems, availability, or your process"
                  aria-label="Ask the AI clone"
                  className="flex-1 min-w-0 bg-cardhi border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-accent/70 transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Send to the text clone"
                  className="shrink-0 h-11 px-4 rounded-xl bg-ink text-bg font-semibold text-sm flex items-center gap-2 hover:bg-olive transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Text</span>
                </button>
                <Link
                  href="/ai-link/call"
                  aria-label="Start a voice call with the clone"
                  className="shrink-0 h-11 px-4 rounded-xl border border-line bg-cardhi text-ink text-sm font-semibold flex items-center gap-2 hover:border-accent hover:text-accent transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline">Voice</span>
                </Link>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
