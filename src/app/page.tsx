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

export default function Home() {
  return (
    <main id="top" className="bg-bg min-h-screen selection:bg-accent/30">
      <Navbar />
      <div id="main" />
      <Hero />
      {/* Everything below slides over the pinned hero like the next slide in a deck */}
      <div className="relative z-10 bg-bg">
        <WorksGrid />
        <TextReveal />
        <ServicesSection />
        <Process />
        <Skills />
        <About />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
