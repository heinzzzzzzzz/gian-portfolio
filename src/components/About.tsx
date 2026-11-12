'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownToLine } from 'lucide-react';

const facts = [
  ['Based in', 'Quezon City, Philippines · GMT+8'],
  ['Currently', 'Automation Engineer at Intention Technology, part-time, plus freelance'],
  ['Studying', 'BS Information Technology, Universidad de Manila'],
  ['Principle', 'One engine, any audience: build the machine once, swap the config per client'],
];

export default function About() {
  return (
    <section id="about" className="bg-bg text-ink py-20 md:py-28 px-5 md:px-10 border-t border-line/60">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">About</p>
          <h2 className="headline mt-4 text-4xl md:text-6xl font-extrabold leading-[0.95]">
            I turn repetitive work into <span className="serif-italic text-accent font-normal">infrastructure.</span>
          </h2>
          <p className="mt-8 text-mute leading-relaxed text-lg">
            I&apos;m Gian Benedict Bigay, an Automation Engineer who works mostly in n8n. At Intention Technology I designed and ran the content engines, multi-platform distribution and CRM reporting that kept whole brands publishing daily without anyone touching a keyboard.
          </p>
          <p className="mt-4 text-mute leading-relaxed text-lg">
            Outside the pipelines I build the products themselves: an offline-first Flutter finance app, a booking system for my university, and a PHP e-commerce store. Same habits everywhere: shape the data once, fail loudly, make every run safe to repeat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#contact"
              className="group flex items-center gap-2 bg-ink text-bg rounded-full px-7 py-3.5 font-semibold hover:bg-olive transition-colors"
            >
              Let&apos;s build something
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <a
              href="/assets/resume.pdf"
              download
              className="border border-line bg-surface text-ink rounded-full px-7 py-3.5 font-medium hover:border-accent/60 transition-colors flex items-center gap-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              Download resume
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="lg:col-span-5 grid sm:grid-cols-[180px_1fr] lg:grid-cols-1 gap-6"
        >
          <div className="relative w-full max-w-[180px] lg:max-w-[240px] aspect-[2/3]">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-accent/50" />
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-line bg-card">
              <Image src="/profile.jpg" alt="Gian Benedict Bigay" fill sizes="240px" className="object-cover object-top" />
            </div>
          </div>
          <dl className="divide-y divide-line/60 border-y border-line/60">
            {facts.map(([k, v]) => (
              <div key={k} className="py-4 grid grid-cols-[90px_1fr] gap-4">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-faint pt-0.5">{k}</dt>
                <dd className="text-sm text-ink leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
