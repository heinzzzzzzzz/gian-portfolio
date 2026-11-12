import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WorksGrid from '@/components/WorksGrid';
import { ServicesSection } from '@/components/ServicesSection';
import Skills from '@/components/Skills';
import TextReveal from '@/components/TextReveal';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main id="top" className="bg-bg min-h-screen selection:bg-accent/30">
      <Navbar />
      <Hero />
      {/* Everything below slides over the pinned hero like the next slide in a deck */}
      <div className="relative z-10 bg-bg">
        <WorksGrid />
        <ServicesSection />
        <Skills />
        <TextReveal />
        <About />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
