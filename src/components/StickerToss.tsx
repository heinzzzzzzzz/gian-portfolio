'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useReduce } from './Scene';

// Between the hero and the work: what Gian builds, as fat cartoon stickers.
// The section pins (like "How a project goes") and the scroll itself throws
// them: each sticker flies in from off-screen spinning, slaps down with a
// squash-and-stretch and kicks up a little dust puff. Scroll back up and they
// fly back out. Scroll-driven, so nobody can miss it.

type S = { t: string; bg: string; fg: string; r: number; from: [number, number] };
const STICKERS: S[] = [
  { t: 'n8n workflows', bg: '#FF6FA6', fg: '#3A1426', r: -7, from: [-80, 10] },
  { t: 'AI chatbots', bg: '#FFD166', fg: '#474329', r: 5, from: [10, 80] },
  { t: 'Voice agents', bg: '#474329', fg: '#FBDCE7', r: -4, from: [80, -5] },
  { t: 'CRM automation', bg: '#C9B6E6', fg: '#2C2140', r: 6, from: [-80, 40] },
  { t: 'Built once, runs forever', bg: '#FBDCE7', fg: '#B0245F', r: -3, from: [80, 45] },
  { t: 'Talk to my AI', bg: '#8FD1A8', fg: '#1F3B2A', r: 8, from: [-15, 85] },
];
const PUFFS = [-2, -1, 0, 1, 2];
const N = STICKERS.length;

export default function StickerToss() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduce();
  // 0 when the section pins, 1 when it lets go
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <div ref={ref} className="relative h-[170vh] bg-bg">
      <div
        role="img"
        aria-label="What I build: n8n workflows, AI chatbots, voice agents, CRM automation."
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-5 select-none"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-7 md:gap-x-8 md:gap-y-10">
          {STICKERS.map((s, i) => (
            <Sticker key={s.t} s={s} i={i} progress={scrollYProgress} still={reduce} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Sticker({ s, i, progress, still }: { s: S; i: number; progress: MotionValue<number>; still: boolean }) {
  // Each sticker gets its own slice of the pinned scroll; the last lands at 90%.
  const start = (i / N) * 0.78;
  const end = start + 0.2;
  const t = useTransform(progress, [start, end], [0, 1], { clamp: true });

  // fly in on an arc, slap down (squash), rebound (stretch), settle
  const K = [0, 0.55, 0.8, 0.9, 1];
  const x = useTransform(t, K, [s.from[0], s.from[0] * 0.3, 0, 0, 0].map((v) => `${v}vw`));
  const y = useTransform(t, K, [s.from[1], s.from[1] * 0.3 - 12, 0, -1.2, 0].map((v) => `${v}vh`));
  const rotate = useTransform(t, K, [s.r * 18, s.r * 5, s.r, s.r, s.r]);
  const scaleX = useTransform(t, K, [1.25, 1.15, 1.2, 0.95, 1]);
  const scaleY = useTransform(t, K, [1.25, 1.15, 0.78, 1.07, 1]);
  const opacity = useTransform(t, [0, 0.04], [0, 1]);

  return (
    <motion.span
      className="relative inline-block"
      style={still ? { rotate: s.r } : { x, y, rotate, scaleX, scaleY, opacity, originY: 1 }}
    >
      <span
        className="headline relative block whitespace-nowrap rounded-2xl border-[5px] border-[#fffaf5] px-5 py-2.5 text-[clamp(20px,3vw,44px)] font-extrabold leading-none tracking-[-0.03em] shadow-[0_14px_28px_-12px_rgb(71_67_41/0.55),0_0_0_1.5px_rgb(71_67_41/0.12)] md:px-7 md:py-3.5"
        style={{ background: s.bg, color: s.fg }}
      >
        {s.t}
      </span>
      {!still && PUFFS.map((p) => <Puff key={p} p={p} t={t} />)}
    </motion.span>
  );
}

// A dust puff that bursts out sideways right as the sticker lands.
function Puff({ p, t }: { p: number; t: MotionValue<number> }) {
  const opacity = useTransform(t, [0.78, 0.84, 1], [0, 0.8, 0]);
  const x = useTransform(t, [0.78, 1], [0, p * 30]);
  const y = useTransform(t, [0.78, 1], [0, -6 - Math.abs(p) * 4]);
  const scale = useTransform(t, [0.78, 1], [0.4, 1.4]);
  return (
    <motion.span
      aria-hidden
      style={{ opacity, x, y, scale }}
      className="pointer-events-none absolute bottom-[-4px] left-1/2 h-3 w-3 rounded-full bg-ink/25"
    />
  );
}
