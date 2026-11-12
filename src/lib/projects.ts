export type Category = 'automation' | 'app' | 'website';

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'automation', label: 'Automations' },
  { id: 'app', label: 'Apps' },
  { id: 'website', label: 'Websites' },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  automation: 'Automation',
  app: 'App',
  website: 'Website',
};

export interface Project {
  id: string;
  number: string;
  title: string;
  category: Category;
  kind: string;          // short label on the card, e.g. "n8n · Content"
  tagline: string;       // one line for the card
  description: string;   // long form for the detail page
  flow: string[];
  outcome: string;
  highlights?: string[];
  stack: string[];
  year: string;
  role: string;
  link?: string;         // live URL when one exists
  image: string;         // card cover
  gallery: string[];
  galleryLayout?: 'wide' | 'phone';
}

export const projects: Project[] = [
  // ---------------------------------------------------------------- Apps
  {
    id: 'octi',
    number: '01',
    title: 'Octi',
    category: 'app',
    kind: 'Flutter · Finance',
    tagline: 'An offline-first finance app that teaches you money by making you raise something.',
    description:
      'Octi is a mobile finance app where logging money and finishing short lessons raises a small octopus through six growth stages, from baby to millionaire. Every number lives on the device: accounts, money in and out, jars, goals and history are stored locally with no sign-up and no server. The home screen shows the octopus, a shell-by-shell progress strip, quick actions for logging money, and a stage badge whose progress ring is driven by the same rules engine that decides when the next stage is reached.',
    flow: ['Log money', 'Lessons', 'Progress rules', 'Stage up', 'Keepsakes'],
    outcome:
      'A finance habit that feels like raising a pet: real rows, real progress, nothing faked, and it works with no internet at all.',
    highlights: [
      'Offline-first: Drift (SQLite) database, no accounts, no network',
      'Six growth stages driven by a rules engine, not a hardcoded timer',
      'Accessible by design: large text, reduce-motion support, 48dp tap targets',
      'Built phase by phase with a test and an on-device screenshot per gate',
    ],
    stack: ['Flutter', 'Dart', 'Drift', 'SQLite', 'fl_chart', 'Local notifications'],
    year: '2026',
    role: 'Solo design and build',
    image: '/work/octi-cover.jpg',
    gallery: ['/work/octi-onboarding.jpg', '/work/octi-home.jpg', '/work/octi-stageup.jpg', '/work/octi-badge.jpg', '/work/octi-depth.jpg'],
    galleryLayout: 'phone',
  },

  // ------------------------------------------------------------ Websites
  {
    id: 'udm-booking-system',
    number: '02',
    title: 'UDM Room & Equipment Booking',
    category: 'website',
    kind: 'JavaScript · Web app',
    tagline: 'One place for Universidad de Manila students and faculty to reserve rooms and borrow equipment.',
    description:
      'Reserving rooms and equipment at the university used to happen through chat threads and paper, so nobody could see what was free or be sure a booking was confirmed. This web app lets students and faculty sign in, browse rooms and equipment, check a day-by-day availability grid, and submit a request. Every request is checked against the booking rules: no double bookings, students limited to 3-hour bookings that need approval, faculty up to 8 hours and auto-approved. Each booking can be viewed, cancelled and printed as a booking slip. It was designed with object-oriented principles (Rooms and Equipment extend an abstract Resource, Students and Faculty extend an abstract User) and shipped in two forms: a Java version with its own web server, and this browser-only JavaScript version.',
    flow: ['Sign in', 'Browse', 'Pick slot', 'Rules check', 'Booking slip'],
    outcome:
      'The client confirmed the system works and would be a good inclusion for the school, and asked for a Power Automate version that fits the existing UDM portal, which was also delivered.',
    highlights: [
      'Availability grid per room and equipment, 30-minute steps, 7 AM to 9 PM',
      'Role-based rules: student vs faculty limits, approval and auto-approval',
      'Double-booking prevention and quantity tracking for equipment',
      'Printable booking slips and a demo-data reset for reviewers',
    ],
    stack: ['JavaScript (ES modules)', 'OOP design', 'Java', 'HTML/CSS', 'Netlify', 'Power Automate'],
    year: '2026',
    role: 'Lead developer, team of four',
    link: 'https://udmbookingsystem.netlify.app/',
    image: '/work/udm-availability.jpg',
    gallery: ['/work/udm-login.jpg', '/work/udm-home.jpg', '/work/udm-availability.jpg', '/work/udm-book.jpg', '/work/udm-rooms.jpg'],
    galleryLayout: 'wide',
  },
  {
    id: 'vapehub',
    number: '03',
    title: 'VapeHub',
    category: 'website',
    kind: 'PHP · E-commerce',
    tagline: 'An e-commerce and order management store built for Philippine vape retailers and RA 11900 compliance.',
    description:
      'Small vape shops in the Philippines sell through Messenger threads: manual totals, stock checked by hand, addresses typed loosely, and no record that the buyer is 21. VapeHub replaces that with a storefront and order system built in native PHP 8 and MySQL. Customers browse a live-search catalog, add to a cart, and check out with a cascading Philippine address picker (region, province, city, barangay, postal code) and a choice of Cash on Delivery, GCash or Maya. Stock is deducted inside a database transaction the moment an order is finalized, so the store never oversells. Age confirmation and legal acknowledgments are enforced at registration, and a voice assistant lets customers order by talking.',
    flow: ['Catalog', 'Cart', 'Age gate', 'PH address', 'Order + stock'],
    outcome:
      'A seven-entity relational system (users, customers, products, orders, order details, payments, deliveries) that turns a chat-based shop into a structured, legally compliant store.',
    highlights: [
      'Transactional checkout: stock decreases atomically with the order',
      'Cascading Philippine address selection for courier-ready deliveries',
      'RA 11900 age gating and acknowledgment logging',
      'AI voice ordering assistant on the storefront',
    ],
    stack: ['PHP 8', 'MySQL (PDO)', 'JavaScript', 'HTML/CSS', 'Vapi voice', 'XAMPP'],
    year: '2026',
    role: 'Solo design and build',
    image: '/work/vapehub-products.jpg',
    gallery: ['/work/vapehub-home.jpg', '/work/vapehub-products.jpg', '/work/vapehub-register.jpg', '/work/vapehub-mobile.jpg'],
    galleryLayout: 'wide',
  },

  // ---------------------------------------------------------- Automations
  {
    id: 'demand-automation-network',
    number: '04',
    title: 'Demand Automation Network',
    category: 'automation',
    kind: 'n8n · Content hub',
    tagline: 'An Airtable command center where every generated post flows through an approval pipeline.',
    description:
      'The backbone of the whole operation. An Airtable-powered command center where every generated post, caption, AI image and CRM call-to-action flows through a kanban approval pipeline (Pending, Approved, Posted). Per-platform views for Facebook, Instagram, LinkedIn, Bluesky, Threads and the blog keep editorial oversight easy while the machines do the heavy lifting.',
    flow: ['Ingest', 'Generate', 'Pending', 'Approved', 'Posted'],
    outcome: 'One governed source of truth coordinating hundreds of posts across 6 channels with full approval control.',
    stack: ['Airtable', 'n8n', 'GoHighLevel', 'OpenRouter'],
    year: '2025',
    role: 'Automation Engineer, Intention Technology',
    image: '/wf-unified.jpg',
    gallery: ['/wf-unified.jpg', '/out-care-airtable.jpg', '/out-game-airtable.jpg'],
  },
  {
    id: 'autonomous-thought-leadership',
    number: '05',
    title: 'Autonomous Thought-Leadership Engine',
    category: 'automation',
    kind: 'n8n · LinkedIn',
    tagline: 'A daily trigger that turns fresh AI news into a branded LinkedIn post and infographic.',
    description:
      'A daily 9 AM trigger pulls fresh AI news via RSS, an LLM drafts an on-brand post and a structured infographic, the HTML is rendered to a polished image, and Ayrshare publishes it straight to LinkedIn. Five rotating layout templates keep the feed visually fresh without a designer in the loop.',
    flow: ['9AM', 'RSS', 'LLM', 'Infographic', 'Post'],
    outcome: 'A consistent daily thought-leadership presence, fully hands-off, with studio-quality infographics every morning.',
    stack: ['n8n', 'OpenRouter', 'HCTI', 'Ayrshare'],
    year: '2025',
    role: 'Automation Engineer, Intention Technology',
    image: '/wf-tactical.jpg',
    gallery: ['/wf-tactical.jpg', '/out-care-social.jpg', '/out-game-social.jpg'],
  },
  {
    id: 'self-healing-content',
    number: '06',
    title: 'Self-Healing Content Pipeline',
    category: 'automation',
    kind: 'n8n · Content',
    tagline: 'A feedback loop that catches flagged posts and rewrites them in place.',
    description:
      'A closed feedback loop that polls live posts every 60 minutes, isolates anything flagged for revision, and routes it back through the LLM to rewrite captions and content, then quietly updates the source in place. Multi-branch chains (Fix / Improve / Insights / Tools) tag and route each piece to the right treatment. Inoreader, WordPress and GoHighLevel stay in sync across the whole chain.',
    flow: ['Scan', 'Filter', 'Extract', 'Regenerate', 'Replace'],
    outcome: 'Content that improves itself over time: underperformers caught and rewritten without manual review.',
    stack: ['n8n', 'Inoreader', 'WordPress', 'GoHighLevel', 'OpenRouter'],
    year: '2025',
    role: 'Automation Engineer, Intention Technology',
    image: '/wf-newsletter.jpg',
    gallery: ['/wf-newsletter.jpg', '/out-game-blog.jpg', '/out-care-blog.jpg'],
  },
  {
    id: 'multi-category-editorial',
    number: '07',
    title: 'Multi-Category Editorial Generator',
    category: 'automation',
    kind: 'n8n · SEO blog',
    tagline: 'Parallel LLM chains that publish SEO-ready articles with images and schema to WordPress.',
    description:
      'Parallel LLM chains generate articles across four editorial categories, merge into a single structured payload, generate a featured image, and publish to WordPress with proper Rank Math schema, categories and tag taxonomies. Links are re-tagged after publishing to keep the content graph clean.',
    flow: ['Tag', 'LLM Chains', 'Merge', 'Image', 'Publish'],
    outcome: '49+ SEO-ready articles with Article/BlogPosting schema, structured categories and auto-generated featured images.',
    stack: ['n8n', 'OpenRouter', 'WordPress', 'Rank Math'],
    year: '2025',
    role: 'Automation Engineer, Intention Technology',
    image: '/out-care-blog.jpg',
    gallery: ['/wf-unified.jpg', '/out-care-blog.jpg', '/out-game-blog.jpg'],
  },
  {
    id: 'omnichannel-creative',
    number: '08',
    title: 'Omni-Channel Creative Studio',
    category: 'automation',
    kind: 'n8n · Creative',
    tagline: 'Branded, correctly sized visuals for five social platforms, produced automatically.',
    description:
      'An Airtable-triggered engine that takes content needing creative, routes it per platform, generates a base image, and composites it through Bannerbear brand templates, then writes the finished asset back to the record. Conditional branches make sure each network gets correctly sized, on-brand visuals.',
    flow: ['Trigger', 'Route', 'Image Gen', 'Bannerbear', 'Update'],
    outcome: 'Branded, correctly formatted creative for 5 social platforms produced automatically, no designer required.',
    stack: ['Airtable', 'n8n', 'Bannerbear', 'OpenRouter'],
    year: '2025',
    role: 'Automation Engineer, Intention Technology',
    image: '/out-game-social.jpg',
    gallery: ['/wf-tactical.jpg', '/out-game-airtable.jpg', '/out-care-social.jpg'],
  },
  {
    id: 'intelligent-distribution',
    number: '09',
    title: 'Intelligent Distribution Scheduler',
    category: 'automation',
    kind: 'n8n · Scheduler',
    tagline: 'A scheduled engine that dispatches approved posts to each platform at its best slot.',
    description:
      'A scheduled engine that prepares the queue, searches Airtable for approved items, and uses conditional branching to dispatch each post to its destination (Facebook, Instagram, LinkedIn, Bluesky or Threads) via GoHighLevel, updating the record status on success. Built-in waits respect rate limits and posting windows.',
    flow: ['Schedule', 'Prep', 'Search', 'Route', 'Publish'],
    outcome: '368+ posts scheduled and distributed autonomously across platforms, each at its optimal slot.',
    stack: ['n8n', 'Airtable', 'GoHighLevel'],
    year: '2025',
    role: 'Automation Engineer, Intention Technology',
    image: '/out-care-social.jpg',
    gallery: ['/wf-unified.jpg', '/out-care-social.jpg', '/out-game-social.jpg'],
  },
  {
    id: 'automated-newsletter',
    number: '10',
    title: 'Automated Newsletter System',
    category: 'automation',
    kind: 'n8n · Email',
    tagline: 'A monthly newsletter curated, written and sent end to end through GoHighLevel.',
    description:
      'On the 1st of each month, the system pulls featured, related and latest WordPress posts, runs a freshness check, and an LLM composes a warm, on-brand newsletter. It maps the output into GoHighLevel custom values via a loop and triggers the email send: a complete hybrid content-to-inbox pipeline with a human editorial pass where it matters.',
    flow: ['Monthly', 'Curate', 'Freshness', 'Generate', 'Send'],
    outcome: 'A polished monthly newsletter assembled and delivered end to end with zero manual writing.',
    stack: ['n8n', 'WordPress', 'OpenRouter', 'GoHighLevel'],
    year: '2025',
    role: 'Automation Engineer, Intention Technology',
    image: '/out-newsletter-email.jpg',
    gallery: ['/wf-newsletter.jpg', '/out-newsletter-email.jpg', '/out-care-blog.jpg'],
  },
  {
    id: 'crm-call-intelligence',
    number: '11',
    title: 'CRM Call Intelligence Report',
    category: 'automation',
    kind: 'n8n · Reporting',
    tagline: 'Daily call analytics pulled from GoHighLevel and appended to a running Google Sheet.',
    description:
      'A daily trigger computes the reporting window, pulls every conversation from GoHighLevel, splits and reads call messages, then aggregates by number into key metrics (total calls, answered %, voicemail %, blank-duration %) appended to a running Google Sheet for at-a-glance performance tracking.',
    flow: ['2AM', 'Range', 'Fetch', 'Aggregate', 'Sheet'],
    outcome: 'Daily, decision-ready call analytics delivered automatically, no spreadsheet wrangling.',
    stack: ['n8n', 'GoHighLevel', 'Google Sheets'],
    year: '2025',
    role: 'Automation Engineer, Intention Technology',
    image: '/out-call-sheet.jpg',
    gallery: ['/wf-callsummary.jpg', '/out-call-sheet.jpg', '/out-care-airtable.jpg'],
  },
];

export const projectCounts: Record<Category | 'all', number> = {
  all: projects.length,
  automation: projects.filter((p) => p.category === 'automation').length,
  app: projects.filter((p) => p.category === 'app').length,
  website: projects.filter((p) => p.category === 'website').length,
};
