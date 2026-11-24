'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { MessageCircle, Phone } from 'lucide-react';
import { useReduce } from '@/lib/motion';

/*
 * "Systems that run themselves": two real builds drawn as an n8n-style canvas
 * that wires itself up as you scroll (desktop pins it; phones get the same
 * steps as a list). Pink steps are where a person stays in charge, and the
 * last node is the live AI on this site, with chat and call right there.
 *
 * Canvas coordinates are a 760x640 design grid. Node boxes are placed in % of
 * that grid and sized in em, where 1em = 16 grid units (set on .lc-board via
 * container query units), so the whole board scales as one picture.
 */

type Node = {
  id: string;
  x: number;
  y: number;
  w?: number;
  title: string;
  sub: string;
  kind?: 'human' | 'ai';
  thumb?: string;
  at: [number, number]; // reveal range, % of the pinned scroll
};

const NODES: Node[] = [
  { id: 'n1', x: 0, y: 40, title: 'New article', sub: 'Inoreader feed', at: [0, 6] },
  { id: 'n2', x: 290, y: 40, title: 'AI writes it', sub: 'blog post + 5 social posts', at: [10, 16] },
  { id: 'n3', x: 570, y: 40, title: 'Branded images', sub: 'Bannerbear, per platform', at: [20, 26] },
  { id: 'n4', x: 570, y: 160, title: 'Scheduled', sub: 'GHL Social Planner', thumb: '/out-care-social.jpg', at: [28, 34] },
  { id: 'h1', x: 290, y: 190, title: 'You review', sub: 'type [REVISE] and it rewrites', kind: 'human', at: [36, 42] },
  { id: 'v1', x: 0, y: 340, title: 'Phone rings', sub: 'a patient calls the clinic', at: [48, 54] },
  { id: 'v2', x: 290, y: 340, title: 'Voice agent answers', sub: 'Vapi, talks it through', at: [56, 62] },
  { id: 'v3', x: 570, y: 340, title: 'Checks, then books', sub: 'n8n + Google Calendar', at: [64, 70] },
];

const WIRES: { d: string; at: [number, number]; pink?: boolean }[] = [
  { d: 'M190 78 C 240 78, 240 78, 290 78', at: [4, 12] },
  { d: 'M480 78 C 530 78, 530 78, 570 78', at: [14, 22] },
  { d: 'M665 116 C 665 136, 665 140, 665 160', at: [24, 30] },
  { d: 'M570 232 C 530 232, 520 232, 480 232', at: [32, 38] },
  { d: 'M385 190 C 385 160, 385 140, 385 118', at: [40, 46], pink: true },
  { d: 'M190 378 C 240 378, 240 378, 290 378', at: [52, 58] },
  { d: 'M480 378 C 530 378, 530 378, 570 378', at: [60, 66] },
  { d: 'M385 416 C 385 450, 420 470, 450 500', at: [70, 80], pink: true },
  { d: 'M665 416 C 665 460, 620 480, 590 500', at: [70, 80], pink: true },
];

const PACKETS: { d: string; at: [number, number]; dur: string }[] = [
  { d: 'M190 78 L 290 78 M 480 78 L 570 78', at: [24, 30], dur: '2.6s' },
  { d: 'M190 378 L 290 378 L 480 378 L 570 378', at: [66, 72], dur: '2.8s' },
];

const CHAT = '/ai-link/chat';
const CALL = '/ai-link/call';
const range = (at: [number, number]) => ({ animationRange: `contain ${at[0]}% contain ${at[1]}%` });

export default function LiveCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduce();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [built, setBuilt] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const n = NODES.filter((nd) => p * 100 >= nd.at[1]).length + (p * 100 >= 88 ? 1 : 0);
    setBuilt((b) => (b === n ? b : n));
  });
  const total = NODES.length + 1;
  const shown = reduce ? total : built;

  return (
    <section id="live" className="scroll-mt-24 bg-bg">
      {/* ---------- desktop: pinned canvas ---------- */}
      <div ref={ref} className="lc-stage relative hidden h-[320vh] lg:block">
        <div className="sticky top-0 mx-auto grid h-dvh max-w-[1400px] grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] items-center gap-12 px-10">
          <div>
            <p className="text-[15px] text-mute">Two real builds, wiring themselves up</p>
            <h2 className="headline mt-3 text-[clamp(48px,5.4vw,88px)] font-extrabold leading-[0.9] tracking-[-0.045em] text-ink">
              Systems that run <span className="text-accent-ink">themselves.</span>
            </h2>
            <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed text-mute">
              Keep scrolling and the workflows connect. The pink steps are where a person stays in charge, and the last one is live: the AI on this site.
            </p>
            <p className="mt-6 font-mono text-[13px] font-semibold text-faint" aria-live="polite">
              nodes connected: <span className="text-accent-ink">{shown}/{total}</span>
            </p>
          </div>

          <div className="lc-board relative mx-auto aspect-[760/640] w-[min(100%,calc(76dvh*760/640))] [container-type:inline-size]">
            <div className="absolute inset-0 text-[calc(100cqw*16/760)]">
              <svg viewBox="0 0 760 640" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                {WIRES.map((w, i) => (
                  <path
                    key={i}
                    d={w.d}
                    pathLength={1}
                    className={`lc-wire fill-none ${w.pink ? 'stroke-accent' : 'stroke-ink/40'}`}
                    strokeWidth={2.2}
                    style={range(w.at)}
                  />
                ))}
                {!reduce &&
                  PACKETS.map((pk, i) => (
                    <g key={i} className="lc-pop" style={range(pk.at)}>
                      <circle r={5} className="fill-accent">
                        <animateMotion dur={pk.dur} repeatCount="indefinite" path={pk.d} />
                      </circle>
                    </g>
                  ))}
              </svg>

              <Chip x={0} y={0} at={[0, 5]}>Caregiving content pipeline</Chip>
              <Chip x={0} y={300} at={[46, 50]}>AI voice receptionist</Chip>
              {NODES.map((n) => (
                <NodeCard key={n.id} n={n} />
              ))}

              {/* the live one */}
              <div
                className="lc-pop lc-live absolute rounded-[1em] bg-ink p-[0.9em] text-bg shadow-[0_24px_50px_-18px_rgba(255,111,166,0.9)] ring-2 ring-accent"
                style={{ left: `${(220 / 760) * 100}%`, top: `${(500 / 640) * 100}%`, width: `${(520 / 760) * 100}%`, ...range([78, 88]) }}
              >
                <p className="text-[1em] font-bold leading-tight">
                  This one is live: <span className="script neon text-[1.5em] font-normal">my AI self</span>
                </p>
                <p className="lc-live-sub mt-[0.2em] text-[0.8em] text-bg/80">Same kind of agent. Text it or call it, it answers like me.</p>
                <div className="mt-[0.6em] flex gap-[0.5em]">
                  <Link href={CHAT} className="inline-flex items-center gap-[0.4em] rounded-full bg-accent px-[0.9em] py-[0.45em] text-[0.85em] font-bold text-on-accent hover:bg-accent-deep">
                    <MessageCircle className="h-[1.1em] w-[1.1em]" /> Chat with it
                  </Link>
                  <Link href={CALL} className="inline-flex items-center gap-[0.4em] rounded-full bg-bg px-[0.9em] py-[0.45em] text-[0.85em] font-bold text-ink hover:bg-blush">
                    <Phone className="h-[1.1em] w-[1.1em]" /> Call it
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- phones + tablets: the same steps as a list ---------- */}
      <div className="px-5 py-24 md:px-10 lg:hidden">
        <p className="text-[15px] text-mute">Two real builds, wiring themselves up</p>
        <h2 className="headline mt-3 text-[clamp(44px,12vw,72px)] font-extrabold leading-[0.92] tracking-[-0.045em] text-ink">
          Systems that run <span className="text-accent-ink">themselves.</span>
        </h2>
        <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-mute">The pink steps are where a person stays in charge.</p>
        <Flow title="Caregiving content pipeline" nodes={[NODES[0], NODES[1], NODES[2], NODES[3], NODES[4]]} />
        <Flow title="AI voice receptionist" nodes={[NODES[5], NODES[6], NODES[7]]} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="lc-live mt-10 rounded-2xl bg-ink p-5 text-bg shadow-[0_24px_50px_-18px_rgba(255,111,166,0.9)] ring-2 ring-accent"
        >
          <p className="text-lg font-bold">
            This one is live: <span className="script neon text-2xl font-normal">my AI self</span>
          </p>
          <p className="lc-live-sub mt-1 text-sm text-bg/80">Same kind of agent. Text it or call it, it answers like me.</p>
          <div className="mt-4 flex gap-2">
            <Link href={CHAT} className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-on-accent">
              <MessageCircle className="h-4 w-4" /> Chat with it
            </Link>
            <Link href={CALL} className="inline-flex h-11 items-center gap-2 rounded-full bg-bg px-4 text-sm font-bold text-ink">
              <Phone className="h-4 w-4" /> Call it
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Chip({ x, y, at, children }: { x: number; y: number; at: [number, number]; children: React.ReactNode }) {
  return (
    <span
      className="lc-pop absolute rounded-full bg-blush px-[0.65em] py-[0.3em] text-[0.72em] font-bold tracking-[0.04em] text-accent-ink"
      style={{ left: `${(x / 760) * 100}%`, top: `${(y / 640) * 100}%`, ...range(at) }}
    >
      {children}
    </span>
  );
}

function NodeCard({ n }: { n: Node }) {
  const human = n.kind === 'human';
  return (
    <div
      className={`lc-pop absolute rounded-[0.9em] px-[0.85em] py-[0.7em] ${
        human
          ? 'bg-accent text-on-accent shadow-[0_18px_34px_-14px_rgba(255,111,166,0.9)]'
          : 'bg-card text-ink shadow-[0_16px_30px_-18px_rgba(71,67,41,0.5)] ring-[1.5px] ring-ink/20'
      }`}
      style={{ left: `${(n.x / 760) * 100}%`, top: `${(n.y / 640) * 100}%`, width: `${((n.w ?? 190) / 760) * 100}%`, ...range(n.at) }}
    >
      <p className="text-[0.88em] font-bold leading-tight">{n.title}</p>
      <p className={`mt-[0.15em] text-[0.74em] leading-snug ${human ? 'text-on-accent' : 'text-faint'}`}>{n.sub}</p>
      {n.thumb && (
        <div className="relative mt-[0.5em] aspect-[16/9] overflow-hidden rounded-[0.5em] ring-1 ring-ink/10">
          <Image src={n.thumb} alt="Scheduled posts in the social planner" fill sizes="200px" className="object-cover object-top" />
        </div>
      )}
    </div>
  );
}

function Flow({ title, nodes }: { title: string; nodes: Node[] }) {
  return (
    <div className="mt-10">
      <p className="inline-block rounded-full bg-blush px-3 py-1 text-xs font-bold text-accent-ink">{title}</p>
      <ol className="mt-4">
        {nodes.map((n, i) => (
          <motion.li
            key={n.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="relative pb-4 pl-8 last:pb-0"
          >
            {i < nodes.length - 1 && <span className="absolute left-[7px] top-5 h-full border-l-2 border-dashed border-ink/30" />}
            <span className={`absolute left-0 top-3 h-4 w-4 rounded-full ${n.kind === 'human' ? 'bg-accent' : 'bg-ink'}`} />
            <div className={`rounded-xl px-4 py-3 ${n.kind === 'human' ? 'bg-accent text-on-accent' : 'bg-card text-ink ring-[1.5px] ring-ink/15'}`}>
              <p className="text-[15px] font-bold">{n.title}</p>
              <p className={`text-[13px] ${n.kind === 'human' ? 'text-on-accent' : 'text-faint'}`}>{n.sub}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
