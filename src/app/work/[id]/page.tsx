import { projects } from '@/lib/projects';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function generateStaticParams() {
  return projects.map((p) => ({
    id: p.id,
  }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = projects.find((p) => p.id === resolvedParams.id);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-bg text-ink selection:bg-teal/30 pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <Link href="/#work" className="inline-flex items-center gap-2 text-mute hover:text-teal transition-colors text-sm font-medium mb-8">
          <ArrowLeft className="w-4 h-4" />
          BACK TO WORK
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16">
          
          {/* Left Column: Details */}
          <div>
            <p className="font-mono text-xs tracking-widest text-teal uppercase mb-4">{project.category}</p>
            <h1 className="font-head text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.9] mb-8">
              {project.title}
            </h1>
            
            <div className="mb-12">
              <p className="text-lg text-mute leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="mb-12">
              <h3 className="font-mono text-xs tracking-widest text-faint mb-4 uppercase">Workflow Pipeline</h3>
              <div className="flex flex-wrap items-center gap-2">
                {project.flow.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm font-medium text-ink">
                      {step}
                    </span>
                    {idx < project.flow.length - 1 && (
                      <span className="text-teal font-mono text-xs">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="font-mono text-xs tracking-widest text-faint mb-4 uppercase">Outcome</h3>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 border-l-2 border-l-teal">
                <p className="text-ink font-medium leading-relaxed">
                  {project.outcome}
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="font-mono text-xs tracking-widest text-faint mb-4 uppercase">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span key={tech} className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-mute uppercase tracking-wider">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Gallery */}
          <div className="flex flex-col gap-8">
            {project.gallery.map((img, idx) => (
              <div key={idx} className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-card group">
                <Image 
                  src={img} 
                  alt={`${project.title} screenshot ${idx + 1}`} 
                  width={1200} 
                  height={800} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                  quality={90}
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
