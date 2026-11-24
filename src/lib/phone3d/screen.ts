import { sans, script } from './fonts';
import type { CallInfo } from '@/lib/stage';
import { STICKERS, SERVICES } from '@/lib/content';
import { projects } from '@/lib/projects';

const STICKER_NAMES = STICKERS.map((s) => [s.label, s.bg, s.fg] as const);
const SOCIAL_STATS = { builds: projects.length, services: SERVICES.length };

/*
 * Everything the 3D phone shows on its screen, drawn on a 2D canvas that the
 * phone uses as a texture. Each "app" is a small function of time so the
 * screen moves like a real phone: boot logo, lock screen, an incoming call
 * that slides down, the call itself with a live voice wave, notifications
 * while it rides along, and the Builds app opening before it explodes.
 */
export const SCREEN_W = 512; // drawing coordinates
export const SCREEN_H = 1085;
// Texture pixels per drawing unit: full size on laptops, a bit less on phones
// (fewer pixels to upload each time it changes).
export let SCREEN_RES = 1;
export const setScreenRes = (r: number) => (SCREEN_RES = r);

export type ScreenScene =
  | { kind: 'hero'; t: number } // boot -> lock -> incoming call
  | { kind: 'dock'; t: number }
  | { kind: 'app'; p: number } // 0..1 opening the Builds app
  | { kind: 'chapter'; app: ChapterApp; progress: number; t: number };
export type ChapterApp = 'n8n' | 'mail' | 'messages' | 'stickers' | 'social' | 'calendar';
/** a swipe between two screens: `u` 0..1, `dir` which way the content moves */
export type Swipe = { from: ScreenScene; to: ScreenScene; u: number; dir: 1 | -1 };

const avatar = typeof Image !== 'undefined' ? new Image() : null;
if (avatar) avatar.src = '/avatar.jpg';

const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: false, timeZone: 'Asia/Manila' });
const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' });

const C = {
  ink: '#474329',
  mute: '#6E6850',
  pink: '#FF6FA6',
  pinkInk: '#B0245F',
  onPink: '#3A1426',
  cream: '#FBF7F1',
};
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

export function drawScreen(g: CanvasRenderingContext2D, scene: ScreenScene | Swipe, call: CallInfo, night: boolean, calm: boolean) {
  g.save();
  g.setTransform(SCREEN_RES, 0, 0, SCREEN_RES, 0, 0);
  g.clearRect(0, 0, SCREEN_W, SCREEN_H);
  let dark = false;
  if (call.status === 'connecting' || call.status === 'active') {
    onCall(g, call, night, calm);
    dark = true;
  } else if ('u' in scene) {
    // swipe: the old app slides out one way, the next one follows it in
    const off = scene.dir * easeInOutS(scene.u) * SCREEN_W;
    g.setTransform(SCREEN_RES, 0, 0, SCREEN_RES, off * SCREEN_RES, 0);
    drawOne(g, scene.from, night, calm);
    g.setTransform(SCREEN_RES, 0, 0, SCREEN_RES, (off - scene.dir * SCREEN_W) * SCREEN_RES, 0);
    drawOne(g, scene.to, night, calm);
    g.setTransform(SCREEN_RES, 0, 0, SCREEN_RES, 0, 0);
    dark = scene.u < 0.5 ? isDark(scene.from) : isDark(scene.to);
  } else {
    drawOne(g, scene, night, calm);
    dark = isDark(scene);
  }
  // status bar on top of every screen
  statusBar(g, dark);
  g.restore();
}
const easeInOutS = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const isDark = (s: ScreenScene) => (s.kind === 'hero' && s.t < 1) || (s.kind === 'chapter' && s.app === 'n8n');
function drawOne(g: CanvasRenderingContext2D, scene: ScreenScene, night: boolean, calm: boolean) {
  if (scene.kind === 'hero') hero(g, scene.t, night, calm);
  else if (scene.kind === 'dock') dock(g, scene.t, night, calm);
  else if (scene.kind === 'chapter') chapterApp(g, scene, night);
  else app(g, scene.p, night);
}

function wallpaper(g: CanvasRenderingContext2D, night: boolean) {
  const grd = g.createLinearGradient(0, 0, SCREEN_W * 0.4, SCREEN_H);
  if (night) {
    grd.addColorStop(0, '#5a2150');
    grd.addColorStop(0.55, '#2d1428');
    grd.addColorStop(1, '#1c0b19');
  } else {
    grd.addColorStop(0, '#FFE9F1');
    grd.addColorStop(0.6, '#F9CFE0');
    grd.addColorStop(1, '#F2B8CF');
  }
  g.fillStyle = grd;
  g.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

function statusBar(g: CanvasRenderingContext2D, light: boolean) {
  g.fillStyle = light ? '#ffffff' : C.ink;
  g.globalAlpha = 0.85;
  g.font = sans(700, 26);
  g.textAlign = 'left';
  g.fillText(timeFmt.format(new Date()), 44, 62);
  // signal + battery
  g.textAlign = 'right';
  for (let i = 0; i < 4; i++) g.fillRect(392 + i * 11, 58 - (i + 1) * 6, 7, (i + 1) * 6);
  g.strokeStyle = g.fillStyle;
  g.lineWidth = 3;
  roundRect(g, 444, 38, 40, 22, 6);
  g.stroke();
  g.fillRect(448, 42, 26, 14);
  g.globalAlpha = 1;
}

function avatarCircle(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.save();
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.closePath();
  g.fillStyle = '#f3d6e2';
  g.fill();
  g.clip();
  if (avatar?.complete && avatar.naturalWidth) g.drawImage(avatar, x - r, y - r, r * 2, r * 2);
  g.restore();
}

function pulseRings(g: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, amp = 1) {
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.55 + i / 3) % 1;
    g.beginPath();
    g.arc(x, y, r + k * 95 * amp, 0, Math.PI * 2);
    g.strokeStyle = `rgba(255,111,166,${0.55 * (1 - k)})`;
    g.lineWidth = 6;
    g.stroke();
  }
}

function roundButton(g: CanvasRenderingContext2D, x: number, y: number, fill: string, label: string, icon: 'msg' | 'phone' | 'end', labelColor: string) {
  g.beginPath();
  g.arc(x, y, 66, 0, Math.PI * 2);
  g.fillStyle = fill;
  g.fill();
  g.strokeStyle = icon === 'msg' ? C.ink : icon === 'end' ? '#fff' : C.onPink;
  g.lineWidth = 7;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (icon === 'msg') {
    roundRect(g, x - 30, y - 24, 60, 42, 12);
    g.stroke();
    g.beginPath();
    g.moveTo(x - 14, y + 18);
    g.lineTo(x - 22, y + 30);
    g.lineTo(x - 2, y + 18);
    g.stroke();
  } else {
    // handset
    g.save();
    g.translate(x, y);
    if (icon === 'end') g.rotate(Math.PI * 0.75);
    g.beginPath();
    g.moveTo(-22, -20);
    g.quadraticCurveTo(-26, 18, 20, 24);
    g.stroke();
    g.beginPath();
    g.arc(-22, -24, 7, 0, Math.PI * 2);
    g.arc(24, 24, 7, 0, Math.PI * 2);
    g.fillStyle = g.strokeStyle;
    g.fill();
    g.restore();
  }
  g.fillStyle = labelColor;
  g.font = sans(700, 28);
  g.textAlign = 'center';
  g.fillText(label, x, y + 112);
}

/* ---------- hero: boot -> lock -> incoming call ---------- */
function hero(g: CanvasRenderingContext2D, t: number, night: boolean, calm: boolean) {
  if (calm) t = 9; // reduced motion: go straight to the call screen
  if (t < 1) {
    // boot: black, then the neon GB fades in
    g.fillStyle = '#0d0b06';
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const a = clamp((t - 0.2) / 0.5);
    g.globalAlpha = a;
    g.font = script(150);
    g.textAlign = 'center';
    g.shadowColor = 'rgba(255,111,166,0.9)';
    g.shadowBlur = 30;
    g.fillStyle = '#ff7fb2';
    g.fillText('GB', SCREEN_W / 2, SCREEN_H / 2 + 40);
    g.shadowBlur = 0;
    g.globalAlpha = 1;
    return;
  }
  wallpaper(g, night);
  const fg = night ? '#ffeaf4' : C.ink;
  const lockFade = 1 - clamp((t - 2.0) / 0.5); // the lock screen gives way to the call
  if (lockFade > 0) {
    g.globalAlpha = lockFade;
    lockClock(g, fg, night);
    g.globalAlpha = 1;
  }
  if (t < 1.7) return;
  // incoming call: a banner drops in from the top, then opens full screen
  const drop = easeOut((t - 1.7) / 0.35);
  const open = easeOut((t - 2.15) / 0.45);
  if (open < 1) {
    const y = -140 + drop * 230;
    g.globalAlpha = 1 - open;
    g.fillStyle = night ? 'rgba(58,26,52,0.95)' : 'rgba(255,255,255,0.92)';
    roundRect(g, 28, y, SCREEN_W - 56, 120, 30);
    g.fill();
    avatarCircle(g, 92, y + 60, 38);
    g.fillStyle = fg;
    g.textAlign = 'left';
    g.font = sans(800, 30);
    g.fillText("Gian's AI", 146, y + 52);
    g.font = sans(600, 22);
    g.fillStyle = night ? '#e8bcd2' : C.mute;
    g.fillText('incoming call…', 146, y + 86);
    g.globalAlpha = 1;
  }
  if (open > 0) {
    g.globalAlpha = open;
    incoming(g, t, fg, night);
    g.globalAlpha = 1;
  }
}

function lockClock(g: CanvasRenderingContext2D, fg: string, night: boolean) {
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.font = sans(300, 30);
  g.fillText(dateFmt.format(new Date()), SCREEN_W / 2, 200);
  g.font = sans(700, 150);
  g.fillText(timeFmt.format(new Date()), SCREEN_W / 2, 350);
  g.font = sans(600, 22);
  g.fillStyle = night ? '#e8bcd2' : C.mute;
  g.fillText('Quezon City · Manila time', SCREEN_W / 2, 400);
}

function incoming(g: CanvasRenderingContext2D, t: number, fg: string, night: boolean) {
  g.textAlign = 'center';
  g.fillStyle = night ? '#e8bcd2' : C.mute;
  g.font = sans(600, 28);
  g.fillText('incoming call · AI clone', SCREEN_W / 2, 200);
  pulseRings(g, SCREEN_W / 2, 400, 120, t);
  avatarCircle(g, SCREEN_W / 2, 400, 120);
  g.fillStyle = fg;
  g.font = sans(800, 60);
  g.fillText("Gian's AI", SCREEN_W / 2, 640);
  g.font = sans(600, 28);
  g.fillStyle = night ? '#e8bcd2' : C.mute;
  g.fillText('Automation specialist', SCREEN_W / 2, 690);
  roundButton(g, 150, 900, night ? '#3a1a34' : C.cream, 'Text', 'msg', fg);
  roundButton(g, 362, 900, C.pink, 'Answer', 'phone', fg);
}

/* ---------- on a call ---------- */
function onCall(g: CanvasRenderingContext2D, call: CallInfo, night: boolean, calm: boolean) {
  g.fillStyle = night ? '#1c0b19' : '#2b2716';
  g.fillRect(0, 0, SCREEN_W, SCREEN_H);
  const t = performance.now() / 1000;
  g.textAlign = 'center';
  // a status pill: calling (pink, dots) or connected (green)
  const live = call.status === 'active';
  const pillW = 300;
  g.fillStyle = live ? 'rgba(63,182,107,0.22)' : 'rgba(255,111,166,0.22)';
  roundRect(g, SCREEN_W / 2 - pillW / 2, 150, pillW, 70, 35);
  g.fill();
  g.fillStyle = live ? '#3FB66B' : '#FF6FA6';
  g.beginPath();
  g.arc(SCREEN_W / 2 - pillW / 2 + 40, 185, 11 + (live && !calm ? Math.sin(t * 6) * 3 : 0), 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#ffffff';
  g.font = sans(800, 32);
  const dots = '.'.repeat(1 + (Math.floor(t * 3) % 3));
  g.fillText(live ? 'Connected' : `Calling${dots}`, SCREEN_W / 2 + 16, 197);
  g.font = sans(600, 28);
  g.fillStyle = '#ffeaf4';
  if (live) g.fillText(call.speaking ? 'my AI is talking' : 'listening to you', SCREEN_W / 2, 262);
  if (!calm) pulseRings(g, SCREEN_W / 2, 400, 120, t, 0.4 + call.volume * 6);
  avatarCircle(g, SCREEN_W / 2, 400, 120);
  g.font = sans(800, 56);
  g.fillStyle = '#ffffff';
  g.fillText("Gian's AI", SCREEN_W / 2, 630);
  g.font = sans(600, 34);
  g.fillStyle = '#ff9cc8';
  const s = call.seconds;
  g.font = sans(800, 46);
  g.fillText(call.status === 'active' ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : 'ringing', SCREEN_W / 2, 700);
  // live voice wave
  const bars = 21;
  for (let i = 0; i < bars; i++) {
    const k = Math.sin(t * 9 + i * 0.7) * 0.5 + 0.5;
    const h = 10 + (calm ? 0.3 : k) * (20 + call.volume * 900) * (1 - Math.abs(i - bars / 2) / bars);
    g.fillStyle = '#FF6FA6';
    roundRect(g, 96 + i * 15.5, 780 - Math.min(110, h) / 2, 8, Math.min(110, h), 4);
    g.fill();
  }
  roundButton(g, SCREEN_W / 2, 950, '#e5484d', 'End call', 'end', '#ffffff');
}

/* ---------- riding along in the corner ---------- */
const NOTES = [
  ['Gian’s AI', 'Tap me to call. I pick up.'],
  ['Gian’s AI', 'Or text me, I reply fast.'],
  ['Builds', '13 projects in the shelf below'],
  ['Gian’s AI', 'Ask me how a project starts'],
];
function dock(g: CanvasRenderingContext2D, t: number, night: boolean, calm: boolean) {
  wallpaper(g, night);
  const fg = night ? '#ffeaf4' : C.ink;
  lockClock(g, fg, night);
  const cycle = 4.2;
  const idx = Math.floor(t / cycle) % NOTES.length;
  const k = calm ? 1 : (t % cycle) / cycle;
  const inP = easeOut(k / 0.12);
  const outP = clamp((k - 0.88) / 0.12);
  const y = 470 + (1 - inP) * -60;
  g.globalAlpha = calm ? 1 : inP * (1 - outP);
  g.fillStyle = night ? 'rgba(58,26,52,0.95)' : 'rgba(255,255,255,0.9)';
  roundRect(g, 32, y, SCREEN_W - 64, 150, 30);
  g.fill();
  avatarCircle(g, 96, y + 75, 40);
  g.textAlign = 'left';
  g.fillStyle = fg;
  g.font = sans(800, 32);
  g.fillText(NOTES[idx][0], 152, y + 62);
  g.font = sans(600, 27);
  g.fillStyle = night ? '#e8bcd2' : C.mute;
  g.fillText(NOTES[idx][1], 152, y + 100);
  g.globalAlpha = 1;
  // the call button stays on the lock screen
  roundButton(g, SCREEN_W / 2, 880, C.pink, 'Call my AI', 'phone', fg);
}

/* ---------- opening the Builds app ---------- */
function app(g: CanvasRenderingContext2D, p: number, night: boolean) {
  wallpaper(g, night);
  const icons = ['#474329', '#FF6FA6', '#8FD1A8', '#FFD166', '#9CC6E8', '#C9B6E6', '#B0245F', '#E6D6C3', '#3a1a34', '#F7E27A', '#FBF7F1', '#151515'];
  const tap = clamp(p / 0.45);
  const zoom = easeOut((p - 0.45) / 0.55);
  // home screen grid
  g.globalAlpha = 1 - zoom;
  icons.forEach((c, i) => {
    const x = 60 + (i % 4) * 106;
    const y = 180 + Math.floor(i / 4) * 150;
    g.fillStyle = c;
    roundRect(g, x, y, 86, 86, 22);
    g.fill();
  });
  g.globalAlpha = 1;
  // the Builds folder icon, pressed then opening to full screen
  const s = 1 - Math.sin(tap * Math.PI) * 0.12;
  const bx = SCREEN_W / 2, by = 760;
  const w = (150 + zoom * (SCREEN_W - 150)) * s;
  const h = (150 + zoom * (SCREEN_H - 150)) * s;
  const cy = by + (SCREEN_H / 2 - by) * zoom;
  g.fillStyle = '#FF6FA6';
  roundRect(g, bx - w / 2, cy - h / 2, w, h, 36 * (1 - zoom) + 4);
  g.fill();
  // folder glyph
  g.fillStyle = '#3A1426';
  const fw = 80 + zoom * 120, fh = 56 + zoom * 84;
  roundRect(g, bx - fw / 2, cy - fh / 2 + 6, fw, fh, 10);
  g.fill();
  roundRect(g, bx - fw / 2, cy - fh / 2 - 6, fw * 0.45, 20, 6);
  g.fill();
  g.globalAlpha = 1 - zoom;
  g.fillStyle = night ? '#ffeaf4' : C.ink;
  g.font = sans(700, 26);
  g.textAlign = 'center';
  g.fillText('Builds', bx, by + 110);
  g.globalAlpha = 1;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

/* ================= chapter apps =================
 * One app per chapter, drawn big enough to read on the 3D phone. Each draws
 * from `progress` (step + how far into it), so the phone changes as you
 * scroll, like someone using the app. */
const thumbs = new Map<string, HTMLImageElement>();
export function thumb(src: string) {
  let im = thumbs.get(src);
  if (!im && typeof Image !== 'undefined') {
    im = new Image();
    im.src = src;
    thumbs.set(src, im);
  }
  return im;
}
export const SOCIAL_POSTS = [
  '/work/3d/voice-receptionist.webp',
  '/work/3d/cackle-wide.webp',
  '/work/3d/octi-wide.webp',
  '/work/3d/cover-demand-automation-network.webp',
  '/work/3d/cover-udm-booking-system.webp',
  '/work/3d/cover-vapehub.webp',
];

function appBar(g: CanvasRenderingContext2D, title: string, bg: string, fg: string, right?: string, rightColor?: string) {
  g.fillStyle = bg;
  g.fillRect(0, 0, SCREEN_W, 190);
  g.fillStyle = fg;
  g.textAlign = 'left';
  g.font = sans(800, 50);
  g.fillText(title, 36, 162, right ? SCREEN_W - 230 : SCREEN_W - 72);
  if (right) {
    g.textAlign = 'right';
    g.font = sans(800, 30);
    g.fillStyle = rightColor ?? fg;
    g.fillText(right, SCREEN_W - 36, 158);
    g.textAlign = 'left';
  }
}

function drawCover(g: CanvasRenderingContext2D, im: HTMLImageElement | undefined, x: number, y: number, w: number, h: number) {
  g.fillStyle = '#d8c9b4';
  g.fillRect(x, y, w, h);
  if (!im?.complete || !im.naturalWidth) return;
  const sc = Math.max(w / im.naturalWidth, h / im.naturalHeight);
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.drawImage(im, x + (w - im.naturalWidth * sc) / 2, y, im.naturalWidth * sc, im.naturalHeight * sc);
  g.restore();
}

/** word-wrapped lines (no drawing) */
function lines(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > maxW && line) {
      out.push(line);
      line = w;
    } else line = t;
  }
  if (line) out.push(line);
  return out;
}

const FLOWS = {
  content: { name: 'blog-to-social', nodes: ['New article', 'AI writes it', 'Images', 'You review', 'Schedule'], pink: 3 },
  voice: { name: 'voice-receptionist', nodes: ['Phone rings', 'Vapi answers', 'Check calendar', 'Book the slot'], pink: -1 },
};

function chapterApp(g: CanvasRenderingContext2D, s: { app: ChapterApp; progress: number; t: number }, night: boolean) {
  const fg = night ? '#ffeaf4' : C.ink;
  const mute = night ? '#e8bcd2' : C.mute;
  const card = night ? '#3a1a34' : '#ffffff';
  const bg = night ? '#1c0b19' : '#F6EFE6';
  const step = Math.max(0, Math.floor(s.progress));
  g.fillStyle = bg;
  g.fillRect(0, 0, SCREEN_W, SCREEN_H);
  switch (s.app) {
    case 'n8n': {
      const flow = step >= 2 ? FLOWS.voice : FLOWS.content;
      g.fillStyle = '#1f1d24';
      g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      g.fillStyle = 'rgba(255,255,255,0.07)';
      for (let x = 20; x < SCREEN_W; x += 34) for (let y = 210; y < SCREEN_H - 170; y += 34) g.fillRect(x, y, 3, 3);
      appBar(g, flow.name, '#2a2731', '#ffffff', '● On', '#3FB66B');
      const n = flow.nodes.length;
      const cycle = n + 1.5;
      const runAt = (s.t * 1.1) % cycle; // which node is running right now
      const rowH = 138;
      const top = 225;
      flow.nodes.forEach((label, i) => {
        const y = top + i * rowH;
        const done = runAt > i + 1;
        const running = runAt >= i && runAt <= i + 1;
        // the wire to the next node
        if (i < n - 1) {
          g.fillStyle = done ? '#FF6FA6' : '#4a4656';
          g.fillRect(66, y + 104, 6, rowH - 104);
        }
        g.fillStyle = i === flow.pink ? '#FF6FA6' : running ? '#3d3949' : '#33303c';
        roundRect(g, 26, y, SCREEN_W - 52, 104, 22);
        g.fill();
        if (running && i !== flow.pink) {
          g.strokeStyle = '#FF6FA6';
          g.lineWidth = 4;
          roundRect(g, 26, y, SCREEN_W - 52, 104, 22);
          g.stroke();
        }
        g.fillStyle = i === flow.pink ? '#3A1426' : '#ffffff';
        g.font = sans(800, 38);
        g.textAlign = 'left';
        g.fillText(label, 100, y + 66, SCREEN_W - 210);
        // left icon dot
        g.beginPath();
        g.arc(69, y + 52, 15, 0, Math.PI * 2);
        g.fillStyle = i === flow.pink ? '#3A1426' : '#FF6FA6';
        g.fill();
        // status on the right
        if (done) {
          g.fillStyle = '#3FB66B';
          g.beginPath();
          g.arc(SCREEN_W - 70, y + 52, 22, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = '#ffffff';
          g.lineWidth = 6;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(SCREEN_W - 81, y + 52);
          g.lineTo(SCREEN_W - 73, y + 60);
          g.lineTo(SCREEN_W - 59, y + 44);
          g.stroke();
        } else if (running) {
          g.strokeStyle = i === flow.pink ? '#3A1426' : '#FF6FA6';
          g.lineWidth = 6;
          g.beginPath();
          const a0 = s.t * 6;
          g.arc(SCREEN_W - 70, y + 52, 18, a0, a0 + Math.PI * 1.4);
          g.stroke();
        }
      });
      g.fillStyle = '#2a2731';
      g.fillRect(0, SCREEN_H - 170, SCREEN_W, 170);
      g.fillStyle = '#ffffff';
      g.textAlign = 'left';
      g.font = sans(700, 32);
      const k = Math.min(n, Math.floor(runAt) + 1);
      g.fillText(runAt >= n ? 'Done. Runs again on schedule' : `Running ${k} of ${n}`, 36, SCREEN_H - 104, SCREEN_W - 72);
      g.fillStyle = '#4a4656';
      roundRect(g, 36, SCREEN_H - 80, SCREEN_W - 72, 12, 6);
      g.fill();
      g.fillStyle = '#FF6FA6';
      roundRect(g, 36, SCREEN_H - 80, (SCREEN_W - 72) * clamp(runAt / n), 12, 6);
      g.fill();
      break;
    }
    case 'mail': {
      const shown = Math.min(4, step + 1);
      appBar(g, 'Inbox', card, fg, `${shown} new`, '#B0245F');
      const rows = [
        ['An agency owner', 'Content engines'],
        ['A dental clinic', 'Voice agents'],
        ['A GHL agency', 'CRM & reports'],
        ['A founder', 'Apps & sites'],
      ];
      const k = easeOut((s.progress - step) * 2.5);
      for (let i = shown - 1; i >= 0; i--) {
        const pos = shown - 1 - i; // newest on top
        const y = 215 + pos * 200 + (i === step ? (1 - k) * -40 : 0);
        const isNew = i === step;
        g.globalAlpha = isNew ? k : 1;
        g.fillStyle = isNew ? (night ? '#4a1838' : '#FBDCE7') : card;
        roundRect(g, 20, y, SCREEN_W - 40, 180, 26);
        g.fill();
        g.fillStyle = '#FF6FA6';
        g.beginPath();
        g.arc(80, y + 90, 38, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#3A1426';
        g.font = sans(800, 36);
        g.textAlign = 'center';
        g.fillText((rows[i][0].split(' ')[1] ?? rows[i][0])[0].toUpperCase(), 80, y + 103);
        g.textAlign = 'left';
        g.fillStyle = fg;
        g.font = sans(800, 34);
        g.fillText(rows[i][0], 138, y + 64, SCREEN_W - 170);
        g.fillStyle = '#B0245F';
        g.font = sans(700, 30);
        g.fillText("You're hired", 138, y + 108, SCREEN_W - 170);
        g.fillStyle = mute;
        g.font = sans(600, 30);
        g.fillText(rows[i][1], 138, y + 150, SCREEN_W - 170);
        g.globalAlpha = 1;
      }
      break;
    }
    case 'messages': {
      appBar(g, 'Project chat', card, fg, 'Slack', mute);
      const p = s.progress;
      type Msg = { me: boolean; text?: string; at: number; kind?: 'sketch' | 'file' | 'log' };
      const msgs: Msg[] = [
        { me: false, text: 'Can every new blog post turn into LinkedIn, X and Facebook posts on its own?', at: 0 },
        { me: true, text: 'Here’s the shape first. You approve every post.', at: 1 },
        { me: true, kind: 'sketch', at: 1.15 },
        { me: false, text: 'Yes, that’s it.', at: 1.4 },
        { me: true, kind: 'file', at: 2 },
        { me: true, kind: 'log', at: 3 },
      ];
      g.font = sans(600, 32);
      const maxW = SCREEN_W - 150;
      const shownMsgs = msgs.filter((m) => p >= m.at);
      const laid = shownMsgs.map((m, i) => {
        // the sender's name above the first bubble of each run
        const label = i === 0 || shownMsgs[i - 1].me !== m.me ? (m.me ? 'Gian' : 'Client') : '';
        const extra = label ? 40 : 0;
        if (m.kind === 'sketch') return { m, h: 170, ls: [] as string[], label, extra };
        if (m.kind === 'file') return { m, h: 120, ls: [] as string[], label, extra };
        if (m.kind === 'log') return { m, h: 150, ls: [] as string[], label, extra };
        const ls = lines(g, m.text!, maxW);
        return { m, h: 36 + ls.length * 42, ls, label, extra };
      });
      // newest at the bottom; older messages scroll off the top
      const bottom = SCREEN_H - 150;
      let y = bottom;
      for (let i = laid.length - 1; i >= 0; i--) {
        const { m, h, ls, label, extra } = laid[i];
        y -= h + 22 + extra;
        if (y + h + extra < 190) break;
        const a = clamp((p - m.at) * 4);
        g.globalAlpha = a;
        if (label) {
          g.font = sans(800, 26);
          g.fillStyle = m.me ? '#B0245F' : mute;
          g.textAlign = m.me ? 'right' : 'left';
          g.fillText(label, m.me ? SCREEN_W - 34 : 34, y + 28);
          g.textAlign = 'left';
        }
        const yy = y + extra + (1 - a) * 30;
        if (m.kind === 'sketch') {
          g.fillStyle = '#2a2731';
          roundRect(g, SCREEN_W - 26 - 400, yy, 400, h, 24);
          g.fill();
          ['New post', 'Write 3', 'Approve', 'Post'].forEach((lbl, k) => {
            g.fillStyle = k === 2 ? '#FF6FA6' : '#FBF7F1';
            roundRect(g, SCREEN_W - 406 + k * 95, yy + 50, 82, 70, 12);
            g.fill();
          });
          g.fillStyle = '#ffffff';
          g.font = sans(700, 26);
          g.fillText('Proposed shape', SCREEN_W - 400, yy + 36);
        } else if (m.kind === 'file' || m.kind === 'log') {
          const isLog = m.kind === 'log';
          g.fillStyle = night ? '#4a1838' : isLog ? '#EEF4E8' : '#FBDCE7';
          roundRect(g, 26, yy, SCREEN_W - 52, h, 24);
          g.fill();
          g.fillStyle = isLog ? '#3E6B30' : '#B0245F';
          g.font = sans(800, 32);
          g.fillText(isLog ? 'Run log' : 'blog-to-social.json', 52, yy + 52, SCREEN_W - 104);
          g.fillStyle = fg;
          g.font = sans(600, 28);
          g.fillText(isLog ? 'Stopped once, fixed,' : 'Built by Gian', 52, yy + 92, SCREEN_W - 104);
          if (isLog) g.fillText('ran clean again', 52, yy + 128, SCREEN_W - 104);
        } else {
          const w = Math.max(...ls.map((l) => g.measureText(l).width)) + 48;
          const x = m.me ? SCREEN_W - 26 - w : 26;
          g.fillStyle = m.me ? '#FF6FA6' : card;
          roundRect(g, x, yy, w, h, 30);
          g.fill();
          g.fillStyle = m.me ? '#3A1426' : fg;
          g.font = sans(600, 32);
          g.textAlign = 'left';
          ls.forEach((l, k) => g.fillText(l, x + 24, yy + 50 + k * 42));
        }
        g.globalAlpha = 1;
        g.font = sans(600, 32);
      }
      // the header goes on top, so older messages scroll up behind it
      appBar(g, 'Project chat', card, fg, 'Slack', mute);
      // input bar
      g.fillStyle = card;
      g.fillRect(0, SCREEN_H - 130, SCREEN_W, 130);
      g.fillStyle = night ? '#2d1428' : '#F3EADF';
      roundRect(g, 26, SCREEN_H - 112, SCREEN_W - 52, 70, 35);
      g.fill();
      g.fillStyle = mute;
      g.font = sans(600, 28);
      g.fillText('Message', 56, SCREEN_H - 66);
      break;
    }
    case 'stickers': {
      appBar(g, 'Sticker pack', card, fg, `${STICKER_NAMES.length}`, '#B0245F');
      const run = clamp(s.progress / 1.5);
      STICKER_NAMES.forEach(([label, color, ink], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 22 + col * 238;
        const y = 215 + row * 112;
        const placed = run >= (i / STICKER_NAMES.length) * 0.92 + 0.09;
        g.globalAlpha = placed ? 0.35 : 1;
        g.fillStyle = '#ffffff';
        roundRect(g, x, y, 228, 96, 30);
        g.fill();
        g.fillStyle = color;
        roundRect(g, x + 7, y + 7, 214, 82, 25);
        g.fill();
        g.fillStyle = ink;
        g.textAlign = 'left';
        g.font = sans(800, 30);
        g.fillText(label, x + 24, y + 59, 180);
        g.globalAlpha = 1;
        if (placed) {
          g.fillStyle = '#3FB66B';
          g.beginPath();
          g.arc(x + 206, y + 20, 16, 0, Math.PI * 2);
          g.fill();
        }
      });
      break;
    }
    case 'social': {
      appBar(g, 'gianbenedict', card, fg);
      avatarCircle(g, 104, 300, 74);
      g.fillStyle = fg;
      g.textAlign = 'center';
      [[String(SOCIAL_STATS.builds), 'builds'], [String(SOCIAL_STATS.services), 'services'], ['1', 'AI clone']].forEach(([n, l], i) => {
        g.font = sans(800, 42);
        g.fillText(n, 250 + i * 98, 300);
        g.font = sans(600, 22);
        g.fillText(l, 250 + i * 98, 334);
      });
      g.textAlign = 'left';
      g.font = sans(800, 36);
      g.fillText('Gian Benedict', 32, 432);
      g.font = sans(600, 28);
      g.fillStyle = mute;
      g.fillText('Automation specialist', 32, 474);
      g.fillText('n8n + AI agents', 32, 512);
      g.fillStyle = '#FF6FA6';
      roundRect(g, 32, 545, 216, 70, 18);
      g.fill();
      g.fillStyle = card;
      roundRect(g, 264, 545, 216, 70, 18);
      g.fill();
      g.textAlign = 'center';
      g.font = sans(800, 28);
      g.fillStyle = '#3A1426';
      g.fillText('Book a call', 140, 590);
      g.fillStyle = fg;
      g.fillText('Message', 372, 590);
      SOCIAL_POSTS.forEach((src, i) => drawCover(g, thumb(src), 4 + (i % 3) * 170, 640 + Math.floor(i / 3) * 170, 166, 166));
      break;
    }
    case 'calendar': {
      const now = new Date();
      const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'Asia/Manila' }).format(now);
      appBar(g, month, card, fg, String(now.getFullYear()), mute);
      const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
      const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const today = now.getDate();
      g.textAlign = 'center';
      g.font = sans(700, 26);
      g.fillStyle = mute;
      'SMTWTFS'.split('').forEach((d, i) => g.fillText(d, 50 + i * 69, 240));
      for (let d = 1; d <= days; d++) {
        const c = (first + d - 1) % 7;
        const r = Math.floor((first + d - 1) / 7);
        const x = 50 + c * 69;
        const y = 305 + r * 78;
        if (d === today) {
          g.fillStyle = '#FF6FA6';
          g.beginPath();
          g.arc(x, y - 11, 30, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = d === today ? '#3A1426' : fg;
        g.font = sans(d === today ? 800 : 600, 30);
        g.fillText(String(d), x, y);
      }
      g.fillStyle = night ? '#4a1838' : '#FBDCE7';
      roundRect(g, 24, 800, SCREEN_W - 48, 200, 28);
      g.fill();
      g.fillStyle = '#B0245F';
      g.textAlign = 'left';
      g.font = sans(800, 40);
      g.fillText('Discovery call', 54, 866);
      g.font = sans(600, 30);
      g.fillStyle = fg;
      g.fillText('20 min · free · Cal Video', 54, 914);
      g.font = sans(800, 30);
      g.fillStyle = '#B0245F';
      g.fillText('Pick a time →', 54, 962);
      break;
    }
  }
}
