'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, CalendarDays } from 'lucide-react';
import LampToggle from './LampToggle';

const NAV_LINKS = [
  { name: 'Work', id: 'work' },
  { name: 'Services', id: 'services' },
  { name: 'Process', id: 'process' },
  { name: 'About', id: 'about' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 40);
      setIsHidden(y > last && y > 160);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the section currently in view (nav-state-active).
  useEffect(() => {
    const els = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: isHidden && !open ? '-110%' : '0%', opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 px-3 md:px-6 pt-3"
      >
        <div
          className={`mx-auto flex items-center justify-between rounded-full px-3 md:px-4 py-2 transition-all duration-300 ${
            isScrolled ? 'bg-card/95 shadow-[0_10px_30px_-18px_rgba(71,67,41,0.45)] ring-1 ring-ink/10' : 'bg-transparent'
          }`}
        >
          <Link href="/#top" className="flex items-center gap-3 pl-1" aria-label="Gian Benedict, home">
            <span className="script neon text-[32px] leading-none -rotate-[6deg] transition-transform duration-300 hover:-rotate-[2deg] hover:scale-105">
              GB
            </span>
            <span data-dim className="hidden sm:inline text-[11px] uppercase tracking-[0.22em] text-mute">Automation Engineer</span>
          </Link>

          <nav data-dim aria-label="Main" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const on = active === l.id;
              return (
                <Link
                  key={l.id}
                  href={`/#${l.id}`}
                  aria-current={on ? 'true' : undefined}
                  className={`relative rounded-full px-4 py-2 text-[12px] uppercase tracking-[0.18em] transition-colors duration-200 ${
                    on ? 'text-ink' : 'text-mute hover:text-ink'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-blush"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{l.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <LampToggle className="mr-1" />
            <Link
              data-dim
              href="/ai-link"
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-ink ring-1 ring-ink/15 hover:ring-accent hover:text-accent-ink transition-colors duration-200"
            >
              <Sparkles className="w-4 h-4" /> Talk to my AI
            </Link>
            <Link
              data-dim
              href="/#book"
              className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent hover:text-on-accent transition-colors duration-200"
            >
              <CalendarDays className="w-4 h-4" /> Book a call
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-1">
          <LampToggle />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-full text-ink"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-bg flex flex-col justify-center px-6 lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col items-center gap-6">
              {NAV_LINKS.map((l, i) => (
                <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link
                    href={`/#${l.id}`}
                    onClick={() => setOpen(false)}
                    className="headline font-extrabold text-4xl text-ink hover:text-accent-ink transition-colors"
                  >
                    {l.name}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
                <Link
                  href="/#book"
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-bg"
                >
                  <CalendarDays className="w-4 h-4" /> Book a 20-min call
                </Link>
                <Link
                  href="/ai-link"
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-base font-semibold text-on-accent"
                >
                  <Sparkles className="w-4 h-4" /> Talk to my AI
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
