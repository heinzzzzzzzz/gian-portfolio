'use client';

import { motion } from 'framer-motion';
import { Mail, User } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="bg-bg py-24 px-6 md:px-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto bg-surface border border-faint rounded-3xl p-12 md:p-24 text-center space-y-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent pointer-events-none" />
        
        <h2 className="text-4xl md:text-6xl font-black font-head text-ink relative z-10">
          Have a process worth automating?
        </h2>
        <p className="text-xl text-mute max-w-2xl mx-auto relative z-10">
          Let's talk about how we can build a self-running system for your business.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 relative z-10">
          <a href="mailto:gianbenedict.bigay07@gmail.com" className="flex items-center gap-2 px-8 py-4 bg-teal text-bg rounded-full font-bold hover:bg-cyan transition-colors w-full sm:w-auto justify-center">
            <Mail size={20} />
            <span>Email Me</span>
          </a>
          <a href="https://www.linkedin.com/in/gian-benedict-6043193a4/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-8 py-4 bg-card border border-faint text-ink rounded-full font-bold hover:border-cyan hover:text-cyan transition-colors w-full sm:w-auto justify-center">
            <User size={20} />
            <span>LinkedIn</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
