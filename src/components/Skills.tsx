'use client';

import { motion } from 'framer-motion';
import { skillGroups } from '@/lib/skills';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Skills() {
  return (
    <section id="skills" className="relative bg-bg border-t border-line/60">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-28">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent"
            >
              Skills
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="headline mt-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-ink leading-[0.92]"
            >
              What I<br />
              <span className="serif-italic text-accent font-normal">build with.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-mute max-w-md text-base leading-relaxed"
          >
            Every tool on this list is here because a shipped build above used it. No padding.
          </motion.p>
        </div>

        <div className="mt-14 border-y border-line/60 divide-y divide-line/60">
          {skillGroups.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.05 * i, ease: EASE }}
              className="grid md:grid-cols-12 gap-6 md:gap-8 py-10 md:py-14"
            >
              <div className="md:col-span-1 font-mono text-xs text-accent">{g.number}</div>
              <div className="md:col-span-4">
                <h3 className="font-head font-bold text-2xl md:text-3xl text-ink leading-tight">{g.title}</h3>
                <p className="mt-3 text-sm text-mute leading-relaxed">{g.blurb}</p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-faint">
                  Proven in: <span className="text-mute">{g.builtWith}</span>
                </p>
              </div>
              <div className="md:col-span-7 flex flex-wrap gap-2 content-start">
                {g.skills.map((s, j) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(j * 0.03, 0.5) }}
                    className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink hover:border-accent hover:text-accent transition-colors cursor-default"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
