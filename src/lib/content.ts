import { projects } from './projects';

/*
 * Content shared by the page text and the 3D chapters, so both always say
 * the same thing.
 */

export type Service = { id: string; title: string; line: string; tools: string; proof: string[]; from: string };
export const SERVICES: Service[] = [
  {
    id: 'content',
    title: 'Content engines',
    line: 'One source feed in. A blog post, native posts for each platform and branded images out, approved before anything goes live.',
    tools: 'n8n · OpenRouter · WordPress · Airtable · Bannerbear',
    proof: ['demand-automation-network', 'self-healing-content', 'multi-category-editorial', 'autonomous-thought-leadership', 'omnichannel-creative', 'automated-newsletter'],
    from: 'An agency owner',
  },
  {
    id: 'voice',
    title: 'Voice agents',
    line: 'A receptionist that answers the phone, checks the calendar, books the slot and logs the call.',
    tools: 'Vapi · n8n · Google Calendar',
    proof: ['ai-voice-receptionist'],
    from: 'A dental clinic',
  },
  {
    id: 'crm',
    title: 'CRM & reports',
    line: 'GoHighLevel pipelines and call reports that land in a sheet before anyone opens a laptop.',
    tools: 'GoHighLevel · n8n · Google Sheets',
    proof: ['crm-call-intelligence', 'intelligent-distribution'],
    from: 'A GHL agency',
  },
  {
    id: 'apps',
    title: 'Apps & sites',
    line: 'When the tool you need does not exist yet. A time-tracking SaaS, an offline-first finance app, a booking system, a store.',
    tools: 'Next.js · Supabase · Flutter · PHP · MySQL',
    proof: ['cackle', 'octi', 'udm-booking-system', 'vapehub'],
    from: 'A founder',
  },
];

export type Sticker = { label: string; match: string[]; bg: string; fg: string; builds: string[] };
const RAW: Omit<Sticker, 'builds'>[] = [
  { label: 'n8n', match: ['n8n'], bg: '#FF6FA6', fg: '#3A1426' },
  { label: 'OpenRouter', match: ['OpenRouter'], bg: '#F0E5D8', fg: '#474329' },
  { label: 'GoHighLevel', match: ['GoHighLevel'], bg: '#FBDCE7', fg: '#B0245F' },
  { label: 'Google Sheets', match: ['Google Sheets', 'Google Calendar'], bg: '#FFFFFF', fg: '#2F6B3B' },
  { label: 'Airtable', match: ['Airtable'], bg: '#FFD166', fg: '#474329' },
  { label: 'WordPress', match: ['WordPress', 'Rank Math'], bg: '#E6D6C3', fg: '#474329' },
  { label: 'Vapi', match: ['Vapi', 'Vapi voice'], bg: '#474329', fg: '#FBDCE7' },
  { label: 'JavaScript', match: ['JavaScript', 'JavaScript (ES modules)'], bg: '#F7E27A', fg: '#3B3413' },
  { label: 'PHP + MySQL', match: ['PHP 8', 'MySQL (PDO)'], bg: '#C9B6E6', fg: '#2C2140' },
  { label: 'Bannerbear', match: ['Bannerbear'], bg: '#B0245F', fg: '#FFFFFF' },
  { label: 'Flutter', match: ['Flutter'], bg: '#9CC6E8', fg: '#20324A' },
  { label: 'Next.js', match: ['Next.js'], bg: '#151515', fg: '#FFFFFF' },
  { label: 'Supabase', match: ['Supabase'], bg: '#8FD1A8', fg: '#1F3B2A' },
  { label: 'Power Automate', match: ['Power Automate'], bg: '#CFE0FF', fg: '#1F3360' },
];
// sticker size comes from how many builds on the site list the tool
export const STICKERS: Sticker[] = RAW.map((s) => ({
  ...s,
  builds: projects.filter((p) => p.stack.some((t) => s.match.includes(t))).map((p) => p.title),
}));
export const ALSO_IN_KIT = 'Dart, Drift, Java, TypeScript, Tailwind CSS, Postgres, Vercel, Netlify, Inoreader, Ayrshare, HCTI';

/** small WebP copies made for the 3D scene (public/work/3d) */
export const img3d = (src: string) => `/work/3d/${src.split('/').pop()!.replace(/\.(jpe?g|png)$/i, '.webp')}`;
