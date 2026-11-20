'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { switchTheme, useTheme } from '@/lib/theme';

// A little pendant lamp hanging into the nav from the top of the screen.
// Light mode: the bulb glows warm and throws a soft cone of light (cute).
// Night: the bulb is off and the shade is a hot-pink neon outline.
// Click it: the lamp swings and a velvet curtain swaps the whole site's mood.
export default function LampToggle({ className = '' }: { className?: string }) {
  const theme = useTheme();
  const on = theme === 'light';
  const swing = useAnimationControls();

  const click = () => {
    swing.start({ rotate: [0, -16, 11, -6, 3, 0], transition: { duration: 1.1, ease: 'easeOut' } });
    switchTheme();
  };

  return (
    <button
      type="button"
      onClick={click}
      aria-label={on ? 'Turn the lights off (dark mode)' : 'Turn the lights on (light mode)'}
      aria-pressed={!on}
      title={on ? 'Lights off' : 'Lights on'}
      className={`group relative flex h-11 w-11 items-start justify-center ${className}`}
    >
      <motion.span
        animate={swing}
        style={{ transformOrigin: '50% -28px' }}
        className="relative block h-11 w-9 transition-transform duration-300 group-hover:rotate-[4deg]"
        data-light
      >
        <svg viewBox="0 0 36 44" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {/* cord up to the top edge of the screen */}
          <line x1="18" y1="-40" x2="18" y2="12" stroke={on ? '#474329' : '#ff79b8'} strokeWidth="1.5" opacity={on ? 0.7 : 0.6} />
          {/* warm cone of light under the shade */}
          {on && <path d="M9 24 L-6 52 L42 52 L27 24 Z" fill="url(#lamp-cone)" className="pointer-events-none" />}
          {/* glow around the bulb */}
          {on && <circle cx="18" cy="25" r="11" fill="url(#lamp-halo)" />}
          <circle
            cx="18"
            cy="25"
            r="5.2"
            fill={on ? '#FFD98A' : '#3a1a34'}
            stroke={on ? '#FFC45C' : '#9a4a86'}
            strokeWidth="1"
          />
          {/* shade */}
          <path
            d="M6 25 C 7 15, 12 11, 18 11 C 24 11, 29 15, 30 25 Z"
            fill={on ? '#474329' : '#1c0b19'}
            stroke={on ? '#474329' : '#ff79b8'}
            strokeWidth="1.6"
            strokeLinejoin="round"
            style={on ? undefined : { filter: 'drop-shadow(0 0 3px #ff79b8) drop-shadow(0 0 8px rgb(255 95 168 / 0.7))' }}
          />
          <rect x="15.5" y="8.5" width="5" height="3.5" rx="1" fill={on ? '#474329' : '#ff79b8'} />
          {/* a cute little blush mark on the shade in light mode */}
          {on && <circle cx="12.5" cy="19" r="1.4" fill="#FF6FA6" opacity="0.9" />}
          <defs>
            <radialGradient id="lamp-halo">
              <stop offset="0%" stopColor="#FFE3A3" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFE3A3" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lamp-cone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE7B0" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFE7B0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.span>
    </button>
  );
}
