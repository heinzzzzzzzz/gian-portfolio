import * as THREE from 'three';
import type { Project } from '@/lib/projects';
import { img3d } from '@/lib/content';
import { designFor } from './folders';
import { canvasTexture, wrapText, sans, loadImage, drawImageCover, fitFont } from './kit';
import { script } from './fonts';
import { T, onTheme } from './theme';

/*
 * One project = one open file folder: a back panel with a labelled tab, a few
 * papers inside (the top one carries the screenshot), and a front panel with a
 * step cut, printed in the project's own colours. The front panel is hinged
 * at the bottom fold so it can tip open, and the top paper can rise out.
 */
export const FW = 3.2; // folder width
export const FH = 2.4; // back panel height (the tab sits above it)
const TAB_W = 1.25;
const CAT: Record<string, string> = { automation: 'AUTOMATION', app: 'APP', website: 'WEBSITE' };

export type Folder3D = {
  p: Project;
  group: THREE.Group;
  flap: THREE.Group;
  paper: THREE.Mesh;
  detail: () => void; // draws the front cover and the screenshot page (lazily)
  cur: { x: number; y: number; z: number; ry: number; s: number; open: number; lift: number };
};

function backShape(tabX: number) {
  const w = FW, h = FH, t = 0.36, r = 0.08;
  const s = new THREE.Shape();
  s.moveTo(r, 0);
  s.lineTo(w - r, 0);
  s.quadraticCurveTo(w, 0, w, r);
  s.lineTo(w, h - r);
  s.quadraticCurveTo(w, h, w - r, h);
  s.lineTo(tabX + TAB_W + 0.2, h);
  s.quadraticCurveTo(tabX + TAB_W + 0.06, h, tabX + TAB_W, h + t * 0.4);
  s.lineTo(tabX + TAB_W - 0.05, h + t - 0.05);
  s.quadraticCurveTo(tabX + TAB_W - 0.1, h + t, tabX + TAB_W - 0.2, h + t);
  s.lineTo(tabX + 0.12, h + t);
  s.quadraticCurveTo(tabX, h + t, tabX, h + t - 0.12);
  s.lineTo(tabX, h);
  s.lineTo(r, h);
  s.quadraticCurveTo(0, h, 0, h - r);
  s.lineTo(0, r);
  s.quadraticCurveTo(0, 0, r, 0);
  return s;
}
function frontShape() {
  const w = FW, h = FH * 0.86, r = 0.08, step = 0.32, cx = w * 0.42;
  const s = new THREE.Shape();
  s.moveTo(r, 0);
  s.lineTo(w - r, 0);
  s.quadraticCurveTo(w, 0, w, r);
  s.lineTo(w, h - r);
  s.quadraticCurveTo(w, h, w - r, h);
  s.lineTo(cx + 0.35, h);
  s.quadraticCurveTo(cx + 0.2, h, cx + 0.1, h - step * 0.5);
  s.lineTo(cx - 0.02, h - step + 0.06);
  s.quadraticCurveTo(cx - 0.1, h - step, cx - 0.25, h - step);
  s.lineTo(r, h - step);
  s.quadraticCurveTo(0, h - step, 0, h - step - r);
  s.lineTo(0, r);
  s.quadraticCurveTo(0, 0, r, 0);
  return s;
}
const extrudeOpts = { depth: 0.035, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 1, curveSegments: 6 };
const geo = {
  back: [0, 1, 2].map((k) => new THREE.ExtrudeGeometry(backShape(0.18 + k * 0.85), extrudeOpts)),
  front: new THREE.ExtrudeGeometry(frontShape(), extrudeOpts),
  paper: new THREE.BoxGeometry(FW - 0.3, FH - 0.05, 0.012),
  tab: new THREE.PlaneGeometry(TAB_W - 0.12, 0.28),
  face: new THREE.PlaneGeometry(FW - 0.3, FH * 0.86 * 0.6),
};
const paperMats = [new THREE.MeshLambertMaterial({ color: T.sheet }), new THREE.MeshLambertMaterial({ color: T.sheetAlt })];
onTheme(() => {
  paperMats[0].color.set(T.sheet);
  paperMats[1].color.set(T.sheetAlt);
});

/** shortens text with an ellipsis so it fits in `maxW` pixels (spread over lines) */
function clip(g: CanvasRenderingContext2D, text: string, maxW: number) {
  if (g.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 4 && g.measureText(t + '…').width > maxW) t = t.slice(0, t.lastIndexOf(' ') > 0 ? t.lastIndexOf(' ') : t.length - 1);
  return t.replace(/[\s,.:;·]+$/, '') + '…';
}

const darker = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k);
  return c;
};

export function buildFolder(p: Project, i: number): Folder3D {
  const d = designFor(p);
  const group = new THREE.Group();
  group.userData.id = p.id;
  const variant = i % 3;
  const tabX = 0.18 + variant * 0.85;
  const backCol = darker(d.bg, -0.06);

  const back = new THREE.Mesh(geo.back[variant], new THREE.MeshLambertMaterial({ color: backCol }));
  back.position.set(-FW / 2, 0, -0.2);
  back.rotation.x = -0.08;
  group.add(back);

  // the tab label: always readable, drawn up front for every folder
  const tabTex = canvasTexture(400, 96, (g, W, H) => {
    g.fillStyle = backCol.getStyle();
    g.fillRect(0, 0, W, H);
    g.fillStyle = d.fg;
    g.textBaseline = 'middle';
    const name = d.spine; // e.g. VOICE RECEPTIONIST, like a printed file label
    fitFont(g, name, 800, 46, W - 24, 18);
    g.fillText(name, 12, H / 2 + 3);
  });
  const tab = new THREE.Mesh(geo.tab, new THREE.MeshBasicMaterial({ map: tabTex, toneMapped: false }));
  tab.position.set(-FW / 2 + tabX + TAB_W / 2 - 0.02, FH + 0.17, -0.2 + 0.06);
  tab.rotation.x = -0.08;
  group.add(tab);

  // papers inside; the top one is the screenshot page that rises out
  const papers = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const pm = new THREE.Mesh(geo.paper, paperMats[k % 2]);
    pm.position.set(0.02 * k, FH / 2 + 0.05 + k * 0.03, -0.14 + k * 0.03);
    papers.add(pm);
  }
  const paperMat = new THREE.MeshBasicMaterial({ color: T.sheet, toneMapped: false });
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(FW - 0.34, FH - 0.08), paperMat);
  paper.position.set(0.06, FH / 2 + 0.12, -0.04);
  papers.add(paper);
  group.add(papers);

  // the front panel, hinged at the bottom fold
  const flap = new THREE.Group();
  const frontMat = new THREE.MeshLambertMaterial({ color: d.bg });
  const front = new THREE.Mesh(geo.front, frontMat);
  front.position.set(-FW / 2, 0, 0);
  flap.add(front);
  const faceMat = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, opacity: 0 });
  const face = new THREE.Mesh(geo.face, faceMat);
  face.position.set(0, FH * 0.86 * 0.34, 0.06);
  flap.add(face);
  flap.position.z = 0.06;
  flap.rotation.x = 0.08;
  group.add(flap);

  let drawn = false;
  const detail = () => {
    if (drawn) return;
    drawn = true;
    const faceTex = canvasTexture(760, 460, (g, W, H) => {
      g.fillStyle = d.fg;
      g.font = sans(800, 26);
      g.fillText((CAT[p.category] ?? '').split('').join(' '), 36, 62);
      const t = p.title.toUpperCase();
      fitFont(g, t, 800, 58, W - 72, 28);
      g.fillText(t, 36, 142);
      g.font = sans(600, 26);
      g.globalAlpha = 0.85;
      g.fillText(p.stack.slice(0, 3).join(' · '), 36, 196, W - 220);
      g.globalAlpha = 1;
      g.fillStyle = d.accent;
      g.beginPath();
      g.arc(W - 100, H - 100, 64, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = d.fg;
      g.font = script(58);
      g.textAlign = 'center';
      g.fillText('GB', W - 100, H - 80);
      g.textAlign = 'left';
      g.font = sans(600, 22);
      g.globalAlpha = 0.8;
      g.fillText(`A Gian Benedict build · ${p.year}`, 30, H - 40);
    });
    faceMat.map = faceTex;
    faceMat.opacity = 1;
    faceMat.needsUpdate = true;
    const holder: { im?: HTMLImageElement } = {};
    const pageTex = canvasTexture(640, 480, (g, W, H) => {
      g.fillStyle = T.page;
      g.fillRect(0, 0, W, H);
      g.fillStyle = T.photoBg;
      g.fillRect(22, 22, W - 44, H - 165);
      drawImageCover(g, holder.im, 22, 22, W - 44, H - 165);
      g.fillStyle = T.pageInk;
      fitFont(g, p.title, 800, 32, W - 44, 20);
      g.fillText(p.title, 22, H - 100);
      g.font = sans(600, 21);
      g.fillStyle = T.pageBody;
      wrapText(g, clip(g, p.tagline, (W - 44) * 2 - 30), 22, H - 66, W - 44, 27, 2);
    });
    holder.im = loadImage(img3d(p.image), () => pageTex.redraw());
    paperMat.map = pageTex;
    paperMat.color.set('#ffffff');
    paperMat.needsUpdate = true;
    onTheme(() => pageTex.redraw());
  };
  onTheme(() => {
    if (!drawn) paperMat.color.set(T.sheet);
  });

  return { p, group, flap, paper, detail, cur: { x: 0, y: 0, z: 0, ry: 0, s: 0, open: 0, lift: 0 } };
}
