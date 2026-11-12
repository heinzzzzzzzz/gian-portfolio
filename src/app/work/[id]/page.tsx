import { projects, CATEGORY_LABEL } from '@/lib/projects';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return {};
  return {
    title: `${project.title} — Gian Benedict Bigay`,
    description: project.tagline,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.id === project.id);
  const next = projects[(idx + 1) % projects.length];
  const phone = project.galleryLayout === 'phone';

  return (
    <main className="min-h-screen bg-bg text-ink selection:bg-accent/30 pt-28 md:pt-32 pb-20 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to work
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16">
          {/* Details */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">
                {CATEGORY_LABEL[project.category]}
              </span>
              <span className="text-faint">{project.kind}</span>
              <span className="text-faint">· {project.year}</span>
            </div>
            <h1 className="headline mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[0.95]">{project.title}</h1>
            <p className="mt-5 text-lg text-mute leading-relaxed">{project.tagline}</p>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg hover:bg-olive transition-colors"
              >
                Visit the live site
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}

            <div className="mt-10">
              <h3 className="font-mono text-[11px] tracking-widest text-faint mb-4 uppercase">The build</h3>
              <p className="text-mute leading-relaxed">{project.description}</p>
            </div>

            {project.highlights && (
              <div className="mt-10">
                <h3 className="font-mono text-[11px] tracking-widest text-faint mb-4 uppercase">Highlights</h3>
                <ul className="space-y-3">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-ink">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10">
              <h3 className="font-mono text-[11px] tracking-widest text-faint mb-4 uppercase">Flow</h3>
              <div className="flex flex-wrap items-center gap-2">
                {project.flow.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-md bg-surface border border-line text-sm font-medium text-ink">{step}</span>
                    {i < project.flow.length - 1 && <span className="text-accent font-mono text-xs">→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-mono text-[11px] tracking-widest text-faint mb-4 uppercase">Outcome</h3>
              <div className="p-5 rounded-xl bg-surface border border-line border-l-2 border-l-accent">
                <p className="text-ink font-medium leading-relaxed">{project.outcome}</p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-mono text-[11px] tracking-widest text-faint mb-3 uppercase">Role</h3>
                <p className="text-sm text-ink">{project.role}</p>
              </div>
              <div>
                <h3 className="font-mono text-[11px] tracking-widest text-faint mb-3 uppercase">Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-md border border-line text-[11px] text-mute">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className={phone ? 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 self-start' : 'flex flex-col gap-6'}>
            {project.gallery.map((img, i) => (
              <div
                key={img}
                className={`relative overflow-hidden border border-line bg-card group ${
                  phone ? 'rounded-[1.6rem] aspect-[9/20]' : 'rounded-2xl'
                }`}
              >
                {phone ? (
                  <Image
                    src={img}
                    alt={`${project.title} screen ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src={img}
                    alt={`${project.title} screenshot ${i + 1}`}
                    width={1440}
                    height={900}
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    quality={88}
                    priority={i === 0}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Next */}
        <div className="mt-24 border-t border-line/60 pt-10 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">Next build</span>
          <Link href={`/work/${next.id}`} className="group flex items-center gap-3 text-right">
            <span className="headline font-bold text-xl md:text-3xl text-ink group-hover:text-accent transition-colors">{next.title}</span>
            <ArrowUpRight className="w-6 h-6 text-faint group-hover:text-accent transition-colors" />
          </Link>
        </div>
      </div>
    </main>
  );
}
