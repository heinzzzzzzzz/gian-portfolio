'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { projects } from '@/lib/projects';
import { RevealLine } from './RevealLine';

/*
 * The tool list as stickers on a laptop lid. Sticker size comes from how many
 * builds on this site actually list the tool in their stack, so the counts
 * update themselves when a project is added.
 */

type Sticker = {
  label: string;
  match: string[]; // stack names in projects.ts that count as this tool
  bg: string;
  fg: string;
  d: [number, number, number]; // desktop: left %, top %, rotate deg
  m: [number, number, number]; // phone: left %, top %, rotate deg
};

const STICKERS: Sticker[] = [
  { label: 'n8n', match: ['n8n'], bg: '#FF6FA6', fg: '#3A1426', d: [4, 6, -8], m: [5, 3, -8] },
  { label: 'OpenRouter', match: ['OpenRouter'], bg: '#F0E5D8', fg: '#474329', d: [40, 9, 6], m: [36, 21, 6] },
  { label: 'GoHighLevel', match: ['GoHighLevel'], bg: '#FBDCE7', fg: '#B0245F', d: [6, 40, 4], m: [4, 38, 4] },
  { label: 'Google Sheets', match: ['Google Sheets', 'Google Calendar'], bg: '#FFFFFF', fg: '#2F6B3B', d: [25, 27, -12], m: [52, 6, 8] },
  { label: 'Airtable', match: ['Airtable'], bg: '#FFD166', fg: '#474329', d: [48, 41, -10], m: [58, 37, -10] },
  { label: 'WordPress', match: ['WordPress', 'Rank Math'], bg: '#E6D6C3', fg: '#474329', d: [68, 30, 8], m: [8, 53, 8] },
  { label: 'Vapi', match: ['Vapi', 'Vapi voice'], bg: '#474329', fg: '#FBDCE7', d: [76, 7, -4], m: [56, 53, -4] },
  { label: 'JavaScript', match: ['JavaScript', 'JavaScript (ES modules)'], bg: '#F7E27A', fg: '#3B3413', d: [29, 55, 7], m: [38, 66, 7] },
  { label: 'PHP + MySQL', match: ['PHP 8', 'MySQL (PDO)'], bg: '#C9B6E6', fg: '#2C2140', d: [70, 53, -7], m: [4, 69, -7] },
  { label: 'Bannerbear', match: ['Bannerbear'], bg: '#B0245F', fg: '#FFFFFF', d: [5, 75, -6], m: [6, 82, -6] },
  { label: 'Flutter', match: ['Flutter'], bg: '#9CC6E8', fg: '#20324A', d: [27, 76, 9], m: [42, 80, 9] },
  { label: 'Next.js', match: ['Next.js'], bg: '#151515', fg: '#FFFFFF', d: [44, 72, -3], m: [72, 79, -3] },
  { label: 'Supabase', match: ['Supabase'], bg: '#8FD1A8', fg: '#1F3B2A', d: [58, 76, 5], m: [62, 90, 5] },
  { label: 'Power Automate', match: ['Power Automate'], bg: '#CFE0FF', fg: '#1F3360', d: [72, 82, 3], m: [8, 92, 3] },
];

const withBuilds = STICKERS.map((s) => ({
  ...s,
  builds: projects.filter((p) => p.stack.some((t) => s.match.includes(t))).map((p) => p.title),
}));

const ALSO = 'Dart, Drift, Java, TypeScript, Tailwind CSS, Postgres, Vercel, Netlify, Inoreader, Ayrshare, HCTI';

export default function Skills() {
  const [picked, setPicked] = useState<number | null>(null);
  const sel = picked === null ? null : withBuilds[picked];

  return (
    <section id="skills" className="relative overflow-hidden bg-bg px-5 py-24 md:px-10 md:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(71,67,41,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(71,67,41,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 className="headline text-[clamp(44px,5.6vw,84px)] font-extrabold leading-[0.9] tracking-[-0.045em] text-ink">
            <span className="whitespace-nowrap"><RevealLine>Stickers on</RevealLine></span>
            {/* the neon glow would get clipped by a reveal mask, so this line fades in instead */}
            <motion.span
              className="script neon mt-1 block font-normal tracking-normal"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: 0.25 }}
            >
              my laptop.
            </motion.span>
          </h2>
          <p className="mt-6 max-w-[34ch] text-base leading-relaxed text-mute">
            Every tool here shipped in a real build on this site. The bigger the sticker, the more builds it&apos;s in.
          </p>
          <p className="mt-6 max-w-[40ch] text-sm leading-relaxed text-faint">Also in the kit: {ALSO}.</p>
        </div>

        <div>
          <motion.ul
            aria-label="Tools, sized by how many builds use them"
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.35 }}
            className="sticker-board @container relative aspect-[4/5] rounded-[28px] bg-[linear-gradient(160deg,#5A5536,#3F3B23)] shadow-[0_50px_90px_-40px_rgba(58,52,30,0.8),inset_0_2px_0_rgba(255,255,255,0.08)] sm:aspect-[16/10]"
          >
            {/* the logo dimple in the middle of the lid */}
            <span aria-hidden className="absolute left-1/2 top-1/2 h-[7cqw] w-[7cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg/10" />
            {withBuilds.map((s, i) => {
              const n = s.builds.length;
              const fs = 1.8 + n * 0.45; // cqw at desktop
              const rot = s.d[2];
              return (
                <motion.li
                  key={s.label}
                  className="absolute left-[var(--mx)] top-[var(--my)] sm:left-[var(--x)] sm:top-[var(--y)]"
                  style={{ '--x': `${s.d[0]}%`, '--y': `${s.d[1]}%`, '--mx': `${s.m[0]}%`, '--my': `${s.m[1]}%` } as React.CSSProperties}
                  variants={{
                    hidden: { opacity: 0, y: -60, scale: 1.3 },
                    shown: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 16, delay: i * 0.07 } },
                  }}
                >
                  <button
                    type="button"
                    aria-pressed={picked === i}
                    onClick={() => setPicked(picked === i ? null : i)}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setPicked(i)}
                    className="relative block whitespace-nowrap rounded-[0.6em] px-[0.9em] py-[0.45em] text-left font-extrabold leading-tight tracking-[-0.02em] shadow-[0_0_0_0.22em_#fff,0_10px_18px_-6px_rgba(0,0,0,0.45)] transition-[rotate,scale] duration-250 ease-out [font-size:calc(var(--fs)*1.6cqw)] [rotate:var(--r)] hover:z-10 hover:[rotate:0deg] hover:scale-110 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent sm:[font-size:calc(var(--fs)*1cqw)] aria-pressed:[rotate:0deg] aria-pressed:scale-110"
                    style={{ background: s.bg, color: s.fg, '--fs': fs, '--r': `${rot}deg` } as React.CSSProperties}
                  >
                    {s.label}
                    <span className="block text-[max(10px,0.42em)] font-bold tracking-normal opacity-85">
                      {n} {n === 1 ? 'build' : 'builds'}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>

          <p aria-live="polite" className="mt-6 min-h-[3.25rem] text-[15px] leading-relaxed text-mute">
            {sel ? (
              <>
                <span className="font-bold text-ink">{sel.label}</span> shipped in {sel.builds.join(', ')}.
              </>
            ) : (
              'Tap a sticker to see the builds behind it.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
