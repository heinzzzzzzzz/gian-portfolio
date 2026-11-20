import type { Category } from './projects';

// The work section is three doors; each opens its own page at /builds/<slug>.
export const DOORS: { slug: string; cat: Category; label: string; n: number }[] = [
  { slug: 'automations', cat: 'automation', label: 'Automations', n: 1 },
  { slug: 'apps', cat: 'app', label: 'Apps', n: 2 },
  { slug: 'websites', cat: 'website', label: 'Websites', n: 3 },
];
