'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useMotionForced, prefersCalm } from '@/lib/motion';

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

  // Smooth scrolling for mouse wheels only. A wheel jumps ~100px per notch,
  // which made the pinned 3D scenes judder; Lenis turns those notches into a
  // glide. Trackpads and touch already glide on their own (smoothing them again
  // read as lag, which is why Lenis was off before), so their events pass
  // straight through to the browser. Off entirely for Reduce Motion.
  useEffect(() => {
    if (prefersCalm()) return;
    let lenis: { destroy: () => void } | null = null;
    let alive = true;
    import('lenis').then(({ default: Lenis }) => {
      if (!alive) return;
      lenis = new Lenis({
        lerp: 0.13,
        smoothWheel: true,
        anchors: true,
        autoRaf: true,
        // dialogs, the call panel, the chat thread and the booking iframe scroll themselves
        prevent: (node) => !!node.closest?.('dialog,[popover],iframe,[data-lenis-prevent]'),
        // only smooth real mouse-wheel notches; let trackpads scroll natively
        virtualScroll: ({ event }) => event instanceof WheelEvent && isWheelNotch(event),
      });
    });
    return () => {
      alive = false;
      lenis?.destroy();
    };
  }, []);

  // reducedMotion="user": framer skips transform animations for people who
  // turn on Reduce Motion, without each component branching on it (which
  // made the server and client render different markup).
  return <MotionConfig reducedMotion={forced ? 'never' : 'user'}>{children}</MotionConfig>;
}

/**
 * A mouse wheel sends whole steps (Firefox: lines; Chrome/Edge: 100 or 120px,
 * no sideways part). Trackpads send many small, often fractional deltas.
 */
function isWheelNotch(e: WheelEvent) {
  if (e.deltaMode !== 0) return true;
  const y = Math.abs(e.deltaY);
  return e.deltaX === 0 && y >= 50 && Number.isInteger(y);
}
