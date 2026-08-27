'use client';

import { motion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Project } from '@/lib/projects';

import Image from 'next/image';

export default function CursorFollower({
  activeProject,
  mousePosition
}: {
  activeProject: Project | null;
  mousePosition: { x: number; y: number };
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mouseX = useSpring(mousePosition.x, { stiffness: 500, damping: 28 });
  const mouseY = useSpring(mousePosition.y, { stiffness: 500, damping: 28 });

  useEffect(() => {
    mouseX.set(mousePosition.x);
    mouseY.set(mousePosition.y);
  }, [mousePosition, mouseX, mouseY]);

  if (!isDesktop) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 pointer-events-none w-80 h-56 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-card"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: activeProject ? 1 : 0, 
        scale: activeProject ? 1 : 0.8 
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {activeProject && (
        <>
          <div className="absolute inset-0 bg-neutral-900">
            {activeProject.image ? (
              <Image 
                src={activeProject.image}
                alt={activeProject.title}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover opacity-60"
              />
            ) : (
              <div className="w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px', backgroundColor: activeProject.color }}></div>
            )}
          </div>
          <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <p className="text-xs uppercase tracking-[0.2em] text-white/80 mb-2">
              {activeProject.category}
            </p>
            <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md">
              {activeProject.title}
            </h3>
          </div>
        </>
      )}
    </motion.div>
  );
}
