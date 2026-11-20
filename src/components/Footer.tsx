'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowUpRight, ArrowRight } from 'lucide-react';

const SITE_LINKS = [
  { label: 'Work', href: '/#work' },
  { label: 'Services', href: '/#services' },
  { label: 'Process', href: '/#process' },
  { label: 'About', href: '/#about' },
];

// Address lines on the back of the postcard.
const LINES = [
  { k: 'Book', v: '20-min discovery call', href: '/#book', icon: ArrowUpRight },
  { k: 'Email', v: 'gianbenedict.bigay07@gmail.com', href: 'mailto:gianbenedict.bigay07@gmail.com' },
  { k: 'LinkedIn', v: '/in/gian-benedict', href: 'https://www.linkedin.com/in/gian-benedict-6043193a4/', icon: ArrowUpRight, external: true },
  { k: 'Or', v: 'ask my AI self', href: '/ai-link', icon: ArrowRight, accent: true },
];

// Live Manila time for the postmark. Server render shows no time (avoids a
// hydration mismatch); the browser fills it in and refreshes every 20s.
const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 20_000);
  return () => clearInterval(t);
};
const useManilaTime = () =>
  useSyncExternalStore(subscribe, () => fmt.format(new Date()), () => null);

export default function Footer() {
  const time = useManilaTime();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-bg px-5 pt-20 pb-8 text-ink md:px-10 md:pt-28 border-t border-ink/10">
      {/* paper grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(71,67,41,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(71,67,41,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="relative mx-auto max-w-5xl">
        <p className="text-[12px] uppercase tracking-[0.28em] text-accent-ink">Before you go</p>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -6 }}
          whileInView={{ opacity: 1, y: 0, rotate: -2 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="group mt-8 md:mt-10"
        >
          {/* The postcard straightens up when you hover it. */}
          <div className="grid overflow-hidden rounded-2xl bg-[#FBF7F1] shadow-[0_40px_80px_-40px_rgba(71,67,41,0.6)] ring-1 ring-ink/10 transition-transform duration-300 ease-out md:grid-cols-2 md:group-hover:rotate-2 motion-reduce:transition-none motion-reduce:md:group-hover:rotate-0">
            {/* Message side */}
            <div className="relative flex flex-col p-7 sm:p-10 border-b-2 border-dashed border-ink/15 md:border-b-0 md:border-r-2">
              <p className="script neon -rotate-[5deg] origin-left whitespace-nowrap text-[clamp(26px,8.6vw,40px)] leading-[1.1] sm:text-[52px]">
                Thanks for stopping by.
              </p>
              <p className="mt-6 max-w-[36ch] text-[17px] leading-relaxed text-mute">
                If something here reminded you of a process you hate doing by hand, send it my way. I&apos;ll reply with how I&apos;d build it.
              </p>
              <p className="mt-10 text-sm text-mute md:mt-auto md:pt-10">Gian Benedict · Automation Engineer</p>
            </div>

            {/* Address side */}
            <div className="relative p-7 sm:p-10">
              <div className="flex items-start justify-end gap-4">
                {/* postmark */}
                <div
                  aria-label={time ? `Manila time ${time}` : 'Manila time'}
                  className="mt-6 flex h-32 w-32 shrink-0 -rotate-[14deg] flex-col items-center justify-center rounded-full border-[2.5px] border-accent-ink/60 text-center font-extrabold uppercase leading-snug tracking-[0.14em] text-accent-ink/90"
                >
                  <span className="text-[11px]">Quezon City</span>
                  <span className="text-[22px] tracking-normal tabular-nums">{time ?? 'PH'}</span>
                  <span className="text-[11px]">Manila time</span>
                </div>
                {/* stamp */}
                <div className="flex h-[120px] w-[100px] shrink-0 rotate-[4deg] flex-col items-center justify-center bg-ink outline-2 outline-dashed outline-ink/35 outline-offset-0 ring-[6px] ring-[#FBF7F1]">
                  <span className="script neon text-[44px] leading-none">GB</span>
                  <span className="mt-1 text-[10px] tracking-[0.2em] text-blush">PH · {year}</span>
                </div>
              </div>

              <ul className="mt-6">
                {LINES.map(({ k, v, href, icon: Icon, external, accent }) => (
                  <li key={k} className="border-b-[1.5px] border-ink/15">
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="flex min-h-12 flex-col items-start justify-center gap-0.5 py-2.5 transition-colors hover:text-accent-ink sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className="text-[11px] uppercase tracking-[0.2em] text-faint">{k}</span>
                      <span className={`flex items-center gap-1 text-[15px] font-semibold sm:text-right sm:text-base ${accent ? 'text-accent-ink' : ''}`}>
                        {v} {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-5xl flex-col items-center gap-5 text-sm text-mute md:flex-row md:justify-between">
        <p>© {year} Gian Benedict Bigay</p>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-medium">
          {SITE_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-accent-ink transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <a href="#top" className="inline-flex h-11 items-center gap-2 rounded-full px-4 font-semibold text-ink ring-1 ring-ink/20 hover:ring-ink/40 transition-colors">
          Back to top <ArrowUp className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
