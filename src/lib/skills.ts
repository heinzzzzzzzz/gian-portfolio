export interface SkillGroup {
  id: string;
  number: string;
  title: string;
  blurb: string;
  builtWith: string; // which project(s) prove it
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'automation',
    number: '01',
    title: 'Automation & AI orchestration',
    blurb:
      'Pipelines that research, write, design, schedule, publish and report with a human approval step only where it matters.',
    builtWith: 'Eight production systems built for client brands',
    skills: [
      'n8n',
      'Make',
      'Power Automate',
      'Zapier',
      'GoHighLevel',
      'OpenRouter',
      'OpenAI',
      'Claude',
      'Gemini',
      'Vapi voice agents',
      'Airtable',
      'Google Sheets',
      'WordPress + Rank Math',
      'Ayrshare',
      'Bannerbear',
      'RSS / Inoreader',
      'Webhooks & REST APIs',
    ],
  },
  {
    id: 'apps',
    number: '02',
    title: 'App development',
    blurb:
      'Offline-first mobile apps with a real local database, accessible UI and a rules engine instead of hardcoded behavior.',
    builtWith: 'Octi',
    skills: [
      'Flutter',
      'Dart',
      'Drift (SQLite)',
      'fl_chart',
      'Local notifications',
      'Offline-first architecture',
      'Material 3 theming',
      'Widget & unit testing',
    ],
  },
  {
    id: 'web',
    number: '03',
    title: 'Web development',
    blurb:
      'From a browser-only JavaScript app to a PHP and MySQL store to this Next.js site with motion and an AI clone.',
    builtWith: 'UDM Booking System, VapeHub, this portfolio',
    skills: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'JavaScript (ES modules)',
      'PHP 8',
      'MySQL (PDO)',
      'Java',
      'HTML / CSS',
      'Netlify',
    ],
  },
  {
    id: 'engineering',
    number: '04',
    title: 'Data & engineering practice',
    blurb:
      'The habits that make a build safe to run twice: clean schemas, transactions, pagination, validation and visible failures.',
    builtWith: 'Every build above',
    skills: [
      'Relational schema design (ERD)',
      'Database transactions',
      'Pagination & rate limits',
      'Idempotent re-runs',
      'LLM output validation',
      'Human-in-the-loop approval',
      'Git',
      'Fail-fast error handling',
    ],
  },
];

export const stackTicker = [
  'n8n', 'GoHighLevel', 'Make', 'Power Automate', 'OpenRouter', 'Claude', 'Gemini', 'Vapi',
  'Airtable', 'Google Sheets', 'WordPress', 'Flutter', 'Dart', 'Next.js', 'TypeScript', 'PHP', 'MySQL', 'Java',
];
