'use client';

import { useReduce } from '@/lib/motion';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { markIntroDone } from '@/lib/intro';

const MIN_MS = 900;
const MAX_MS = 2400;
const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const;

// Opening title card: the neon GB sign flickers on over the sand wall while a
// watermelon line counts the page in, then the whole card lifts like a curtain.
// Plays once per browser session; a script in <head> hides it on repeat visits
// before first paint, and Reduce Motion skips it.
export default function Preloader() {
  const reduce = useReduce();
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem('gb-intro') === '1';
    } catch {}
    if (seen || reduce) {
      // Already hidden by the <head> script; unmount on the next frame.
      const id = requestAnimationFrame(() => {
        setShow(false);
        markIntroDone();
      });
      return () => cancelAnimationFrame(id);
    }

    const t0 = performance.now();
    let loaded = document.readyState === 'complete';
    const onLoad = () => (loaded = true);
    window.addEventListener('load', onLoad);
    let fontsReady = false;
    document.fonts?.ready.then(() => (fontsReady = true));

    let raf = 0;
    const tick = () => {
      const t = performance.now() - t0;
      const ready = (loaded && fontsReady) || t > MAX_MS;
      // Ease toward 90% on time alone; the last 10% waits for the page.
      const timeP = Math.min(1, t / MIN_MS);
      const p = ready && t >= MIN_MS ? 1 : Math.min(0.9, 1 - Math.pow(1 - timeP, 3));
      setPct(Math.round(p * 100));
      if (p >= 1) {
        try {
          sessionStorage.setItem('gb-intro', '1');
        } catch {}
        setTimeout(() => {
          setShow(false);
          markIntroDone();
        }, 120);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', onLoad);
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="preloader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: EASE_CURTAIN }}
          aria-hidden
        >
          <div className="grain !absolute" />
          {/* faint wall grid, same as the old hero */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgb(71_67_41/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(71_67_41/0.06)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_50%,#000_20%,transparent_100%)]" />

          {/* CSS-only entrance so the sign paints before the page's JavaScript arrives. */}
          <div className="relative boot-in">
            <span className="script neon neon-boot block text-[clamp(96px,16vw,180px)] leading-none -rotate-[6deg]">GB</span>
          </div>

          <div className="relative mt-8 text-center text-[12px] uppercase tracking-[0.3em] text-mute boot-in [animation-delay:0.5s]">
            Gian Benedict · Automation Specialist
          </div>

          <div className="absolute inset-x-5 md:inset-x-10 bottom-8 flex items-center gap-4">
            <div className="relative h-px flex-1 bg-ink/15 overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-accent shadow-[0_0_10px_rgb(255_111_166/0.9)]" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-[3ch] text-right text-[13px] font-semibold tabular-nums text-ink">{pct}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
