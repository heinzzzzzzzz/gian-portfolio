import * as THREE from 'three';
import { sans } from './fonts';
import { onTheme } from './theme';

/*
 * Small building blocks for the 3D chapters. Everything with text is a card:
 * a rounded slab with an unlit printed face (MeshBasicMaterial with a canvas
 * texture), so the text stays crisp and costs no lighting math. The face is
 * cut from the exact same rounded outline as the slab, so the edge reads as
 * an even rim all the way round.
 */

export type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;
/** a colour, or a function that reads the current theme (day/night) */
export type Col = string | (() => string);
const col = (c: Col) => (typeof c === 'function' ? c() : c);

let maxAniso = 8;
export const setMaxAnisotropy = (n: number) => (maxAniso = Math.max(1, Math.min(16, n)));

/** a canvas texture drawn once (call .redraw() to repaint, e.g. after an image loads) */
export function canvasTexture(pxW: number, pxH: number, draw: Draw, bg?: Col) {
  const c = document.createElement('canvas');
  c.width = pxW;
  c.height = pxH;
  const g = c.getContext('2d')!;
  const tex = new THREE.CanvasTexture(c) as THREE.CanvasTexture & { redraw: () => void };
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.redraw = () => {
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (bg) {
      g.fillStyle = col(bg);
      g.fillRect(0, 0, pxW, pxH);
    } else g.clearRect(0, 0, pxW, pxH);
    draw(g, pxW, pxH);
    tex.needsUpdate = true;
  };
  tex.redraw();
  return tex;
}

export function roundedShape(w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  const x = -w / 2, y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const geoCache = new Map<string, { slab: THREE.BufferGeometry; face: THREE.BufferGeometry; front: number }>();
function cardGeo(w: number, h: number, depth: number, r: number) {
  const k = `${w}|${h}|${depth}|${r}`;
  let g = geoCache.get(k);
  if (!g) {
    const bevel = Math.min(0.025, depth * 0.3);
    const shape = roundedShape(w, h, r);
    const slab = new THREE.ExtrudeGeometry(shape, { depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 });
    slab.translate(0, 0, -(depth - bevel * 2) / 2);
    const face = new THREE.ShapeGeometry(shape, 10);
    // map the face's x/y onto 0..1 so the canvas covers it exactly
    const pos = face.attributes.position as THREE.BufferAttribute;
    const uv = face.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
    uv.needsUpdate = true;
    g = { slab, face, front: (depth - bevel * 2) / 2 + bevel };
    geoCache.set(k, g);
  }
  return g;
}

/** a thick card: a coloured rounded slab with a printed face of the same outline */
export function card(w: number, h: number, opts: { depth?: number; radius?: number; edge?: Col; bg?: Col; px?: number; draw: Draw }) {
  const depth = opts.depth ?? 0.1;
  const r = opts.radius ?? 0.14;
  const group = new THREE.Group();
  const geo = cardGeo(w, h, depth, r);
  const edge = opts.edge ?? '#efe4d4';
  const slabMat = new THREE.MeshLambertMaterial({ color: col(edge) });
  const slab = new THREE.Mesh(geo.slab, slabMat);
  let px = opts.px ?? 260; // texture pixels per world unit
  px = Math.min(px, 2048 / w, 2048 / h);
  const tex = canvasTexture(Math.round(w * px), Math.round(h * px), opts.draw, opts.bg ?? '#ffffff');
  const face = new THREE.Mesh(geo.face, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  face.position.z = geo.front + 0.002;
  group.add(slab, face);
  group.userData.tex = tex;
  group.userData.face = face;
  // repaint in the other theme when day/night changes
  onTheme(() => {
    slabMat.color.set(col(edge));
    tex.redraw();
  });
  return group;
}

export function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

/** text that wraps inside a width; returns the y after the last line */
export function wrapText(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number, maxLines = 6) {
  const words = text.split(' ');
  let line = '';
  let n = 0;
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > maxW && line) {
      g.fillText(line, x, y);
      y += lineH;
      line = w;
      if (++n >= maxLines - 1) break;
    } else line = t;
  }
  if (line) {
    g.fillText(line, x, y);
    y += lineH;
  }
  return y;
}

export { sans };

/** sets the largest font (up to `max`) at which `text` fits in `maxW`, with one measurement */
export function fitFont(g: CanvasRenderingContext2D, text: string, weight: number, max: number, maxW: number, min = 12) {
  g.font = sans(weight, max);
  const w = g.measureText(text).width;
  const size = w > maxW ? Math.max(min, Math.floor((max * maxW) / w)) : max;
  if (size !== max) g.font = sans(weight, size);
  return size;
}

/** loads an image once (same-origin, so canvases stay readable) */
const imgs = new Map<string, HTMLImageElement>();
export function loadImage(src: string, onload: () => void) {
  let im = imgs.get(src);
  if (!im) {
    im = new Image();
    im.decoding = 'async';
    im.src = src;
    imgs.set(src, im);
  }
  // always async, so callers can store the image before their callback runs
  if (im.complete && im.naturalWidth) setTimeout(onload, 0);
  else im.addEventListener('load', onload, { once: true });
  return im;
}

export function drawImageCover(g: CanvasRenderingContext2D, im: HTMLImageElement | undefined, x: number, y: number, w: number, h: number, alignTop = true) {
  if (!im?.complete || !im.naturalWidth) return;
  const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  const dh = im.naturalHeight * s;
  g.drawImage(im, x + (w - im.naturalWidth * s) / 2, alignTop ? y : y + (h - dh) / 2, im.naturalWidth * s, dh);
  g.restore();
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => ((t = clamp(t)) < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** eases out with a small overshoot, like a card that pops and settles */
export const easeOutBack = (t: number) => {
  t = clamp(t);
  const c1 = 1.3, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
