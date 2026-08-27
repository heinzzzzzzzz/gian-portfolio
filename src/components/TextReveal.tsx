'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const text = "I don't just automate tasks. I architect self-running systems across content, distribution, and CRM - so you never touch a keyboard.";
const highlightWords = ["self-running", "systems", "never", "touch", "a", "keyboard."];

export default function TextReveal() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.7", "start 0.2"]
  });

  const words = text.split(" ");

  return (
    <section ref={container} className="min-h-screen flex items-center justify-center bg-bg px-8 py-24">
      <p className="max-w-4xl text-3xl md:text-5xl lg:text-6xl font-bold text-ink leading-tight flex flex-wrap gap-x-3 gap-y-4 justify-center text-center">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + (1 / words.length);
          const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
          
          const isHighlight = highlightWords.includes(word.replace(/[,.—]/g, ''));
          
          return (
            <motion.span 
              key={i} 
              style={{ opacity }}
              className={isHighlight ? "text-teal" : "text-ink"}
            >
              {word}
            </motion.span>
          );
        })}
      </p>
    </section>
  );
}
