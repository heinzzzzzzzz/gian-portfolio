'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowUpRight, Sparkles, Check, CalendarDays, Loader2 } from 'lucide-react';

const BOOKING_URL = 'https://cal.com/gian-benedict-ctcofe/discovery-call';
const EMBED_URL = `${BOOKING_URL}?embed=true&theme=light&layout=month_view`;

const CALL_STEPS = [
  'You walk me through the process that eats your week.',
  'I sketch how I would automate it and what it would touch.',
  'You leave with a clear next step, whether we work together or not.',
];

export default function Contact() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section id="contact" className="bg-bg px-5 md:px-10 py-20 md:py-28">
      <div id="book" className="scroll-mt-24 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2rem] bg-ink text-bg"
        >
          {/* soft pink light from the top-right corner */}
          <div className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(255,111,166,0.35),transparent)]" />

          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:p-14">
            {/* Left: the pitch */}
            <div className="flex flex-col">
              <p className="text-[12px] uppercase tracking-[0.28em] text-blush">Book a call</p>
              <h2 className="headline mt-4 text-4xl font-extrabold leading-[0.95] sm:text-5xl lg:text-6xl">
                Have a process worth{' '}
                <span className="script neon font-normal text-[1.15em] leading-none">automating?</span>
              </h2>
              <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-bg/80">
                Grab a free 20-minute discovery call. Here is how it goes:
              </p>
              <ul className="mt-6 space-y-3">
                {CALL_STEPS.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 text-[15px] leading-relaxed text-bg/90">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-on-accent">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <p className="text-[12px] uppercase tracking-[0.24em] text-bg/70">Not ready for a call?</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="mailto:gianbenedict.bigay07@gmail.com"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-bg px-5 font-semibold text-ink hover:bg-blush transition-colors duration-200"
                  >
                    <Mail className="h-4 w-4" /> Email me
                  </a>
                  <Link
                    href="/ai-link"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-on-accent hover:bg-accent-deep transition-colors duration-200"
                  >
                    <Sparkles className="h-4 w-4" /> Ask my AI first
                  </Link>
                  <a
                    href="https://www.linkedin.com/in/gian-benedict-6043193a4/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold text-bg ring-1 ring-bg/30 hover:ring-bg/60 transition-colors duration-200"
                  >
                    LinkedIn <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: the live calendar */}
            <div className="relative">
              <div className="overflow-hidden rounded-[1.5rem] bg-cardhi shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-bg/10">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 text-ink">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="h-4 w-4 text-accent-ink" /> Discovery call · 20 min
                  </span>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-mute hover:text-accent-ink"
                  >
                    Open in Cal.com <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="relative h-[640px] sm:h-[600px]">
                  {!loaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-mute" aria-hidden>
                      <Loader2 className="h-6 w-6 animate-spin text-accent-ink" />
                      <span className="text-sm">Loading my calendar…</span>
                    </div>
                  )}
                  <iframe
                    src={EMBED_URL}
                    title="Book a discovery call with Gian Benedict"
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    className={`h-full w-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
              </div>
              <p className="mt-3 flex items-center gap-2 text-[13px] text-bg/75">
                <Check className="h-4 w-4 text-accent" /> Times show in your own timezone. I&apos;m in Manila, GMT+8.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
