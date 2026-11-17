'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';

const LINKS = [
  { label: 'Work', href: '/#work' },
  { label: 'Services', href: '/#services' },
  { label: 'Process', href: '/#process' },
  { label: 'About', href: '/#about' },
  { label: 'Book a call', href: '/#book' },
  { label: 'AI clone', href: '/ai-link' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-bg px-5 pb-8 pt-24 text-ink md:px-10 border-t border-ink/10">
      <div className="pointer-events-none absolute inset-x-0 top-6 flex select-none justify-center">
        <span className="script neon text-[22vw] leading-none opacity-[0.16] md:text-[15vw]" aria-hidden>
          Gian Benedict
        </span>
      </div>

      <div className="relative z-10 mx-auto mt-[12vw] flex w-full max-w-7xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <p className="text-sm text-mute">© {new Date().getFullYear()} Gian Benedict Bigay</p>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-accent-ink transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <a
          href="#top"
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-ink/20 hover:ring-ink/40 transition-colors"
        >
          Back to top <ArrowUp className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
