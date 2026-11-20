'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export { useReduce } from '@/lib/motion';
import { useReduce } from '@/lib/motion';

// One shot of the page film. Full bleed, no frame: the background never moves,
// only the content does. On the way in it rises and fades up;
// on the way out it pushes back, drifts up and fades, like a cut in a video.
// Transforms and opacity only, so scrolling stays smooth. No overflow-hidden
// here (overflow-x: clip does not make a scroll box), so sticky scenes inside
// (Process) keep pinning and nothing causes sideways scroll on phones.
export default function Scene({ children, className = 'bg-bg' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduce();

  // Section position is measured once (and again on resize), never per frame,
  // so scrolling only does math plus transform/opacity writes.
  const box = useRef({ top: 0, height: 0, vh: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      box.current = { top: r.top + window.scrollY, height: r.height, vh: window.innerHeight };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // enter: 0 when the top edge is at the viewport bottom, 1 once it is 75% up.
  // exit: 0 until the bottom edge reaches 75% down, 1 when it leaves the top.
  const { scrollY } = useScroll();
  const enter = useTransform(scrollY, (y) => {
    const { top, vh } = box.current;
    return Math.min(1, Math.max(0, (vh - (top - y)) / (vh * 0.75)));
  });
  const exit = useTransform(scrollY, (y) => {
    const { top, height, vh } = box.current;
    if (!height) return 0;
    return Math.min(1, Math.max(0, (vh * 0.75 - (top + height - y)) / (vh * 0.75)));
  });

  const inY = useTransform(enter, [0, 1], [140, 0]);
  const inOpacity = useTransform(enter, [0, 0.7], [0, 1]);

  const outY = useTransform(exit, [0, 1], [0, -80]);
  const outOpacity = useTransform(exit, [0, 0.85], [1, 0]);

  return (
    <div ref={ref} className={`relative overflow-x-clip ${className}`}>
      <motion.div style={reduce ? undefined : { y: outY, opacity: outOpacity, willChange: 'transform, opacity' }}>
        <motion.div style={reduce ? undefined : { y: inY, opacity: inOpacity, willChange: 'transform, opacity' }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
