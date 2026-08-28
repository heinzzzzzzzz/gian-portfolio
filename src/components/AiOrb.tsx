'use client';

import { motion } from 'framer-motion';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

interface AiOrbProps {
  isTalking?: boolean;
  isThinking?: boolean;
  audioLevel?: number; // 0 to 1 for live Vapi audio waveform
  scale?: number;
  interactive?: boolean;
  text?: string;
}

export default function AiOrb({ 
  isTalking = false, 
  isThinking = false, 
  audioLevel = 0,
  scale = 1, 
  interactive = false,
  text = "Gian AI\nClone"
}: AiOrbProps) {
  
  // Base duration speeds up if thinking
  const rotateSpeed = isThinking ? 5 : 20;

  // If we have live audio level (from Vapi), use it to scale the core.
  // Otherwise, if just 'isTalking', use a generic pulse.
  const coreScale = audioLevel > 0 
    ? 1 + (audioLevel * 0.5) 
    : isTalking 
      ? [1, 1.1, 1] 
      : 1;

  return (
    <div 
      className={`relative flex items-center justify-center ${interactive ? 'cursor-pointer hover:scale-105 transition-transform duration-500' : ''}`} 
      style={{ width: 300 * scale, height: 300 * scale }}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-[-20%] bg-teal/10 blur-[50px] rounded-full pointer-events-none" />

      {/* Outer Dashed Tracker Ring */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: rotateSpeed * 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[0%] rounded-full border border-teal/30"
        style={{ borderStyle: 'dashed', borderWidth: '2px' }}
      />

      {/* Outer Solid Ring with gaps */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: rotateSpeed * 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[8%] rounded-full border border-cyan/40"
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%, 25% 25%, 75% 75%)' }}
      />

      {/* Middle Tech Ring (Thick) */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: rotateSpeed, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[15%] rounded-full border-[8px] border-teal/20"
      />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: rotateSpeed, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[15%] rounded-full border-[8px] border-cyan/60"
        style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
      />

      {/* Inner Fast Spinners */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: rotateSpeed * 0.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[25%] rounded-full border-[3px] border-teal/40"
        style={{ borderStyle: 'dotted' }}
      />

      {/* The Core Orb */}
      <motion.div 
        animate={{ scale: coreScale }}
        transition={typeof coreScale === 'number' ? { duration: 0.1 } : { duration: 0.5, repeat: Infinity }}
        className="absolute inset-[32%] rounded-full bg-gradient-to-br from-teal/20 to-cyan/10 backdrop-blur-md flex flex-col items-center justify-center border border-cyan/50 shadow-[0_0_30px_rgba(45,212,191,0.4),inset_0_0_20px_rgba(45,212,191,0.3)] overflow-hidden"
      >
        {/* Core Inner sweep */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(45,212,191,0.3)_360deg)]"
        />

        <span 
          className={`relative z-10 text-ink text-center tracking-[0.1em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${orbitron.className}`} 
          style={{ 
            fontSize: (text.length > 10 ? 11 : 16) * scale, 
            whiteSpace: 'pre-line', 
            fontWeight: 900,
            lineHeight: 1.2
          }}
        >
          {text}
        </span>
      </motion.div>
    </div>
  );
}
