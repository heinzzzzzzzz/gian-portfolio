'use client';

import { motion } from 'framer-motion';
import { Download, ArrowUpRight, ArrowDownToLine } from 'lucide-react';
import Link from 'next/link';

const techStack = ['GoHighLevel', 'n8n', 'Make', 'OpenAI', 'Claude', 'Airtable', 'Stripe', 'Twilio'];

export default function About() {
  return (
    <section id="about" className="bg-bg text-ink py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-black font-head">About</h2>
          <p className="mt-6 leading-relaxed text-mute">I turn manual, repetitive marketing and operations work into self-running infrastructure. At <span className="text-ink font-medium">Intention Technology</span>, I designed and operated the content engines, multi-platform distribution, and CRM reporting that kept entire brands publishing daily, without anyone touching a keyboard.</p>
          <p className="mt-4 leading-relaxed text-mute">My toolkit blends visual automation (n8n, GoHighLevel) with LLM orchestration, structured data, and human-in-the-loop approval. The result: pipelines that scale from one post to hundreds while staying on-brand and on-schedule.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#contact" className="group flex items-center gap-2 bg-gradient-to-b from-teal to-[#0FA8B5] text-bg rounded-full px-7 py-3.5 font-semibold hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all">
              Let's build something
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <a href="/assets/resume.pdf" download className="border border-white/10 bg-white/5 backdrop-blur-md text-ink rounded-full px-7 py-3.5 font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              Download resume
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-surface border border-faint rounded-3xl p-8"
        >
          <h3 className="text-xl font-mono text-teal mb-6">stack.json</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {techStack.map((tech) => (
              <div key={tech} className="bg-card border border-faint px-4 py-3 rounded-xl flex items-center justify-center text-sm font-medium text-ink hover:border-teal transition-colors">
                {tech}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
