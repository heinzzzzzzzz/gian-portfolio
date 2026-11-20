'use client';

import { useSyncExternalStore } from 'react';

// Reduced motion, with an owner override.
// Visitors who turn on Reduce Motion (or turn off Windows "Animation effects")
// get the calm version of the site. Gian can force the full motion on his own
// machine by opening the site once with ?motion=full (undo with ?motion=auto).
const RM = '(prefers-reduced-motion: reduce)';

export const motionForced = () => {
  try {
    return localStorage.getItem('gb-motion') === 'full';
  } catch {
    return false;
  }
};
export const prefersCalm = () => !motionForced() && window.matchMedia(RM).matches;

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
// Server and first client render agree (false); React then re-renders with the real value.
export const useReduce = () => useSyncExternalStore(subscribe, prefersCalm, () => false);
export const useMotionForced = () => useSyncExternalStore(subscribe, motionForced, () => false);
