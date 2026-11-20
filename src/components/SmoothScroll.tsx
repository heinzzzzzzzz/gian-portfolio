'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { MotionConfig } from 'framer-motion';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // lerp 0.16: still glides, but tracks the wheel closely instead of trailing
    // ~1s behind it (the old duration-based easing felt like input lag).
    const lenis = new Lenis({
      lerp: 0.16,
      wheelMultiplier: 1,
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
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
