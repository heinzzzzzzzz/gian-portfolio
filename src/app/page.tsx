import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

import WorksList from '@/components/WorksList';
import { ServicesSection } from '@/components/ServicesSection';
import TextReveal from '@/components/TextReveal';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="bg-bg min-h-screen selection:bg-teal/30 selection:text-teal">
      <Navbar />
      <Hero />
      
      <WorksList />
      <ServicesSection />
      <TextReveal />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
