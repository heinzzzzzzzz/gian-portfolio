'use client';

import { useSyncExternalStore } from 'react';

// Tiny shared flag: has the opening loader finished (or been skipped)?
// The hero waits for it so its entrance plays after the curtain lifts.
let done = false;
const subs = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  subs.forEach((cb) => cb());
}

const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => subs.delete(cb);
};

export const useIntroDone = () =>
  useSyncExternalStore(subscribe, () => done, () => false);
