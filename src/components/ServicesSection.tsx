'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Megaphone, BarChart3, PhoneCall, AppWindow, Sparkles } from 'lucide-react';
import { projects } from '@/lib/projects';

const EASE = [0.16, 1, 0.3, 1] as const;

type Service = {
  id: string;
  icon: typeof Megaphone;
  title: string;
  line: string;
  stack: string[];
  proof: string[]; // project ids that prove it
  ask: string; // question pre-filled for the AI clone
  span: string; // bento placement
  dark?: boolean;
};

const SERVICES: Service[] = [
  {
    id: 'content',
    icon: Megaphone,
    title: 'Content engines',
    line: 'One source feed in. A blog post, native posts for five social platforms and branded images out, approved and scheduled without anyone copy-pasting.',
    stack: ['n8n', 'OpenRouter', 'WordPress', 'Airtable', 'Bannerbear'],
    proof: ['demand-automation-network', 'multi-category-editorial', 'self-healing-content'],
    ask: 'How would you automate my content from one source feed?',
    span: 'lg:col-span-4',
    dark: true,
  },
  {
    id: 'voice',
    icon: PhoneCall,
    title: 'AI voice agents',
    line: 'Receptionists that pick up, check the calendar and book, then log it.',
    stack: ['Vapi', 'n8n', 'Google Calendar'],
    proof: ['ai-voice-receptionist'],
    ask: 'Can you build an AI receptionist for my business?',
    span: 'lg:col-span-2',
  },
  {
    id: 'crm',
    icon: BarChart3,
    title: 'CRM & reporting',
    line: 'GoHighLevel pipelines, call analytics and approval boards that land in a sheet before anyone opens a laptop.',
    stack: ['GoHighLevel', 'n8n', 'Google Sheets'],
    proof: ['crm-call-intelligence', 'intelligent-distribution'],
    ask: 'What can you automate in GoHighLevel for my agency?',
    span: 'lg:col-span-2',
  },
  {
    id: 'apps',
    icon: AppWindow,
    title: 'Apps & websites',
    line: 'When the tool you need does not exist yet: a time-tracking SaaS, an offline-first Flutter app, a booking system, an e-commerce store, this site.',
    stack: ['Flutter', 'Next.js', 'PHP', 'MySQL'],
    proof: ['cackle', 'octi', 'udm-booking-system', 'vapehub'],
    ask: 'Can you build a custom app or website for my team?',
    span: 'lg:col-span-4',
  },
];

const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-24 bg-bg px-5 py-20 md:px-10 md:py-28 border-t border-ink/10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-[0.28em] text-accent-ink">Services</p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: EASE }}
              className="headline mt-4 text-5xl font-extrabold leading-[0.92] text-ink sm:text-6xl md:text-7xl"
            >
              What I <span className="serif-italic font-normal text-accent-ink">build.</span>
            </motion.h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-mute">
            Four kinds of work, each backed by builds you can open. Tap &ldquo;Ask my AI&rdquo; on any of them to get a straight answer about your case.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:gap-5 lg:grid-cols-6">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            const dark = !!s.dark;
            return (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: EASE }}
                className={`${s.span} group relative flex flex-col overflow-hidden rounded-[1.75rem] p-6 md:p-8 ring-1 transition-shadow duration-300 hover:shadow-[0_24px_60px_-28px_rgba(255,111,166,0.75)] ${
                  dark ? 'bg-ink text-bg ring-ink' : 'bg-card text-ink ring-ink/10'
                }`}
              >
                {dark && (
                  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,111,166,0.38),transparent)]" />
                )}
                <div className="relative flex items-start justify-between gap-4">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? 'bg-accent text-on-accent' : 'bg-blush text-accent-ink'}`}>
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <span className={`text-[12px] font-semibold tabular-nums ${dark ? 'text-bg/70' : 'text-faint'}`}>0{i + 1}</span>
                </div>

                <h3 className="headline relative mt-6 text-2xl font-extrabold md:text-3xl">{s.title}</h3>
                <p className={`relative mt-3 max-w-[52ch] text-[15px] leading-relaxed ${dark ? 'text-bg/85' : 'text-mute'}`}>{s.line}</p>

                <ul className="relative mt-5 flex flex-wrap gap-1.5" aria-label="Tools">
                  {s.stack.map((t) => (
                    <li
                      key={t}
                      className={`rounded-full px-3 py-1 text-[12px] ${dark ? 'bg-bg/10 text-bg/90 ring-1 ring-bg/15' : 'bg-bg text-mute ring-1 ring-ink/10'}`}
                    >
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-auto pt-7">
                  <p className={`text-[11px] uppercase tracking-[0.2em] ${dark ? 'text-bg/70' : 'text-faint'}`}>See it in</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                    {s.proof.map((id) => (
                      <Link
                        key={id}
                        href={`/work/${id}`}
                        className={`inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline ${dark ? 'text-blush' : 'text-accent-ink'}`}
                      >
                        {byId[id]?.title ?? id} <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/ai-link/chat?q=${encodeURIComponent(s.ask)}`}
                    className={`mt-5 inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${
                      dark ? 'bg-accent text-on-accent hover:bg-accent-deep' : 'bg-ink text-bg hover:bg-accent hover:text-on-accent'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" /> Ask my AI about this
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
