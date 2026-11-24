/*
 * Scroll math for the Work shelf, shared by the page (ProjectShelf) and the
 * 3D world so both agree on where the explosion, the browsing and the
 * reassembly happen. All values are in viewport heights (vh).
 *
 *   [ explode ][ browse: one step per folder ][ reform ]
 */
export const EXPLODE_VH = 1.1;
export const STEP_VH = 0.42;
export const REFORM_VH = 0.9;

export const shelfHeightVh = (n: number) => 1 + EXPLODE_VH + Math.max(1, n) * STEP_VH + REFORM_VH;

/** Where we are inside the pinned shelf, from the section's top offset. */
export function shelfPhase(scrollY: number, top: number, vh: number, n: number) {
  const y = (scrollY - top) / vh; // vh scrolled since the section's top reached the top of the screen
  const count = Math.max(1, n);
  const browseEnd = EXPLODE_VH + count * STEP_VH;
  const explode = clamp(y / EXPLODE_VH); // 0 = phone, 1 = folders
  const browse = clamp((y - EXPLODE_VH) / (count * STEP_VH));
  const reform = clamp((y - browseEnd) / REFORM_VH); // 0 = folders, 1 = phone again
  const active = Math.min(count - 1, Math.max(0, Math.floor(browse * count)));
  return { y, explode, browse, reform, active, inside: y > -1 && y < browseEnd + REFORM_VH + 0.2 };
}

/** The scroll position that shows folder i facing you. */
export const scrollForIndex = (i: number, top: number, vh: number) => top + (EXPLODE_VH + (i + 0.5) * STEP_VH) * vh;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
