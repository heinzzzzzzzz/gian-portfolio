'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg text-ink relative overflow-hidden min-h-[45vh] flex flex-col justify-end pt-24 pb-8 px-5 md:px-10 border-t border-line/60">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden translate-y-10">
        <h1 className="headline text-[16vw] leading-none font-extrabold opacity-[0.06] whitespace-nowrap text-ink">
          GIAN BIGAY
        </h1>
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 mt-auto">
        <p className="text-sm text-mute">© {new Date().getFullYear()} Gian Benedict Bigay. All rights reserved.</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">
          Systems that <span className="text-accent">publish themselves</span>
        </p>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/#work" className="hover:text-accent transition-colors">Work</Link>
          <Link href="/#skills" className="hover:text-accent transition-colors">Skills</Link>
          <Link href="/#about" className="hover:text-accent transition-colors">About</Link>
          <Link href="/ai-link" className="hover:text-accent transition-colors">AI clone</Link>
        </div>
      </div>
    </footer>
  );
}
