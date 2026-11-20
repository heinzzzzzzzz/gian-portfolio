'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useReduce } from '@/lib/motion';
import { useRouter } from 'next/navigation';
import { curtainNavigate } from '@/lib/theme';
import { DoorFrame, DoorLeaf, DOORWAY, HINGE_X, PHASE, type DoorLook } from './StoryDoor';
import ThemedImage from '@/components/ThemedImage';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { CATEGORY_LABEL, projectCounts, Project } from '@/lib/projects';
import { DOORS } from '@/lib/doors';


// Hand-built work (apps, websites, the voice demo) gets the glowing frame.
const isFeatured = (p: Project) => p.category !== 'automation' || p.status === 'demo';

// Hostname shown in the browser frame's address bar.
const hostFor = (p: Project) => (p.link ? new URL(p.link).host : p.id === 'vapehub' ? 'localhost/vapehub' : `${p.id}.app`);

function Cover({ p, wide }: { p: Project; wide: boolean }) {
  const sizes = wide ? '(max-width: 640px) 100vw, 66vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  if (p.frame === 'browser' && !p.mockup) {
    return (
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#FBDCE7,#E7D9C8)] px-4 pt-12 sm:px-5 sm:pt-14">
        <div className="relative h-full overflow-hidden rounded-t-xl bg-cardhi shadow-[0_18px_40px_-18px_rgba(71,67,41,0.55)] ring-1 ring-ink/10 transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <div className="flex items-center gap-2 border-b border-ink/10 bg-card px-3 py-2">
            <span className="flex gap-1.5" aria-hidden>
              <i className="h-2.5 w-2.5 rounded-full bg-[#ED6A5E]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#F5BF4F]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#61C554]" />
            </span>
            <span className="mx-auto truncate rounded-md bg-bg px-3 py-0.5 text-[11px] text-mute">{hostFor(p)}</span>
          </div>
          <div className="relative h-[calc(100%-33px)]">
            <ThemedImage src={p.image} alt={`${p.title} screenshot`} fill sizes={sizes} className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <ThemedImage
      src={p.image}
      alt={`${p.title} cover`}
      fill
      sizes={sizes}
      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
    />
  );
}
// The lead project gets a double-wide slot in the grid.
const isWide = (p: Project) => p.id === 'cackle';

export function BuildCard({ p, plain = false }: { p: Project; plain?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const featured = isFeatured(p);
  const wide = !plain && isWide(p);

  // Cursor spotlight + gentle 3D tilt, driven by CSS variables.
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    el.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
    el.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  };

  const inner = (
    <>
      <div className={`relative overflow-hidden bg-card ${wide ? 'aspect-[4/3] sm:aspect-[8/3]' : 'aspect-[4/3]'}`}>
        <Cover p={p} wide={wide} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <span className="absolute top-3 left-3 z-10 rounded-full bg-bg/95 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink ring-1 ring-ink/10">
          {CATEGORY_LABEL[p.category]}
        </span>
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          {featured && p.status !== 'demo' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-accent shadow-[0_0_18px_rgba(255,111,166,0.8)]">
              <Sparkles className="w-3 h-3" /> New
            </span>
          )}
          {p.status === 'demo' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blush px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-ink">
              Demo
            </span>
          )}
          {p.status === 'live' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bg">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7CFF9B]" /> Live
            </span>
          )}
        </div>

        {/* Hover call-to-action */}
        <span className="absolute left-1/2 bottom-4 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent shadow-[0_0_30px_rgba(255,111,166,0.9)] whitespace-nowrap">
          Open case study <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-faint">
          <span>{p.kind}</span>
          <span>{p.number} · {p.year}</span>
        </div>
        <h3 className={`mt-3 font-head font-bold text-ink flex items-start justify-between gap-3 group-hover:text-accent-ink transition-colors ${wide ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          <span>{p.title}</span>
          <ArrowUpRight className="mt-1 w-5 h-5 shrink-0 text-faint transition-all duration-300 group-hover:text-accent-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </h3>
        <p className="mt-2 text-sm text-mute leading-relaxed">{p.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.stack.slice(0, wide ? 6 : 4).map((s) => (
            <span key={s} className="rounded-md bg-bg/70 px-2 py-1 text-[11px] text-mute ring-1 ring-ink/10">
              {s}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <Link
      ref={ref}
      href={`/work/${p.id}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group card-tilt block h-full rounded-2xl ${
        featured ? 'glow-border p-[1.5px] shadow-[0_18px_50px_-22px_rgba(255,111,166,0.65)]' : 'border border-line'
      }`}
    >
      <div className={`spotlight relative h-full overflow-hidden bg-card ${featured ? 'rounded-[15px]' : 'rounded-2xl'}`}>
        {inner}
      </div>
    </Link>
  );
}

export default function WorksGrid() {
  const pin = useRef<HTMLDivElement>(null);
  const reduce = useReduce();
  const done = useMotionValue(1);
  // 0 when the section pins, 1 when it lets go. The doors build one after another.
  const { scrollYProgress } = useScroll({ target: pin, offset: ['start start', 'end end'] });
  const build = reduce ? done : scrollYProgress;

  return (
    <section id="work" ref={pin} className="relative h-[340vh] bg-bg">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-5 pt-24 pb-6 md:px-10 md:pt-24">
        {/* Header */}
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-ink">Selected work</p>
            <h2 className="headline mt-2 text-[clamp(36px,5vw,72px)] font-extrabold text-ink leading-[0.95]">
              Builds, by <span className="outline-text">category.</span>
            </h2>
            <span className="script neon absolute right-0 -bottom-7 sm:-right-24 text-[clamp(26px,2.6vw,40px)] whitespace-nowrap pointer-events-none -rotate-6">
              pick a door
            </span>
          </div>
          <p className="text-mute max-w-md text-[15px] leading-relaxed">
            Automations that ran daily for client brands, plus the apps and websites I build myself. Pick a door to walk through those builds.
          </p>
        </div>

        {/* Three doors, built by your scroll, one per category. Each opens its own page. */}
        <div className="mx-auto mt-6 grid min-h-0 w-full max-w-6xl flex-1 grid-cols-3 items-end gap-3 sm:gap-6 md:gap-10">
          {DOORS.map((d, i) => (
            <Door key={d.slug} d={d} build={build} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

const LOOKS: Record<string, DoorLook> = {
  automations: { stone: '#B9A8F5', stoneHi: '#DCD3FF', leaf: '#FF8FC8', leafShade: '#C2457F', detail: 'gear' },
  apps: { stone: '#FFC6A3', stoneHi: '#FFE3D2', leaf: '#8FDDB8', leafShade: '#2F8A63', detail: 'porthole' },
  websites: { stone: '#F7A8C8', stoneHi: '#FFD6E6', leaf: '#FFD978', leafShade: '#B88A1A', detail: 'heart' },
};

// A storybook door with a sign. Hover cracks it open (a pink glow and the first
// warm light shows through); click swings it wide while a curtain falls and
// "teleports" you into that category's room.
function Door({ d, i, build }: { d: (typeof DOORS)[number]; i: number; build: MotionValue<number> }) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const href = `/builds/${d.slug}`;
  const look = LOOKS[d.slug];
  // this door's slice of the pinned scroll: door 1, then 2, then 3
  const t = useTransform(build, [i * 0.28, i * 0.28 + 0.34], [0, 1], { clamp: true });
  const ready = useTransform(t, (v) => (v >= 0.999 ? 'auto' : 'none'));
  // the sign drops in on its strings and swings to rest
  const sign = useTransform(t, [PHASE.sign[0], PHASE.sign[1]], [0, 1], { clamp: true });
  const signY = useTransform(sign, [0, 0.6, 1], ['-260%', '8%', '0%']);
  const signR = useTransform(sign, [0, 0.6, 0.8, 1], [-14, 6, -4, -2]);
  const signO = useTransform(sign, [0, 0.1], [0, 1]);
  const label = useTransform(t, [0.95, 1], [0, 1]);
  const room = useTransform(t, [0.37, 0.42], [0, 1]);

  const go = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let new-tab clicks through
    e.preventDefault();
    setOpening(true);
    curtainNavigate(() => router.push(href));
  };

  return (
    <motion.div style={{ pointerEvents: ready }} className="flex h-full min-h-0 flex-col justify-end">
      <Link href={href} onClick={go} aria-label={`Door ${d.n}: ${d.label}, ${projectCounts[d.cat]} builds`} className="group block">
        <div className="relative mx-auto aspect-[300/470] w-full max-w-[min(280px,calc((100svh-330px)*0.64))] [container-type:inline-size] [perspective:1400px] transition-transform duration-300 group-hover:-translate-y-1">
          <DoorFrame look={look} t={t} />
          {/* a warm light switching on behind the door, no preview */}
          <motion.div className="absolute overflow-hidden rounded-t-full" style={{ ...DOORWAY, opacity: room }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_70%,#FFF3C4_0%,#FFC2DA_35%,rgb(255_111_166/0.55)_60%,#2a0f22_100%)]" />
          </motion.div>
          {/* the leaf swings on its hinge */}
          <div
            className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-safe:group-hover:[transform:rotateY(-26deg)]"
            style={{
              transformOrigin: `${HINGE_X} 50%`,
              ...(opening ? { transform: 'rotateY(-110deg)', transitionDuration: '700ms', transitionTimingFunction: 'cubic-bezier(0.6,0,0.2,1)' } : {}),
            }}
          >
            <DoorLeaf look={look} t={t} />
            {/* hanging sign */}
            <motion.div style={{ x: '-50%', y: signY, rotate: signR, opacity: signO }} className="absolute left-1/2 top-[56%] w-[62%] origin-top">
              <div className="mx-auto flex w-[46%] justify-between px-[8%]" aria-hidden>
                <span className="h-5 w-[3px] -rotate-12 bg-[#2E2350]" />
                <span className="h-5 w-[3px] rotate-12 bg-[#2E2350]" />
              </div>
              <div className="rounded-[5cqw] border-[3px] border-[#2E2350] bg-[#FFF8EE] px-[3cqw] py-[3cqw] text-center shadow-[0_5px_0_-1px_#2E2350]">
                <div className="text-[4cqw] font-bold uppercase tracking-[0.2em] text-[#B0245F]">Door {d.n}</div>
                <div className="headline mt-0.5 text-[8.5cqw] font-extrabold leading-none text-[#2E2350]">{d.label}</div>
                <div className="mt-1 text-[4.2cqw] font-semibold text-[#5F5943]">{String(projectCounts[d.cat]).padStart(2, '0')} builds</div>
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div style={{ opacity: label }} className="mt-3 text-center text-sm font-semibold text-mute transition-colors group-hover:text-accent-ink">
          Walk in <span aria-hidden>→</span>
        </motion.div>
      </Link>
    </motion.div>
  );
}
