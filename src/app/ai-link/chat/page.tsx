'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AiRoom from '@/components/AiRoom';

// Kept for old links: /ai-link/chat?q=... opens the AI room and sends the question.
function ChatInner() {
  const q = useSearchParams().get('q');
  return <AiRoom initialQuestion={q} focusChat />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<main className="min-h-[100svh] bg-bg" />}>
      <ChatInner />
    </Suspense>
  );
}
