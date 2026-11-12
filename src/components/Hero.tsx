'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, Send } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

// Stacked headline, one line per entry. Editorial style: huge, uppercase, tight.
const LINES = ['Built', 'once.', 'Runs', 'forever.'];

// Questions the input "types" by itself so visitors see what they can ask.
const PROMPTS = [
  'What do you automate?',
  'Can you build my content pipeline?',
  'Are you available this month?',
  'What is Octi?',
  'How does a project with you start?',
];

function useTypewriter(lines: string[], enabled: boolean) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!enabled) return;
    let line = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = lines[line];
      if (!deleting) {
        char++;
        setText(full.slice(0, char));
        if (char === full.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 55);
      } else {
        char--;
        setText(full.slice(0, char));
        if (char === 0) {
          deleting = false;
          line = (line + 1) % lines.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 25);
      }
    };
    timer = setTimeout(tick, 1600);
    return () => clearTimeout(timer);
  }, [lines, enabled]);
  return text;
}

export default function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const typed = useTypewriter(PROMPTS, !reduce && !focused && q === '');

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
      {/* Paper grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(71,67,41,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(71,67,41,0.06)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_55%_50%,#000_25%,transparent_100%)]" />

      <motion.div
        style={{ opacity: fade, scale }}
        className="relative flex flex-col min-h-[100svh] md:h-full px-5 md:px-10 pt-24 md:pt-28 pb-5 md:pb-8"
      >
        {/* Top meta row: three columns with room to breathe */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="relative z-30 grid grid-cols-2 md:grid-cols-12 gap-6 items-start"
        >
          <div className="md:col-span-3 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-mute leading-[2]">
            <div className="text-ink">Gian Benedict Bigay</div>
            <div>Automation Engineer · n8n</div>
          </div>
          <p className="hidden md:block md:col-span-4 md:col-start-5 text-[15px] leading-relaxed text-mute max-w-[44ch]">
            I build content pipelines, CRM systems, apps and websites that keep running after I log off. One engine, retuned for every client.
          </p>
          <div className="md:col-span-3 md:col-start-10 text-right font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-mute leading-[2]">
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
        <div className="relative flex-1 min-h-0 mt-8 md:mt-10">
          {/* Headline + neon signature, sized to fit the viewport height */}
          <motion.div
            style={{ x: typeX, y: typeY }}
            className="absolute left-0 top-0 z-10 text-[19vw] md:text-[min(10.5vw,15vh)]"
          >
            <h1
              className="headline font-extrabold uppercase text-olive leading-[0.84] select-none"
              aria-label="Built once. Runs forever. Gian Bigay."
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
              className="script neon neon-live absolute z-30 left-[46%] top-[1.02em] text-[0.62em] leading-none whitespace-nowrap -rotate-[8deg] pointer-events-none"
            >
              Gian Bigay
            </span>
          </motion.div>

          {/* Figure with pink aura. On desktop it runs down behind the AI bar. */}
          <motion.div
            style={{ x: photoX, y: photoY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
            className="absolute z-20 right-[-14%] md:right-[5%] bottom-0 md:-bottom-[12rem] h-[72%] md:h-[calc(100%+12rem)] aspect-[1000/1281]"
          >
            <div className="aura absolute left-[8%] right-[8%] top-[2%] bottom-[20%] rounded-full pointer-events-none" />
            <Image
              src="/profile-cutout.png"
              alt="Gian Benedict Bigay"
              fill
              priority
              sizes="(max-width: 768px) 80vw, 45vw"
              className="aura-edge object-contain object-bottom select-none pointer-events-none"
            />

            {/* Speech bubble from the AI clone, desktop only */}
            <Link
              href="/ai-link/chat"
              className="hidden lg:flex absolute z-30 -left-[34%] top-[9%] items-start gap-2 group"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.6, ease: EASE }}
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="relative rounded-2xl rounded-br-md bg-card/95 backdrop-blur border border-accent/50 px-4 py-3 shadow-[0_10px_40px_-10px_rgba(255,111,166,0.6)] max-w-[250px] group-hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Gian&apos;s AI · online
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-ink">
                    Hi! I&apos;m the AI version of me. Ask me anything about my work.
                  </p>
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: d * 0.2 }}
                        className="h-1.5 w-1.5 rounded-full bg-accent"
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="relative z-30 mt-4 md:mt-6 grid md:grid-cols-12 gap-6 items-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="hidden md:flex md:col-span-4 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-faint"
          >
            Scroll
            <motion.span
              animate={reduce ? undefined : { y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="inline-block w-px h-6 bg-gradient-to-b from-accent to-transparent"
            />
            <span className="ml-4">08 automations · 01 app · 02 websites</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8, ease: EASE }}
            className="md:col-span-7 md:col-start-6"
          >
            {/* Neon callout with a hand-drawn arrow into the bar */}
            <div className="flex items-end gap-2 pl-2 -mb-1">
              <span className="script neon neon-live text-[34px] md:text-[44px] leading-none -rotate-[3deg]">
                Talk to my AI self
              </span>
              <svg aria-hidden viewBox="0 0 80 50" className="w-14 md:w-16 h-auto text-accent mb-[-10px]" fill="none">
                <path d="M4 8 C 30 2, 58 10, 64 38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M54 30 L 64 40 L 72 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="relative rounded-2xl p-[1.5px] glow-border shadow-[0_24px_70px_-24px_rgba(255,111,166,0.7)]">
              <div className="rounded-[15px] bg-card/95 backdrop-blur-xl p-3 md:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1.5 pb-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    Live AI agent
                  </span>
                  <span className="text-[12px] text-mute">Trained on my work · answers in about a second · text or voice</span>
                </div>
                <form onSubmit={ask} className="flex items-center gap-2">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={reduce || focused ? 'Ask me anything about my work' : `${typed}|`}
                    aria-label="Ask the AI clone"
                    className="flex-1 min-w-0 bg-cardhi border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Send to the text clone"
                    className="shrink-0 h-11 px-4 rounded-xl bg-ink text-bg font-semibold text-sm flex items-center gap-2 hover:bg-accent hover:text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask</span>
                  </button>
                  <Link
                    href="/ai-link/call"
                    aria-label="Start a voice call with the clone"
                    className="shrink-0 h-11 px-4 rounded-xl border border-line bg-cardhi text-ink text-sm font-semibold flex items-center gap-2 hover:border-accent hover:text-accent transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                    <span className="hidden sm:inline">Call</span>
                  </Link>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
