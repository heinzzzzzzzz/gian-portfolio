'use client';

import { useEffect, useRef, useState } from 'react';
import { lightDismissFallback } from './ChatDialog';
import Link from 'next/link';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowUpRight, MessageCircle, Phone, Mail, Sparkles, ArrowDownToLine, CalendarDays, X } from 'lucide-react';
import { chapterDef, chapterHeightVh, chapterPhase, type ChapterId } from '@/lib/chapters';
import { SERVICES, STICKERS, ALSO_IN_KIT } from '@/lib/content';
import { projects } from '@/lib/projects';
import { useStage } from '@/lib/stage';

/*
 * The readable half of each 3D chapter. Every chapter is a tall pinned
 * section: the 3D phone (lib/phone3d) does its thing on the right (on phones:
 * the top half), and this text walks through the same steps on the left
 * (on phones: a panel at the bottom). Step timing comes from lib/chapters.ts,
 * the same numbers the 3D side uses.
 */

type Phase = { step: number; stepP: number; visible: boolean };

function Chapter({ id, children, anchors }: { id: ChapterId; children: (p: Phase) => React.ReactNode; anchors?: string[] }) {
  const def = chapterDef(id);
  const ref = useRef<HTMLElement>(null);
  const top = useRef(0);
  const [phase, setPhase] = useState<Phase>({ step: 0, stepP: 0, visible: false });
  const sync = (y: number) => {
    const ph = chapterPhase(y, top.current, innerHeight, def.steps, def.stepVh);
    const visible = ph.enter > 0.55 && ph.exit < 0.5;
    setPhase((p) => (p.step === ph.step && p.visible === visible ? p : { step: ph.step, stepP: ph.stepP, visible }));
  };
  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      top.current = ref.current.getBoundingClientRect().top + window.scrollY;
      sync(window.scrollY);
    };
    measure();
    const t = window.setInterval(measure, 1000);
    window.addEventListener('resize', measure);
    return () => {
      clearInterval(t);
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', sync);

  return (
    <section ref={ref} id={id} className="relative bg-bg" style={{ height: `${chapterHeightVh(def.steps, def.stepVh) * 100}vh` }}>
      {anchors?.map((a) => (
        <span key={a} id={a} aria-hidden className="absolute inset-x-0" style={{ top: '70vh' }} />
      ))}
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* the phone takes one side (lib/chapters.ts), the text the other */}
        <div className={`mx-auto grid h-full max-w-7xl ${def.side === 'right' ? 'lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]' : 'lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)]'}`}>
          <div
            className={`relative z-[45] flex flex-col justify-end px-4 pb-5 transition-opacity duration-500 lg:justify-center lg:px-10 lg:pb-0 ${def.side === 'left' ? 'lg:col-start-2' : ''} ${
              phase.visible ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {/* on phones the 3D sits in the top half; this panel keeps the text readable below it */}
            <div data-chapter-panel className="rounded-3xl bg-bg/90 p-4 shadow-[0_-20px_40px_-20px_rgba(71,67,41,0.25)] lg:bg-transparent lg:p-0 lg:shadow-none">{children(phase)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Steps({ n, at }: { n: number; at: number }) {
  return (
    <div className="mt-6 flex gap-2" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`h-1 w-10 rounded-full transition-colors duration-300 ${i <= at ? 'bg-accent' : 'bg-ink/15'}`} />
      ))}
    </div>
  );
}

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="headline text-[clamp(30px,8vw,44px)] font-extrabold leading-[0.92] tracking-[-0.045em] text-ink lg:text-[clamp(44px,4.6vw,72px)]">{children}</h2>
);
const Swap = ({ k, children }: { k: number; children: React.ReactNode }) => (
  <div key={k} className="animate-[chapter-in_0.45s_ease-out]">
    {children}
  </div>
);

/* ---------------- Systems ---------------- */
const SYSTEM_STEPS = [
  'The caregiving content pipeline: a new article comes in, AI writes the blog post and five social posts, Bannerbear makes the images, and it all gets scheduled.',
  'You stay in charge. Type [REVISE] on any post and it rewrites itself. Nothing goes out without a person saying yes.',
  'The voice receptionist: the phone rings, a Vapi agent answers, checks the calendar through n8n and books the slot. The AI that called you at the top of this page is built the same way.',
];
export function SystemsChapter() {
  return (
    <Chapter id="systems">
      {({ step }) => (
        <>
          <p className="text-[13px] font-semibold text-mute">Two real builds, wiring themselves up</p>
          <H2>
            Systems that run <span className="text-accent-ink">themselves.</span>
          </H2>
          <Swap k={step}>
            <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-mute lg:text-lg">{SYSTEM_STEPS[step]}</p>
          </Swap>
          {step === 2 && (
            <div className="mt-4 flex gap-2">
              <Link href="/ai-link/chat" className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-on-accent">
                <MessageCircle className="h-4 w-4" /> Chat with it
              </Link>
              <Link href="/ai-link/call" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-bg">
                <Phone className="h-4 w-4" /> Call it
              </Link>
            </div>
          )}
          <Steps n={3} at={step} />
        </>
      )}
    </Chapter>
  );
}

/* ---------------- Services ---------------- */
const titleOf = Object.fromEntries(projects.map((p) => [p.id, p.title]));
export function ServicesChapter() {
  return (
    <Chapter id="services">
      {({ step }) => {
        const s = SERVICES[step];
        return (
          <>
            <p className="text-[13px] font-semibold text-mute">My inbox, more or less</p>
            <H2>
              Four things I get <span className="text-accent-ink">hired for.</span>
            </H2>
            <Swap k={step}>
              <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.2em] text-accent-ink">
                {String(step + 1).padStart(2, '0')} · {s.proof.length} {s.proof.length === 1 ? 'build' : 'builds'} shipped
              </p>
              <h3 className="headline mt-1 text-2xl font-extrabold text-ink lg:text-3xl">{s.title}</h3>
              {/* on phones the email card above already says this */}
              <p className="mt-2 hidden max-w-[42ch] text-base leading-relaxed text-mute lg:block">{s.line}</p>
              <p className="mt-2 hidden text-[13px] text-faint lg:block">{s.tools}</p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                {s.proof.slice(0, 3).map((id) => (
                  <Link key={id} href={`/work/${id}`} className="text-accent-ink underline decoration-accent/60 decoration-2 underline-offset-4">
                    {titleOf[id]}
                  </Link>
                ))}
              </p>
            </Swap>
            <Steps n={4} at={step} />
          </>
        );
      }}
    </Chapter>
  );
}

/* ---------------- Process ---------------- */
const PROCESS = [
  ['You tell', 'me.', 'In plain words, the way you would explain it to a coworker. A Slack message is enough. No spec.'],
  ['I sketch', 'it.', 'Before building, I send the shape: what starts it, what it touches, and where a person signs off. You say yes or "not quite".'],
  ['I build', 'all of it.', 'You get the whole thing in one drop, plus a short list of what to connect before you hit run.'],
  ['You run', 'it.', 'If something breaks, it stops loudly instead of failing quietly. I fix the cause and it is safe to run again.'],
];
export function ProcessChapter() {
  return (
    <Chapter id="process">
      {({ step }) => (
        <>
          <p className="text-[13px] font-semibold text-mute">How a project actually goes</p>
          <Swap k={step}>
            <H2>
              {PROCESS[step][0]} <span className="text-accent-ink">{PROCESS[step][1]}</span>
            </H2>
            <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-mute lg:text-lg">{PROCESS[step][2]}</p>
          </Swap>
          <Steps n={4} at={step} />
        </>
      )}
    </Chapter>
  );
}

/* ---------------- Skills ---------------- */
export function SkillsChapter() {
  const skill = useStage((s) => s.skill);
  const sel = STICKERS.find((s) => s.label === skill);
  return (
    <Chapter id="skills">
      {() => (
        <>
          <H2>
            Stickers on <span className="script neon font-normal tracking-normal">my laptop.</span>
          </H2>
          <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-mute">Every tool here shipped in a real build on this site. The bigger the sticker, the more builds it&apos;s in.</p>
          <p className="mt-4 min-h-[3rem] max-w-[44ch] text-[15px] leading-relaxed text-mute" aria-live="polite">
            {sel ? (
              <>
                <span className="font-bold text-ink">{sel.label}</span> shipped in {sel.builds.join(', ')}.
              </>
            ) : (
              'Point at a sticker to see the builds behind it.'
            )}
          </p>
          <p className="mt-2 max-w-[44ch] text-[13px] text-faint">Also in the kit: {ALSO_IN_KIT}.</p>
        </>
      )}
    </Chapter>
  );
}

/* ---------------- About ---------------- */
export function AboutChapter() {
  // on phones the paragraph folds to 4 lines so the 3D above it has room
  const [more, setMore] = useState(false);
  const fold = more ? '' : 'max-lg:line-clamp-4';
  return (
    <Chapter id="about">
      {({ step }) => (
        <>
          <p className="text-[13px] font-semibold text-mute">About</p>
          <H2>
            I turn repetitive work into <span className="text-accent-ink">infrastructure.</span>
          </H2>
          <Swap k={step}>
            {step === 0 ? (
              <p className={`mt-3 max-w-[46ch] text-[15px] leading-relaxed text-mute lg:mt-4 lg:text-base ${fold}`}>
                I&apos;m Gian Benedict Bigay, an Automation Specialist who works mostly in n8n. For client brands I designed and ran the content engines, multi-platform distribution and CRM reporting that kept them publishing daily without anyone touching a keyboard.
              </p>
            ) : (
              <p className={`mt-3 max-w-[46ch] text-[15px] leading-relaxed text-mute lg:mt-4 lg:text-base ${fold}`}>
                Outside the pipelines I build the products themselves: an offline-first Flutter finance app, a room and equipment booking system for Universidad de Manila, a PHP e-commerce store, and AI voice receptionists. Same habits everywhere: shape the data once, fail loudly, make every run safe to repeat.
              </p>
            )}
          </Swap>
          <button type="button" onClick={() => setMore((m) => !m)} className="mt-1 text-[13px] font-semibold text-accent-ink underline underline-offset-4 lg:hidden">
            {more ? 'Show less' : 'Read more'}
          </button>
          <p className="mt-3 hidden text-[13px] text-faint lg:block">Quezon City, Philippines · GMT+8 · freelance, open for new projects</p>
          <div className="mt-3 flex flex-wrap gap-2 lg:mt-5 lg:gap-3">
            <a href="#book" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-semibold text-bg hover:bg-accent hover:text-on-accent lg:h-11 lg:px-5 lg:text-sm">
              Let&apos;s build something <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="/assets/resume.pdf" download className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold lg:h-11 lg:px-5 lg:text-sm text-ink ring-1 ring-ink/25 hover:ring-ink/50">
              <ArrowDownToLine className="h-4 w-4" /> Resume
            </a>
          </div>
        </>
      )}
    </Chapter>
  );
}

/* ---------------- Contact ---------------- */
const BOOKING_URL = 'https://cal.com/gian-benedict-ctcofe/discovery-call';
const EMBED_URL = `${BOOKING_URL}?embed=true&theme=light&layout=month_view`;
export function ContactChapter() {
  const dlg = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [opened, setOpened] = useState(false);
  const openCal = () => {
    setOpened(true);
    if (!dlg.current?.open) dlg.current?.showModal();
  };
  // the 3D "Pick a time" button on the desk calendar fires this
  useEffect(() => {
    const on = () => openCal();
    addEventListener('gb:book', on);
    const d = dlg.current;
    const off = d ? lightDismissFallback(d) : undefined;
    return () => {
      removeEventListener('gb:book', on);
      off?.();
    };
  }, []);
  return (
    <>
      <Chapter id="contact" anchors={['book']}>
        {() => (
          <>
            <p className="text-[13px] font-semibold text-mute">Book a call</p>
            <H2>
              Have a process worth <span className="script neon font-normal tracking-normal">automating?</span>
            </H2>
            <ol className="mt-3 space-y-1.5 text-[14px] leading-snug text-mute lg:mt-4 lg:space-y-2 lg:text-[15px] lg:leading-relaxed">
              {['You walk me through the process that eats your week.', 'I sketch how I would automate it and what it would touch.', 'You leave with a clear next step, whether we work together or not.'].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-[12px] font-bold text-on-accent">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2 lg:mt-5">
              <button type="button" onClick={openCal} className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-bold lg:h-12 lg:px-6 lg:text-base text-on-accent shadow-[0_14px_30px_-10px_rgba(255,111,166,1)]">
                <CalendarDays className="h-5 w-5" /> Pick a time
              </button>
              <a href="mailto:gianbenedict.bigay07@gmail.com" className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] lg:h-12 lg:px-4 lg:text-sm font-semibold text-ink ring-1 ring-ink/25">
                <Mail className="h-4 w-4" /> Email
              </a>
              <Link href="/ai-link" className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] lg:h-12 lg:px-4 lg:text-sm font-semibold text-ink ring-1 ring-ink/25">
                <Sparkles className="h-4 w-4" /> Ask my AI first
              </Link>
              <a href="https://www.linkedin.com/in/gian-benedict-6043193a4/" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] lg:h-12 lg:px-4 lg:text-sm font-semibold text-ink ring-1 ring-ink/25">
                LinkedIn <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 hidden text-[13px] text-faint lg:block">Free, 20 minutes, in your own timezone. I&apos;m in Manila, GMT+8.</p>
          </>
        )}
      </Chapter>
      <dialog
        ref={dlg}
        aria-label="Book a discovery call"
        className="chat-dialog"
        {...({ closedby: 'any' } as object)}
      >
        <div className="flex h-full flex-col gap-2">
          <div className="flex justify-end">
            <button type="button" onClick={() => dlg.current?.close()} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-card px-4 text-sm font-bold text-ink shadow ring-1 ring-ink/10">
              <X className="h-4 w-4" /> Close
            </button>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] bg-white">
            {!loaded && <p className="absolute inset-0 grid place-items-center text-sm text-mute">Loading my calendar…</p>}
            {opened && <iframe src={EMBED_URL} title="Book a discovery call with Gian" className="h-full w-full" onLoad={() => setLoaded(true)} />}
          </div>
        </div>
      </dialog>
    </>
  );
}
