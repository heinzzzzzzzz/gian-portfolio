// Behind the hero at night: soft pink and champagne bokeh drifting slowly,
// and a scatter of twinkling sparkles. Decorative, night-only, and laid out
// from fixed numbers so server and client render the same markup.

const SPARKLES = [
  [36, 6, 10, 0], [34, 68, 7, 1.1], [37, 34, 6, 2.0], [46, 12, 9, 0.6], [57, 64, 6, 1.7],
  [64, 22, 8, 2.6], [72, 82, 7, 0.3], [83, 40, 10, 1.4], [91, 14, 6, 2.2], [95, 66, 8, 0.9],
  [47, 95, 6, 1.9], [39, 90, 7, 2.9], [51, 44, 5, 0.4], [78, 58, 5, 3.0],
] as const;

function Sparkle({ x, y, s, d }: { x: number; y: number; s: number; d: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="twinkle absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: s * 2, height: s * 2, animationDelay: `${d}s` }}
    >
      <path d="M10 0 C 11 7, 13 9, 20 10 C 13 11, 11 13, 10 20 C 9 13, 7 11, 0 10 C 7 9, 9 7, 10 0 Z" fill="#ffe3f0" style={{ filter: 'drop-shadow(0 0 4px rgb(255 95 168 / 0.9))' }} />
    </svg>
  );
}

export default function NightGlam() {
  return (
    <div aria-hidden className="night-only pointer-events-none absolute inset-0 overflow-hidden">
      <div className="drift absolute -top-[25%] -right-[10%] h-[80%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(255_95_168/0.28),transparent)]" />
      <div className="drift absolute top-[35%] -left-[15%] h-[70%] w-[50%] rounded-full bg-[radial-gradient(closest-side,rgb(196_70_170/0.22),transparent)] [animation-delay:-6s]" />
      <div className="drift absolute -bottom-[30%] left-[30%] h-[70%] w-[50%] rounded-full bg-[radial-gradient(closest-side,rgb(255_214_165/0.12),transparent)] [animation-delay:-3s]" />
      {SPARKLES.map(([x, y, s, d], i) => (
        <Sparkle key={i} x={x} y={y} s={s} d={d} />
      ))}
    </div>
  );
}
