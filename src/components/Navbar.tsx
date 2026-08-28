'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { name: 'My Work', href: '#work' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Handle glassmorphism background
      setIsScrolled(currentScrollY > 50);

      // Handle hide/show on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
        setIsMobileMenuOpen(false); // Close mobile menu on scroll down
      } else {
        setIsHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isHidden ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
          isScrolled
            ? 'bg-[#06070A]/80 backdrop-blur-xl border-b border-[#5C6883]/40'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="#top" className="flex items-center gap-3 z-50 relative">
            {/* Logo Image */}
            <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[#5C6883]/50">
              <Image 
                src="/profile.jpg" 
                alt="Gian Benedict Bigay" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-sans text-sm font-bold tracking-tight text-[#F2F5FB]">
              Gian Portfolio
            </span>
          </Link>

          {/* Center: Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-medium text-sm uppercase tracking-wide text-[#9BA7BF] hover:text-[#F2F5FB] transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: CTA (Desktop) */}
          <div className="hidden lg:flex items-center">
            <Link
              href="#contact"
              className="px-6 py-2 text-sm font-medium italic uppercase tracking-wide border border-[#F2F5FB]/30 text-[#F2F5FB] hover:bg-[#F2F5FB] hover:text-[#06070A] transition-all duration-300"
            >
              Let's talk
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden z-50 relative p-2 text-[#F2F5FB]"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#06070A]/95 backdrop-blur-2xl flex flex-col justify-center px-6 lg:hidden"
          >
            <nav className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-medium text-xl uppercase tracking-widest text-[#9BA7BF] hover:text-[#F2F5FB] transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-8 px-8 py-3 text-lg font-medium italic uppercase tracking-wide border border-[#F2F5FB]/30 text-[#F2F5FB] hover:bg-[#F2F5FB] hover:text-[#06070A] transition-all duration-300"
              >
                Let's talk
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
