'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';

// A storybook door: rounded stones around an arch, a plank door with a round
// knob, two little steps and grass tufts, all with a thick cartoon outline.
// Each door gets its own colours and one detail so the three read as different
// places. Everything is driven by a 0..1 "build" value, so the scroll can put
// the door together piece by piece: stones pop in one by one, then the steps
// and grass, then the planks rise, then the detail, the knob and the sign.

export type DoorLook = {
  stone: string;
  stoneHi: string;
  leaf: string;
  leafShade: string;
  detail: 'gear' | 'porthole' | 'heart';
};

const INK = '#2E2350';
const W = 300;
const H = 470;
// doorway: x 62..238, arch centre (150,152), radius 88, floor at y 428
const L = 62, R = 238, CY = 152, RAD = 88, FLOOR = 428;
const LEAF = `M${L} ${FLOOR} V${CY} A${RAD} ${RAD} 0 0 1 ${R} ${CY} V${FLOOR} Z`;
const archY = (x: number) => CY - Math.sqrt(Math.max(0, RAD * RAD - (x - 150) ** 2));

// Build timeline (fractions of the door's 0..1 build value)
export const PHASE = { stones: [0, 0.42], ground: [0.4, 0.52], leaf: [0.5, 0.7], detail: [0.7, 0.8], knob: [0.78, 0.86], sign: [0.86, 1] } as const;

const fill = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

/** 0..1 inside a window of the build. */
function useWindow(t: MotionValue<number>, a: number, b: number) {
  return useTransform(t, [a, b], [0, 1], { clamp: true });
}

/** A piece that pops in: drops a little, overshoots, settles. */
function usePop(t: MotionValue<number>, a: number, b: number) {
  const w = useWindow(t, a, b);
  return {
    scale: useTransform(w, [0, 0.7, 1], [0, 1.18, 1]),
    y: useTransform(w, [0, 1], [-18, 0]),
    opacity: useTransform(w, [0, 0.15], [0, 1]),
  };
}

const STONES: { x: number; y: number; w: number; h: number; a: number }[] = (() => {
  const s: { x: number; y: number; w: number; h: number; a: number }[] = [];
  const ys = [408, 368, 324, 282, 238, 196];
  // laid bottom-up, like a real arch: both sides, then over the top
  ys.forEach((y, i) => {
    const wob = i % 2 ? 4 : -3;
    s.push({ x: 34 + wob, y, w: 58, h: 42, a: 0 });
    s.push({ x: 266 - wob, y, w: 58, h: 42, a: 0 });
  });
  const arch: typeof s = [];
  for (let k = 0; k <= 8; k++) {
    const deg = 180 - k * 22.5;
    const t = (deg * Math.PI) / 180;
    arch.push({ x: 150 + 116 * Math.cos(t), y: CY - 116 * Math.sin(t), w: 56, h: 46, a: 90 - deg });
  }
  // meet in the middle: alternate from each end so the keystone lands last
  const order = [0, 8, 1, 7, 2, 6, 3, 5, 4];
  order.forEach((k) => s.push(arch[k]));
  return s;
})();

function Stone({ s, i, t, c }: { s: (typeof STONES)[number]; i: number; t: MotionValue<number>; c: string }) {
  const [a, b] = PHASE.stones;
  const step = (b - a) / STONES.length;
  const pop = usePop(t, a + i * step, a + i * step + step * 3);
  return (
    <g transform={`rotate(${s.a} ${s.x} ${s.y})`}>
      <motion.rect
        x={s.x - s.w / 2}
        y={s.y - s.h / 2}
        width={s.w}
        height={s.h}
        rx={17}
        fill={c}
        stroke={INK}
        strokeWidth={4}
        style={{ ...fill, ...pop }}
      />
    </g>
  );
}

function Tufts({ t }: { t: MotionValue<number> }) {
  const w = useWindow(t, PHASE.ground[0] + 0.04, PHASE.ground[1]);
  const scaleY = useTransform(w, [0, 0.7, 1], [0, 1.25, 1]);
  const tuft = (x: number, flip = 1) =>
    `M${x} 462 l${4 * flip} -30 l${6 * flip} 20 l${5 * flip} -34 l${7 * flip} 28 l${5 * flip} -22 l${6 * flip} 26 l${4 * flip} -14 l${3 * flip} 26 Z`;
  return (
    <motion.g fill={INK} style={{ scaleY, transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
      <path d={tuft(4)} />
      <path d={tuft(296, -1)} />
      <path d={tuft(52)} opacity={0.85} />
      <path d={tuft(248, -1)} opacity={0.85} />
    </motion.g>
  );
}

/** The frame: stones, steps, grass and the dark room behind the door. */
export function DoorFrame({ look, t, children }: { look: DoorLook; t: MotionValue<number>; children?: React.ReactNode }) {
  const steps = usePop(t, PHASE.ground[0], PHASE.ground[0] + 0.08);
  const room = useWindow(t, PHASE.stones[1] - 0.05, PHASE.ground[0]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      {/* the room behind the door fades in once the arch is up */}
      <motion.path d={LEAF} fill="#1d0f2a" stroke={INK} strokeWidth={4} style={{ opacity: room }} />
      <motion.g style={{ opacity: room }}>{children}</motion.g>
      {STONES.map((s, i) => (
        <Stone key={i} s={s} i={i} t={t} c={look.stone} />
      ))}
      <motion.g style={{ ...fill, ...steps }}>
        <rect x={70} y={FLOOR} width={160} height={16} rx={3} fill={look.stoneHi} stroke={INK} strokeWidth={4} />
        <rect x={52} y={FLOOR + 16} width={196} height={16} rx={3} fill={look.stone} stroke={INK} strokeWidth={4} />
      </motion.g>
      <Tufts t={t} />
    </svg>
  );
}

function Plank({ x0, x1, i, t, look }: { x0: number; x1: number; i: number; t: MotionValue<number>; look: DoorLook }) {
  const [a, b] = PHASE.leaf;
  const step = (b - a) / 4;
  const w = useWindow(t, a + i * step * 0.8, a + i * step * 0.8 + step * 1.6);
  // planks rise from the floor into place
  const y = useTransform(w, [0, 0.75, 1], [FLOOR - archY(x0), -6, 0]);
  const opacity = useTransform(w, [0, 0.1], [0, 1]);
  return (
    <motion.g style={{ y, opacity }}>
      <rect x={x0} y={0} width={x1 - x0} height={FLOOR} fill={look.leaf} />
      <rect x={x1 - 7} y={0} width={7} height={FLOOR} fill={look.leafShade} opacity={0.35} />
    </motion.g>
  );
}

/** The door leaf alone, on the same canvas so it lines up with the frame. */
export function DoorLeaf({ look, t }: { look: DoorLook; t: MotionValue<number> }) {
  const edges = [L, 106, 150, 194, R];
  const outline = useWindow(t, PHASE.leaf[1] - 0.06, PHASE.leaf[1]);
  const detail = usePop(t, PHASE.detail[0], PHASE.detail[1]);
  const knob = usePop(t, PHASE.knob[0], PHASE.knob[1]);
  const id = `leafclip-${look.detail}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id={id}>
          <path d={LEAF} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {edges.slice(0, -1).map((x0, i) => (
          <Plank key={x0} x0={x0} x1={edges[i + 1]} i={i} t={t} look={look} />
        ))}
      </g>
      {/* outline and seams draw on once the planks are in */}
      <motion.g style={{ opacity: outline }}>
        <path d={LEAF} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        {[106, 150, 194].map((x) => (
          <line key={x} x1={x} y1={archY(x) + 2} x2={x} y2={FLOOR - 2} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        ))}
      </motion.g>
      <motion.g style={{ ...fill, ...knob }}>
        <circle cx={216} cy={300} r={9} fill={look.stoneHi} stroke={INK} strokeWidth={4} />
      </motion.g>
      <motion.g style={{ ...fill, ...detail }}>
        {look.detail === 'porthole' && (
          <g>
            <circle cx={150} cy={190} r={30} fill="#BFE6FF" stroke={INK} strokeWidth={4} />
            <path d="M131 182 q8 -12 22 -10" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        )}
        {look.detail === 'heart' && (
          <path d="M150 214 C 118 192, 126 160, 150 176 C 174 160, 182 192, 150 214 Z" fill="#FF6FA6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        )}
        {look.detail === 'gear' && (
          <g transform="translate(150 192)">
            {Array.from({ length: 8 }, (_, k) => (
              <rect key={k} x={-6} y={-30} width={12} height={14} rx={3} fill={look.stoneHi} stroke={INK} strokeWidth={3.5} transform={`rotate(${k * 45})`} />
            ))}
            <circle r={20} fill={look.stoneHi} stroke={INK} strokeWidth={4} />
            <circle r={7} fill={look.leaf} stroke={INK} strokeWidth={3.5} />
          </g>
        )}
      </motion.g>
    </svg>
  );
}

// Fraction of the canvas where the hinge sits, for transform-origin.
export const HINGE_X = `${(L / W) * 100}%`;
// Where the doorway sits on the canvas, for placing things inside it.
export const DOORWAY = { left: `${(L / W) * 100}%`, right: `${100 - (R / W) * 100}%`, top: `${((CY - RAD) / H) * 100}%`, bottom: `${100 - (FLOOR / H) * 100}%` };
