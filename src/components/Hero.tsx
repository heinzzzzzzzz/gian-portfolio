'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms for headline
  const line1Y = useTransform(scrollYProgress, [0, 1], [-60, 0]);
  const line2Y = useTransform(scrollYProgress, [0, 1], [60, 0]);

  // Parallax transforms for floating elements
  const float1Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const float2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const float3Y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const float4Y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const float5Y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const logoOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Tech stack items
  const stack = [
    'GoHighLevel', 'n8n', 'Make', 'OpenAI', 'Claude', 
    'Airtable', 'Google Sheets', 'WordPress', 'Zapier', 'Notion'
  ];

  return (
    <section className="relative w-full">
      {/* Part 1: Sticky Headline with Floating Elements */}
      <div ref={containerRef} className="relative h-[300vh] bg-bg w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          
          {/* Floating Elements (Behind) */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
            {/* Top-left */}
            <motion.div 
              style={{ y: float1Y }}
              className="absolute top-[10%] left-[5%] w-[35vw] h-[30vh] bg-gradient-to-br from-teal/20 to-cyan/10 rounded-lg" 
            />
            {/* Left */}
            <motion.div 
              style={{ y: float2Y }}
              className="absolute top-[40%] -left-[5%] w-[20vw] h-[45vh] bg-gradient-to-br from-amber/20 to-amber/5 rounded-lg" 
            />
            {/* Right */}
            <motion.div 
              style={{ y: float3Y }}
              className="absolute top-[20%] right-[10%] w-[25vw] h-[25vh] bg-gradient-to-br from-cyan/20 to-teal/10 rounded-lg" 
            />
            {/* Bottom-left */}
            <motion.div 
              style={{ y: float4Y }}
              className="absolute bottom-[10%] left-[20%] w-[20vw] h-[25vh] bg-gradient-to-br from-teal/15 to-cyan/5 rounded-lg" 
            />
            {/* Bottom-right */}
            <motion.div 
              style={{ y: float5Y }}
              className="absolute bottom-[15%] right-[5%] w-[15vw] h-[15vh] bg-gradient-to-br from-amber/15 to-teal/10 rounded-lg" 
            />
          </div>

          {/* Center Headline */}
          <div className="z-10 flex flex-col items-center justify-center font-head font-bold uppercase text-[12vw] md:text-[10vw] text-ink leading-[0.85] text-center w-full">
            <motion.div 
              style={{ 
                y: line1Y, 
                filter: useTransform(scrollYProgress, [0, 0.2], ['blur(0px)', 'blur(8px)']),
                opacity: useTransform(scrollYProgress, [0, 0.4], [1, 0]),
                scale: useTransform(scrollYProgress, [0, 0.4], [1, 0.9])
              }}
            >
              AUTOMATION
            </motion.div>
            <motion.div 
              style={{ 
                y: line2Y,
                filter: useTransform(scrollYProgress, [0, 0.2], ['blur(0px)', 'blur(8px)']),
                opacity: useTransform(scrollYProgress, [0, 0.4], [1, 0]),
                scale: useTransform(scrollYProgress, [0, 0.4], [1, 0.9])
              }}
            >
              ENGINEER
            </motion.div>
          </div>
        </div>
      </div>

      {/* Part 2: Status Badge + Intro Text */}
      <div className="relative z-10 bg-bg px-6 py-20 w-full">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
            </span>
            <span className="font-mono text-xs text-teal">
              8 production systems - running on autopilot
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-head text-4xl sm:text-6xl font-bold text-ink mt-7 leading-tight"
          >
            I build AI systems that
            <br />
            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-teal to-cyan">
              run themselves.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-mute text-base sm:text-lg mt-7 max-w-2xl mx-auto"
          >
            I&apos;m Gian Benedict Bigay, a GHL Automation Expert &amp; AI Automation Specialist. I architect pipelines that research, write, design, schedule, publish, and report across every major platform - with no human in the hot path.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-9"
          >
            <Link 
              href="#work"
              className="group flex items-center gap-2 bg-gradient-to-b from-teal to-[#0FA8B5] text-bg rounded-full px-7 py-3.5 font-semibold hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all"
            >
              Explore my systems
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#contact"
              className="border border-white/10 bg-white/5 backdrop-blur-md text-ink rounded-full px-7 py-3.5 font-medium hover:bg-white/10 transition-colors"
            >
              Get in touch
            </Link>
          </motion.div>
        </div>

        {/* Part 3: Tech Stack Marquee */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 max-w-6xl mx-auto overflow-hidden"
        >
          <div className="text-center font-mono text-[11px] uppercase tracking-[.25em] text-faint mb-8">
            The stack I orchestrate
          </div>
          
          <div 
            className="flex w-full overflow-hidden"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', 
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' 
            }}
          >
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            <div className="flex w-max gap-10 items-center pr-10" style={{ animation: 'marquee 32s linear infinite' }}>
              {/* First set */}
              {stack.map((item, i) => (
                <span key={`stack-1-${i}`} className="opacity-70 font-mono text-sm text-mute whitespace-nowrap">
                  {item}
                </span>
              ))}
              {/* Second set for infinite scroll */}
              {stack.map((item, i) => (
                <span key={`stack-2-${i}`} className="opacity-70 font-mono text-sm text-mute whitespace-nowrap">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
