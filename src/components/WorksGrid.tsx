'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { projects, CATEGORIES, CATEGORY_LABEL, projectCounts, Category } from '@/lib/projects';
import { stackTicker } from '@/lib/skills';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function WorksGrid() {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const visible = projects.filter((p) => filter === 'all' || p.category === filter);

  return (
    <section id="work" className="relative bg-bg">
      {/* Lime ticker band: the leading edge of the slide that covers the hero */}
      <div className="bg-olive text-bg overflow-hidden">
        <div
          className="marquee flex w-max items-center py-3 font-mono text-[11px] font-medium uppercase tracking-[0.25em]"
          style={{ '--marquee-duration': '45s' } as React.CSSProperties}
        >
          {[...stackTicker, ...stackTicker].map((s, i) => (
            <span key={i} className="flex items-center">
              <span className="px-6">{s}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-bg/50" />
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-28">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
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
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-mute max-w-md text-base leading-relaxed"
          >
            Automations that run every day at Intention Technology, plus the apps and websites I build on my own. Every item opens a case study with real screenshots.
          </motion.p>
        </div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-12 flex flex-wrap gap-2"
        >
          {CATEGORIES.map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-bg' : 'text-mute hover:text-ink'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="work-filter-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {c.label}
                  <span className={`font-mono text-[10px] ${active ? 'text-bg/70' : 'text-faint'}`}>
                    {String(projectCounts[c.id]).padStart(2, '0')}
                  </span>
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Grid */}
        <motion.div layout className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4), ease: EASE }}
              >
                <Link
                  href={`/work/${p.id}`}
                  className="group block h-full rounded-2xl border border-line bg-surface overflow-hidden hover:border-accent/60 transition-colors duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-card">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="absolute top-3 left-3 rounded-full border border-accent/40 bg-bg/80 backdrop-blur px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                      {CATEGORY_LABEL[p.category]}
                    </span>
                    {p.link && (
                      <span className="absolute top-3 right-3 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-bg">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-faint">
                      <span>{p.kind}</span>
                      <span>{p.year}</span>
                    </div>
                    <h3 className="mt-3 font-head font-bold text-xl text-ink flex items-start justify-between gap-3">
                      <span>{p.title}</span>
                      <ArrowUpRight className="mt-1 w-5 h-5 shrink-0 text-faint transition-all duration-300 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </h3>
                    <p className="mt-2 text-sm text-mute leading-relaxed">{p.tagline}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-md border border-line px-2 py-1 text-[11px] text-mute">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
