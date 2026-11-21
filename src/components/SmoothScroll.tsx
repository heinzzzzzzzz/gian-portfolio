'use client';

import { useEffect } from 'react';
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

  // Scrolling is the browser's own on purpose: wheel, trackpad, arrow keys and
  // touch all move at the speed the visitor's device is tuned to. A JS smoothing
  // layer (Lenis) used to sit on top; on trackpads, which already glide, that
  // double-smoothing read as lag. The scroll-driven scenes still animate off it.

  // reducedMotion="user": framer skips transform animations for people who
  // turn on Reduce Motion, without each component branching on it (which
  // made the server and client render different markup).
  return <MotionConfig reducedMotion={forced ? 'never' : 'user'}>{children}</MotionConfig>;
}
