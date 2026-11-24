'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// Real builds pinned around the portrait. Positions are % of the column so the
// collage scales with the hero.
export const WORK = [
  { id: 'cackle', src: '/work/cackle-timer.jpg', w: 1440, h: 900, label: 'Cackle', kind: 'Time-tracking SaaS', pos: 'left-[0%] top-[6%] w-[42%]', tilt: -4, depth: 26 },
  { id: 'ai-voice-receptionist', src: '/work/voice-receptionist.jpg', w: 1600, h: 1200, label: 'AI voice receptionist', kind: 'Vapi + n8n', pos: 'right-[1%] top-[2%] w-[30%]', tilt: 3, depth: 18 },
  { id: 'crm-call-intelligence', src: '/work/hero-n8n.jpg', w: 950, h: 195, label: 'Call intelligence report', kind: 'n8n workflow', pos: 'left-[-2%] bottom-[9%] w-[54%]', tilt: 2, depth: 34 },
] as const;

export function Shot({ src, w, h, alt }: { src: string; w: number; h: number; alt: string }) {
  // Nested radius: outer 14px with 6px padding means inner 8px.
  return (
    <span className="block rounded-[14px] bg-cardhi p-1.5 border border-[rgb(71_67_41/0.10)] shadow-[0_24px_50px_-24px_rgb(71_67_41/0.55)]">
      <Image src={src} alt={alt} width={w} height={h} sizes="(max-width: 768px) 45vw, 22vw" className="block h-auto w-full rounded-[8px]" />
    </span>
  );
}

// Work Peek: the builds drift a little with the cursor (each at its own depth),
// and hovering one straightens it, lifts it and names it. Mouse only; touch and
// Reduce Motion get still cards that are plain links.
export default function HeroWork({ ai }: { ai?: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 120, damping: 20, mass: 0.6 });

  const dx = useTransform(sx, (v) => v * 14);
  const dy = useTransform(sy, (v) => v * 14);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    setActive(null);
  };

  return (
    <div className="relative h-full w-full" onPointerMove={onMove} onPointerLeave={onLeave}>
      {/* Portrait: clean studio print, centered */}
      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[56%] overflow-hidden rounded-[28px] border border-[rgb(71_67_41/0.10)] bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,#FFFFFF_0%,#F3EADF_50%,#E2D2BE_100%)]">
        <Image
          src="/portrait.webp"
          alt="Gian Benedict Bigay"
          fill
          priority
          sizes="(max-width: 768px) 60vw, 28vw"
          className="object-contain object-bottom pt-[10%]"
        />
      </div>

      {WORK.map((p) => (
        <PeekCard
          key={p.id}
          p={p}
          sx={sx}
          sy={sy}
          active={active}
          onEnter={(e) => e.pointerType === 'mouse' && setActive(p.id)}
          onLeave={() => setActive(null)}
        />
      ))}

      {/* Live AI clone card: the biggest piece in the collage (desktop; phones get it under the collage). */}
      {ai && (
        <motion.div className="absolute right-0 z-20 hidden md:block w-[45%]" style={{ x: dx, y: dy, bottom: "24%" }}>
          {ai}
        </motion.div>
      )}
    </div>
  );
}

type Work = (typeof WORK)[number];

function PeekCard({
  p,
  sx,
  sy,
  active,
  onEnter,
  onLeave,
}: {
  p: Work;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  active: string | null;
  onEnter: (e: React.PointerEvent) => void;
  onLeave: () => void;
}) {
  const x = useTransform(sx, (v) => v * p.depth);
  const y = useTransform(sy, (v) => v * p.depth);
  const on = active === p.id;
  const dim = active !== null && !on;

  return (
    <Link
      href={`/work/${p.id}`}
      aria-label={`${p.label}, ${p.kind}`}
      data-peek={p.id}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={`group absolute ${p.pos} ${on ? 'z-30' : 'z-10'} focus-visible:outline-none`}
    >
      <motion.span className="block" style={{ x, y }}>
        <motion.span
          className="block"
          initial={false}
          animate={{ rotate: on ? 0 : p.tilt, scale: on ? 1.06 : 1, opacity: dim ? 0.55 : 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Shot src={p.src} w={p.w} h={p.h} alt="" />
        </motion.span>
        <span
          className={`pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-bg transition-[opacity,translate] duration-200 ease-out ${
            on ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
          } group-focus-visible:opacity-100 group-focus-visible:translate-y-0`}
        >
          {p.label} <span className="font-normal text-bg/70">· {p.kind}</span>
          <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 -mt-0.5" />
        </span>
      </motion.span>
    </Link>
  );
}
