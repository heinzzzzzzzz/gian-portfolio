'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { projects, CATEGORIES, CATEGORY_LABEL, type Category } from '@/lib/projects';
import { stage } from '@/lib/stage';
import { shelfHeightVh, shelfPhase, scrollForIndex, EXPLODE_VH, STEP_VH } from '@/lib/shelf';
import { prefersCalm } from '@/lib/motion';

/*
 * Work, as a shelf of 3D folders (drawn by lib/phone3d/world.ts). This section
 * is tall and pinned: the phone explodes into folders, scrolling moves one
 * folder at a time, and at the end they fold back into the phone. This file
 * owns the readable parts and the folder-opening flow: click a folder (or
 * "Open the build") and it flies forward, opens like a book, then the page
 * dives into the project.
 */
export default function ProjectShelf() {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const list = useMemo(() => projects.filter((p) => filter === 'all' || p.category === filter), [filter]);
  const ids = useMemo(() => list.map((p) => p.id), [list]);
  const [active, setActive] = useState(0);
  const [show, setShow] = useState(false);
  const [diving, setDiving] = useState(false);

  useEffect(() => {
    stage.set({ shelfIds: ids });
  }, [ids]);

  const topRef = useRef(0);
  const sync = (y: number) => {
    const ph = shelfPhase(y, topRef.current, innerHeight, ids.length);
    setActive((a) => (a === ph.active ? a : ph.active));
    const s = ph.explode > 0.95 && ph.reform < 0.1;
    setShow((v) => (v === s ? v : s));
  };
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      topRef.current = r.top + window.scrollY;
      stage.set({ work: { top: topRef.current, height: r.height } });
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
  }, [ids]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', sync);

  const go = (i: number, smooth = true) => {
    const j = Math.max(0, Math.min(ids.length - 1, i));
    window.scrollTo({ top: scrollForIndex(j, topRef.current, innerHeight), behavior: smooth ? 'smooth' : 'auto' });
  };

  // open a build: the folder flies forward, opens like a book, then we go
  const open = (i: number) => {
    const id = ids[i];
    if (!id || diving) return;
    if (i !== active) go(i, false);
    if (prefersCalm()) {
      router.push(`/work/${id}`);
      return;
    }
    setDiving(true);
    requestAnimationFrame(() => stage.set({ opening: { id, at: performance.now() } }));
    window.setTimeout(() => router.push(`/work/${id}`), 1350);
  };

  // a folder clicked in 3D opens straight away
  useEffect(
    () =>
      stage.subscribe(() => {
        const p = stage.get().pick;
        if (p && performance.now() - p.at < 120) {
          stage.set({ pick: null });
          open(p.index);
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ids, active, diving],
  );
  // leaving the page clears the opening, so coming back shows the shelf again
  useEffect(() => () => stage.set({ opening: null }), []);

  const pickFilter = (f: Category | 'all') => {
    setFilter(f);
    requestAnimationFrame(() => window.scrollTo({ top: scrollForIndex(0, topRef.current, innerHeight), behavior: 'auto' }));
  };

  const p = list[Math.min(active, list.length - 1)];
  const visible = show && !diving;

  return (
    <section
      ref={ref}
      id="shelf"
      aria-label="Selected work"
      className="relative bg-bg"
      style={{ height: `${shelfHeightVh(ids.length) * 100}vh` }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(active + 1);
        if (e.key === 'ArrowLeft') go(active - 1);
      }}
    >
      {/* "Work" in the nav lands here: the shelf already built, first folder facing you */}
      <span id="work" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0" style={{ top: `${(EXPLODE_VH + STEP_VH * 0.5) * 100}vh` }} />

      <div className="sticky top-0 flex h-[100svh] flex-col px-5 pb-6 pt-24">
        <div className={`relative z-[45] flex flex-col items-center gap-3 text-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-accent-ink">Work · {list.length} builds</p>
          <div role="tablist" aria-label="Filter builds" className="flex flex-wrap justify-center bg-bg ring-1 ring-ink/40">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={filter === c.id}
                onClick={() => pickFilter(c.id)}
                className={`h-9 border-r border-ink/40 px-4 text-[12px] font-bold uppercase tracking-[0.14em] transition-colors last:border-r-0 ${
                  filter === c.id ? 'bg-accent-ink text-bg' : 'text-ink hover:bg-ink/5'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* the 3D shelf is sized to fit exactly in this band, so it never covers the text */}
        <div data-shelf-band className="min-h-0 flex-1" />

        <div className={`relative z-[45] mx-auto flex w-full max-w-5xl items-end justify-between gap-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <button type="button" onClick={() => go(active - 1)} disabled={active <= 0} aria-label="Previous build" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bg ring-1 ring-ink/30 transition-colors hover:bg-ink hover:text-bg disabled:opacity-30">
            <ArrowLeft className="h-5 w-5" />
          </button>
          {p && (
            <div className="min-w-0 text-center" aria-live="polite">
              <h3 className="headline text-[clamp(22px,2.6vw,36px)] font-extrabold leading-tight tracking-[-0.03em] text-ink">{p.title}</h3>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.18em] text-accent-ink">
                {CATEGORY_LABEL[p.category]} · {p.kind}
              </p>
              <button type="button" onClick={() => open(active)} className="mt-2 inline-flex items-center gap-1.5 border-b-2 border-accent pb-0.5 text-sm font-bold text-ink hover:text-accent-ink">
                Open the build <ArrowUpRight className="h-4 w-4" />
              </button>
              <p className="mt-1 text-[12px] text-faint">or click any folder</p>
            </div>
          )}
          <button type="button" onClick={() => go(active + 1)} disabled={active >= list.length - 1} aria-label="Next build" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bg ring-1 ring-ink/30 transition-colors hover:bg-ink hover:text-bg disabled:opacity-30">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* the dive into a project fades the page out just before it changes */}
      <div aria-hidden className={`pointer-events-none fixed inset-0 z-[60] bg-bg transition-opacity duration-300 ${diving ? 'opacity-100 delay-[1050ms]' : 'opacity-0'}`} />

      <ul className="sr-only">
        {list.map((pr) => (
          <li key={pr.id}>
            <Link href={`/work/${pr.id}`}>
              {pr.title}, {CATEGORY_LABEL[pr.category]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
