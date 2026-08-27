'use client';

import { ScrollStackCard } from './ScrollStackCard';

const services = [
  {
    index: 1,
    title: 'CONTENT AUTOMATION',
    number: '225',
    suffix: '+',
    desc: 'End-to-end pipelines that research, draft, design, and publish across platforms without manual intervention.',
    bgColor: 'bg-card',
    textColor: 'text-ink'
  },
  {
    index: 2,
    title: 'DISTRIBUTION SYSTEMS',
    number: '6',
    suffix: '',
    desc: 'One-click publish engines that auto-resize, reformat, and schedule for optimal engagement windows per channel.',
    bgColor: 'bg-teal',
    textColor: 'text-bg'
  },
  {
    index: 3,
    title: 'CRM & PIPELINES',
    number: '8',
    suffix: '',
    desc: 'Fully automated lead nurture sequences with AI-personalized follow-ups, appointment booking, and stage management.',
    bgColor: 'bg-amber',
    textColor: 'text-bg'
  },
  {
    index: 4,
    title: 'DATA & REPORTING',
    number: '368',
    suffix: '+',
    desc: 'Automated reporting that pulls metrics, generates AI insights, and delivers formatted reports to stakeholders.',
    bgColor: 'bg-cyan',
    textColor: 'text-bg'
  }
];

export function ServicesSection() {
  return (
    <section className="relative w-full">
      {/* Intro Panel */}
      <div className="h-screen flex items-center justify-center bg-ink text-bg sticky top-0 z-0">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase font-head text-center px-8">
          So what do I automate, exactly?
        </h2>
      </div>
      
      {/* Stacked Cards */}
      <div className="relative z-10">
        {services.map((service) => (
          <ScrollStackCard key={service.index} {...service} />
        ))}
      </div>
    </section>
  );
}
