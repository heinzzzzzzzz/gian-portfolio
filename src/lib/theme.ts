'use client';

import { useSyncExternalStore } from 'react';
import { prefersCalm } from './motion';

// Light = the cute sand studio. Night = Tokyo after dark. The class lives on
// <html> (set before first paint by a script in layout.tsx) so CSS tokens
// retune the whole site at once.
export type Theme = 'light' | 'night';

const subs = new Set<() => void>();
const read = (): Theme => (document.documentElement.classList.contains('night') ? 'night' : 'light');
const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => subs.delete(cb);
};
export const useTheme = () => useSyncExternalStore(subscribe, read, () => 'light' as Theme);

let busy = false;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function apply(t: Theme) {
  document.documentElement.classList.toggle('night', t === 'night');
  try {
    localStorage.setItem('gb-theme', t);
  } catch {}
  subs.forEach((cb) => cb());
}

// Builds the velvet stage curtain: a scalloped valance and two drapes.
function makeCurtain(mood: Theme) {
  const el = document.createElement('div');
  el.className = `curtain curtain--${mood === 'night' ? 'night' : 'day'}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="curtain-half l"></div><div class="curtain-half r"></div><div class="curtain-valance"></div>';
  el.style.transform = 'translateY(-104%)';
  document.body.appendChild(el);
  const [l, r] = Array.from(el.querySelectorAll<HTMLElement>('.curtain-half'));
  return { el, l, r };
}

type Curtain = ReturnType<typeof makeCurtain>;

// Drop the curtain over the screen, with a little cloth sway.
async function dropCurtain(c: Curtain, calm: boolean) {
  const drop = c.el.animate([{ transform: 'translateY(-104%)' }, { transform: 'translateY(0)' }], {
    duration: 560,
    easing: calm ? 'cubic-bezier(0.65, 0, 0.35, 1)' : 'cubic-bezier(0.55, 0, 0.2, 1.08)',
    fill: 'forwards',
  });
  if (!calm) {
    const sway = [{ transform: 'skewX(0deg)' }, { transform: 'skewX(1.6deg)', offset: 0.45 }, { transform: 'skewX(-0.9deg)', offset: 0.75 }, { transform: 'skewX(0deg)' }];
    c.l.animate(sway, { duration: 800, easing: 'ease-out' });
    c.r.animate(sway, { duration: 800, easing: 'ease-out', delay: 40 });
  }
  await drop.finished;
}

// Part the drapes from the centre, gather them to the sides, then lift away.
async function openCurtain(c: Curtain) {
  const part = { duration: 820, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'forwards' as const };
  const gather = (dir: number) => [
    { transform: 'translateX(0) scaleX(1)' },
    { transform: `translateX(${dir * 3}%) scaleX(0.14)` },
  ];
  const pl = c.l.animate(gather(-1), part);
  c.r.animate(gather(1), part);
  await wait(part.duration * 0.72);
  await c.el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-104%)' }], {
    duration: 420,
    easing: 'cubic-bezier(0.55, 0, 0.75, 0.3)',
    fill: 'forwards',
  }).finished;
  await pl.finished.catch(() => {});
}

/**
 * Click the lamp: a velvet curtain in the colour of the next mode drops over
 * the screen, the theme swaps behind it, then the drapes part from the centre
 * and gather to the sides, revealing the new look. Transforms only.
 * With Reduce Motion the same curtain plays, just without overshoot or sway.
 */
export async function switchTheme() {
  if (busy) return;
  const next: Theme = read() === 'night' ? 'light' : 'night';
  busy = true;
  const c = makeCurtain(next);
  try {
    await dropCurtain(c, prefersCalm());
    apply(next);
    await wait(90);
    await openCurtain(c);
  } finally {
    c.el.remove();
    busy = false;
  }
}

/**
 * The same curtain as a page change ("teleport"): it falls, the route changes
 * behind it, and it opens on the new page. The curtain lives on <body>, which
 * stays mounted across client navigations, so it survives the route change.
 */
export async function curtainNavigate(go: () => void) {
  if (busy) return go();
  busy = true;
  const c = makeCurtain(read());
  try {
    await dropCurtain(c, prefersCalm());
    const from = location.pathname;
    go();
    const t0 = performance.now();
    while (location.pathname === from && performance.now() - t0 < 3000) await wait(40);
    await wait(160); // let the new page paint behind the curtain
    await openCurtain(c);
  } finally {
    c.el.remove();
    busy = false;
  }
}
