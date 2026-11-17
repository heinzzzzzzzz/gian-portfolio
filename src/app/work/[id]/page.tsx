import { projects, CATEGORY_LABEL } from '@/lib/projects';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check, CalendarDays, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

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
    <>
    <Navbar />
    <main id="main" className="min-h-screen bg-bg text-ink selection:bg-accent/30 pt-28 md:pt-32 pb-20 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mute hover:text-accent-ink transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to work
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16">
          {/* Details */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent-ink">
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
                      <Check className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" />
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
                    {i < project.flow.length - 1 && <span className="text-accent-ink font-mono text-xs">→</span>}
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
                className={`relative overflow-hidden ring-1 ring-ink/10 bg-card group shadow-[0_24px_60px_-30px_rgba(71,67,41,0.5)] ${
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
                ) : project.frame === 'browser' ? (
                  <div>
                    <div className="flex items-center gap-2 border-b border-ink/10 bg-card px-3 py-2">
                      <span className="flex gap-1.5" aria-hidden>
                        <i className="h-2.5 w-2.5 rounded-full bg-[#ED6A5E]" />
                        <i className="h-2.5 w-2.5 rounded-full bg-[#F5BF4F]" />
                        <i className="h-2.5 w-2.5 rounded-full bg-[#61C554]" />
                      </span>
                      <span className="mx-auto truncate rounded-md bg-bg px-3 py-0.5 text-[11px] text-mute">
                        {project.link ? new URL(project.link).host : 'localhost/vapehub'}
                      </span>
                    </div>
                    <Image
                      src={img}
                      alt={`${project.title} screenshot ${i + 1}`}
                      width={1440}
                      height={900}
                      className="w-full h-auto object-cover"
                      quality={88}
                      priority={i === 0}
                    />
                  </div>
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

        {/* Book */}
        <div className="mt-24 relative overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-bg sm:px-10 md:flex md:items-center md:justify-between md:gap-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,111,166,0.38),transparent)]" />
          <div className="relative">
            <p className="text-[12px] uppercase tracking-[0.28em] text-blush">Want something like this?</p>
            <h2 className="headline mt-3 text-3xl font-extrabold md:text-4xl">Let&apos;s map out your version.</h2>
            <p className="mt-2 max-w-[52ch] text-bg/80">A free 20-minute call. You bring the process, I bring a plan.</p>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3 md:mt-0">
            <Link href="/#book" className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-on-accent hover:bg-accent-deep transition-colors">
              <CalendarDays className="h-4 w-4" /> Book a call
            </Link>
            <Link href={`/ai-link/chat?q=${encodeURIComponent(`Could you build something like ${project.title} for me?`)}`} className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-bg ring-1 ring-bg/30 hover:ring-bg/60 transition-colors">
              <Sparkles className="h-4 w-4" /> Ask my AI
            </Link>
          </div>
        </div>

        {/* Next */}
        <div className="mt-16 border-t border-ink/10 pt-10 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">Next build</span>
          <Link href={`/work/${next.id}`} className="group flex items-center gap-3 text-right">
            <span className="headline font-bold text-xl md:text-3xl text-ink group-hover:text-accent-ink transition-colors">{next.title}</span>
            <ArrowUpRight className="w-6 h-6 text-faint group-hover:text-accent-ink transition-colors" />
          </Link>
        </div>
      </div>
    </main>
    </>
  );
}
