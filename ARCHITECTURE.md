# Architecture: gianbportfolio.netlify.app

Personal portfolio for Gian Benedict, Automation Engineer. Shows the work, lets visitors talk to an AI clone (text or voice), and books discovery calls.

## Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.3.3 |
| UI | React | 19.2.8 |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`) | 4 |
| Motion | framer-motion, Lenis smooth scroll | 13.1.1 / 1.3.x |
| Icons | lucide-react | 1.x |
| Fonts | `next/font/google`: Open Sans (all text), Yellowtail (neon script) | |
| Text AI | Google Gemini via `@google/genai`, streamed | 2.19 |
| Voice AI | Vapi Web SDK (`@vapi-ai/web`) | 3.0.1 |
| Booking | Cal.com discovery call, embedded by iframe | |
| Hosting | Netlify with `@netlify/plugin-nextjs`, deploys from GitHub `main` | |

No database, no auth. Nothing stores visitor data.

## Folders

```
src/
  app/
    page.tsx               home: Hero, Work, TextReveal, Services, Process, Skills, About, Contact, Footer
    layout.tsx             fonts (variables on <html>), metadata, share image
    globals.css            design tokens + shared effects (neon, aura, glow frame, reduced-motion)
    opengraph-image.png    link preview for LinkedIn / Messenger / WhatsApp / X
    icon.png, apple-icon.png
    api/chat/route.ts      text clone: origin check, per-IP rate limit, Gemini stream with model fallback
    ai-link/               full-page AI room (/ai-link, /ai-link/chat?q=..., /ai-link/call)
    work/[id]/page.tsx     case study pages, statically generated from src/lib/projects.ts
  components/              one file per section; ChatPanel + VoiceButton share useGianAgent
  lib/
    projects.ts            all work items (single source for grid, detail pages, services proof links)
    skills.ts              skill groups + stack ticker
    persona.ts             who the AI clone is: shared FACTS, text PERSONA, VOICE_PERSONA
    useGianAgent.ts        one conversation for text + voice; Vapi overrides applied per call
public/
  portrait.webp            hero cutout (contact shadows baked in)
  work/*.jpg               project screenshots and covers
```

## Environment variables (Netlify)

| Name | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | yes | text clone |
| `GEMINI_MODELS` | no | comma list to override model order |

The Vapi key in `useGianAgent.ts` is the public (browser) key by design.

## Design tokens

Sand `#F0E5D8` background, Mocha `#474329` ink, Watermelon `#FF6FA6` accent (fills and glows only).
Pink text uses `accent-ink #B0245F` (5.2:1 on sand); text on pink fills uses `on-accent #3A1426` (6.2:1).
Greys `mute #5F5943` and `faint #6E6850` both pass 4.5:1.

## Rules this site follows

- Infinite animations are transform/opacity only (no animated filters, backdrop blurs or conic angles). Everything honours `prefers-reduced-motion`.
- The pinned hero stops painting once covered.
- `/api/chat` only answers this site's origin and rate-limits per IP (in memory, per instance). Keep a spend cap on the Gemini key and the Vapi account; the in-memory limit is not a hard guarantee.
- No fabricated numbers. Stats shown come from real project output.
