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

// Warm-up ping. The chat page calls this on mount so the serverless function
// is already awake when the first real message is sent.
export async function GET() {
  return Response.json({ ok: true, models: MODELS });
}

export async function POST(req: Request) {
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
