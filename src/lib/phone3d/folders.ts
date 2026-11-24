import { sans, script } from './fonts';
import type { Project } from '@/lib/projects';

/*
 * Each project is a thick folder on the shelf, like a row of VHS boxes:
 * its own colours and a little drawing on the spine, the name running down
 * the spine, the category and a GB badge at the foot. The cover (seen when
 * the folder turns to face you) carries the real screenshot.
 */
type Motif = 'nodes' | 'wave' | 'chart' | 'mail' | 'calendar' | 'brush' | 'bubble' | 'loop' | 'columns' | 'stopwatch' | 'coin' | 'building' | 'bag';
export type Design = { bg: string; fg: string; accent: string; motif: Motif; spine: string };

export const DESIGNS: Record<string, Design> = {
  cackle: { bg: '#F7E27A', fg: '#3B3413', accent: '#474329', motif: 'stopwatch', spine: 'CACKLE' },
  octi: { bg: '#8FD1A8', fg: '#1F3B2A', accent: '#F6FFF8', motif: 'coin', spine: 'OCTI' },
  'udm-booking-system': { bg: '#9CC6E8', fg: '#20324A', accent: '#FBF7F1', motif: 'building', spine: 'UDM BOOKING' },
  vapehub: { bg: '#C9B6E6', fg: '#2C2140', accent: '#FF6FA6', motif: 'bag', spine: 'VAPEHUB' },
  'ai-voice-receptionist': { bg: '#FF6FA6', fg: '#3A1426', accent: '#FBF7F1', motif: 'wave', spine: 'VOICE RECEPTIONIST' },
  'demand-automation-network': { bg: '#474329', fg: '#F0E5D8', accent: '#FF6FA6', motif: 'nodes', spine: 'DEMAND NETWORK' },
  'autonomous-thought-leadership': { bg: '#F0E5D8', fg: '#474329', accent: '#B0245F', motif: 'bubble', spine: 'THOUGHT LEADERSHIP' },
  'self-healing-content': { bg: '#B0245F', fg: '#FBDCE7', accent: '#FFD166', motif: 'loop', spine: 'SELF-HEALING CONTENT' },
  'multi-category-editorial': { bg: '#E6D6C3', fg: '#474329', accent: '#B0245F', motif: 'columns', spine: 'EDITORIAL GENERATOR' },
  'omnichannel-creative': { bg: '#151515', fg: '#F0E5D8', accent: '#FF6FA6', motif: 'brush', spine: 'CREATIVE STUDIO' },
  'intelligent-distribution': { bg: '#FFD166', fg: '#474329', accent: '#B0245F', motif: 'calendar', spine: 'DISTRIBUTION' },
  'automated-newsletter': { bg: '#FBDCE7', fg: '#B0245F', accent: '#474329', motif: 'mail', spine: 'NEWSLETTER' },
  'crm-call-intelligence': { bg: '#3A1A34', fg: '#FFEAF4', accent: '#8FD1A8', motif: 'chart', spine: 'CALL INTELLIGENCE' },
};
const FALLBACK: Design = { bg: '#E6D6C3', fg: '#474329', accent: '#FF6FA6', motif: 'nodes', spine: '' };
export const designFor = (p: Project): Design => {
  const d = DESIGNS[p.id] ?? FALLBACK;
  return d.spine ? d : { ...d, spine: p.title.toUpperCase() };
};

const CAT: Record<string, string> = { automation: 'AUTOMATION', app: 'APP', website: 'WEBSITE' };

export const SPINE_W = 256;
export const SPINE_H = 1360;
export const COVER_W = 1024;
export const COVER_H = 1360;

function paper(g: CanvasRenderingContext2D, w: number, h: number, bg: string) {
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // soft worn edges, like a well-handled case
  const v = g.createLinearGradient(0, 0, w, 0);
  v.addColorStop(0, 'rgba(0,0,0,0.18)');
  v.addColorStop(0.12, 'rgba(0,0,0,0)');
  v.addColorStop(0.88, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.18)');
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
  const s = g.createLinearGradient(0, 0, 0, h);
  s.addColorStop(0, 'rgba(255,255,255,0.12)');
  s.addColorStop(0.5, 'rgba(255,255,255,0)');
  s.addColorStop(1, 'rgba(0,0,0,0.12)');
  g.fillStyle = s;
  g.fillRect(0, 0, w, h);
}

export function drawSpine(c: HTMLCanvasElement, p: Project, k = 1) {
  const d = designFor(p);
  c.width = Math.round(SPINE_W * k);
  c.height = Math.round(SPINE_H * k);
  const g = c.getContext('2d')!;
  g.scale(k, k);
  paper(g, SPINE_W, SPINE_H, d.bg);
  // the drawing at the top of the spine
  motif(g, d.motif, SPINE_W / 2, 170, 88, d);
  g.strokeStyle = d.fg;
  g.globalAlpha = 0.35;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(40, 300);
  g.lineTo(SPINE_W - 40, 300);
  g.stroke();
  g.globalAlpha = 1;
  // the name, running down the spine
  const words = d.spine;
  const avail = 760;
  g.save();
  g.translate(SPINE_W / 2, 330);
  g.rotate(Math.PI / 2);
  g.fillStyle = d.fg;
  g.textBaseline = 'middle';
  let size = 104;
  g.font = sans(800, size);
  while (g.measureText(words).width > avail && size > 46) g.font = sans(800, (size -= 2));
  if (g.measureText(words).width > avail && words.includes(' ')) {
    // two lines for long names
    const mid = words.lastIndexOf(' ', Math.ceil(words.length / 2) + 3);
    const [a, b] = [words.slice(0, mid), words.slice(mid + 1)];
    size = 78;
    g.font = sans(800, size);
    while (Math.max(g.measureText(a).width, g.measureText(b).width) > avail && size > 40) g.font = sans(800, (size -= 2));
    g.fillText(a, 0, -size * 0.55);
    g.fillText(b, 0, size * 0.55);
  } else {
    g.fillText(words, 0, 0);
  }
  g.restore();
  // foot: category, then the GB badge
  g.fillStyle = d.fg;
  g.textAlign = 'center';
  g.font = sans(700, 26);
  g.fillText(spaced(CAT[p.category] ?? ''), SPINE_W / 2, SPINE_H - 168);
  g.strokeStyle = d.fg;
  g.lineWidth = 4;
  g.strokeRect(SPINE_W / 2 - 62, SPINE_H - 136, 124, 70);
  g.font = script(52);
  g.fillText('GB', SPINE_W / 2, SPINE_H - 84);
  g.font = sans(700, 22);
  g.fillText(p.year, SPINE_W / 2, SPINE_H - 30);
}

export function drawCover(c: HTMLCanvasElement, p: Project, shot: HTMLImageElement | null, k = 1) {
  const d = designFor(p);
  c.width = Math.round(COVER_W * k);
  c.height = Math.round(COVER_H * k);
  const g = c.getContext('2d')!;
  g.scale(k, k);
  paper(g, COVER_W, COVER_H, d.bg);
  g.strokeStyle = d.fg;
  g.globalAlpha = 0.5;
  g.lineWidth = 4;
  g.strokeRect(36, 36, COVER_W - 72, COVER_H - 72);
  g.globalAlpha = 1;
  g.fillStyle = d.fg;
  g.textAlign = 'center';
  g.font = sans(700, 28);
  g.fillText(spaced('A GIAN BENEDICT BUILD'), COVER_W / 2, 120);
  // title, wrapped
  const lines = wrap(g, p.title.toUpperCase(), 880, 92);
  g.font = sans(800, lines.size);
  lines.lines.forEach((l, i) => g.fillText(l, COVER_W / 2, 230 + i * lines.size * 1.02));
  // the real screenshot
  const top = 250 + lines.lines.length * lines.size;
  const boxH = COVER_H - top - 250;
  g.save();
  g.beginPath();
  g.roundRect(80, top, COVER_W - 160, boxH, 18);
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fill();
  g.clip();
  if (shot?.complete && shot.naturalWidth) {
    const s = Math.max((COVER_W - 160) / shot.naturalWidth, boxH / shot.naturalHeight);
    const w = shot.naturalWidth * s;
    g.drawImage(shot, 80 + (COVER_W - 160 - w) / 2, top, w, shot.naturalHeight * s);
  } else {
    motif(g, d.motif, COVER_W / 2, top + boxH / 2, 150, d);
  }
  g.restore();
  // foot
  g.fillStyle = d.fg;
  g.textAlign = 'left';
  g.font = sans(700, 30);
  g.fillText(spaced(CAT[p.category] ?? ''), 90, COVER_H - 150);
  g.font = sans(600, 28);
  g.globalAlpha = 0.85;
  g.fillText(p.stack.slice(0, 4).join(' · '), 90, COVER_H - 104);
  g.globalAlpha = 1;
  g.textAlign = 'center';
  g.lineWidth = 4;
  g.strokeRect(COVER_W - 230, COVER_H - 190, 140, 90);
  g.font = script(64);
  g.fillText('GB', COVER_W - 160, COVER_H - 122);
  g.font = sans(700, 24);
  g.fillText(p.year, COVER_W - 160, COVER_H - 66);
}

function wrap(g: CanvasRenderingContext2D, text: string, max: number, start: number) {
  for (let size = start; size >= 48; size -= 4) {
    g.font = sans(800, size);
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (g.measureText(t).width > max && cur) {
        lines.push(cur);
        cur = w;
      } else cur = t;
    }
    lines.push(cur);
    if (lines.length <= 3) return { lines, size };
  }
  return { lines: [text], size: 48 };
}

const spaced = (s: string) => s.split('').join(' ');

/* ---------- spine and cover drawings ---------- */
function motif(g: CanvasRenderingContext2D, m: Motif, x: number, y: number, r: number, d: Design) {
  g.save();
  g.translate(x, y);
  // a sun disc behind every drawing, like the reference covers
  g.fillStyle = d.accent;
  g.globalAlpha = 0.9;
  g.beginPath();
  g.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  g.strokeStyle = d.fg;
  g.fillStyle = d.fg;
  g.lineWidth = r * 0.08;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const u = r / 100;
  switch (m) {
    case 'nodes': {
      const pts = [[-50, -30], [10, -55], [55, 0], [5, 45], [-45, 35]];
      g.beginPath();
      pts.forEach(([a, b], i) => pts.slice(i + 1).forEach(([c, e]) => { if ((i + 1) % 2 || c > 0) { g.moveTo(a * u, b * u); g.lineTo(c * u, e * u); } }));
      g.stroke();
      pts.forEach(([a, b]) => { g.beginPath(); g.arc(a * u, b * u, 12 * u, 0, Math.PI * 2); g.fill(); });
      break;
    }
    case 'wave':
      for (let i = -4; i <= 4; i++) {
        const h = (60 - Math.abs(i) * 11) * u;
        g.beginPath();
        g.moveTo(i * 13 * u, -h);
        g.lineTo(i * 13 * u, h);
        g.stroke();
      }
      break;
    case 'chart':
      [[-45, 30], [-15, -5], [15, -35], [45, -60]].forEach(([bx, by]) => { g.fillRect((bx - 10) * u, by * u, 20 * u, (55 - by) * u); });
      break;
    case 'mail':
      g.strokeRect(-55 * u, -38 * u, 110 * u, 76 * u);
      g.beginPath();
      g.moveTo(-55 * u, -38 * u);
      g.lineTo(0, 8 * u);
      g.lineTo(55 * u, -38 * u);
      g.stroke();
      break;
    case 'calendar':
      g.strokeRect(-50 * u, -42 * u, 100 * u, 90 * u);
      g.fillRect(-50 * u, -42 * u, 100 * u, 22 * u);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.fillRect((-36 + i * 30) * u, (-8 + j * 18) * u, 12 * u, 9 * u);
      break;
    case 'brush':
      g.beginPath();
      g.moveTo(-50 * u, 45 * u);
      g.bezierCurveTo(-30 * u, -60 * u, 30 * u, 60 * u, 50 * u, -45 * u);
      g.stroke();
      g.beginPath();
      g.arc(-20 * u, -30 * u, 14 * u, 0, Math.PI * 2);
      g.fill();
      break;
    case 'bubble':
      g.beginPath();
      g.roundRect(-55 * u, -42 * u, 110 * u, 70 * u, 18 * u);
      g.moveTo(-20 * u, 28 * u);
      g.lineTo(-34 * u, 52 * u);
      g.lineTo(0, 28 * u);
      g.stroke();
      g.fillRect(-35 * u, -18 * u, 70 * u, 8 * u);
      g.fillRect(-35 * u, 0, 45 * u, 8 * u);
      break;
    case 'loop':
      g.beginPath();
      g.arc(0, 0, 45 * u, 0.3, Math.PI * 1.75);
      g.stroke();
      g.beginPath();
      g.moveTo(28 * u, -48 * u);
      g.lineTo(46 * u, -26 * u);
      g.lineTo(18 * u, -18 * u);
      g.stroke();
      break;
    case 'columns':
      for (let c = 0; c < 2; c++) for (let l = 0; l < 6; l++) g.fillRect((-50 + c * 55) * u, (-45 + l * 17) * u, (l === 5 ? 28 : 45) * u, 8 * u);
      break;
    case 'stopwatch':
      g.beginPath();
      g.arc(0, 8 * u, 48 * u, 0, Math.PI * 2);
      g.stroke();
      g.fillRect(-10 * u, -58 * u, 20 * u, 14 * u);
      g.beginPath();
      g.moveTo(0, 8 * u);
      g.lineTo(22 * u, -16 * u);
      g.stroke();
      break;
    case 'coin':
      g.beginPath();
      g.arc(0, 0, 48 * u, 0, Math.PI * 2);
      g.stroke();
      g.font = sans(800, 70 * u);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('₱', 0, 4 * u);
      break;
    case 'building':
      g.strokeRect(-42 * u, -50 * u, 84 * u, 100 * u);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) g.fillRect((-30 + i * 24) * u, (-38 + j * 20) * u, 12 * u, 10 * u);
      break;
    case 'bag':
      g.strokeRect(-42 * u, -22 * u, 84 * u, 72 * u);
      g.beginPath();
      g.arc(0, -22 * u, 22 * u, Math.PI, 0);
      g.stroke();
      break;
  }
  g.restore();
}
