import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WorksGrid from '@/components/WorksGrid';
import TextReveal from '@/components/TextReveal';
import { ServicesSection } from '@/components/ServicesSection';
import Process from '@/components/Process';
import Skills from '@/components/Skills';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Scene from '@/components/Scene';
import StickerToss from '@/components/StickerToss';

export default function Home() {
  return (
    <main id="top" className="bg-bg min-h-screen selection:bg-accent/30">
      <Navbar />
      <div id="main" />
      <Hero />
      {/* The page plays like a film: full-bleed shots, no frames. Each section's
          content rises in from a slight zoom, then pushes back and fades as the
          next shot slides up over it. */}
      <div data-dim style={{ ['--dim-delay' as string]: '0.4s' }} className="relative z-10">
        <StickerToss />
        <Scene><WorksGrid /></Scene>
        <Scene><TextReveal /></Scene>
        <Scene><ServicesSection /></Scene>
        <Scene className="bg-surface"><Process /></Scene>
        <Scene><Skills /></Scene>
        <Scene><About /></Scene>
        <Scene><Contact /></Scene>
        <Scene><Footer /></Scene>
      </div>
    </main>
  );
}
