'use client';

export default function Footer() {
  return (
    <footer className="bg-bg text-ink relative overflow-hidden min-h-[50vh] flex flex-col justify-end pt-24 pb-8 px-6 md:px-12 border-t border-faint/20">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden translate-y-12">
        <h1 className="text-[15vw] leading-none font-head font-black opacity-5 whitespace-nowrap text-ink">
          GIAN BIGAY
        </h1>
      </div>
      
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 mt-auto">
        <p className="text-sm text-mute">
          © {new Date().getFullYear()} Gian Bigay. All rights reserved.
        </p>
        <p className="text-sm text-mute flex items-center gap-2">
          Designed & engineered for <span className="text-teal font-medium">automation</span>
        </p>
        <div className="flex gap-6 text-sm font-medium">
          <a href="#about" className="hover:text-cyan transition-colors">About</a>
          <a href="#works" className="hover:text-cyan transition-colors">Works</a>
          <a href="#services" className="hover:text-cyan transition-colors">Services</a>
          <a href="#contact" className="hover:text-cyan transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
