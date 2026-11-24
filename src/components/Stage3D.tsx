'use client';

import { useEffect, useRef } from 'react';
import { prefersCalm } from '@/lib/motion';

/*
 * Mounts the one fixed 3D canvas for the home page (the phone and the folder
 * shelf). three.js is loaded after the page is interactive, so it never slows
 * the first paint. The canvas ignores the mouse; the page under it keeps
 * working, and the 3D world listens for its own clicks on folders.
 */
export default function Stage3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return; // no WebGL: the hero falls back to the flat photo
    const boot = () =>
      import('@/lib/phone3d/world').then(({ createWorld }) => {
        if (!cancelled) dispose = createWorld(canvas, { calm: prefersCalm });
      });
    const idle = typeof window.requestIdleCallback === 'function';
    const id = idle ? window.requestIdleCallback(boot, { timeout: 1200 }) : window.setTimeout(boot, 300);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id);
      else clearTimeout(id);
      dispose?.();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full" />;
}
