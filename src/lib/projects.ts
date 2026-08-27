export interface Project {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  flow: string[];
  outcome: string;
  stack: string[];
  color: string;
  image: string;
  gallery: string[];
}

export const projects: Project[] = [
  { 
    id: 'demand-automation-network', number: '01', title: 'Demand Automation Network', category: 'Content Hub · Governance', 
    description: 'The backbone of the whole operation. An Airtable-powered command center where every generated post — caption, AI image, and CRM call-to-action — flows through a kanban approval pipeline (Pending → Approved → Posted). Per-platform views for Facebook, Instagram, LinkedIn, Bluesky, Threads and the blog keep editorial oversight effortless while the machines do the heavy lifting.', 
    flow: ['Ingest','Generate','Pending','Approved','Posted'],
    outcome: 'One governed source of truth coordinating hundreds of posts across 6 channels with full approval control.',
    stack: ['Airtable','n8n','GoHighLevel','OpenRouter'], 
    color: '#2DD4BF', image: '/wf-unified.jpg',
    gallery: ['/wf-unified.jpg', '/out-care-airtable.jpg', '/out-game-airtable.jpg']
  },
  { 
    id: 'autonomous-thought-leadership', number: '02', title: 'Autonomous Thought-Leadership Engine', category: 'Distribution · LinkedIn', 
    description: 'A daily 9 AM trigger pulls fresh AI news via RSS, an LLM drafts an on-brand post and a structured infographic, the HTML is rendered to a polished image, and Ayrshare publishes it straight to LinkedIn. Five rotating layout templates keep the feed visually fresh without a designer in the loop.', 
    flow: ['9AM','RSS','LLM','Infographic','Post'],
    outcome: 'A consistent daily thought-leadership presence, fully hands-off, with studio-quality infographics every morning.',
    stack: ['n8n','OpenRouter','HCTI','Ayrshare'], 
    color: '#22D3EE', image: '/wf-tactical.jpg',
    gallery: ['/wf-tactical.jpg', '/out-care-social.jpg', '/out-game-social.jpg']
  },
  { 
    id: 'self-healing-content', number: '03', title: 'Self-Healing Content Pipeline', category: 'Content · Self-Healing', 
    description: 'A closed feedback loop that polls live posts every 60 minutes, isolates anything flagged for revision, and routes it back through the LLM to rewrite captions and content — then quietly updates the source in place. Multi-branch chains (Fix / Improve / Insights / Tools) tag and route each piece to the right treatment. Inoreader → WordPress → GoHighLevel keeps the whole chain in sync.', 
    flow: ['Scan','Filter','Extract','Regenerate','Replace'],
    outcome: 'Content that improves itself over time — underperformers caught and rewritten without manual review.',
    stack: ['n8n','Inoreader','WordPress','GoHighLevel','OpenRouter'], 
    color: '#22D3EE', image: '/wf-newsletter.jpg',
    gallery: ['/wf-newsletter.jpg', '/out-game-blog.jpg', '/out-care-blog.jpg']
  },
  { 
    id: 'multi-category-editorial', number: '04', title: 'Multi-Category Editorial Generator', category: 'Content · SEO Blog', 
    description: 'Parallel LLM chains generate articles across four editorial categories, merge into a single structured payload, generate a featured image, and publish to WordPress with proper Rank Math schema, categories, and tag taxonomies. Links are re-tagged after publishing to keep the content graph clean.', 
    flow: ['Tag','LLM Chains','Merge','Image','Publish'],
    outcome: '49+ SEO-ready articles with Article/BlogPosting schema, structured categories, and auto-generated featured images.',
    stack: ['n8n','OpenRouter','WordPress','Rank Math'], 
    color: '#2DD4BF', image: '/wf-unified.jpg',
    gallery: ['/wf-unified.jpg', '/out-care-blog.jpg', '/out-game-blog.jpg']
  },
  { 
    id: 'omnichannel-creative', number: '05', title: 'Omni-Channel Creative Studio', category: 'Creative · Multi-Platform', 
    description: 'An Airtable-triggered engine that takes content needing creative, routes it per platform, generates a base image, and composites it through Bannerbear brand templates — then writes the finished asset back to the record. Conditional branches ensure each network gets correctly-sized, on-brand visuals.', 
    flow: ['Trigger','Route','Image Gen','Bannerbear','Update'],
    outcome: 'Branded, correctly-formatted creative for 5 social platforms produced automatically, no designer required.',
    stack: ['Airtable','n8n','Bannerbear','OpenRouter'], 
    color: '#F5B544', image: '/wf-tactical.jpg',
    gallery: ['/wf-tactical.jpg', '/out-game-airtable.jpg', '/out-care-social.jpg']
  },
  { 
    id: 'intelligent-distribution', number: '06', title: 'Intelligent Distribution Scheduler', category: 'Distribution · Scheduler', 
    description: 'A scheduled engine that prepares the queue, searches Airtable for approved items, and uses conditional branching to dispatch each post to its destination — Facebook, Instagram, LinkedIn, Bluesky or Threads — via GoHighLevel, updating the record status on success. Built-in waits respect rate limits and posting windows.', 
    flow: ['Schedule','Prep','Search','Route','Publish'],
    outcome: '368+ posts scheduled and distributed autonomously across platforms, each at its optimal slot.',
    stack: ['n8n','Airtable','GoHighLevel'], 
    color: '#2DD4BF', image: '/wf-unified.jpg',
    gallery: ['/wf-unified.jpg', '/out-care-social.jpg', '/out-game-social.jpg']
  },
  { 
    id: 'automated-newsletter', number: '07', title: 'Automated Newsletter System', category: 'Email · Newsletter', 
    description: 'On the 1st of each month, the system pulls featured, related, and latest WordPress posts, runs a freshness check, and an LLM composes a warm, on-brand newsletter. It maps the output into GoHighLevel custom values via a loop and triggers the email send — a complete hybrid content-to-inbox pipeline.', 
    flow: ['Monthly','Curate','Freshness','Generate','Send'],
    outcome: 'A polished monthly newsletter assembled and delivered end-to-end with zero manual writing.',
    stack: ['n8n','WordPress','OpenRouter','GoHighLevel'], 
    color: '#F5B544', image: '/wf-newsletter.jpg',
    gallery: ['/wf-newsletter.jpg', '/out-newsletter-email.jpg', '/out-care-blog.jpg']
  },
  { 
    id: 'crm-call-intelligence', number: '08', title: 'CRM Call Intelligence Report', category: 'CRM · Analytics', 
    description: 'A daily trigger computes the reporting window, pulls every conversation from GoHighLevel, splits and reads call messages, then aggregates by number into key metrics — total calls, answered %, voicemail %, and blank-duration % — appended to a running Google Sheet for at-a-glance performance tracking.', 
    flow: ['2AM','Range','Fetch','Aggregate','Sheet'],
    outcome: 'Daily, decision-ready call analytics delivered automatically — no spreadsheet wrangling.',
    stack: ['n8n','GoHighLevel','Google Sheets'], 
    color: '#22D3EE', image: '/wf-callsummary.jpg',
    gallery: ['/wf-callsummary.jpg', '/out-call-sheet.jpg', '/out-care-airtable.jpg']
  }
];
