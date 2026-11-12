'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Work', href: '#work' },
  { name: 'Skills', href: '#skills' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 40);
      if (y > last && y > 120) {
        setIsHidden(true);
        setIsMobileMenuOpen(false);
      } else {
        setIsHidden(false);
      }
      last = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: isHidden ? '-100%' : '0%', opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
          isScrolled ? 'bg-bg/80 backdrop-blur-xl border-b border-line/70' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex items-center justify-between">
          <Link href="/#top" className="flex items-center gap-3 z-50 relative">
            <span className="headline font-extrabold text-lg text-ink">
              GB<span className="text-accent">.</span>
            </span>
            <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.22em] text-mute">
              Automation Engineer
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={`/${link.href}`}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-ink transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/ai-link"
              className="group flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg hover:bg-olive transition-colors duration-300"
            >
              <Sparkles className="w-4 h-4" />
              Talk to my AI
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden z-50 relative p-2 text-ink"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-2xl flex flex-col justify-center px-6 lg:hidden"
          >
            <nav className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={`/${link.href}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="headline font-bold text-4xl text-ink hover:text-accent transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/ai-link"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-6 flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-base font-semibold text-bg"
              >
                <Sparkles className="w-4 h-4" />
                Talk to my AI
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
