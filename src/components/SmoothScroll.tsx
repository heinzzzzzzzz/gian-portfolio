'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { MotionConfig } from 'framer-motion';
import { useMotionForced } from '@/lib/motion';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const forced = useMotionForced();

  // Owner switch: ?motion=full forces full motion on this browser, ?motion=auto undoes it.
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('motion');
    if (q !== 'full' && q !== 'auto') return;
    try {
      if (q === 'full') localStorage.setItem('gb-motion', 'full');
      else localStorage.removeItem('gb-motion');
      sessionStorage.removeItem('gb-intro');
    } catch {}
    const url = new URL(location.href);
    url.searchParams.delete('motion');
    location.replace(url.toString());
  }, []);

  useEffect(() => {
    // lerp 0.085: a film-like glide that trails the wheel a little and eases to
    // a stop, without tipping into feeling like input lag.
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // reducedMotion="user": framer skips transform animations for people who
  // turn on Reduce Motion, without each component branching on it (which
  // made the server and client render different markup).
  return <MotionConfig reducedMotion={forced ? 'never' : 'user'}>{children}</MotionConfig>;
}
