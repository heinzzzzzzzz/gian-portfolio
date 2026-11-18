'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageSquareText, Compass, PackageCheck, RefreshCcw } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    icon: MessageSquareText,
    title: 'Brief',
    body: 'Tell me the process in plain words, the way you would explain it to a colleague. No spec needed.',
  },
  {
    icon: Compass,
    title: 'Approach',
    body: 'I propose the shape first: what triggers it, what it touches, where a human approves. You gut-check it before I build.',
  },
  {
    icon: PackageCheck,
    title: 'One drop',
    body: 'I build the whole thing end to end and hand it over ready to run, with a checklist of what to connect.',
  },
  {
    icon: RefreshCcw,
    title: 'Run & refine',
    body: 'You run it. If something breaks it fails loudly, I fix the root cause, and it is safe to run again.',
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.6'] });
  // The connecting line draws itself as you scroll (transform only).
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="scroll-mt-24 bg-surface px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-[0.28em] text-accent-ink">Process</p>
            <h2 className="headline mt-4 text-5xl font-extrabold leading-[0.92] text-ink sm:text-6xl md:text-7xl">
              How a project <span className="serif-italic font-normal text-accent-ink">runs.</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-mute">
            Four steps, no surprises. You decide the shape, I do the building, and you always know what changed.
          </p>
        </div>

        <div ref={ref} className="relative mt-14">
          {/* track + animated fill, desktop only */}
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-[2px] bg-ink/10 lg:block" />
          <motion.div
            style={{ scaleX: lineScale }}
            className="motion-reduce:transform-none! pointer-events-none absolute left-0 right-0 top-6 hidden h-[2px] origin-left bg-accent lg:block"
          />

          <ol className="grid gap-5 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                  className="relative"
                >
                  <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-bg ring-8 ring-surface">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="mt-5 rounded-[1.5rem] bg-card p-6 ring-1 ring-ink/10">
                    <p className="text-[12px] font-semibold tabular-nums text-accent-ink">Step 0{i + 1}</p>
                    <h3 className="headline mt-2 text-2xl font-extrabold text-ink">{s.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-mute">{s.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
