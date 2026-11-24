import * as THREE from 'three';
import { projects } from '@/lib/projects';
import { SERVICES, STICKERS, img3d } from '@/lib/content';
import type { ChapterId } from '@/lib/chapters';
import type { ChapterApp } from './screen';
import { card, rr, wrapText, sans, loadImage, drawImageCover, clamp, easeOut, easeInOut, easeOutBack, fitFont, roundedShape, canvasTexture } from './kit';
import { script } from './fonts';
import { T, onTheme } from './theme';
import { SCREEN_W as PHYS_W, SCREEN_H as PHYS_H, PHONE } from './phoneModel';

/*
 * The 3D side of each chapter. The phone opens an app, and one big, readable
 * card at a time pops out of its screen into the free space beside it (on
 * phones: right in front of it). When the step changes, the card goes back
 * into the phone and the next one comes out.
 *
 * Units: the chapter root sits on the phone (phone units, the phone is 5.5
 * tall). Cards live in a "panel" next to the phone, 3.6 units wide, scaled so
 * the card is a comfortable reading size on any screen. Layouts are written
 * for the phone on the right; they mirror when the phone sits on the left.
 */

export type ChapterCtx = {
  t: number;
  calm: boolean;
  mobile: boolean;
  anchor: { x: number; y: number; s: number }; // the phone, right now
  flip: boolean; // phone on the left: mirror the layout
  cs: number; // card scale (panel units -> phone units)
  formed: number; // 0..1 how present the chapter is
  progress: number; // step + progress inside the step
  mx: number;
  my: number;
};
export type Chapter3D = {
  id: ChapterId;
  app: ChapterApp;
  root: THREE.Group;
  update(ctx: ChapterCtx): void;
  /** what's under the pointer: a sticker label, or an action like 'book' */
  pick?(ray: THREE.Raycaster): { label?: string; action?: string } | null;
};

const PINK = '#FF6FA6';
const ON_PINK = '#3A1426';
export const PANEL_W = 3.6;

/* where things sit on the phone's screen, in phone units (screen drawn at 512 x 1085) */
const SCREEN_Z = PHONE.d / 2 + 0.05;
export const scr = (sx: number, sy: number) => new THREE.Vector3((sx / 512 - 0.5) * PHYS_W, (0.5 - sy / 1085) * PHYS_H, SCREEN_Z);

type Item = {
  obj: THREE.Object3D;
  slot: THREE.Vector3; // in panel units (phone on the right)
  rot?: THREE.Euler;
  from?: THREE.Vector3; // where on the phone it comes out of (phone units)
  at: number; // progress at which it pops out
  until?: number; // progress at which it goes back in
  speed?: number;
  unfold?: boolean; // grows out of a thin row (an email opening)
  mslot?: THREE.Vector3; // on phones: a different spot
  mscale?: number; // on phones: a different size
};

/** the panel sits beside the phone (inside the free space), or in front of it on phones */
function layoutPanel(panel: THREE.Group, ctx: ChapterCtx) {
  if (ctx.mobile) {
    panel.position.set(0, -0.12, 2.4);
    panel.rotation.set(0, 0, 0);
  } else {
    const x = 1.62 + (PANEL_W / 2) * ctx.cs;
    panel.position.set(ctx.flip ? x : -x, 0, 0.9);
    panel.rotation.set(0, ctx.flip ? -0.1 : 0.1, 0);
  }
  panel.scale.setScalar(ctx.cs);
}

const tmp = new THREE.Vector3();
const OUT = 0.16; // how long a card takes to go back into the phone (in steps)
/** pops items out of the phone into their slots, and back in when their step is over */
function runItems(items: Item[], panel: THREE.Group, ctx: ChapterCtx) {
  items.forEach((it, i) => {
    const sp = it.speed ?? 0.32;
    const p = ctx.progress;
    // a card that replaces another waits until the old one has gone back in,
    // so the two never cross in the same spot
    const start = it.at >= 1 && it.at % 1 === 0 ? it.at + OUT : it.at;
    const inA = ctx.calm ? (p >= it.at ? 1 : 0) : easeOutBack((p - start) / sp);
    const outA = it.until === undefined ? 0 : ctx.calm ? (p >= it.until ? 1 : 0) : easeInOut((p - it.until) / OUT);
    const a = Math.max(0, inA * (1 - outA) * ctx.formed);
    it.obj.visible = a > 0.01;
    if (!it.obj.visible) return;
    // the phone point, converted into panel space
    tmp.copy(it.from ?? scr(256, 540)).sub(panel.position).divideScalar(ctx.cs);
    const slot = ctx.mobile && it.mslot ? it.mslot : it.slot;
    const slotX = ctx.flip && !ctx.mobile ? -slot.x : slot.x;
    it.obj.position.set(tmp.x + (slotX - tmp.x) * a, tmp.y + (slot.y - tmp.y) * a, tmp.z + (slot.z - tmp.z) * a - outA * 0.8);
    if (!ctx.calm) it.obj.position.y += Math.sin(ctx.t * 1.1 + i * 1.7) * 0.025;
    const s = Math.max(0.001, Math.min(a, 1.08)) * (ctx.mobile ? it.mscale ?? 1 : 1);
    it.obj.scale.set(s, it.unfold ? s * (0.25 + 0.75 * clamp(a)) : s, s);
    const r = it.rot;
    const m = ctx.flip && !ctx.mobile ? -1 : 1;
    it.obj.rotation.set((r?.x ?? 0) * a + (ctx.calm ? 0 : ctx.my * 0.06), m * (r?.y ?? 0) * a + (ctx.calm ? 0 : ctx.mx * 0.12), m * (r?.z ?? 0) * a);
  });
}

function base(id: ChapterId, app: ChapterApp) {
  const root = new THREE.Group();
  const panel = new THREE.Group();
  root.add(panel);
  const anchor = (ctx: ChapterCtx) => {
    root.position.set(ctx.anchor.x, ctx.anchor.y, 0);
    root.scale.setScalar(ctx.anchor.s);
    root.visible = ctx.formed > 0.001;
    if (root.visible) layoutPanel(panel, ctx);
    return root.visible;
  };
  return { id, app, root, panel, anchor };
}

/* ---------------- shared card faces: phone notifications ---------------- */
const F = (W: number, k: number) => Math.round(W * k); // font sizes scale with the card
const R_NOTE = 0.32; // big rounded corners, like a notification banner

type IconKind = 'flow' | 'mail' | 'chat' | 'gb';
/** a rounded app icon with a simple white glyph */
function appIcon(g: CanvasRenderingContext2D, x: number, y: number, s: number, kind: IconKind, onPink = false) {
  const bg = onPink ? ON_PINK : { flow: PINK, mail: '#4A8DF7', chat: '#3DCB63', gb: PINK }[kind];
  const fg = onPink ? PINK : '#ffffff';
  g.fillStyle = bg;
  rr(g, x, y, s, s, s * 0.24);
  g.fill();
  g.fillStyle = fg;
  g.strokeStyle = fg;
  g.lineWidth = s * 0.07;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const cx = x + s / 2, cy = y + s / 2;
  if (kind === 'flow') {
    // three linked nodes
    const pts = [[-0.24, -0.16], [0.24, -0.16], [0, 0.22]];
    g.beginPath();
    g.moveTo(cx + pts[0][0] * s, cy + pts[0][1] * s);
    g.lineTo(cx + pts[1][0] * s, cy + pts[1][1] * s);
    g.moveTo(cx + pts[1][0] * s, cy + pts[1][1] * s);
    g.lineTo(cx + pts[2][0] * s, cy + pts[2][1] * s);
    g.stroke();
    pts.forEach(([px, py]) => {
      g.beginPath();
      g.arc(cx + px * s, cy + py * s, s * 0.1, 0, Math.PI * 2);
      g.fill();
    });
  } else if (kind === 'mail') {
    rr(g, cx - s * 0.28, cy - s * 0.19, s * 0.56, s * 0.38, s * 0.06);
    g.stroke();
    g.beginPath();
    g.moveTo(cx - s * 0.26, cy - s * 0.15);
    g.lineTo(cx, cy + s * 0.04);
    g.lineTo(cx + s * 0.26, cy - s * 0.15);
    g.stroke();
  } else if (kind === 'chat') {
    g.beginPath();
    g.ellipse(cx, cy - s * 0.03, s * 0.3, s * 0.24, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(cx - s * 0.2, cy + s * 0.12);
    g.lineTo(cx - s * 0.27, cy + s * 0.3);
    g.lineTo(cx - s * 0.04, cy + s * 0.18);
    g.fill();
  } else {
    g.font = script(Math.round(s * 0.5));
    g.textAlign = 'center';
    g.fillText('GB', cx, cy + s * 0.16);
    g.textAlign = 'left';
  }
}
/** the header row of an expanded notification; returns where the content starts */
function noteHeader(g: CanvasRenderingContext2D, W: number, kind: IconKind, app: string, time = 'now') {
  const s = F(W, 0.085);
  appIcon(g, F(W, 0.055), F(W, 0.045), s, kind);
  g.fillStyle = T.mute;
  g.font = sans(700, F(W, 0.038));
  g.textAlign = 'left';
  g.fillText(app.toUpperCase(), F(W, 0.055) + s + F(W, 0.03), F(W, 0.045) + s * 0.64);
  g.textAlign = 'right';
  g.font = sans(600, F(W, 0.036));
  g.fillText(time, W - F(W, 0.055), F(W, 0.045) + s * 0.64);
  g.textAlign = 'left';
  return F(W, 0.16);
}
/** an expanded notification: header row, then the content moved down below it */
const HEAD_U = 0.13 * PANEL_W; // height the header adds, in card units
function expanded(kind: IconKind, app: string, draw: (g: CanvasRenderingContext2D, W: number, H: number) => void, time?: string) {
  return (g: CanvasRenderingContext2D, W: number, H: number) => {
    const top = noteHeader(g, W, kind, app, time);
    g.save();
    g.translate(0, top - F(W, 0.03));
    draw(g, W, H - top);
    g.restore();
  };
}

function nodeCard(n: number, title: string, sub: string, pink = false, total = 4) {
  return card(PANEL_W, 0.98, {
    radius: R_NOTE,
    depth: 0.07,
    edge: pink ? '#f0508f' : () => T.edge,
    bg: pink ? PINK : () => T.paper,
    draw: (g, W, H) => {
      const c = H / 2;
      const s = H * 0.6;
      const ix = F(W, 0.045);
      appIcon(g, ix, c - s / 2, s, 'flow', pink);
      const x = ix + s + F(W, 0.04);
      g.fillStyle = pink ? ON_PINK : T.ink;
      fitFont(g, title, 800, F(W, 0.06), W - x - F(W, 0.16), 20);
      g.fillText(title, x, c - F(W, 0.01));
      g.fillStyle = pink ? ON_PINK : T.mute;
      fitFont(g, sub, 600, F(W, 0.044), W - x - F(W, 0.05), 16);
      g.fillText(sub, x, c + F(W, 0.05));
      g.font = sans(600, F(W, 0.034));
      g.textAlign = 'right';
      g.fillText(`${n} of ${total}`, W - F(W, 0.05), c - F(W, 0.018));
      g.textAlign = 'left';
    },
  });
}

/** a short vertical pipe with a bead running down it, between stacked cards */
function rail(top: number, bottom: number) {
  const g = new THREE.Group();
  const len = top - bottom;
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 8), new THREE.MeshLambertMaterial({ color: '#d9c7b2' }));
  pipe.position.y = bottom + len / 2;
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), new THREE.MeshBasicMaterial({ color: '#ff3d8b' }));
  g.add(pipe, bead);
  g.userData = { bead, top, bottom };
  return g;
}

/* ================= Systems: n8n workflows ================= */
export function systems(): Chapter3D {
  const b = base('systems', 'n8n');
  const ys = [1.68, 0.56, -0.56, -1.68];
  const chain = (rows: [string, string][], at: number, until: number | undefined, pinkLast: boolean): Item[] =>
    rows.map(([t, s], i) => ({ obj: nodeCard(i + 1, t, s, pinkLast && i === rows.length - 1), slot: new THREE.Vector3(0, ys[i], 0), from: scr(256, 330 + i * 150), at: at + i * 0.08, until, rot: new THREE.Euler(0, 0, 0) }));
  const content = chain(
    [
      ['New article', 'comes in from the Inoreader feed'],
      ['AI writes it', 'a blog post and five social posts'],
      ['Branded images', 'Bannerbear, one per platform'],
      ['Scheduled', 'GoHighLevel Social Planner'],
    ],
    0,
    1,
    false,
  );
  const review: Item = {
    obj: card(PANEL_W, 3.75 + HEAD_U, {
      radius: R_NOTE,
      depth: 0.07,
      edge: () => T.edge,
      bg: () => T.paper,
      draw: expanded('flow', 'blog-to-social', (g, W) => {
        g.fillStyle = T.accentInk;
        g.font = sans(800, F(W, 0.04));
        g.fillText('REVIEW QUEUE', F(W, 0.06), F(W, 0.1));
        g.fillStyle = T.ink;
        g.font = sans(800, F(W, 0.075));
        g.fillText('Nothing posts', F(W, 0.06), F(W, 0.2));
        g.fillText('without a yes.', F(W, 0.06), F(W, 0.285));
        // a draft post (shapes, not copy)
        const y0 = F(W, 0.34);
        g.fillStyle = T.paperAlt;
        rr(g, F(W, 0.06), y0, W - F(W, 0.12), F(W, 0.3), F(W, 0.03));
        g.fill();
        g.fillStyle = T.mute;
        g.font = sans(700, F(W, 0.038));
        g.fillText('LinkedIn · draft 2 of 5', F(W, 0.1), y0 + F(W, 0.07));
        g.fillStyle = T.skeleton;
        [0.82, 0.74, 0.5].forEach((k, i) => {
          rr(g, F(W, 0.1), y0 + F(W, 0.11 + i * 0.055), (W - F(W, 0.2)) * k, F(W, 0.028), F(W, 0.014));
          g.fill();
        });
        // the two choices
        const by = y0 + F(W, 0.36);
        g.fillStyle = PINK;
        rr(g, F(W, 0.06), by, F(W, 0.38), F(W, 0.11), F(W, 0.055));
        g.fill();
        g.strokeStyle = T.ink;
        g.lineWidth = F(W, 0.006);
        rr(g, F(W, 0.48), by, F(W, 0.42), F(W, 0.11), F(W, 0.055));
        g.stroke();
        g.textAlign = 'center';
        g.font = sans(800, F(W, 0.045));
        g.fillStyle = ON_PINK;
        g.fillText('Approve', F(W, 0.25), by + F(W, 0.072));
        g.fillStyle = T.ink;
        g.fillText('[REVISE]', F(W, 0.69), by + F(W, 0.072));
        g.textAlign = 'left';
        g.font = sans(600, F(W, 0.045));
        g.fillStyle = T.mute;
        wrapText(g, 'Type [REVISE] on any post and it rewrites itself.', F(W, 0.06), F(W, 0.9), W - F(W, 0.12), F(W, 0.058), 2);
      }),
    }),
    slot: new THREE.Vector3(0, 0, 0.1),
    from: scr(256, 620),
    at: 1,
    until: 2,
  };
  const voice = chain(
    [
      ['Phone rings', 'a patient calls the clinic'],
      ['Vapi answers', 'a voice agent picks up'],
      ['Checks the calendar', 'through n8n and Google Calendar'],
      ['Books the slot', 'and logs the call'],
    ],
    2,
    undefined,
    true,
  );
  const items = [...content, review, ...voice];
  items.forEach((it) => b.panel.add(it.obj));
  const rails = [rail(ys[0], ys[3]), rail(ys[0], ys[3])];
  rails.forEach((r) => {
    r.position.set(-PANEL_W / 2 - 0.2, 0, -0.02);
    b.panel.add(r);
  });

  return {
    id: b.id,
    app: b.app,
    root: b.root,
    update(ctx) {
      if (!b.anchor(ctx)) return;
      runItems(items, b.panel, ctx);
      // the data bead runs down the chain that's out
      [content, voice].forEach((ch, k) => {
        const r = rails[k];
        const shown = ch[ch.length - 1].obj.visible && ch[ch.length - 1].obj.scale.x > 0.6;
        r.visible = shown;
        if (!shown) return;
        r.scale.setScalar(ch[0].obj.scale.x);
        r.position.x = (ctx.flip && !ctx.mobile ? 1 : -1) * (PANEL_W / 2 + 0.2);
        const { bead, top, bottom } = r.userData as { bead: THREE.Mesh; top: number; bottom: number };
        const f = ctx.calm ? 1 : (ctx.t * 0.45) % 1;
        bead.position.y = top - (top - bottom) * f;
      });
    },
  };
}

/* ================= Services: the inbox ================= */
/** 'An agency owner' -> 'A', 'A dental clinic' -> 'D' */
export const initial = (from: string) => (from.split(' ')[1] ?? from)[0].toUpperCase();
function emailCard(i: number) {
  const s = SERVICES[i];
  return card(PANEL_W, 3.85 + HEAD_U, {
    radius: R_NOTE,
    depth: 0.07,
    edge: () => T.edge,
    bg: () => T.paper,
    draw: expanded('mail', 'Mail', (g, W, H) => {
      // header: who it's from
      g.fillStyle = PINK;
      g.beginPath();
      g.arc(F(W, 0.115), F(W, 0.115), F(W, 0.055), 0, Math.PI * 2);
      g.fill();
      g.fillStyle = ON_PINK;
      g.font = sans(800, F(W, 0.055));
      g.textAlign = 'center';
      g.fillText(initial(s.from), F(W, 0.115), F(W, 0.134));
      g.textAlign = 'left';
      g.fillStyle = T.ink;
      g.font = sans(800, F(W, 0.048));
      g.fillText(s.from, F(W, 0.2), F(W, 0.105));
      g.fillStyle = T.mute;
      g.font = sans(600, F(W, 0.036));
      g.fillText('to Gian · just now', F(W, 0.2), F(W, 0.15));
      g.fillStyle = T.line;
      g.fillRect(F(W, 0.06), F(W, 0.2), W - F(W, 0.12), F(W, 0.004));
      // subject + what it is
      g.fillStyle = T.accentInk;
      g.font = sans(800, F(W, 0.05));
      g.fillText("You're hired", F(W, 0.06), F(W, 0.28));
      g.fillStyle = T.ink;
      fitFont(g, s.title, 800, F(W, 0.09), W - F(W, 0.12), 30);
      g.fillText(s.title, F(W, 0.06), F(W, 0.38));
      g.fillStyle = T.body;
      g.font = sans(600, F(W, 0.046));
      let y = wrapText(g, s.line, F(W, 0.06), F(W, 0.46), W - F(W, 0.12), F(W, 0.062), 6);
      // tools as chips
      y += F(W, 0.02);
      let x = F(W, 0.06);
      g.font = sans(700, F(W, 0.036));
      for (const tool of s.tools.split(' · ')) {
        const w = g.measureText(tool).width + F(W, 0.05);
        if (x + w > W - F(W, 0.06)) {
          x = F(W, 0.06);
          y += F(W, 0.075);
        }
        g.fillStyle = T.paperAlt;
        rr(g, x, y - F(W, 0.045), w, F(W, 0.065), F(W, 0.032));
        g.fill();
        g.fillStyle = T.ink;
        g.fillText(tool, x + F(W, 0.025), y);
        x += w + F(W, 0.015);
      }
      g.fillStyle = T.accentInk;
      g.font = sans(800, F(W, 0.04));
      g.fillText(`${s.proof.length} ${s.proof.length === 1 ? 'build' : 'builds'} shipped`, F(W, 0.06), H - F(W, 0.07));
      g.font = script(F(W, 0.07));
      g.fillStyle = PINK;
      g.textAlign = 'right';
      g.fillText('Gian', W - F(W, 0.06), H - F(W, 0.06));
    }),
  });
}
export function services(): Chapter3D {
  const b = base('services', 'mail');
  const items: Item[] = SERVICES.map((_, i) => ({
    obj: emailCard(i),
    slot: new THREE.Vector3(0, 0, 0),
    from: scr(256, 265), // the newest row of the inbox
    at: i,
    until: i === SERVICES.length - 1 ? undefined : i + 1,
    speed: 0.38,
    unfold: true,
  }));
  items.forEach((it) => b.panel.add(it.obj));
  return {
    id: b.id,
    app: b.app,
    root: b.root,
    update(ctx) {
      if (b.anchor(ctx)) runItems(items, b.panel, ctx);
    },
  };
}

/* ================= Process: messages ================= */
export function process(): Chapter3D {
  const b = base('process', 'messages');
  const note = (who: string, text: string, w: number, h: number, size = 0.058, lines = 4) =>
    card(w, h, {
      radius: R_NOTE,
      depth: 0.07,
      edge: () => T.edge,
      bg: () => T.paper,
      draw: (g, W, H) => {
        const s = Math.min(H * 0.5, F(W, 0.16));
        const ix = F(W, 0.045);
        appIcon(g, ix, F(W, 0.045), s, 'chat');
        const x = ix + s + F(W, 0.04);
        g.fillStyle = T.ink;
        g.font = sans(800, F(W, size * 0.95));
        g.fillText(who, x, F(W, 0.045) + F(W, size * 0.9));
        g.fillStyle = T.mute;
        g.font = sans(600, F(W, 0.034));
        g.textAlign = 'right';
        g.fillText('now', W - F(W, 0.05), F(W, 0.045) + F(W, size * 0.85));
        g.textAlign = 'left';
        g.fillStyle = T.body;
        g.font = sans(600, F(W, size));
        wrapText(g, text, x, F(W, 0.045) + F(W, size * 2.15), W - x - F(W, 0.05), F(W, size * 1.32), lines);
        void H;
      },
    });
  const ask = note('Client', 'Can every new blog post turn into LinkedIn, X and Facebook posts on its own?', PANEL_W, 1.75);
  const sketch = card(PANEL_W, 2.85 + HEAD_U, {
    radius: R_NOTE,
    depth: 0.07,
    edge: () => T.edge,
    bg: () => T.paper,
    draw: expanded('chat', 'Gian · the sketch', (g, W, H0) => {
      // the diagram sits in a dark block inside the notification
      g.fillStyle = '#2a2731';
      rr(g, F(W, 0.04), 0, W - F(W, 0.08), H0 - F(W, 0.02), F(W, 0.05));
      g.fill();
      g.translate(F(W, 0.02), F(W, 0.005));
      g.scale(0.96, 0.96);
      const H = H0 + F(W, 0.1);
      g.fillStyle = '#ffffff';
      g.font = sans(800, F(W, 0.05));
      g.fillText('Proposed shape · v1', F(W, 0.06), F(W, 0.1));
      const boxes: [string, number, number, boolean][] = [
        ['New post', 0.06, 0.17, false],
        ['Write 3 versions', 0.53, 0.17, false],
        ['You approve', 0.06, 0.37, true],
        ['Post it', 0.53, 0.37, false],
      ];
      boxes.forEach(([label, x, y, pink]) => {
        g.fillStyle = pink ? PINK : '#FBF7F1';
        rr(g, F(W, x), F(W, y), F(W, 0.41), F(W, 0.14), F(W, 0.025));
        g.fill();
        g.fillStyle = pink ? ON_PINK : '#474329';
        fitFont(g, label, 800, F(W, 0.05), F(W, 0.36), 16);
        g.fillText(label, F(W, x + 0.03), F(W, y + 0.087));
      });
      g.strokeStyle = '#bfb6a3';
      g.lineWidth = F(W, 0.008);
      g.lineCap = 'round';
      const arrow = (x1: number, y1: number, x2: number, y2: number) => {
        g.beginPath();
        g.moveTo(F(W, x1), F(W, y1));
        g.lineTo(F(W, x2), F(W, y2));
        g.stroke();
      };
      arrow(0.47, 0.24, 0.53, 0.24);
      arrow(0.735, 0.31, 0.27, 0.37);
      arrow(0.47, 0.44, 0.53, 0.44);
      g.fillStyle = '#ffffff';
      g.font = sans(600, F(W, 0.045));
      wrapText(g, 'A person signs off before anything posts.', F(W, 0.06), H - F(W, 0.2), W - F(W, 0.12), F(W, 0.06), 2);
    }),
  });
  const yes = note('Client', 'Yes, that’s it.', 2.9, 0.9, 0.075, 1);
  const built = card(PANEL_W, 1.25, {
    radius: R_NOTE,
    depth: 0.07,
    edge: () => T.blushEdge,
    bg: () => T.blush,
    draw: (g, W, H) => {
      g.fillStyle = PINK;
      rr(g, F(W, 0.05), H / 2 - F(W, 0.065), F(W, 0.13), F(W, 0.13), F(W, 0.035));
      g.fill();
      g.fillStyle = ON_PINK;
      g.font = script(F(W, 0.07));
      g.textAlign = 'center';
      g.fillText('GB', F(W, 0.115), H / 2 + F(W, 0.025));
      g.textAlign = 'left';
      g.fillStyle = T.ink;
      g.font = sans(800, F(W, 0.058));
      g.fillText('Built by Gian', F(W, 0.22), H / 2 - F(W, 0.012));
      g.fillStyle = T.mute;
      g.font = sans(600, F(W, 0.042));
      g.fillText('blog-to-social.json is ready to import', F(W, 0.22), H / 2 + F(W, 0.05), W - F(W, 0.26));
      g.textAlign = 'right';
      g.font = sans(600, F(W, 0.034));
      g.fillText('now', W - F(W, 0.05), H / 2 - F(W, 0.02));
      g.textAlign = 'left';
    },
  });
  const checklist = card(PANEL_W, 1.9 + HEAD_U, {
    radius: R_NOTE,
    depth: 0.07,
    edge: () => T.edge,
    bg: () => T.paper,
    draw: expanded('flow', 'blog-to-social', (g, W) => {
      g.fillStyle = T.accentInk;
      g.font = sans(800, F(W, 0.042));
      g.fillText('BEFORE YOU HIT RUN', F(W, 0.06), F(W, 0.1));
      ['Connect your AI key', 'Connect LinkedIn, X and Facebook', 'Pick the posting schedule'].forEach((l, i) => {
        const y = F(W, 0.19 + i * 0.1);
        g.strokeStyle = T.ink;
        g.lineWidth = F(W, 0.006);
        rr(g, F(W, 0.06), y - F(W, 0.045), F(W, 0.055), F(W, 0.055), F(W, 0.012));
        g.stroke();
        g.fillStyle = T.ink;
        g.font = sans(700, F(W, 0.048));
        g.fillText(l, F(W, 0.15), y, W - F(W, 0.2));
      });
    }),
  });
  const runlog = card(PANEL_W, 3.3 + HEAD_U, {
    radius: R_NOTE,
    depth: 0.07,
    edge: () => T.edge,
    bg: () => T.paper,
    draw: expanded('flow', 'blog-to-social', (g, W) => {
      g.fillStyle = T.ink;
      g.font = sans(800, F(W, 0.058));
      g.fillText('Run log', F(W, 0.06), F(W, 0.11));
      g.fillStyle = T.mute;
      g.font = sans(600, F(W, 0.038));
      g.fillText('blog-to-social', F(W, 0.3), F(W, 0.11));
      const rows: [string, string, 'ok' | 'stop' | 'fix'][] = [
        ['New post found', '', 'ok'],
        ['Wrote 3 versions', '', 'ok'],
        ['LinkedIn: token expired', 'Stopped. Nothing half-posted.', 'stop'],
        ['Fixed, ran again', 'Skipped what already posted.', 'fix'],
      ];
      let y = F(W, 0.2);
      rows.forEach(([t, sub, kind]) => {
        const h = sub ? F(W, 0.15) : F(W, 0.1);
        g.fillStyle = kind === 'stop' ? T.stopBg : T.okBg;
        rr(g, F(W, 0.05), y, W - F(W, 0.1), h - F(W, 0.02), F(W, 0.03));
        g.fill();
        g.fillStyle = kind === 'stop' ? T.accentInk : T.okInk;
        g.beginPath();
        g.arc(F(W, 0.1), y + F(W, 0.045), F(W, 0.018), 0, Math.PI * 2);
        g.fill();
        g.fillStyle = kind === 'stop' ? T.accentInk : T.ink;
        g.font = sans(800, F(W, 0.048));
        g.fillText(t, F(W, 0.15), y + F(W, 0.062));
        if (sub) {
          g.fillStyle = T.mute;
          g.font = sans(600, F(W, 0.04));
          g.fillText(sub, F(W, 0.15), y + F(W, 0.115));
        }
        y += h;
      });
    }),
  });
  const items: Item[] = [
    { obj: ask, slot: new THREE.Vector3(0, 0.4, 0), from: scr(170, 280), at: 0, until: 1 },
    { obj: sketch, slot: new THREE.Vector3(0, 0.62, 0), from: scr(330, 560), at: 1, until: 2 },
    { obj: yes, slot: new THREE.Vector3(-0.35, -1.62, 0.15), from: scr(150, 690), at: 1.4, until: 2 },
    { obj: built, slot: new THREE.Vector3(0, 1.38, 0.1), from: scr(256, 120), at: 2, until: 3 },
    { obj: checklist, slot: new THREE.Vector3(0, -0.68, 0), from: scr(256, 800), at: 2.25, until: 3 },
    { obj: runlog, slot: new THREE.Vector3(0, 0, 0), from: scr(256, 900), at: 3 },
  ];
  items.forEach((it) => b.panel.add(it.obj));
  return {
    id: b.id,
    app: b.app,
    root: b.root,
    update(ctx) {
      if (b.anchor(ctx)) runItems(items, b.panel, ctx);
    },
  };
}

/* ================= About: the social profile ================= */
const avatarImg = typeof Image !== 'undefined' ? loadImage('/avatar.jpg', () => profileRedraw.forEach((f) => f())) : undefined;
const profileRedraw: (() => void)[] = [];
export function about(): Chapter3D {
  const b = base('about', 'social');
  const profile = card(PANEL_W, 2.9 + HEAD_U, {
    radius: R_NOTE,
    depth: 0.07,
    edge: () => T.edge,
    bg: () => T.paper,
    draw: expanded('gb', 'Profile', (g, W) => {
      const r = F(W, 0.1);
      g.save();
      g.beginPath();
      g.arc(F(W, 0.16), F(W, 0.17), r, 0, Math.PI * 2);
      g.fillStyle = '#f3d6e2';
      g.fill();
      g.clip();
      if (avatarImg?.complete && avatarImg.naturalWidth) g.drawImage(avatarImg, F(W, 0.16) - r, F(W, 0.17) - r, r * 2, r * 2);
      g.restore();
      g.fillStyle = T.ink;
      g.font = sans(800, F(W, 0.06));
      g.fillText('Gian Benedict', F(W, 0.31), F(W, 0.15));
      g.fillStyle = T.mute;
      g.font = sans(600, F(W, 0.042));
      g.fillText('Automation specialist · n8n', F(W, 0.31), F(W, 0.205));
      g.fillText('Quezon City · GMT+8', F(W, 0.31), F(W, 0.255));
      const stats: [string, string][] = [
        [String(projects.length), 'builds'],
        [String(SERVICES.length), 'services'],
        ['1', 'AI clone'],
      ];
      stats.forEach(([n, l], i) => {
        const x = F(W, 0.17 + i * 0.33);
        g.textAlign = 'center';
        g.fillStyle = T.ink;
        g.font = sans(800, F(W, 0.085));
        g.fillText(n, x, F(W, 0.43));
        g.fillStyle = T.mute;
        g.font = sans(600, F(W, 0.04));
        g.fillText(l, x, F(W, 0.485));
      });
      g.textAlign = 'center';
      g.fillStyle = PINK;
      rr(g, F(W, 0.06), F(W, 0.56), F(W, 0.42), F(W, 0.11), F(W, 0.055));
      g.fill();
      g.strokeStyle = T.ink;
      g.lineWidth = F(W, 0.005);
      rr(g, F(W, 0.52), F(W, 0.56), F(W, 0.42), F(W, 0.11), F(W, 0.055));
      g.stroke();
      g.font = sans(800, F(W, 0.045));
      g.fillStyle = ON_PINK;
      g.fillText('Book a call', F(W, 0.27), F(W, 0.632));
      g.fillStyle = T.ink;
      g.fillText('Message', F(W, 0.73), F(W, 0.632));
      g.textAlign = 'left';
    }),
  });
  profileRedraw.push(() => (profile.userData.tex as { redraw: () => void }).redraw());
  const posts = ['octi', 'udm-booking-system', 'vapehub', 'ai-voice-receptionist']
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is (typeof projects)[number] => !!p);
  const PW = 1.72, PH = 2.05;
  const polaroids = posts.map((p, i) => {
    const src = img3d(p.image);
    const holder: { im?: HTMLImageElement } = {};
    const c = card(PW, PH, {
      depth: 0.05,
      radius: 0.06,
      edge: () => T.polaroid,
      bg: () => T.polaroid,
      draw: (g, W, H) => {
        const pad = F(W, 0.06);
        g.fillStyle = T.photoBg;
        g.fillRect(pad, pad, W - pad * 2, W - pad * 2);
        drawImageCover(g, holder.im, pad, pad, W - pad * 2, W - pad * 2);
        g.fillStyle = T.ink;
        g.textAlign = 'left';
        fitFont(g, p.title, 800, F(W, 0.085), W - pad * 2 - F(W, 0.12), 14);
        g.fillText(p.title, pad, W + F(W, 0.07));
        g.fillStyle = T.mute;
        fitFont(g, p.stack.slice(0, 2).join(' · '), 600, F(W, 0.062), W - pad * 2, 12);
        g.fillText(p.stack.slice(0, 2).join(' · '), pad, H - F(W, 0.06));
        g.fillStyle = PINK;
        g.font = sans(800, F(W, 0.1));
        g.textAlign = 'right';
        g.fillText('♥', W - pad, W + F(W, 0.08));
      },
    });
    holder.im = loadImage(src, () => (c.userData.tex as { redraw: () => void }).redraw());
    const x = i % 2 === 0 ? -0.92 : 0.92;
    const y = i < 2 ? 1.13 : -1.13;
    // on phones the grid is smaller and higher, clear of the About text below
    return { obj: c, slot: new THREE.Vector3(x, y, i % 2 ? 0.08 : 0), mslot: new THREE.Vector3(x * 0.8, y * 0.8 + 0.45, i % 2 ? 0.08 : 0), mscale: 0.8, from: scr(85 + (i % 3) * 170, 700 + Math.floor(i / 3) * 170), rot: new THREE.Euler(0, 0, (i % 2 ? 1 : -1) * 0.04), at: 1 + i * 0.1 } as Item;
  });
  const items: Item[] = [{ obj: profile, slot: new THREE.Vector3(0, 0.3, 0), from: scr(256, 340), at: 0, until: 1 }, ...polaroids];
  items.forEach((it) => b.panel.add(it.obj));
  return {
    id: b.id,
    app: b.app,
    root: b.root,
    update(ctx) {
      if (b.anchor(ctx)) runItems(items, b.panel, ctx);
    },
  };
}

/* ================= Contact: the desk calendar ================= */
export function contact(): Chapter3D {
  const b = base('contact', 'calendar');
  const desk = new THREE.Group();
  // the stand behind the pages
  const standMat = new THREE.MeshLambertMaterial({ color: T.stand });
  onTheme(() => standMat.color.set(T.stand));
  const stand = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.9, 0.08), standMat);
  stand.position.set(0, -0.2, -0.25);
  stand.rotation.x = -0.18;
  desk.add(stand);
  const ringMat = new THREE.MeshStandardMaterial({ color: '#c9c3b8', metalness: 0.6, roughness: 0.35 });
  const ringGeo = new THREE.TorusGeometry(0.09, 0.025, 8, 20);
  const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Manila' });
  const monFmt = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'Asia/Manila' });
  const now = Date.now();
  const PG_W = 3.4, PG_H = 2.75;
  const pages: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const final = i === 3;
    const d = new Date(now + (3 - i) * 86400000);
    const pg = card(PG_W, PG_H, {
      depth: 0.03,
      radius: 0.08,
      edge: () => T.paper,
      bg: () => T.paper,
      draw: (g, W, H) => {
        g.fillStyle = PINK;
        g.fillRect(0, 0, W, F(W, 0.12));
        g.fillStyle = ON_PINK;
        g.textAlign = 'center';
        g.font = sans(800, F(W, 0.055));
        g.fillText(final ? 'DISCOVERY CALL' : monFmt.format(d).toUpperCase(), W / 2, F(W, 0.08));
        if (final) {
          g.fillStyle = T.ink;
          g.font = sans(800, F(W, 0.15));
          g.fillText('20 min', W / 2, F(W, 0.31));
          g.font = sans(700, F(W, 0.05));
          g.fillStyle = T.body;
          g.fillText('Free · Cal Video · your timezone', W / 2, F(W, 0.39));
          // the button itself is a raised 3D pill (see below); this is its shadow
          g.fillStyle = 'rgba(176,36,95,0.18)';
          rr(g, W / 2 - F(W, 0.3), F(W, 0.45), F(W, 0.6), F(W, 0.15), F(W, 0.075));
          g.fill();
          g.font = script(F(W, 0.075));
          g.fillStyle = T.accentInk;
          g.fillText('see you there, Gian', W / 2, H - F(W, 0.05));
        } else {
          g.fillStyle = T.ink;
          g.font = sans(800, F(W, 0.34));
          g.fillText(String(d.getDate()), W / 2, F(W, 0.5));
          g.font = sans(700, F(W, 0.06));
          g.fillStyle = T.mute;
          g.fillText(dayFmt.format(d), W / 2, F(W, 0.62));
        }
      },
    });
    const pivot = new THREE.Group();
    pivot.position.set(0, PG_H / 2, 0.035 * (3 - i));
    pg.position.set(0, -PG_H / 2, 0);
    pivot.add(pg);
    for (const rx of [-0.75, 0.75]) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(rx, 0, 0.03);
      pivot.add(ring);
    }
    desk.add(pivot);
    pages.push(pivot);
  }
  // the real button: a raised pill you can click
  const btnTex = canvasTexture(512, 128, (g, W, H) => {
    g.fillStyle = PINK;
    g.fillRect(0, 0, W, H);
    g.fillStyle = ON_PINK;
    g.font = sans(800, 56);
    g.textAlign = 'center';
    g.fillText('Pick a time', W / 2, H / 2 + 20);
  });
  const pillW = PG_W * 0.6, pillH = PG_W * 0.15;
  const pill = new THREE.Group();
  const pillBody = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedShape(pillW, pillH, pillH / 2), { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, curveSegments: 12 }), new THREE.MeshLambertMaterial({ color: '#f0508f' }));
  const faceGeo = new THREE.ShapeGeometry(roundedShape(pillW, pillH, pillH / 2), 12);
  const fp = faceGeo.attributes.position as THREE.BufferAttribute;
  const fu = faceGeo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < fp.count; i++) fu.setXY(i, (fp.getX(i) + pillW / 2) / pillW, (fp.getY(i) + pillH / 2) / pillH);
  const pillFace = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: btnTex, toneMapped: false }));
  pillFace.position.z = 0.101;
  pill.add(pillBody, pillFace);
  pill.userData.action = 'book';
  pill.position.set(0, -PG_W * 0.525, 0.16); // pivot space: the page hangs down from y = 0
  pages[3].add(pill);
  b.panel.add(desk);
  let hover = 0;
  let hovering = false;

  return {
    id: b.id,
    app: b.app,
    root: b.root,
    update(ctx) {
      if (!b.anchor(ctx)) return;
      const a = ctx.calm ? 1 : easeOutBack(clamp(ctx.formed));
      tmp.copy(scr(256, 860)).sub(b.panel.position).divideScalar(ctx.cs);
      // on phones it sits a little higher and smaller, clear of the heading below
      const lift = ctx.mobile ? 0.55 : 0.1;
      desk.position.set(tmp.x * (1 - a), tmp.y * (1 - a) + lift * a, tmp.z * (1 - a));
      desk.scale.setScalar(Math.max(0.001, a * (ctx.mobile ? 0.84 : 1)));
      const m = ctx.flip && !ctx.mobile ? -1 : 1;
      desk.rotation.set(-0.06 + (ctx.calm ? 0 : ctx.my * 0.06), m * 0.08 + (ctx.calm ? 0 : ctx.mx * 0.12), 0);
      // the date pages flip over one by one, ending on the discovery call
      pages.forEach((pv, i) => {
        if (i === 3) return;
        const f = ctx.calm ? 1 : clamp((ctx.progress - 0.05 - i * 0.18) / 0.2);
        pv.rotation.x = -Math.PI * 0.9 * easeOut(f);
        pv.visible = f < 0.999;
      });
      hover += ((hovering ? 1 : 0) - hover) * 0.2;
      // the button belongs to the last page: it pops up once the dates have flipped past
      const shown = ctx.calm ? 1 : easeOutBack(clamp((ctx.progress - 0.05 - 2 * 0.18 - 0.16) / 0.12));
      pill.visible = shown > 0.01;
      pill.scale.setScalar(Math.max(0.001, shown) * (1 + hover * 0.06));
      pill.position.z = 0.16 + hover * 0.06;
    },
    pick(ray) {
      const hit = pill.visible && pill.scale.x > 0.9 ? ray.intersectObject(pill, true)[0] : undefined;
      hovering = !!hit && b.root.visible;
      return hovering ? { action: 'book' } : null;
    },
  };
}

/* ================= Skills: a silver laptop, stickers flying on ================= */
let envMap: THREE.Texture | null = null;
export const setEnvMap = (t: THREE.Texture) => (envMap = t);

function slab(w: number, d: number, h: number, r: number, mat: THREE.Material) {
  // a rounded-corner slab lying flat (XZ), h tall
  const geo = new THREE.ExtrudeGeometry(roundedShape(w, d, r), { depth: h - 0.02, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 10 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0.01, 0);
  return new THREE.Mesh(geo, mat);
}
export function skills(): Chapter3D {
  const b = base('skills', 'stickers');
  const LW = 5.4, LD = 3.7;
  const laptop = new THREE.Group();
  const alu = new THREE.MeshStandardMaterial({ color: '#d3d5d9', metalness: 0.55, roughness: 0.32, envMapIntensity: 1 });
  const dark = new THREE.MeshStandardMaterial({ color: '#2a2a2e', metalness: 0.2, roughness: 0.6 });
  const baseSlab = slab(LW, LD, 0.13, 0.22, alu);
  const seam = slab(LW - 0.06, LD - 0.08, 0.025, 0.2, dark);
  seam.position.y = 0.13;
  const lid = slab(LW, LD, 0.1, 0.22, alu);
  lid.position.y = 0.155;
  // the thumb scoop at the front and the hinge at the back
  const scoop = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 24, 1, false, 0, Math.PI), dark);
  scoop.rotation.set(0, Math.PI / 2, Math.PI / 2);
  scoop.position.set(0, 0.14, LD / 2 + 0.005);
  scoop.scale.set(1, 1, 0.35);
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(LW * 0.7, 0.05, 0.03), dark);
  hinge.position.set(0, 0.14, -LD / 2 - 0.005);
  // two ports on the left side
  const portGeo = new THREE.BoxGeometry(0.02, 0.05, 0.22);
  for (const z of [-0.6, -0.2]) {
    const port = new THREE.Mesh(portGeo, dark);
    port.position.set(-LW / 2 - 0.005, 0.065, z);
    laptop.add(port);
  }
  laptop.add(baseSlab, seam, lid, scoop, hinge);
  const LID_TOP = 0.255 + 0.003;

  // stickers: flat, die-cut, pressed onto the lid
  // pack the stickers into rows (biggest first) so none of them overlap
  const sizes = STICKERS.map((s) => {
    const w = 1.12 + Math.min(s.builds.length, 9) * 0.085;
    return { w, h: w * 0.44 };
  });
  const order = STICKERS.map((_, i) => i).sort((a, b) => sizes[b].w - sizes[a].w);
  const rows: number[][] = [[]];
  let rowW = 0;
  const GAP = 0.17, MAXW = LW - 0.4;
  for (const i of order) {
    if (rowW + sizes[i].w > MAXW && rows[rows.length - 1].length) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push(i);
    rowW += sizes[i].w + GAP;
  }
  const rowH = rows.map((r) => Math.max(...r.map((i) => sizes[i].h)));
  const totalH = rowH.reduce((a, b) => a + b, 0) + GAP * (rows.length - 1);
  const fit = Math.min(1, (LD - 0.4) / totalH);
  const spots: number[][] = [];
  let zc = -totalH / 2;
  rows.forEach((r, ri) => {
    const wsum = r.reduce((a, i) => a + sizes[i].w, 0) + GAP * (r.length - 1);
    let xc = -wsum / 2;
    r.forEach((i, k) => {
      const jitter = ((i * 37) % 7) / 7 - 0.5;
      spots[i] = [(xc + sizes[i].w / 2) * fit, (zc + rowH[ri] / 2) * fit + jitter * 0.06, (k % 2 ? 1 : -1) * (3 + ((i * 13) % 5))];
      xc += sizes[i].w + GAP;
    });
    zc += rowH[ri] + GAP;
  });
  const stickers = STICKERS.map((s, i) => {
    const n = s.builds.length;
    const w = sizes[i].w * fit;
    const h = sizes[i].h * fit;
    const r = h * 0.32;
    const px = 300;
    const tex = canvasTexture(Math.round(w * px), Math.round(h * px), (g, W, H) => {
      g.fillStyle = '#ffffff';
      rr(g, 0, 0, W, H, H * 0.32);
      g.fill();
      g.fillStyle = s.bg;
      rr(g, H * 0.07, H * 0.07, W - H * 0.14, H - H * 0.14, H * 0.26);
      g.fill();
      g.fillStyle = s.fg;
      g.textAlign = 'left';
      fitFont(g, s.label, 800, Math.round(H * 0.44), W - H * 0.45, 16);
      g.fillText(s.label, H * 0.22, H * 0.56);
      g.font = sans(700, Math.round(H * 0.19));
      g.globalAlpha = 0.85;
      g.fillText(`${n} build${n === 1 ? '' : 's'}`, H * 0.25, H * 0.8);
      g.globalAlpha = 1;
    });
    const geo = new THREE.ShapeGeometry(roundedShape(w, h, r), 8);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let k = 0; k < pos.count; k++) uv.setXY(k, (pos.getX(k) + w / 2) / w, (pos.getY(k) + h / 2) / h);
    // printed vinyl: unlit so the colours and labels stay crisp, pressed flush on the lid
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    const [x, z, rot] = spots[i];
    mesh.userData = { label: s.label, home: new THREE.Vector3(x, LID_TOP, z), r: THREE.MathUtils.degToRad(rot) };
    laptop.add(mesh);
    return mesh;
  });
  laptop.scale.setScalar(0.62);
  b.panel.add(laptop);
  let hovered: THREE.Object3D | null = null;
  const from = new THREE.Vector3();
  let envSet = false;

  return {
    id: b.id,
    app: b.app,
    root: b.root,
    update(ctx) {
      if (!b.anchor(ctx)) return;
      if (!envSet && envMap) {
        alu.envMap = envMap;
        alu.needsUpdate = true;
        envSet = true;
      }
      const a = ctx.calm ? 1 : easeOutBack(clamp(ctx.formed));
      const m = ctx.flip && !ctx.mobile ? -1 : 1;
      laptop.position.set(0, -0.2, 0); // centred in its own space: clear of the phone and the text
      // 5.4 wide x 0.62 = 3.35, inside the 3.6-wide space between phone and text
      laptop.scale.setScalar(Math.max(0.001, 0.62 * a));
      // lid tilted toward you, a little turned toward the phone
      laptop.rotation.set(1.18 + (ctx.calm ? 0 : ctx.my * 0.05), m * -0.08 + (ctx.calm ? 0 : ctx.mx * 0.08), 0);
      // where the phone screen is, inside the laptop's own space
      b.root.updateMatrixWorld();
      from.copy(scr(256, 520)).applyMatrix4(b.root.matrixWorld);
      laptop.worldToLocal(from);
      const run = clamp(ctx.progress / 1.5);
      stickers.forEach((st, i) => {
        const at = (i / stickers.length) * 0.92;
        const k = ctx.calm ? (run >= at ? 1 : 0) : clamp((run - at) / 0.09);
        st.visible = k > 0.001 && a > 0.05;
        if (!st.visible) return;
        const home = st.userData.home as THREE.Vector3;
        // fly in an arc from the phone, then slap down flat
        const fly = easeInOut(clamp(k / 0.8));
        const slap = clamp((k - 0.8) / 0.2);
        const arc = Math.sin(fly * Math.PI) * 1.4;
        st.position.set(from.x + (home.x - from.x) * fly, from.y + (home.y + 0.35 - from.y) * fly + arc - 0.35 * easeOut(slap), from.z + (home.z - from.z) * fly);
        if (k >= 1) st.position.y = home.y;
        const squash = k >= 1 ? 1 : 1 + Math.sin(slap * Math.PI) * 0.08;
        const lift = st === hovered ? 1.07 : 1;
        st.scale.set(squash * lift, squash * lift, 1);
        st.rotation.set(-Math.PI / 2 + (1 - fly) * 0.9, 0, st.userData.r + (1 - fly) * 1.2);
        if (st === hovered) st.position.y = home.y + 0.04;
      });
    },
    pick(ray) {
      const hit = ray.intersectObjects(stickers.filter((s) => s.visible), false)[0];
      hovered = hit?.object ?? null;
      return hovered ? { label: hovered.userData.label as string } : null;
    },
  };
}

export const buildChapter = (id: ChapterId): Chapter3D => ({ systems, services, process, skills, about, contact })[id]();
