'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-[100] bg-[#0E1118] flex items-center justify-center pointer-events-none"
        initial={{ height: '100vh', bottom: 0 }}
        animate={{ height: '0vh' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Optional: Add a small logo or loading line here if needed */}
        <div className="w-full h-px bg-teal/30 absolute bottom-0"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
