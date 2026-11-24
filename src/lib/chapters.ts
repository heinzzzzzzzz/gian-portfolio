/*
 * The home page after the hero is a run of pinned "chapters". In each one the
 * 3D phone opens an app and pops big readable cards out of its screen, while
 * the text walks through a few steps. The phone alternates sides: between
 * chapters it slides across the page while its screen swipes to the next app.
 * This file is the single source of truth for steps, sides and scroll math,
 * shared by the page (React) and the 3D world.
 *
 *   [ enter: cards pop out ][ step ][ step ]...[ exit: cards go back in ]
 */
import { clamp } from './shelf';

export type ChapterId = 'systems' | 'services' | 'process' | 'skills' | 'about' | 'contact';
export type Side = 'left' | 'right'; // where the phone sits; the text takes the other side
export const CHAPTERS: { id: ChapterId; steps: number; stepVh: number; side: Side }[] = [
  { id: 'systems', steps: 3, stepVh: 0.7, side: 'right' },
  { id: 'services', steps: 4, stepVh: 0.6, side: 'left' },
  { id: 'process', steps: 4, stepVh: 0.6, side: 'right' },
  { id: 'skills', steps: 2, stepVh: 0.8, side: 'left' },
  { id: 'about', steps: 2, stepVh: 0.7, side: 'right' },
  { id: 'contact', steps: 1, stepVh: 0.9, side: 'left' },
];
export const chapterDef = (id: ChapterId) => CHAPTERS.find((c) => c.id === id)!;

export const ENTER_VH = 0.5;
export const EXIT_VH = 0.4;

export const chapterHeightVh = (steps: number, stepVh: number) => 1 + ENTER_VH + steps * stepVh + EXIT_VH;

export function chapterPhase(scrollY: number, top: number, vh: number, steps: number, stepVh: number) {
  const y = (scrollY - top) / vh;
  const enter = clamp(y / ENTER_VH);
  const run = clamp((y - ENTER_VH) / (steps * stepVh)); // 0..1 across all steps
  const exit = clamp((y - ENTER_VH - steps * stepVh) / EXIT_VH);
  const f = run * steps;
  const step = Math.min(steps - 1, Math.floor(f));
  const stepP = y < ENTER_VH ? 0 : clamp(f - step); // progress inside the current step
  // how much the phone belongs to this chapter (for blending its pose)
  const approach = clamp((y + 0.9) / 0.9);
  const leave = clamp((y - (ENTER_VH + steps * stepVh + EXIT_VH)) / 0.8);
  return { y, enter, run, exit, step, stepP, weight: approach * (1 - leave), approach, leave };
}
export type ChapterPhase = ReturnType<typeof chapterPhase>;

export const scrollForStep = (i: number, top: number, vh: number, stepVh: number) => top + (ENTER_VH + (i + 0.35) * stepVh) * vh;
