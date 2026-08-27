'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { projects, Project } from '@/lib/projects';
import CursorFollower from './CursorFollower';
import Link from 'next/link';

export default function WorksList() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <section 
      id="work" 
      className="bg-[#06070A] min-h-screen px-6 md:px-12 py-24 text-[#F2F5FB] relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActiveProject(null)}
    >
      <CursorFollower activeProject={activeProject} mousePosition={mousePosition} />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12"
      >
        <div className="flex items-center w-full">
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#F2F5FB] flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
            SELECTED <span className="text-[#9BA7BF]">WORKS</span>
          </h2>
          <div className="flex-1 h-px bg-[#5C6883]/30 mx-8 hidden md:block"></div>
        </div>
      </motion.div>

      <div className="flex flex-col mt-12 relative z-10">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group border-t border-[#5C6883]/30 last:border-b"
          >
            <Link 
              href={`/work/${project.id}`} 
              className="py-8 lg:py-12 flex flex-col lg:flex-row lg:items-center justify-between w-full"
              onMouseEnter={() => setActiveProject(project)}
              onMouseLeave={() => setActiveProject(null)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-12 transition-transform duration-500 ease-out lg:group-hover:translate-x-4">
                <span className="text-xs text-[#9BA7BF]">
                  {project.number}
                </span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#9BA7BF] group-hover:text-[#F2F5FB] transition-colors duration-300">
                  {project.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-8 mt-4 lg:mt-0 transition-transform duration-500 ease-out lg:group-hover:-translate-x-4">
                <span className="text-xs uppercase tracking-[0.2em] text-[#9BA7BF] group-hover:text-[#F2F5FB] transition-colors duration-300">
                  {project.category}
                </span>
                <div className="hidden lg:flex w-12 h-12 rounded-full border border-[#5C6883]/30 items-center justify-center group-hover:bg-[#F2F5FB] group-hover:text-[#06070A] transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
