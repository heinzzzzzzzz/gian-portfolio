'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { curtainNavigate } from '@/lib/theme';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { projects } from '@/lib/projects';
import { DOORS } from '@/lib/doors';
import { useReduce } from '@/lib/motion';
import ThemedImage from './ThemedImage';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/projects';

const EASE = [0.16, 1, 0.3, 1] as const;

// The room behind a door (you arrive through the curtain). The page pins and your scroll slides the builds
// past sideways, one big preview at a time. Every card opens its case study;
// the top bar always has a way back to the doors.
export default function BuildsHall({ slug }: { slug: string }) {
  const door = DOORS.find((d) => d.slug === slug)!;
  const items = projects.filter((p) => p.category === door.cat);
  const others = DOORS.filter((d) => d.slug !== slug);
  const next = DOORS[(DOORS.indexOf(door) + 1) % DOORS.length];
  const reduce = useReduce();
  const router = useRouter();
  // Leaving the room: the curtain falls and you land back on the doors (or the next room).
  const via = (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    curtainNavigate(() => router.push(href));
  };

  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  // How far the row has to travel: its width minus the screen width.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setShift(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: pin, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -shift]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <main id="main" className="bg-bg text-ink selection:bg-accent/30">
      <div ref={pin} className="relative" style={{ height: `${100 + items.length * 70}vh` }}>
        <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
          {/* top bar */}
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 px-5 pt-24 md:px-10 md:pt-28">
            <div>
              <Link
                href="/#work"
                onClick={via('/#work')}
                className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-mute transition-colors hover:text-accent-ink"
              >
                <ArrowLeft className="h-4 w-4" /> Back to all doors
              </Link>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="script neon text-[28px] leading-none -rotate-6">Door {door.n}</span>
                <h1 className="headline text-[clamp(32px,4.2vw,60px)] font-extrabold leading-[1.05] tracking-[-0.04em]">{door.label}</h1>
                <span className="text-sm text-mute">{String(items.length).padStart(2, '0')} builds</span>
              </div>
            </div>
            <nav aria-label="Other doors" className="flex gap-2">
              {others.map((d) => (
                <Link
                  key={d.slug}
                  href={`/builds/${d.slug}`}
                  onClick={via(`/builds/${d.slug}`)}
                  className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-mute transition-colors hover:border-accent hover:text-accent-ink"
                >
                  Door {d.n} · {d.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* the sideways row */}
          <div className="relative flex min-h-0 flex-1 items-start pt-8 md:pt-10">
            <motion.div ref={track} style={{ x }} className="flex items-stretch gap-6 px-5 md:gap-10 md:px-10">
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={reduce ? false : { opacity: 0, x: 120 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.35 + i * 0.08, ease: EASE }}
                  className="w-[min(84vw,760px,calc((100svh-490px)*1.78))] min-w-[280px] shrink-0"
                >
                  <RoomCard p={p} />
                </motion.div>
              ))}
              {/* end of the hall */}
              <div className="flex w-[min(82vw,340px)] shrink-0 flex-col items-start justify-center gap-4 rounded-2xl border-2 border-dashed border-line p-8">
                <p className="text-sm text-mute">That&apos;s everything behind door {door.n}.</p>
                <Link
                  href={`/builds/${next.slug}`}
                  onClick={via(`/builds/${next.slug}`)}
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent hover:text-on-accent"
                >
                  Next: door {next.n}, {next.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/#work" onClick={via('/#work')} className="text-sm font-semibold text-mute underline-offset-4 hover:text-accent-ink hover:underline">
                  Back to all doors
                </Link>
              </div>
            </motion.div>
          </div>

          {/* how far along the hall you are */}
          <div className="mx-5 mb-8 h-[3px] overflow-hidden rounded-full bg-line md:mx-10">
            <motion.div style={{ scaleX: bar, transformOrigin: '0% 50%' }} className="h-full bg-accent" />
          </div>
        </div>
      </div>
    </main>
  );
}

// A wide preview: the screenshot big, then just the name and a two-line pitch.
// Landscape on purpose, so it never looks stretched on a tall or short screen.
function RoomCard({ p }: { p: Project }) {
  return (
    <Link
      href={`/work/${p.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-card shadow-[0_24px_60px_-30px_rgb(71_67_41/0.6)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1.5px_rgb(255_111_166/0.7),0_30px_70px_-28px_rgb(255_111_166/0.6)]"
    >
      <div className="relative aspect-video overflow-hidden">
        <ThemedImage
          src={p.image}
          alt={`${p.title} preview`}
          fill
          sizes="(max-width: 768px) 84vw, 760px"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {p.status === 'live' && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bg">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7CFF9B]" /> Live
          </span>
        )}
        {p.status === 'demo' && (
          <span className="absolute right-3 top-3 rounded-full bg-blush px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-ink">Demo</span>
        )}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-3 whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent opacity-0 shadow-[0_0_26px_rgb(255_111_166/0.85)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Open case study
        </span>
      </div>
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-faint">
            {p.kind} · {p.year}
          </div>
          <h3 className="mt-1 truncate font-head text-[clamp(18px,1.6vw,22px)] font-bold text-ink transition-colors group-hover:text-accent-ink">{p.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-mute">{p.tagline}</p>
        </div>
        <ArrowUpRight className="mt-5 h-5 w-5 shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-ink" />
      </div>
    </Link>
  );
}
