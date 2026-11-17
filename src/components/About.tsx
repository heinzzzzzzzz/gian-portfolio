'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight, ArrowDownToLine, MapPin, Briefcase, Compass } from 'lucide-react';

const facts = [
  { icon: MapPin, k: 'Based in', v: 'Quezon City, Philippines · GMT+8, works with teams anywhere' },
  { icon: Briefcase, k: 'Currently', v: 'Freelance Automation Engineer, open for new projects' },
  { icon: Compass, k: 'Principle', v: 'One engine, any audience: build the machine once, swap the config per client' },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 bg-bg text-ink py-20 md:py-28 px-5 md:px-10 border-t border-ink/10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Portrait print */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -3 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 order-2 lg:order-1 mx-auto w-full max-w-[380px]"
        >
          <div className="relative rounded-[1.5rem] bg-cardhi p-3 pb-14 shadow-[0_30px_70px_-30px_rgba(71,67,41,0.55)] ring-1 ring-ink/10">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-card">
              <Image src="/profile.jpg" alt="Gian Benedict in a grey three-piece suit, seated on a wooden stool" fill sizes="380px" className="object-cover object-[50%_20%]" />
            </div>
            <span className="script neon absolute bottom-3 left-1/2 -translate-x-1/2 -rotate-3 whitespace-nowrap text-[34px] leading-none">
              Gian Benedict
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 order-1 lg:order-2"
        >
          <p className="text-[12px] uppercase tracking-[0.28em] text-accent-ink">About</p>
          <h2 className="headline mt-4 text-4xl md:text-6xl font-extrabold leading-[0.95]">
            I turn repetitive work into <span className="serif-italic text-accent-ink font-normal">infrastructure.</span>
          </h2>
          <p className="mt-8 text-mute leading-relaxed text-lg max-w-[62ch]">
            I&apos;m Gian Benedict Bigay, an Automation Engineer who works mostly in n8n. For client brands I designed and ran the content engines, multi-platform distribution and CRM reporting that kept them publishing daily without anyone touching a keyboard.
          </p>
          <p className="mt-4 text-mute leading-relaxed text-lg max-w-[62ch]">
            Outside the pipelines I build the products themselves: an offline-first Flutter finance app, a room and equipment booking system for Universidad de Manila, a PHP e-commerce store, and AI voice receptionists. Same habits everywhere: shape the data once, fail loudly, make every run safe to repeat.
          </p>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {facts.map(({ icon: Icon, k, v }) => (
              <div key={k} className="rounded-2xl bg-card p-4 ring-1 ring-ink/10">
                <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-faint">
                  <Icon className="h-4 w-4 text-accent-ink" /> {k}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#book"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-bg hover:bg-accent hover:text-on-accent transition-colors duration-200"
            >
              Let&apos;s build something
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="/assets/resume.pdf"
              download
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-ink ring-1 ring-ink/20 hover:ring-ink/40 transition-colors duration-200"
            >
              <ArrowDownToLine className="h-4 w-4" /> Download resume
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
