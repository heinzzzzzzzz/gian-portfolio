'use client';

import { ScrollStackCard } from './ScrollStackCard';

const services = [
  {
    index: 1,
    label: 'Automation',
    title: 'CONTENT AUTOMATION',
    number: '225',
    suffix: '+',
    desc: 'End-to-end pipelines that research, draft, design and publish across platforms, with a human approval step only where it matters.',
    bgColor: 'bg-card',
    textColor: 'text-ink',
  },
  {
    index: 2,
    label: 'Automation',
    title: 'DISTRIBUTION SYSTEMS',
    number: '368',
    suffix: '+',
    desc: 'Scheduling engines that route every approved post to the right channel at the right slot, respecting rate limits.',
    bgColor: 'bg-accent',
    textColor: 'text-bg',
  },
  {
    index: 3,
    label: 'Automation',
    title: 'CRM & REPORTING',
    number: '8',
    suffix: '',
    desc: 'GoHighLevel syncs, Airtable approval boards and daily analytics that land in a sheet before anyone opens a laptop.',
    bgColor: 'bg-olive',
    textColor: 'text-bg',
  },
  {
    index: 4,
    label: 'Apps & web',
    title: 'APPS & WEBSITES',
    number: '3',
    suffix: '',
    desc: 'An offline-first Flutter app, a university booking system and a PHP e-commerce store, built with the same engineering habits as the pipelines.',
    bgColor: 'bg-ink',
    textColor: 'text-bg',
  },
];

export function ServicesSection() {
  return (
    <section className="relative w-full">
      <div className="h-screen flex items-center justify-center bg-surface text-ink sticky top-0 z-0 border-t border-line/60">
        <div className="text-center px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-5">What I do</p>
          <h2 className="headline text-3xl md:text-5xl lg:text-6xl font-extrabold">
            So what do I build, <span className="serif-italic text-accent font-normal">exactly?</span>
          </h2>
        </div>
      </div>

      <div className="relative z-10">
        {services.map((service) => (
          <ScrollStackCard key={service.index} {...service} />
        ))}
      </div>
    </section>
  );
}
