'use client';

import { useReduce } from '@/lib/motion';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';

/*
 * "How a project actually goes", told with the real artifacts of Gian's loop:
 * the brief, the proposed shape, the drop with its checklist, and a run that
 * fails loudly and gets fixed. Desktop pins the section and swaps scenes as
 * you scroll; phones and tablets get the same scenes stacked.
 */

const STEPS = [
  {
    lead: 'You tell',
    end: 'me.',
    copy: 'In plain words, the way you would explain it to a coworker. A Slack message is enough. No spec.',
  },
  {
    lead: 'I sketch',
    end: 'it.',
    copy: 'Before building, I send the shape: what starts it, what it touches, and where a person signs off. You say yes or "not quite".',
  },
  {
    lead: 'I build',
    end: 'all of it.',
    copy: 'You get the whole thing in one drop, plus a short list of what to connect before you hit run.',
  },
  {
    lead: 'You run',
    end: 'it.',
    copy: 'If something breaks, it stops loudly instead of failing quietly. I fix the cause and it is safe to run again.',
  },
];

const BRIEF = 'Can every new blog post turn into LinkedIn, X and Facebook posts on its own? Someone still needs to okay them first.';

export default function Process() {
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageSeen = useInView(stageRef, { amount: 0.5 });
  useMotionValueEvent(scrollYProgress, 'change', (p) => setActive(Math.min(3, Math.max(0, Math.floor(p * 4)))));

  return (
    <section id="process" className="scroll-mt-24 bg-surface">
      {/* ---------- desktop: pinned scene ---------- */}
      <div ref={pinRef} className="relative hidden h-[300vh] lg:block">
        <div className="sticky top-0 mx-auto grid h-dvh max-w-7xl grid-cols-2 items-center gap-16 px-10">
          <div>
            <p className="text-[15px] text-mute">How a project actually goes</p>
            <h2 className="headline relative mt-4 h-[1.85em] overflow-hidden text-[clamp(56px,6.6vw,100px)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink">
              {STEPS.map((s, i) => (
                <span
                  key={s.lead}
                  aria-hidden={i !== active}
                  className={`absolute left-0 top-0 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${
                    i === active ? 'translate-y-0' : i < active ? '-translate-y-[2em]' : 'translate-y-[2em]'
                  }`}
                >
                  {s.lead} <span className="text-accent-ink">{s.end}</span>
                </span>
              ))}
            </h2>
            <div className="relative mt-2 h-28 max-w-[44ch]">
              {STEPS.map((s, i) => (
                <p
                  key={s.lead}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 text-lg leading-relaxed text-mute transition-[opacity,translate] duration-500 ${
                    i === active ? 'translate-y-0 opacity-100 delay-150' : 'translate-y-3 opacity-0'
                  }`}
                >
                  {s.copy}
                </p>
              ))}
            </div>
            <div className="mt-7 flex gap-2" aria-hidden>
              {STEPS.map((s, i) => (
                <Bar key={s.lead} progress={scrollYProgress} index={i} />
              ))}
            </div>
          </div>

          <div ref={stageRef} className="relative h-[520px] overflow-hidden rounded-3xl bg-[#FBF7F1] shadow-[0_50px_100px_-50px_rgba(71,67,41,0.55)] ring-1 ring-ink/10">
            {[BriefScene, FlowScene, DropScene, RunScene].map((Scene, i) => (
              <div
                key={i}
                aria-hidden={i !== active}
                className={`absolute inset-0 p-10 transition-[opacity,translate,scale] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                  i === active ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-8 scale-[0.97] opacity-0'
                }`}
              >
                <Scene on={i === active && stageSeen} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- phones + tablets: stacked ---------- */}
      <div className="px-5 py-24 md:px-10 lg:hidden">
        <p className="text-[15px] text-mute">How a project actually goes</p>
        <ol className="mt-6 space-y-16">
          {STEPS.map((s, i) => (
            <StackedStep key={s.lead} step={s} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Bar({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const scaleX = useTransform(progress, (p) => Math.min(1, Math.max(0, p * 4 - index)));
  return (
    <span className="relative h-1 w-14 overflow-hidden rounded bg-ink/15">
      <motion.span style={{ scaleX }} className="absolute inset-0 origin-left bg-accent" />
    </span>
  );
}

function StackedStep({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const on = useInView(ref, { once: true, amount: 0.45 });
  const Scene = [BriefScene, FlowScene, DropScene, RunScene][index];
  return (
    <li ref={ref}>
      <h3 className="headline text-[clamp(44px,12vw,72px)] font-extrabold leading-[0.92] tracking-[-0.05em] text-ink">
        {step.lead} <span className="text-accent-ink">{step.end}</span>
      </h3>
      <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-mute">{step.copy}</p>
      <div className="mt-6 rounded-3xl bg-[#FBF7F1] p-6 shadow-[0_40px_80px_-50px_rgba(71,67,41,0.55)] ring-1 ring-ink/10 sm:p-8">
        <Scene on={on} compact />
      </div>
    </li>
  );
}

type SceneProps = { on: boolean; compact?: boolean };

/* 1. The brief arrives and types itself out. */
function BriefScene({ on }: SceneProps) {
  return (
    <div className="ps" data-on={on}>
      <p className="text-xs font-bold text-faint"># automation-requests</p>
      <div className="mt-5 flex gap-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-[#9C8B6E] font-extrabold text-white">C</span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-ink">
            Client <span className="ml-1.5 text-xs font-normal text-faint">9:14 AM</span>
          </p>
          {on ? <Typed text={BRIEF} /> : <p className="mt-1 text-[17px] leading-relaxed text-ink">{BRIEF}</p>}
        </div>
      </div>
      <p className="ps-pop ml-[58px] mt-4 inline-flex rounded-full bg-blush px-3 py-1.5 text-[13px] font-bold text-accent-ink">Gian is on it</p>
    </div>
  );
}

function Typed({ text }: { text: string }) {
  const reduce = useReduce();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    const t = setInterval(() => {
      const next = Math.min(text.length, Math.floor((performance.now() - start) / 22));
      setN(next);
      if (next >= text.length) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [reduce, text]);
  const shown = reduce ? text.length : n;
  return (
    <p className="mt-1 max-w-[40ch] text-[17px] leading-relaxed text-ink">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, shown)}
        {shown < text.length && <span className="ps-caret" />}
      </span>
    </p>
  );
}

/* 2. The proposed shape draws itself; the human step is the pink one. */
const NODES = [
  { t: 'New post', s: 'blog feed' },
  { t: 'Write 3 versions', s: 'LinkedIn, X, Facebook' },
  { t: 'You approve', s: 'one click in Airtable', human: true },
  { t: 'Schedule + post', s: 'on each platform' },
];

function FlowScene({ on, compact }: SceneProps) {
  if (compact) {
    return (
      <div className="ps" data-on={on}>
        <p className="text-xs font-bold text-faint">Proposed shape · v1</p>
        <ol className="mt-5">
          {NODES.map((n, i) => (
            <li key={n.t} className="ps-node relative pb-5 pl-8 last:pb-0" style={{ transitionDelay: `${i * 0.25}s` }}>
              {i < NODES.length - 1 && <span className="absolute left-[7px] top-4 h-full w-0 border-l-2 border-dashed border-ink/30" />}
              <span className={`absolute left-0 top-1.5 h-4 w-4 rounded-full ${n.human ? 'bg-accent' : 'bg-ink'}`} />
              <span className={`inline-block rounded-xl px-3.5 py-2 text-sm font-bold ${n.human ? 'bg-accent text-on-accent' : 'bg-white text-ink ring-[1.5px] ring-ink/20'}`}>
                {n.t}
                <span className={`block text-xs font-normal ${n.human ? 'text-on-accent' : 'text-faint'}`}>{n.s}</span>
              </span>
              {n.human && <span className="script neon ps-hand ml-3 inline-block -rotate-6 align-middle text-2xl">you sign off</span>}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  const pos = [
    { left: '0%', top: '40px' },
    { left: '42%', top: '40px' },
    { left: '68%', top: '170px' },
    { left: '12%', top: '225px' },
  ];
  return (
    <div className="ps" data-on={on}>
      <p className="text-xs font-bold text-faint">Proposed shape · v1</p>
      <div className="absolute inset-x-10 top-[110px] h-[300px]">
        <svg viewBox="0 0 480 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <path className="ps-draw" d="M90 70 C 150 70, 160 70, 200 70" />
          <path className="ps-draw" d="M330 70 C 390 70, 395 140, 395 170" />
          <path className="ps-draw" d="M395 230 C 395 270, 260 275, 210 255" />
        </svg>
        {NODES.map((n, i) => (
          <div
            key={n.t}
            className={`ps-node absolute rounded-xl px-4 py-3 text-sm font-bold ${n.human ? 'bg-accent text-on-accent' : 'bg-white text-ink ring-[1.5px] ring-ink/25'}`}
            style={{ ...pos[i], transitionDelay: `${0.1 + i * 0.45}s` }}
          >
            {n.t}
            <span className={`block text-xs font-normal ${n.human ? 'text-on-accent' : 'text-faint'}`}>{n.s}</span>
          </div>
        ))}
        <span className="script neon ps-hand absolute left-[4%] top-[150px] -rotate-6 text-[26px]">a person signs off here &rarr;</span>
      </div>
    </div>
  );
}

/* 3. One drop: the workflow file and the "before you run this" checklist. */
const CHECKS = [
  'Attach the OpenRouter credential to "Write versions"',
  'Attach the Airtable token to "Approval board"',
  'Paste your blog feed URL in "New post"',
  'Voice block is a guess, swap it to retune',
];

function DropScene({ on }: SceneProps) {
  return (
    <div className="ps" data-on={on}>
      <p className="text-xs font-bold text-faint">Delivered</p>
      <div className="mt-5 flex items-center gap-3.5 rounded-2xl bg-white p-4 ring-[1.5px] ring-ink/15">
        <span className="grid h-[52px] w-11 shrink-0 place-items-center rounded-md bg-ink text-[10px] font-extrabold text-bg">JSON</span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-ink">blog-to-social.json</p>
          <p className="text-xs text-faint">Import into n8n</p>
        </div>
      </div>
      <p className="mt-6 text-sm font-bold text-ink">Before you run this</p>
      <ul className="mt-2">
        {CHECKS.map((c, i) => (
          <li key={c} className="flex items-center gap-3 border-b border-dashed border-ink/20 py-2.5 text-[15px] text-ink">
            <span className="ps-box grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md" style={{ transitionDelay: `${0.3 + i * 0.4}s` }}>
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                <path className="ps-tick" d="M3 8.5l3 3 7-7" style={{ transitionDelay: `${0.3 + i * 0.4}s` }} />
              </svg>
            </span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 4. The run: one step stops loudly, gets fixed, and the re-run is safe. */
const LOG = [
  { t: 'New post found', s: 'ok' },
  { t: 'Wrote 3 versions', s: 'ok' },
  { t: 'Approved in Airtable', s: 'ok' },
  { t: 'Post to LinkedIn: token expired', s: 'stopped', bad: true },
  { t: 'Token fixed, re-run skips what already posted', s: 'ok', fix: true },
];

function RunScene({ on }: SceneProps) {
  return (
    <div className="ps" data-on={on}>
      <p className="text-xs font-bold text-faint">Run log</p>
      <ul className="mt-5 space-y-2 font-mono text-[13px] sm:text-sm">
        {LOG.map((l, i) => (
          <li
            key={l.t}
            className={`ps-line flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 ${
              l.bad ? 'bg-[#FDE7EE] text-accent-ink ring-[1.5px] ring-accent-ink' : l.fix ? 'bg-[#EEF4E8] text-ink ring-[1.5px] ring-[#6E9B5C]' : 'bg-white text-ink ring-1 ring-ink/10'
            }`}
            style={{ transitionDelay: `${[0, 0.3, 0.6, 1.1, 2][i]}s` }}
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${l.bad ? 'bg-accent-ink' : 'bg-[#6E9B5C]'}`} />
            <span className="min-w-0">{l.t}</span>
            <span className="ml-auto text-xs opacity-75">{l.s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
