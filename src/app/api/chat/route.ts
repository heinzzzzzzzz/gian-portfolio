import { GoogleGenAI } from '@google/genai';
import { PERSONA } from '@/lib/persona';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fastest model first. Each one is tried in order when the previous returns
// an error (503 "high demand", 404, quota). Override with GEMINI_MODELS.
const MODELS = (process.env.GEMINI_MODELS || 'gemini-3.5-flash-lite,gemini-3.8-flash,gemini-3.6-flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const MAX_HISTORY = 8;      // turns kept; smaller prompt = faster first token
const MAX_MESSAGE = 1500;   // characters
const MAX_OUTPUT_TOKENS = 400;

type HistoryItem = { role: 'user' | 'ai'; content: string };

// ---------------------------------------------------------------------------
// Abuse guard. This endpoint spends money on every call, so:
// 1. Only this site may call it (Origin check).
// 2. Each visitor IP gets a small budget: 12 messages per 10 minutes and at
//    most 1 per 2 seconds.
// The limiter lives in memory, so on serverless it is per warm instance: it
// stops casual hammering, not a determined attacker. For a hard limit, move it
// to Upstash/Netlify Blobs, and keep a spend cap on the Gemini key regardless.
// ---------------------------------------------------------------------------
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 12;
const MIN_GAP_MS = 2000;
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get('x-nf-client-connection-ip') ||
    h.get('x-forwarded-for')?.split(',')[0].trim() ||
    h.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimited(ip: string): string | null {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length && now - list[list.length - 1] < MIN_GAP_MS) return 'Slow down a little, one message every couple of seconds.';
  if (list.length >= MAX_PER_WINDOW) return 'You have hit the chat limit for now. Try again in a few minutes, or book a call instead.';
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return null;
}

function allowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    const self = new URL(req.url).host;
    return host === self || (host.startsWith('gianbportfolio') && host.endsWith('.netlify.app')) || host.startsWith('localhost:');
  } catch {
    return false;
  }
}

// Warm-up ping. The chat page calls this on mount so the serverless function
// is already awake when the first real message is sent.
export async function GET() {
  return Response.json({ ok: true, models: MODELS });
}

export async function POST(req: Request) {
  if (!allowedOrigin(req)) {
    return Response.json({ error: 'Not allowed.' }, { status: 403 });
  }
  const limited = rateLimited(clientIp(req));
  if (limited) {
    return Response.json({ error: limited }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
  }

  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return Response.json({ error: 'Message is empty.' }, { status: 400 });
  if (message.length > MAX_MESSAGE) return Response.json({ error: 'Message is too long.' }, { status: 413 });

  const history: HistoryItem[] = Array.isArray(body.history)
    ? (body.history as unknown[])
        .filter((m): m is HistoryItem => {
          if (!m || typeof m !== 'object') return false;
          const r = (m as HistoryItem).role;
          return (r === 'user' || r === 'ai') && typeof (m as HistoryItem).content === 'string';
        })
        .slice(-MAX_HISTORY)
    : [];

  const contents = [
    ...history.map((m) => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content.slice(0, MAX_MESSAGE) }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown = null;

  for (const model of MODELS) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: PERSONA,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.7,
        },
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.text;
              if (text) controller.enqueue(encoder.encode(text));
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Model': model,
        },
      });
    } catch (err) {
      lastError = err;
      console.error(`[chat] ${model} failed:`, err instanceof Error ? err.message : err);
      continue;
    }
  }

  const detail = lastError instanceof Error ? lastError.message : 'Unknown error';
  return Response.json(
    { error: 'The clone is busy right now. Please try again in a moment.', detail: detail.slice(0, 300) },
    { status: 503 }
  );
}
