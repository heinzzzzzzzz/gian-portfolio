'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

const text = "I don't just automate tasks. I build systems that run themselves, and the apps and sites that go with them.";
const highlightWords = ['systems', 'run', 'themselves,', 'apps', 'sites'];

function Word({ word, start, end, progress }: { word: string; start: number; end: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const isHighlight = highlightWords.includes(word);
  return (
    <motion.span style={{ opacity }} className={isHighlight ? 'text-accent' : 'text-ink'}>
      {word}
    </motion.span>
  );
}

export default function TextReveal() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start 0.75', 'start 0.2'],
  });

  const words = text.split(' ');

  return (
    <section ref={container} className="min-h-[80vh] flex items-center justify-center bg-bg px-8 py-24 border-t border-line/60">
      <p className="headline max-w-5xl text-3xl md:text-5xl lg:text-6xl font-bold leading-tight flex flex-wrap gap-x-3 gap-y-3 justify-center text-center">
        {words.map((word, i) => (
          <Word key={i} word={word} start={i / words.length} end={i / words.length + 1 / words.length} progress={scrollYProgress} />
        ))}
      </p>
    </section>
  );
}
