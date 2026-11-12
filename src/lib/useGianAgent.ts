'use client';

// One conversation, two ways in: typing (Gemini, streamed) or calling (Vapi
// voice). Voice transcripts land in the same thread as typed messages, so the
// chat panel always shows the whole conversation.

import { useCallback, useEffect, useRef, useState } from 'react';
import type Vapi from '@vapi-ai/web';

// Public (browser-safe) Vapi key and the assistant that speaks as Gian.
const VAPI_PUBLIC_KEY = 'c4d2d332-b9ae-489d-9b64-ab26902f2af1';
const VAPI_ASSISTANT_ID = '5de15b62-d5c5-47ae-8712-e1bfe23c44e6';

export type AgentMsg = { id: string; role: 'user' | 'ai'; content: string; via?: 'voice' };
export type CallStatus = 'idle' | 'connecting' | 'active' | 'error';

const GREETING: AgentMsg = {
  id: 'greeting',
  role: 'ai',
  content: "Hi, I'm Gian's AI self. Ask me what I build, how a project with me works, or tap Call and just talk.",
};

type VapiMessage = { type: string; transcriptType?: string; role?: 'user' | 'assistant'; transcript?: string };

function errorText(e: unknown): string {
  const o = e as { message?: string; error?: { message?: string }; errorMsg?: string } | null;
  return o?.message || o?.error?.message || o?.errorMsg || (typeof e === 'string' ? e : 'Call failed');
}

let seq = 0;
const nextId = () => `m${Date.now()}-${seq++}`;

export function useGianAgent() {
  const [messages, setMessages] = useState<AgentMsg[]>([GREETING]);
  const [thinking, setThinking] = useState(false);
  const historyRef = useRef<AgentMsg[]>([]);

  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callError, setCallError] = useState('');
  const [volume, setVolume] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);

  // Warm the serverless chat function so the first answer is not a cold start.
  useEffect(() => {
    fetch('/api/chat', { method: 'GET', cache: 'no-store' }).catch(() => {});
    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  // Call timer
  useEffect(() => {
    if (callStatus !== 'active') return;
    const t = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [callStatus]);

  const push = (m: AgentMsg) => {
    historyRef.current = [...historyRef.current, m];
    setMessages((prev) => [...prev, m]);
  };

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const history = historyRef.current.map(({ role, content }) => ({ role, content }));
    push({ id: nextId(), role: 'user', content: text });
    setThinking(true);

    const aiId = nextId();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      if (!res.ok || !res.body) {
        let detail = `HTTP ${res.status}`;
        try {
          detail = (await res.json()).error || detail;
        } catch {}
        throw new Error(detail);
      }
      setThinking(false);
      setMessages((prev) => [...prev, { id: aiId, role: 'ai', content: '' }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const snap = full;
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: snap } : m)));
      }
      if (!full.trim()) throw new Error('Empty reply');
      historyRef.current = [...historyRef.current, { id: aiId, role: 'ai', content: full }];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      const bubble = `I couldn't answer that one (${msg}). Try again in a moment, or email gianbenedict.bigay07@gmail.com.`;
      setMessages((prev) =>
        prev.some((m) => m.id === aiId)
          ? prev.map((m) => (m.id === aiId ? { ...m, content: bubble } : m))
          : [...prev, { id: aiId, role: 'ai', content: bubble }]
      );
    } finally {
      setThinking(false);
    }
  }, []);

  const getVapi = useCallback(async () => {
    if (vapiRef.current) return vapiRef.current;
    // Loaded on first call only, so the homepage stays light.
    const { default: VapiClient } = await import('@vapi-ai/web');
    const vapi = new VapiClient(VAPI_PUBLIC_KEY);
    vapi.on('call-start', () => {
      setCallSeconds(0);
      setCallStatus('active');
    });
    vapi.on('call-end', () => {
      setCallStatus('idle');
      setSpeaking(false);
      setVolume(0);
    });
    vapi.on('speech-start', () => setSpeaking(true));
    vapi.on('speech-end', () => setSpeaking(false));
    vapi.on('volume-level', (v: number) => setVolume(v));
    vapi.on('message', (m: VapiMessage) => {
      if (m.type === 'transcript' && m.transcriptType === 'final' && m.role && m.transcript) {
        push({ id: nextId(), role: m.role === 'assistant' ? 'ai' : 'user', content: m.transcript, via: 'voice' });
      }
    });
    vapi.on('error', (e: unknown) => {
      console.error(e);
      setCallError(errorText(e));
      setCallStatus('error');
    });
    vapiRef.current = vapi;
    return vapi;
  }, []);

  const startCall = useCallback(async () => {
    setCallError('');
    setCallStatus('connecting');
    try {
      const vapi = await getVapi();
      await vapi.start(VAPI_ASSISTANT_ID);
    } catch (e) {
      console.error(e);
      setCallError(errorText(e));
      setCallStatus('error');
    }
  }, [getVapi]);

  const endCall = useCallback(() => {
    vapiRef.current?.stop();
    setCallStatus('idle');
    setSpeaking(false);
    setVolume(0);
  }, []);

  const toggleCall = useCallback(() => {
    if (callStatus === 'active' || callStatus === 'connecting') endCall();
    else startCall();
  }, [callStatus, endCall, startCall]);

  return {
    messages,
    thinking,
    send,
    call: { status: callStatus, error: callError, volume, speaking, seconds: callSeconds, start: startCall, end: endCall, toggle: toggleCall },
  };
}

export type GianAgent = ReturnType<typeof useGianAgent>;
