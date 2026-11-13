'use client';

import { motion } from 'framer-motion';

interface ScrollStackCardProps {
  index: number;
  label: string;
  title: string;
  number: string;
  suffix: string;
  desc: string;
  bgColor: string;
  textColor: string;
}

export function ScrollStackCard({ index, label, title, number, suffix, desc, bgColor, textColor }: ScrollStackCardProps) {
  return (
    <div
      className={`sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-center overflow-hidden ${bgColor} ${textColor} p-8 lg:p-24`}
    >
      {/* Mobile */}
      <div className="flex flex-col lg:hidden w-full h-full justify-between py-12 relative z-10">
        <div className="flex justify-between font-mono text-xs uppercase tracking-widest opacity-70">
          <span>{label}</span>
          <span>0{index}</span>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="headline text-4xl md:text-6xl font-extrabold uppercase leading-none">{title}</h2>
          <p className="text-lg opacity-80">{desc}</p>
        </div>
        <div className="flex items-end gap-2">
          <span className="headline text-7xl font-extrabold">{number}</span>
          <span className="text-3xl font-bold mb-2">{suffix}</span>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex w-full h-full justify-between items-center relative z-10">
        <div className="flex flex-col h-full justify-between w-1/3 max-w-sm py-12">
          <div className="border border-current rounded-full px-4 py-2 w-max font-mono text-xs tracking-widest opacity-80">
            0{index}
          </div>
          <p className="text-2xl leading-snug opacity-90">{desc}</p>
        </div>
        <div className="flex flex-col items-end text-right w-2/3 h-full justify-center">
          <span className="font-mono text-xs tracking-[0.3em] opacity-60 mb-4 uppercase">{label}</span>
          <h2 className="headline text-7xl xl:text-8xl 2xl:text-9xl font-extrabold uppercase leading-none mb-12">{title}</h2>
          <div className="flex items-end gap-2">
            <span className="headline text-8xl font-extrabold">{number}</span>
            <span className="text-5xl font-bold mb-2">{suffix}</span>
          </div>
        </div>
      </div>

      {/* Abstract background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-20 pointer-events-none">
        <motion.div
          className="aspect-[3/4] w-64 md:w-80 lg:w-[32rem] bg-gradient-to-tr from-black/40 to-white/10 rounded-3xl shadow-2xl border border-white/20"
          initial={{ rotate: 12, scale: 0.9 }}
          whileInView={{ rotate: index % 2 === 0 ? -12 : 12, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
