'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AiOrb from './AiOrb';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const stack = [
    'GoHighLevel', 'n8n', 'Make', 'OpenAI', 'Claude', 
    'Airtable', 'Google Sheets', 'WordPress', 'Zapier', 'Notion'
  ];

  return (
    <section className="relative w-full overflow-hidden bg-bg">
      {/* JARVIS Orbiting Hero (Scroll-driven) */}
      <div ref={containerRef} className="relative h-[300vh] w-full bg-bg">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          
          {/* Zoom Wrapper (Smooth scaling on scroll) */}
          <motion.div 
            style={{ 
              scale: useTransform(scrollYProgress, [0, 0.5], [1, 6]),
              opacity: useTransform(scrollYProgress, [0.3, 0.5], [1, 0])
            }}
            className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none origin-center"
          >
            {/* Continuous Rotation Wrapper */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Top */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[10%] md:top-[10%] w-[40vw] md:w-[15vw] h-[30vh] md:h-[25vh] rounded-xl overflow-hidden shadow-2xl brightness-[0.5] saturate-[0.8]" 
              >
                <Image src="/wf-unified.jpg" alt="System" fill className="object-cover" />
              </motion.div>
              
              {/* Right */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute right-[-10%] md:right-[15%] top-[20%] md:top-[25%] w-[35vw] md:w-[18vw] h-[25vh] md:h-[30vh] rounded-xl overflow-hidden shadow-2xl brightness-[0.5] saturate-[0.8]" 
              >
                <Image src="/wf-tactical.jpg" alt="System" fill className="object-cover" />
              </motion.div>

              {/* Bottom Right */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-5%] md:bottom-[10%] right-[10%] md:right-[30%] w-[35vw] md:w-[20vw] h-[20vh] md:h-[25vh] rounded-xl overflow-hidden shadow-2xl brightness-[0.5] saturate-[0.8]" 
              >
                <Image src="/wf-newsletter.jpg" alt="System" fill className="object-cover" />
              </motion.div>
              
              {/* Bottom Left */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[5%] md:bottom-[15%] left-[0%] md:left-[20%] w-[40vw] md:w-[22vw] h-[25vh] md:h-[30vh] rounded-xl overflow-hidden shadow-2xl brightness-[0.5] saturate-[0.8]" 
              >
                <Image src="/out-care-blog.jpg" alt="System" fill className="object-cover" />
              </motion.div>
              
              {/* Left */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute top-[30%] md:top-[40%] left-[-15%] md:left-[10%] w-[30vw] md:w-[16vw] h-[30vh] md:h-[35vh] rounded-xl overflow-hidden shadow-2xl brightness-[0.5] saturate-[0.8]" 
              >
                <Image src="/wf-callsummary.jpg" alt="System" fill className="object-cover" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Center J.A.R.V.I.S Orb (Fades out, no laggy scaling) */}
          <motion.div 
            className="z-10 absolute inset-0 flex items-center justify-center flex-col pointer-events-auto"
            style={{ 
              opacity: useTransform(scrollYProgress, [0.1, 0.4], [1, 0])
            }}
          >
            <Link href="/ai-link" className="block outline-none cursor-pointer">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <AiOrb scale={1.2} interactive={true} />
              </motion.div>
            </Link>
            <div className="absolute top-[65%] text-center w-full">
               <span className="font-mono text-xs text-teal uppercase tracking-widest animate-pulse drop-shadow-md">Click to initialize</span>
            </div>
          </motion.div>
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
