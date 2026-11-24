import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProjectShelf from '@/components/ProjectShelf';
import Stage3D from '@/components/Stage3D';
import { SystemsChapter, ServicesChapter, ProcessChapter, SkillsChapter, AboutChapter, ContactChapter } from '@/components/Chapters';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main id="top" className="bg-bg min-h-screen selection:bg-accent/30">
      <Navbar />
      <div id="main" />
      <Hero />
      {/* After the hero, the page is one 3D phone story: the Work shelf, then a
          chapter per section where the phone opens an app or becomes an object. */}
      <div className="relative z-10 bg-bg">
        <ProjectShelf />
        <SystemsChapter />
        <ServicesChapter />
        <ProcessChapter />
        <SkillsChapter />
        <AboutChapter />
        <ContactChapter />
        <Footer />
      </div>
      {/* the 3D phone and everything it turns into, fixed over the whole page */}
      <Stage3D />
    </main>
  );
}
