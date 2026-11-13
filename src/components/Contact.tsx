'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowUpRight, Sparkles } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="bg-bg py-20 md:py-28 px-5 md:px-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto bg-surface border border-line rounded-3xl p-10 md:p-20 text-center relative overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[70%] h-80 bg-[radial-gradient(closest-side,rgba(255,111,166,0.22),transparent)] rounded-full pointer-events-none" />

        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent relative z-10">Contact</p>
        <h2 className="headline mt-5 text-4xl md:text-6xl lg:text-7xl font-extrabold text-ink relative z-10 leading-[0.95]">
          Have a process worth <span className="serif-italic text-accent font-normal">automating?</span>
        </h2>
        <p className="mt-6 text-lg text-mute max-w-2xl mx-auto relative z-10">
          Send the brief the way you would explain it to a colleague. I&apos;ll propose an approach, you gut-check it, and I build the whole thing in one drop.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-10 relative z-10">
          <a
            href="mailto:gianbenedict.bigay07@gmail.com"
            className="flex items-center gap-2 px-7 py-4 bg-ink text-bg rounded-full font-semibold hover:bg-olive transition-colors w-full sm:w-auto justify-center"
          >
            <Mail size={18} />
            <span>Email me</span>
          </a>
          <a
            href="https://www.linkedin.com/in/gian-benedict-6043193a4/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-7 py-4 bg-card border border-line text-ink rounded-full font-semibold hover:border-accent/60 transition-colors w-full sm:w-auto justify-center"
          >
            <span>LinkedIn</span>
            <ArrowUpRight size={18} />
          </a>
          <Link
            href="/ai-link"
            className="flex items-center gap-2 px-7 py-4 border border-accent/40 text-accent rounded-full font-semibold hover:bg-accent/10 transition-colors w-full sm:w-auto justify-center"
          >
            <Sparkles size={18} />
            <span>Ask my AI first</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
