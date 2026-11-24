import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { projects } from '@/lib/projects';
import { stage } from '@/lib/stage';
import { shelfPhase, clamp, ease, EXPLODE_VH, STEP_VH, REFORM_VH } from '@/lib/shelf';
import { CHAPTERS, chapterPhase, type ChapterPhase } from '@/lib/chapters';
import { drawScreen, setScreenRes, SCREEN_W, SCREEN_H, type ScreenScene } from './screen';
import { buildFolder, FW, FH, type Folder3D } from './folder3d';
import { buildPhone, PHONE } from './phoneModel';
import { buildChapter, setEnvMap, PANEL_W, type Chapter3D } from './chapters3d';
import { setMaxAnisotropy } from './kit';
import { initFonts } from './fonts';
import { setTheme } from './theme';

/*
 * The one 3D scene behind the home page. A phone rings in the hero, rides in
 * the corner, explodes into the folder shelf at Work, then walks through the
 * chapters: it slides from side to side while its screen swipes to the next
 * app, and big cards pop out of the screen. Everything is driven by a
 * smoothed copy of the scroll position (so motion glides instead of jumping
 * with the wheel) and by the stage store; React never re-renders for it.
 *
 * Performance rules: unlit cards for anything with text, page positions
 * measured on resize (never per frame), idle frames skipped, only the corner
 * repainted while docked. The resolution never drops below the screen's own
 * (blurry 3D is worse than a few dropped frames); slow devices switch to a
 * steady 30 fps instead.
 */

const FOV = 30;
const CAM_Z = 20;

type Pose = { x: number; y: number; s: number; ry: number; rx: number; rz: number };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t), ry: lerp(a.ry, b.ry, t), rx: lerp(a.rx, b.rx, t), rz: lerp(a.rz, b.rz, t),
});
const easeInOut = (t: number) => ((t = Math.min(1, Math.max(0, t))) < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createWorld(canvas: HTMLCanvasElement, opts: { calm: () => boolean }) {
  initFonts();
  const mobile = () => innerWidth < 768;
  const isMobile = mobile();
  // never below the screen's own resolution (that's what made it look 360p)
  const MAX_DPR = Math.min(devicePixelRatio, isMobile ? 1.75 : 1.5);
  const MIN_DPR = Math.min(devicePixelRatio, isMobile ? 1.25 : 1);
  let dpr = MAX_DPR;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  setMaxAnisotropy(renderer.capabilities.getMaxAnisotropy());
  setScreenRes(isMobile ? 0.85 : 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);
  const hemi = new THREE.HemisphereLight('#fff6ee', '#c9b49a', 1.6);
  const key = new THREE.DirectionalLight('#ffffff', 2.0);
  key.position.set(-4, 6, 10);
  scene.add(hemi, key);

  /* ---------------- phone ---------------- */
  const sc = document.createElement('canvas');
  const sg = sc.getContext('2d')!;
  const sizeScreen = () => {
    sc.width = Math.round(SCREEN_W * (isMobile ? 0.85 : 1));
    sc.height = Math.round(SCREEN_H * (isMobile ? 0.85 : 1));
  };
  sizeScreen();
  const screenTex = new THREE.CanvasTexture(sc);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.generateMipmaps = false;
  screenTex.minFilter = THREE.LinearFilter;
  screenTex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const { group: phone, setEnv: setPhoneEnv, setNight: setPhoneNight } = buildPhone(screenTex);
  scene.add(phone);

  /* ---------------- folders ---------------- */
  const shelf = new THREE.Group();
  const live = (o: THREE.Object3D, on: boolean) => {
    if (on && !o.parent) scene.add(o);
    else if (!on && o.parent) scene.remove(o);
  };
  type Folder = Folder3D;
  const folders: Folder[] = projects.map((p, i) => {
    const f = buildFolder(p, i);
    f.group.visible = false;
    shelf.add(f.group);
    return f;
  });
  const byId = new Map(folders.map((f) => [f.p.id, f]));

  /* ---------------- chapters ---------------- */
  type Ch = { def: (typeof CHAPTERS)[number]; c: Chapter3D | null; top: number; ph: ChapterPhase | null; index: number; panelTop: number };
  const chapters: Ch[] = CHAPTERS.map((def, index) => ({ def, c: null, top: 0, ph: null, index, panelTop: 0 }));
  const ensureChapter = (ch: Ch) => {
    if (!ch.c) {
      ch.c = buildChapter(ch.def.id);
      ch.c.root.visible = false;
    }
    return ch.c;
  };

  /* ---------------- paper (the phone exploding into the shelf) ----------------
   * The screen peels off into small printed pages that flutter and curl, then
   * get filed into the folders. Six page designs, each one instanced mesh. */
  const KINDS = 6;
  const PER = isMobile ? 8 : 24;
  const SHEETS = KINDS * PER;
  const pageGeo = new THREE.PlaneGeometry(0.46, 0.6, 4, 1);
  {
    // a slight curl, so they read as paper rather than cards
    const pp = pageGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pp.count; i++) pp.setZ(i, Math.pow(pp.getX(i) / 0.23, 2) * 0.045);
    pageGeo.computeVertexNormals();
  }
  const pageTex = (k: number) => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 168;
    const g = c.getContext('2d')!;
    g.fillStyle = k === 4 ? '#ffe9f1' : '#fffdf8';
    g.fillRect(0, 0, 128, 168);
    const shot = k % 2 === 0; // half of them carry a little screenshot block
    if (shot) {
      g.fillStyle = ['#cfe3d6', '#d8e4f2', '#efe0b8', '#e9d6f0'][k / 2 % 4];
      g.fillRect(12, 14, 104, 56);
      g.fillStyle = 'rgba(71,67,41,0.25)';
      g.fillRect(20, 24, 50, 6);
      g.fillRect(20, 36, 70, 4);
    }
    g.fillStyle = '#474329';
    g.fillRect(12, shot ? 82 : 18, 64 + (k % 3) * 10, 9);
    g.fillStyle = '#c4b8a2';
    for (let i = 0; i < (shot ? 5 : 9); i++) g.fillRect(12, (shot ? 100 : 38) + i * 12, 104 - ((i + k) % 3) * 20, 5);
    g.fillStyle = '#ff6fa6';
    g.fillRect(12, 154, 26, 4);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  const paper = new THREE.Group();
  paper.visible = false;
  const pages = Array.from({ length: KINDS }, (_, k) => {
    const m = new THREE.InstancedMesh(pageGeo, new THREE.MeshLambertMaterial({ map: pageTex(k), side: THREE.DoubleSide }), PER);
    m.frustumCulled = false;
    paper.add(m);
    return m;
  });
  const R = Math.random;
  const sheetData = Array.from({ length: SHEETS }, () => ({
    start: new THREE.Vector3((R() - 0.5) * PHONE.w * 0.85, (R() - 0.5) * PHONE.h * 0.9, PHONE.d / 2),
    fly: new THREE.Vector3((R() - 0.5) * 2.6, (R() - 0.35) * 1.7, 0.3 + R() * 0.9),
    spin: new THREE.Vector3((R() - 0.5) * 6, (R() - 0.5) * 7, (R() - 0.5) * 4),
    phase: R() * 6.28,
    delay: R(),
    local: new THREE.Vector3((R() - 0.5) * FW * 0.7, FH * (0.45 + R() * 0.3), 0.02 + R() * 0.06),
  }));
  const E = new THREE.Euler();
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), V2 = new THREE.Vector3(), SV = new THREE.Vector3();
  const YAXIS = new THREE.Vector3(0, 1, 0);

  /* ---------------- input ---------------- */
  let mx = 0, my = 0, mxs = 0, mys = 0, hovered: Folder | null = null;
  let moved = false;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let browsing = false;
  let pickable: Chapter3D | null = null;
  let chapterHover: { label?: string; action?: string } | null = null;
  const onMove = (e: PointerEvent) => {
    moved = true;
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  };
  const hitFolder = () => {
    if (!browsing) return null;
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(folders.filter((f) => f.group.visible).map((f) => f.group), true)[0];
    let o: THREE.Object3D | null = h?.object ?? null;
    while (o && !o.userData.id) o = o.parent;
    return o ? byId.get(o.userData.id as string) ?? null : null;
  };
  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('a,button,input,textarea,dialog,iframe,aside')) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    if (chapterHover?.action || hold.pending) return; // handled on click / it's a grab
    const f = hitFolder();
    if (!f) return;
    const index = stage.get().shelfIds.indexOf(f.p.id);
    if (index >= 0) stage.set({ pick: { index, at: performance.now() } });
  };
  // 3D buttons act on the full click, so the release can't land on the
  // dialog they open and dismiss it straight away
  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a,button,input,textarea,dialog,iframe,aside')) return;
    if (!pickable?.pick) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (pickable.pick(ray)?.action === 'book') dispatchEvent(new CustomEvent('gb:book'));
  };
  /* ---- hold the phone: drag to turn it, let go and it turns back ---- */
  const hold = { yaw: 0, pitch: 0, pending: false, active: false, sx: 0, sy: 0, y0: 0, p0: 0, swallowClick: false };
  const GRAB_OK = '[data-phone-slot],[data-phone-grab]';
  const onGrabDown = (e: PointerEvent) => {
    const el = e.target as HTMLElement;
    if (!el.closest(GRAB_OK) && el.closest('a,button,input,textarea,dialog,iframe,aside,select,label')) return;
    if (!phone.visible || e.button > 0) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!ray.intersectObject(phone, true).length) return;
    Object.assign(hold, { pending: true, active: false, sx: e.clientX, sy: e.clientY, y0: hold.yaw, p0: hold.pitch });
  };
  const onGrabMove = (e: PointerEvent) => {
    if (!hold.pending) return;
    const dx = e.clientX - hold.sx, dy = e.clientY - hold.sy;
    if (!hold.active && Math.hypot(dx, dy) > 6) {
      hold.active = true;
      document.documentElement.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
    if (hold.active) {
      hold.yaw = hold.y0 + dx * 0.012;
      hold.pitch = clamp(hold.p0 + dy * 0.008, -1.1, 1.1);
    }
  };
  const onGrabUp = () => {
    if (hold.active) {
      hold.swallowClick = true; // a drag is not a tap: don't answer the call
      setTimeout(() => (hold.swallowClick = false), 0);
      // turn back the short way round
      hold.yaw -= Math.PI * 2 * Math.round(hold.yaw / (Math.PI * 2));
      document.documentElement.style.cursor = '';
      document.body.style.userSelect = '';
    }
    hold.pending = hold.active = false;
  };
  const onGrabClick = (e: MouseEvent) => {
    if (!hold.swallowClick) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    hold.swallowClick = false;
  };
  addEventListener('pointerdown', onGrabDown, true);
  addEventListener('pointermove', onGrabMove, true);
  addEventListener('pointerup', onGrabUp, true);
  addEventListener('pointercancel', onGrabUp, true);
  addEventListener('click', onGrabClick, true);

  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onDown);
  addEventListener('click', onClick);

  /* ---------------- layout helpers ---------------- */
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
  const ppu = () => innerHeight / visH;
  const toWorld = (px: number, py: number) => ({ x: (px - innerWidth / 2) / ppu(), y: -(py - innerHeight / 2) / ppu() });
  const poseAt = (px: number, py: number, heightPx: number, ry = 0, rx = 0, rz = 0): Pose => {
    const w = toWorld(px, py);
    return { x: w.x, y: w.y, s: heightPx / (PHONE.h * ppu()), ry, rx, rz };
  };
  const box = {
    slot: null as null | { l: number; t: number; w: number; h: number; sticky: boolean },
    shelfTop: 0,
    hasShelf: false,
    band: { top: 0, h: 0 },
  };
  const measure = () => {
    const slot = document.querySelector<HTMLElement>('[data-phone-slot]');
    if (slot) {
      const r = slot.getBoundingClientRect();
      const sticky = innerWidth >= 1024;
      box.slot = { l: r.left, t: sticky ? r.top + Math.min(scrollY, 0) : r.top + scrollY, w: r.width, h: r.height, sticky };
    }
    const sh = document.getElementById('shelf');
    box.hasShelf = !!sh;
    if (sh) box.shelfTop = sh.getBoundingClientRect().top + scrollY;
    const band = document.querySelector<HTMLElement>('[data-shelf-band]');
    if (band) box.band = { top: band.offsetTop, h: band.offsetHeight }; // relative to the pinned frame
    for (const ch of chapters) {
      const el = document.getElementById(ch.def.id);
      ch.top = el ? el.getBoundingClientRect().top + scrollY : -1;
      // on phones: where the text panel starts inside the pinned frame (the 3D stays above it)
      const panel = el?.querySelector<HTMLElement>('[data-chapter-panel]');
      const frame = panel?.closest<HTMLElement>('.sticky');
      ch.panelTop = panel && frame ? panel.getBoundingClientRect().top - frame.getBoundingClientRect().top : 0;
    }
  };
  measure();
  const measureTimer = window.setInterval(measure, 1000);
  const onResize = () => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    measure();
    full = true;
  };
  addEventListener('resize', onResize);

  /**
   * Where the phone sits in a chapter, and how big the cards are. On laptops
   * the phone goes on one side, the text on the other, and the cards fill the
   * space between them. On phones the phone sits up top and cards pop out in
   * front of it.
   */
  const chapterLayout = (side: 'left' | 'right', W: number, vh: number, calm: boolean, panelTop = 0) => {
    if (mobile()) {
      // the phone and its cards fit in the space above the text panel, however tall the text is
      const avail = clamp(panelTop > 0 ? panelTop - 10 : vh * 0.42, vh * 0.26, vh * 0.5);
      const h = Math.min(vh * 0.33, avail * 0.86);
      const pose = poseAt(W / 2, Math.max(avail / 2 + 4, h / 2 + 8), h, -0.12 + (calm ? 0 : mxs * 0.3), 0, 0);
      const unit = pose.s * ppu();
      // fit the tallest card stack (about 4.4 units) in the same space
      return { pose, cs: Math.min(1.8, (W * 0.9) / (PANEL_W * unit), (avail * 0.88) / (4.4 * unit)) };
    }
    const heightPx = Math.min(vh * 0.66, W * 0.36);
    const unit = heightPx / PHONE.h;
    const cw = Math.min(W, 1280);
    const cl = (W - cw) / 2;
    const reserve = (1.62 + 1.35) * unit + 40; // the phone, the gaps, the screen edge
    let cardPx: number;
    let x: number;
    if (side === 'right') {
      const textEdge = cl + 0.44 * cw;
      cardPx = Math.min(clamp(W * 0.25, 280, 430), W - textEdge - reserve);
      x = textEdge + 24 + cardPx + 1.62 * unit;
    } else {
      const textStart = cl + 0.56 * cw;
      cardPx = Math.min(clamp(W * 0.25, 280, 430), textStart - reserve);
      x = textStart - 24 - cardPx - 1.62 * unit;
    }
    const tilt = side === 'right' ? -0.2 : 0.2;
    const pose = poseAt(x, vh * 0.52, heightPx, tilt + (calm ? 0 : mxs * 0.35), calm ? 0 : mys * 0.15, 0);
    return { pose, cs: Math.max(0.6, cardPx / (PANEL_W * unit)) };
  };

  /* ---------------- loop ---------------- */
  const clock = new THREE.Clock();
  let raf = 0;
  let sy = scrollY; // the smoothed scroll everything in 3D follows
  let lastScroll = scrollY;
  let sway = 0;
  let callW = 0;
  let screenAcc = 1;
  let lastNight: boolean | null = null;
  let lastSig = '';
  let full = true; // next frame must repaint the whole canvas
  let wasDocked = false;
  const start = performance.now();
  // adaptive smoothness: drop to the floor resolution, then to a steady 30 fps
  let slow = 0, fast = 0, lastFrame = performance.now();
  let cap30 = false;
  let lastDraw = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    if (cap30 && performance.now() - lastDraw < 30) return;
    lastDraw = performance.now();
    const now = performance.now();
    const frameMs = now - lastFrame;
    lastFrame = now;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = (now - start) / 1000;
    const calm = opts.calm();
    const vh = innerHeight;
    const W = innerWidth;
    const st = stage.get();
    const night = document.documentElement.classList.contains('night');
    if (night !== lastNight) {
      lastNight = night;
      setPhoneNight(night);
      setTheme(night); // cards, folder pages and the calendar repaint
      hemi.intensity = night ? 0.9 : 1.6;
      key.intensity = night ? 1.3 : 2.0;
      full = true;
    }
    // glide toward the real scroll and pointer instead of jumping with them
    // quick enough to stay with the page (Lenis already smooths mouse wheels),
    // slow enough to soak up trackpad and touch jitter
    const glide = calm ? 1 : 1 - Math.exp(-dt * 11);
    sy += (scrollY - sy) * glide;
    if (Math.abs(scrollY - sy) < 0.3) sy = scrollY;
    mxs += (mx - mxs) * (calm ? 1 : 1 - Math.exp(-dt * 5));
    mys += (my - mys) * (calm ? 1 : 1 - Math.exp(-dt * 5));
    callW += ((st.callPanel ? 1 : 0) - callW) * (calm ? 1 : 1 - Math.exp(-dt * 4));
    if (Math.abs(callW - (st.callPanel ? 1 : 0)) < 0.002) callW = st.callPanel ? 1 : 0;

    /* ---- poses ---- */
    const sl = box.slot;
    const r = sl ? { left: sl.l, top: sl.sticky ? sl.t : sl.t - scrollY, width: sl.w, height: sl.h } : null;
    const heroPose = r && r.height > 0
      ? poseAt(r.left + r.width / 2, r.top + r.height / 2, Math.min(r.height * 0.94, r.width * 1.9), -0.35 + (calm ? 0 : mxs * 0.55), calm ? 0 : mys * 0.3, 0.06)
      : poseAt(W * 0.75, vh * 0.5, vh * 0.7);
    const dockPose = poseAt(W - (mobile() ? 40 : 67), vh - (mobile() ? 84 : 104), mobile() ? 118 : 160, -0.25 + sway, 0.05, 0.08);
    const centerPose = poseAt(W / 2, vh * 0.47, vh * 0.6);
    const heroP = ease(clamp(sy / (vh * 0.85)));
    let pose = lerpPose(heroPose, dockPose, heroP);
    pose.ry += heroP * (1 - heroP) * 4 * Math.PI * (calm ? 0 : 1);

    // every place the phone can belong to, with how much it belongs there
    type Station = { w: number; pose: Pose; order: number; scene: () => ScreenScene; ch?: Ch; cs?: number };
    const stations: Station[] = [];

    /* ---- the Work shelf ---- */
    const ids = st.shelfIds;
    let explode = 0;
    let appP = -1;
    browsing = false;
    let shelfActive = 0;
    let shelfW = 0;
    if (box.hasShelf) {
      const top = box.shelfTop;
      const ph = shelfPhase(sy, top, vh, ids.length);
      shelfActive = ph.active;
      const approach = clamp((sy - (top - vh * 0.9)) / (vh * 0.9));
      const endY = top + (EXPLODE_VH + Math.max(1, ids.length) * STEP_VH + REFORM_VH) * vh;
      const leave = clamp((sy - endY) / (vh * 0.8));
      shelfW = approach * (1 - leave);
      if (shelfW > 0) {
        appP = clamp((approach - 0.55) / 0.45) * (1 - ph.reform);
        explode = ph.explode * (1 - ph.reform);
        browsing = ph.explode >= 1 && ph.reform <= 0;
        const p = Math.max(0, appP);
        stations.push({ w: shelfW, pose: centerPose, order: 0, scene: () => ({ kind: 'app', p }) });
      }
    }
    if (calm) explode = explode > 0.5 ? 1 : 0;

    /* ---- chapters ---- */
    for (const ch of chapters) {
      if (ch.top < 0) continue;
      ch.ph = chapterPhase(sy, ch.top, vh, ch.def.steps, ch.def.stepVh);
      if (ch.ph.weight > 0) {
        const lay = chapterLayout(ch.def.side, W, vh, calm, ch.panelTop);
        const progress = ch.ph.run * ch.def.steps;
        const app = ensureChapter(ch).app;
        stations.push({ w: ch.ph.weight, pose: lay.pose, order: ch.index + 1, ch, cs: lay.cs, scene: () => ({ kind: 'chapter', app, progress, t }) });
      }
    }
    // build chapters a little before they're needed
    for (const ch of chapters) if (ch.ph && ch.ph.y > -2.5 && ch.ph.y < 12) ensureChapter(ch);

    // blend between the two places the phone belongs to most
    stations.sort((a, b) => b.w - a.w);
    let A = stations[0] ?? null;
    let B = stations[1] ?? null;
    if (A && B && B.order < A.order) [A, B] = [B, A];
    let swipe: { u: number; dir: 1 | -1 } | null = null;
    if (A && B) {
      const u = B.w / (A.w + B.w);
      const travel = Math.sin(Math.PI * u);
      let dir: 1 | -1 = B.pose.x > A.pose.x + 0.01 ? 1 : B.pose.x < A.pose.x - 0.01 ? -1 : B.order % 2 ? 1 : -1;
      const target = lerpPose(A.pose, B.pose, easeInOut(u));
      if (!calm) {
        target.ry += dir * travel * 0.85;
        target.rz -= dir * travel * 0.06;
        target.s *= 1 - 0.1 * travel;
        if (mobile()) target.x += (dir * travel * W * 0.32) / ppu();
      }
      pose = lerpPose(pose, target, Math.min(1, A.w + B.w));
      // the screen content swipes the other way, as if it stays put while the phone moves
      dir = (dir * -1) as 1 | -1;
      swipe = { u: clamp(u), dir };
    } else if (A) pose = lerpPose(pose, A.pose, ease(Math.min(1, A.w)));
    const lead = A && B ? (B.w > A.w ? B : A) : A;

    /* ---- the call: the phone flies to the left of the call panel ---- */
    if (callW > 0) {
      const callPose = mobile()
        ? poseAt(W / 2, vh * 0.2, vh * 0.3, 0.15, 0, 0)
        : poseAt(Math.min(W * 0.3, W - 520), vh * 0.52, Math.min(vh * 0.74, W * 0.4), 0.32 + (calm ? 0 : mxs * 0.2), calm ? 0 : mys * 0.1, 0);
      const k = easeInOut(callW);
      pose = lerpPose(pose, callPose, k);
      if (!calm) pose.ry += Math.sin(Math.PI * callW) * 1.1 * (st.callPanel ? 1 : -1);
    }

    /* ---- phone ---- */
    const onCall = st.call.status === 'active' || st.call.status === 'connecting';
    const ringing = st.call.status === 'idle' && heroP < 0.3 && !calm && t > 2.2 && t % 2.6 < 0.9;
    const docked = heroP > 0.98 && stations.length === 0 && callW <= 0;
    if (docked !== st.docked) stage.set({ docked });
    const floatY = calm || docked ? 0 : Math.sin(t * 1.1) * 0.06 * pose.s;
    phone.position.set(pose.x, pose.y + floatY, 0);
    if (!hold.active) {
      const back = calm ? 1 : 1 - Math.exp(-dt * 3.2); // eases back to its own face
      hold.yaw -= hold.yaw * back;
      hold.pitch -= hold.pitch * back;
      if (Math.abs(hold.yaw) < 0.0005) hold.yaw = 0;
      if (Math.abs(hold.pitch) < 0.0005) hold.pitch = 0;
    }
    phone.rotation.set(pose.rx + hold.pitch, pose.ry + hold.yaw, pose.rz + (ringing ? Math.sin(t * 70) * 0.035 : 0));
    const phoneGone = clamp((explode - 0.1) / 0.08) * (1 - clamp(callW * 4));
    phone.scale.setScalar(pose.s * (1 + phoneGone * 0.15));
    phone.visible = phoneGone < 1;

    const v = scrollY - lastScroll;
    lastScroll = scrollY;
    sway += ((calm ? 0 : clamp(v * 0.004, -0.4, 0.4)) - sway) * 0.08;

    /* ---- screen ---- */
    screenAcc += dt;
    let screenDrawn = false;
    const fps = docked && !onCall ? (isMobile ? 3 : 6) : lead?.ch ? (isMobile ? 10 : 15) : isMobile ? 15 : 24;
    const swiping = !!swipe && swipe.u > 0.01 && swipe.u < 0.99;
    if (phone.visible && (screenAcc > 1 / fps || (swiping && screenAcc > 1 / 30))) {
      screenDrawn = true;
      screenAcc = 0;
      let scr: Parameters<typeof drawScreen>[1];
      if (swipe && A && B && swiping) scr = { from: A.scene(), to: B.scene(), u: swipe.u, dir: swipe.dir };
      else if (lead && lead.w > 0.4) scr = lead.scene();
      else if (heroP < 0.5) scr = { kind: 'hero', t };
      else scr = { kind: 'dock', t };
      drawScreen(sg, scr, st.call, night, calm);
      screenTex.needsUpdate = true;
    }

    /* ---- shelf layout: a row of open file folders ---- */
    const bandH = box.band.h > 0 ? box.band.h : vh * 0.5;
    const stackH = FH + 0.4 + 1.4;
    // leave room: the facing folder comes forward and looks bigger than its slot
    const S = Math.min((W * (mobile() ? 0.62 : 0.25)) / FW, (bandH * 0.82) / stackH) / ppu();
    const bandMid = box.band.h > 0 ? box.band.top + box.band.h / 2 : vh * 0.5;
    shelf.position.set(0, toWorld(W / 2, bandMid).y - (stackH / 2) * S + 0.2 * S, 0);
    shelf.scale.setScalar(Math.max(0.001, S * (1 - easeInOut(callW))));
    const order = ids.map((id) => byId.get(id)).filter(Boolean) as Folder[];
    const active = Math.min(shelfActive, Math.max(0, order.length - 1));
    const opening = st.opening && performance.now() - st.opening.at < 3000 ? st.opening : null;
    const k = calm ? 1 : 1 - Math.exp(-dt * 9);
    const formed = clamp((explode - 0.86) / 0.14);
    const reach = mobile() ? 3 : 6;
    for (const f of folders) {
      const i = order.indexOf(f);
      const d = i - active;
      const isA = i >= 0 && d === 0;
      const inRow = i >= 0 && Math.abs(d) <= reach;
      // the facing folder comes forward and opens; the rest stand in a row going back
      const tx = !inRow ? f.cur.x : isA ? 0 : Math.sign(d) * 1.25 + d * 0.62;
      const tz = isA ? 2.2 : -Math.abs(d) * 0.5;
      const ty = f === hovered && !isA ? 0.2 : 0;
      const tr = isA ? -0.12 + (calm ? 0 : mxs * 0.25) : d > 0 ? -0.95 : 0.95;
      const ts = inRow ? 1 : 0;
      if (inRow && Math.abs(d) <= 2) f.detail();
      f.cur.x += (tx - f.cur.x) * k;
      f.cur.y += (ty - f.cur.y) * k;
      f.cur.z += (tz - f.cur.z) * k;
      f.cur.ry += (tr - f.cur.ry) * k;
      f.cur.s += (ts - f.cur.s) * k;
      f.cur.open += ((isA ? 1 : 0) - f.cur.open) * k;
      f.cur.lift += ((isA ? 1 : 0) - f.cur.lift) * (calm ? 1 : 1 - Math.exp(-dt * 6));
      let scale = f.cur.s * ease(formed);
      let x = f.cur.x, y = f.cur.y, z = f.cur.z, ry = f.cur.ry;
      let open = f.cur.open, lift = f.cur.lift, paperTilt = -lift * 0.12;
      // opening: the flap tips all the way, the page rises to face you, then we dive in
      if (opening && opening.id === f.p.id) {
        const a = clamp((performance.now() - opening.at) / 1350);
        open = 1 + ease(clamp(a / 0.35)) * 0.9;
        lift = 1 + ease(clamp((a - 0.1) / 0.45)) * 0.9;
        paperTilt = -0.12 * (1 - ease(clamp((a - 0.1) / 0.45)));
        ry = lerp(ry, 0, ease(clamp(a / 0.4)));
        x = lerp(x, 0, ease(clamp(a / 0.4)));
        const dive = ease(clamp((a - 0.6) / 0.4));
        scale *= 1 + dive * 3.2;
        z += dive * 5;
        y -= dive * 2.4;
      }
      f.group.visible = scale > 0.01;
      f.group.position.set(x, y, z);
      f.group.rotation.set(0, ry, 0);
      f.group.scale.setScalar(Math.max(0.001, scale));
      f.flap.rotation.x = 0.08 + open * 0.55;
      f.paper.position.y = FH / 2 + 0.12 + lift * 1.25;
      f.paper.rotation.x = paperTilt;
    }
    if (browsing && moved) {
      const h = hitFolder();
      if (h !== hovered) {
        hovered = h;
        document.documentElement.style.cursor = h ? 'pointer' : '';
      }
    } else if (!browsing && hovered) {
      hovered = null;
      document.documentElement.style.cursor = '';
    }

    /* ---- chapters: update content ---- */
    pickable = null;
    for (const ch of chapters) {
      const c = ch.c;
      if (!c || !ch.ph) continue;
      const ph = ch.ph;
      const station = stations.find((s) => s.ch === ch);
      if (!station) {
        c.root.visible = false;
        continue;
      }
      // cards come out once the phone has arrived, and go back in before it leaves
      const inK = calm ? (ph.enter > 0.5 ? 1 : 0) : ease(clamp((ph.enter - 0.3) / 0.7));
      const outK = calm ? (ph.exit > 0.5 ? 1 : 0) : ease(clamp(ph.exit / 0.85));
      c.update({
        t,
        calm,
        mobile: mobile(),
        anchor: { x: pose.x, y: pose.y + floatY, s: pose.s },
        flip: ch.def.side === 'left',
        cs: station.cs ?? 1,
        formed: inK * (1 - outK) * (1 - easeInOut(callW)),
        progress: ph.run * ch.def.steps,
        mx: mxs,
        my: mys,
      });
      if (c.pick && c.root.visible && inK > 0.9 && outK < 0.1) pickable = c;
    }
    // stickers and the calendar button respond to the pointer
    if (pickable?.pick && moved) {
      ray.setFromCamera(ndc, camera);
      const h = pickable.pick(ray);
      chapterHover = h;
      const label = h?.label ?? null;
      if (label !== st.skill) stage.set({ skill: label });
      if (!browsing) document.documentElement.style.cursor = h ? 'pointer' : '';
    } else if (!pickable && chapterHover) {
      chapterHover = null;
      if (st.skill) stage.set({ skill: null });
      if (!browsing) document.documentElement.style.cursor = '';
    }

    /* ---- paper: the phone exploding into the shelf ---- */
    paper.visible = !calm && explode > 0.08 && explode < 0.99;
    if (paper.visible) {
      const e = explode;
      shelf.updateMatrixWorld();
      phone.updateMatrixWorld();
      const gone = 1 - clamp((e - 0.9) / 0.09); // slips into the folder at the very end
      for (let i = 0; i < SHEETS; i++) {
        const d = sheetData[i];
        const burst = ease(clamp((e - 0.06 - d.delay * 0.1) / 0.4));
        const file = ease(clamp((e - 0.48 - d.delay * 0.1) / 0.38));
        const air = burst * (1 - file);
        // out of the screen, drifting down with a side-to-side flutter
        V.copy(d.start).applyMatrix4(phone.matrixWorld).addScaledVector(d.fly, pose.s * 2.2 * burst);
        V.x += Math.sin(t * 2.1 + d.phase) * 0.22 * pose.s * air;
        V.y -= air * pose.s * (0.35 + 0.2 * Math.sin(t * 1.3 + d.phase));
        // filed into a folder
        const f = order.length ? order[i % order.length] : null;
        if (f) V2.copy(d.local).applyAxisAngle(YAXIS, f.cur.ry).add(SV.set(f.cur.x, f.cur.y, f.cur.z)).applyMatrix4(shelf.matrixWorld);
        else V2.copy(V);
        V.lerp(V2, file);
        E.set(d.spin.x * air + Math.sin(t * 3 + d.phase) * 0.45 * air, (f ? f.cur.ry : 0) * file + d.spin.y * air, d.spin.z * air);
        Q.setFromEuler(E);
        const size = lerp(pose.s * (0.5 + 0.5 * burst), S * 0.9, file) * gone;
        SV.setScalar(Math.max(0.001, size));
        M.compose(V, Q, SV);
        pages[i % KINDS].setMatrixAt(Math.floor(i / KINDS), M);
      }
      pages.forEach((m) => (m.instanceMatrix.needsUpdate = true));
    }

    live(shelf, shelfW > 0 && (explode > 0.8 || !!opening));
    live(paper, paper.visible);
    for (const ch of chapters) if (ch.c) live(ch.c.root, ch.c.root.visible);
    moved = false;

    /* ---- render (or skip) ---- */
    let settling = false;
    for (const f of folders) if (f.group.visible && (Math.abs(f.cur.open - (order.indexOf(f) === active ? 1 : 0)) > 0.01 || Math.abs(f.cur.lift - (order.indexOf(f) === active ? 1 : 0)) > 0.01)) settling = true;
    const gliding = hold.yaw !== 0 || hold.pitch !== 0 || sy !== scrollY || Math.abs(mxs - mx) > 0.0005 || Math.abs(mys - my) > 0.0005 || (callW > 0 && callW < 1);
    const sig = `${Math.round(sy)}|${night}`;
    const animating = !docked || stations.length > 0 || !!opening || callW > 0;
    const busy = animating || gliding || screenDrawn || settling || paper.visible || sig !== lastSig || full;
    lastSig = sig;
    if (!busy) return;

    // while resting in the corner, repaint only the corner
    if (docked && !full && wasDocked) {
      // scissor is in CSS pixels from the bottom-left corner
      const pw = mobile() ? 90 : 120, phh = mobile() ? 150 : 200;
      const cx = W - (mobile() ? 40 : 67), cy = mobile() ? 84 : 104;
      renderer.setScissorTest(true);
      renderer.setScissor(cx - pw / 2, cy - phh / 2, pw, phh);
      renderer.render(scene, camera);
      renderer.setScissorTest(false);
    } else {
      renderer.render(scene, camera);
      full = false;
    }
    wasDocked = docked;

    // adaptive: step the resolution down to the floor, then hold a steady 30 fps;
    // step back up when there's room again
    if (animating && frameMs < 300) {
      // only really slow frames (under ~33 fps) count: a 40-50 fps laptop
      // should keep its full frame rate, not get locked to 30
      if (frameMs > (cap30 ? 45 : 30)) slow++;
      else if (frameMs < (cap30 ? 36 : 17)) fast++;
      if (slow > 45 && dpr > MIN_DPR + 0.01) {
        dpr = Math.max(MIN_DPR, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        renderer.setSize(innerWidth, innerHeight, false);
        slow = fast = 0;
        full = true;
      } else if (slow > 45 && !cap30) {
        cap30 = true;
        slow = fast = 0;
      } else if (fast > 200 && cap30) {
        cap30 = false;
        slow = fast = 0;
      } else if (fast > 200 && dpr < MAX_DPR) {
        dpr = Math.min(MAX_DPR, dpr + 0.25);
        renderer.setPixelRatio(dpr);
        renderer.setSize(innerWidth, innerHeight, false);
        slow = fast = 0;
        full = true;
      }
      if (slow + fast > 300) slow = fast = 0;
    }
  }
  raf = requestAnimationFrame(frame);
  stage.set({ ready: true });
  // Build the chapters (canvas text, textures) during idle time after load,
  // one per idle slot, so nothing gets built in the middle of a scroll.
  const warm = (o: THREE.Object3D) =>
    o.traverse((m) => {
      const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
      if (mat && !Array.isArray(mat) && mat.map) renderer.initTexture(mat.map);
    });
  const idle = (cb: () => void) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 200));
  const queue: (() => void)[] = [
    () => {
      // soft studio reflections for the phone's metal frame and the laptop
      const pm = new THREE.PMREMGenerator(renderer);
      const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
      setEnvMap(env);
      setPhoneEnv(env);
      pm.dispose();
      full = true;
    },
    // build each chapter, then push its textures to the GPU while nothing is
    // happening, so the first time it scrolls in there's no upload hitch
    ...chapters.map((ch) => () => warm(ensureChapter(ch).root)),
    ...folders.slice(0, 4).map((f) => () => {
      f.detail();
      warm(f.group);
    }),
  ];
  const pump = () => {
    const job = queue.shift();
    if (!job) return;
    job();
    idle(pump);
  };
  idle(pump);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerdown', onDown);
    removeEventListener('click', onClick);
    removeEventListener('pointerdown', onGrabDown, true);
    removeEventListener('pointermove', onGrabMove, true);
    removeEventListener('pointerup', onGrabUp, true);
    removeEventListener('pointercancel', onGrabUp, true);
    removeEventListener('click', onGrabClick, true);
    removeEventListener('resize', onResize);
    clearInterval(measureTimer);
    document.documentElement.style.cursor = '';
    renderer.dispose();
  };
}
