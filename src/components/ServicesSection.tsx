'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { projects } from '@/lib/projects';
import { RevealLine } from './RevealLine';

const EASE = [0.16, 1, 0.3, 1] as const;

type Service = {
  id: string;
  title: string;
  line: string;
  tools: string;
  proof: string[]; // project ids that prove it (every build sits in exactly one service)
  image: string; // what the cursor preview shows
};

const SERVICES: Service[] = [
  {
    id: 'content',
    title: 'Content engines',
    line: 'One source feed in. A blog post, native posts for each platform and branded images out, approved before anything goes live.',
    tools: 'n8n · OpenRouter · WordPress · Airtable · Bannerbear',
    proof: ['demand-automation-network', 'self-healing-content', 'multi-category-editorial', 'autonomous-thought-leadership', 'omnichannel-creative', 'automated-newsletter'],
    image: '/out-care-social.jpg',
  },
  {
    id: 'voice',
    title: 'Voice agents',
    line: 'A receptionist that answers the phone, checks the calendar, books the slot and logs the call.',
    tools: 'Vapi · n8n · Google Calendar',
    proof: ['ai-voice-receptionist'],
    image: '/work/voice-receptionist.jpg',
  },
  {
    id: 'crm',
    title: 'CRM & reports',
    line: 'GoHighLevel pipelines and call reports that land in a sheet before anyone opens a laptop.',
    tools: 'GoHighLevel · n8n · Google Sheets',
    proof: ['crm-call-intelligence', 'intelligent-distribution'],
    image: '/work/cover-crm-call-intelligence.jpg',
  },
  {
    id: 'apps',
    title: 'Apps & sites',
    line: 'When the tool you need does not exist yet. A time-tracking SaaS, an offline-first finance app, a booking system, a store.',
    tools: 'Next.js · Supabase · Flutter · PHP · MySQL',
    proof: ['cackle', 'octi', 'udm-booking-system', 'vapehub'],
    image: '/work/cackle-wide.jpg',
  },
];

const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
const SHOWN = 3; // proof links listed per row; the rest live in the Work grid

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const subscribePointer = (cb: () => void) => {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useFinePointer = () =>
  useSyncExternalStore(subscribePointer, () => window.matchMedia(FINE_POINTER).matches, () => false);

/**
 * A preview card that follows the cursor with a little lag and leans into the
 * direction you move. The rAF loop only runs while a row is hovered, so it
 * costs nothing while you scroll.
 */
function useCursorPreview(enabled: boolean) {
  const card = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const showing = active !== null;

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !showing) return;
    pos.current = pos.current ?? { ...target.current };
    let raf = 0;
    const tick = () => {
      const p = pos.current!;
      const t = target.current;
      const dx = (t.x - p.x) * 0.14;
      p.x += dx;
      p.y += (t.y - p.y) * 0.14;
      const lean = Math.max(-12, Math.min(12, dx * 0.6)) - 3;
      if (card.current) card.current.style.transform = `translate3d(${p.x - 190}px, ${p.y - 135}px, 0) rotate(${lean}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, showing]);

  return { card, active, setActive };
}

export function ServicesSection() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const preview = fine && !reduce;
  const { card, active, setActive } = useCursorPreview(preview);

  return (
    <section id="services" className="scroll-mt-24 bg-bg px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="headline text-[clamp(44px,7vw,104px)] font-extrabold leading-[0.9] tracking-[-0.045em] text-ink">
            <RevealLine>Four things</RevealLine>
            <RevealLine delay={0.08}>I get hired for.</RevealLine>
          </h2>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-mute">
            Each one has shipped builds behind it.{fine ? ' Hover a row to see one.' : ''}
          </p>
        </div>

        <ul className="mt-14 border-t-[1.5px] border-ink/20 md:mt-20" onPointerLeave={() => setActive(null)}>
          {SERVICES.map((s, i) => {
            const first = byId[s.proof[0]];
            const extra = s.proof.length - SHOWN;
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                onPointerEnter={() => preview && setActive(i)}
                className="group relative isolate border-b-[1.5px] border-ink/20"
              >
                {/* mocha fill that wipes up from the bottom on hover / keyboard focus */}
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-ink [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-300 ease-out group-hover:[clip-path:inset(0)] group-focus-within:[clip-path:inset(0)] motion-reduce:transition-none"
                />
                <div className="grid gap-5 py-8 md:grid-cols-[1fr_minmax(0,380px)_56px] md:items-center md:gap-8 md:px-6 md:py-9">
                  <div>
                    <p className="text-[13px] font-bold text-accent-ink transition-colors group-hover:text-accent group-focus-within:text-accent">
                      {s.proof.length} {s.proof.length === 1 ? 'build' : 'builds'} shipped
                    </p>
                    <h3 className="headline mt-2 text-[clamp(38px,5.6vw,84px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink transition-[color,translate] duration-300 ease-out group-hover:translate-x-3 group-hover:text-bg group-focus-within:text-bg md:group-hover:translate-x-7 motion-reduce:transition-none">
                      {s.title}
                    </h3>
                  </div>

                  <div>
                    {/* touch screens (and reduced motion) get the screenshot inline instead of the cursor card */}
                    <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-ink/10 [@media(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:hidden">
                      <Image src={s.image} alt={`${first?.title ?? s.title} screenshot`} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover object-top" />
                    </div>
                    <p className="text-base leading-relaxed text-mute transition-colors group-hover:text-bg/85 group-focus-within:text-bg/85">{s.line}</p>
                    <p className="mt-2 text-[13px] text-faint transition-colors group-hover:text-bg/75 group-focus-within:text-bg/75">{s.tools}</p>
                    <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                      {s.proof.slice(0, SHOWN).map((id) => (
                        <Link
                          key={id}
                          href={`/work/${id}`}
                          className="inline-flex min-h-8 items-center text-accent-ink underline decoration-accent/60 decoration-2 underline-offset-4 transition-colors hover:decoration-accent group-hover:text-blush group-focus-within:text-blush"
                        >
                          {byId[id]?.title ?? id}
                        </Link>
                      ))}
                      {extra > 0 && (
                        <Link href="/#work" className="inline-flex min-h-8 items-center text-faint transition-colors hover:underline group-hover:text-bg/75 group-focus-within:text-bg/75">
                          +{extra} more
                        </Link>
                      )}
                    </p>
                  </div>

                  <Link
                    href={`/work/${s.proof[0]}`}
                    aria-label={`Open ${first?.title ?? s.title}`}
                    className="hidden h-14 w-14 place-items-center rounded-full ring-[1.5px] ring-ink/30 transition-[rotate,background-color] duration-300 ease-out group-hover:-rotate-45 group-hover:bg-accent group-hover:ring-accent group-focus-within:bg-accent group-focus-within:ring-accent md:grid motion-reduce:transition-none"
                  >
                    <ArrowRight className="h-5 w-5 text-ink group-hover:text-on-accent group-focus-within:text-on-accent" />
                  </Link>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col gap-3 text-base text-mute sm:flex-row sm:items-center sm:justify-between">
          <span>Not sure which one your problem is?</span>
          <Link
            href={`/ai-link/chat?q=${encodeURIComponent('Here is a process I want to automate: ')}`}
            className="self-start border-b-2 border-accent pb-0.5 font-bold text-accent-ink transition-colors hover:text-ink sm:self-auto"
          >
            Describe it to my AI self
          </Link>
        </div>
      </div>

      {/* cursor preview (mouse devices only) */}
      {preview && (
        <div ref={card} aria-hidden className="pointer-events-none fixed left-0 top-0 z-50 h-[270px] w-[380px]">
          <div
            className={`relative h-full w-full overflow-hidden rounded-[14px] shadow-[0_40px_80px_-30px_rgba(58,20,38,0.55),0_0_0_6px_#FBF7F1] transition-[opacity,scale] duration-300 ${
              active === null ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            {SERVICES.map((s, i) => (
              <Image
                key={s.id}
                src={s.image}
                alt=""
                fill
                sizes="380px"
                className={`object-cover object-top transition-[opacity,scale] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                  active === i ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
