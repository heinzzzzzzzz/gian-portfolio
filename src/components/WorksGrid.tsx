'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { projects, CATEGORIES, CATEGORY_LABEL, projectCounts, Category, Project } from '@/lib/projects';
import { stackTicker } from '@/lib/skills';

const EASE = [0.16, 1, 0.3, 1] as const;

// Apps and websites are the newest, hand-built work, so they get the glowing frame.
const isFeatured = (p: Project) => p.category !== 'automation';
// Octi gets a double-wide slot in the grid.
const isWide = (p: Project) => p.id === 'octi';

function BuildCard({ p }: { p: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const featured = isFeatured(p);
  const wide = isWide(p);

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
        <Image
          src={p.image}
          alt={p.title}
          fill
          sizes={wide ? '(max-width: 640px) 100vw, 66vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <span className="absolute top-3 left-3 rounded-full bg-bg/95 border border-line px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-ink">
          {CATEGORY_LABEL[p.category]}
        </span>
        <div className="absolute top-3 right-3 flex gap-1.5">
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-white shadow-[0_0_18px_rgba(255,111,166,0.8)]">
              <Sparkles className="w-3 h-3" /> New
            </span>
          )}
          {p.link && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-bg">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7CFF9B] animate-pulse" /> Live
            </span>
          )}
        </div>

        {/* Hover call-to-action */}
        <span className="absolute left-1/2 bottom-4 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(255,111,166,0.9)] whitespace-nowrap">
          Open case study <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-faint">
          <span>{p.kind}</span>
          <span>{p.number} · {p.year}</span>
        </div>
        <h3 className={`mt-3 font-head font-bold text-ink flex items-start justify-between gap-3 group-hover:text-accent-deep transition-colors ${wide ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          <span>{p.title}</span>
          <ArrowUpRight className="mt-1 w-5 h-5 shrink-0 text-faint transition-all duration-300 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </h3>
        <p className="mt-2 text-sm text-mute leading-relaxed">{p.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.stack.slice(0, wide ? 6 : 4).map((s) => (
            <span key={s} className="rounded-md border border-line bg-bg/60 px-2 py-1 text-[11px] text-mute">
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
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const visible = projects.filter((p) => filter === 'all' || p.category === filter);

  return (
    <section id="work" className="relative bg-bg">
      {/* Ticker band: the leading edge of the slide that covers the hero */}
      <div className="bg-olive text-bg overflow-hidden">
        <div
          className="marquee flex w-max items-center py-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em]"
          style={{ '--marquee-duration': '45s' } as React.CSSProperties}
        >
          {[...stackTicker, ...stackTicker].map((s, i) => (
            <span key={i} className="flex items-center">
              <span className="px-6">{s}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-28">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="relative">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent"
            >
              Selected work
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="headline mt-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-ink leading-[0.92]"
            >
              Builds, by<br />
              <span className="outline-text">category.</span>
            </motion.h2>
            <motion.span
              initial={{ opacity: 0, rotate: -12, scale: 0.9 }}
              whileInView={{ opacity: 1, rotate: -8, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
              className="script neon absolute right-0 sm:-right-28 bottom-2 text-4xl md:text-5xl whitespace-nowrap pointer-events-none"
            >
              pick one
            </motion.span>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-mute max-w-md text-base leading-relaxed"
          >
            Automations that run every day at Intention Technology, plus the apps and websites I build on my own. Every card opens a case study with real screenshots.
          </motion.p>
        </div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-12 inline-flex max-w-full overflow-x-auto no-scrollbar gap-1 rounded-full border border-line bg-card/70 p-1"
        >
          {CATEGORIES.map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`relative shrink-0 whitespace-nowrap rounded-full px-3.5 sm:px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-mute hover:text-ink'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="work-filter-pill"
                    className="absolute inset-0 rounded-full bg-accent shadow-[0_0_20px_rgba(255,111,166,0.7)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {c.label}
                  <span className={`font-mono text-[10px] ${active ? 'text-white/80' : 'text-faint'}`}>
                    {String(projectCounts[c.id]).padStart(2, '0')}
                  </span>
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Grid */}
        <motion.div layout className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4), ease: EASE }}
                className={isWide(p) ? 'sm:col-span-2' : ''}
              >
                <BuildCard p={p} />
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
