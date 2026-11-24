// next/font gives the site fonts generated family names, so canvas text has to
// read them from the CSS variables instead of asking for "Open Sans" by name.
export const F = { sans: '"Open Sans", "Segoe UI", sans-serif', script: 'Yellowtail, cursive' };

export function initFonts() {
  const css = getComputedStyle(document.documentElement);
  const sans = css.getPropertyValue('--font-sans').trim();
  const script = css.getPropertyValue('--font-script').trim();
  if (sans) F.sans = `${sans}, "Segoe UI", sans-serif`;
  if (script) F.script = `${script}, cursive`;
}

export const sans = (weight: number, px: number) => `${weight} ${px}px ${F.sans}`;
export const script = (px: number) => `400 ${px}px ${F.script}`;
