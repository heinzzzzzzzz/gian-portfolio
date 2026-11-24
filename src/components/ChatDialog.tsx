'use client';

import { forwardRef, useEffect } from 'react';
import { X } from 'lucide-react';
import ChatPanel from './ChatPanel';
import type { GianAgent } from '@/lib/useGianAgent';

/*
 * The text chat in its own panel: a native modal <dialog> (focus trap, Esc to
 * close, page behind made inert). Slides in from the right on desktop, up from
 * the bottom on phones. Styles: .chat-dialog in globals.css.
 */
const ChatDialog = forwardRef<HTMLDialogElement, { agent: GianAgent }>(function ChatDialog({ agent }, ref) {
  const close = () => (ref && typeof ref !== 'function' ? ref.current?.close() : undefined);
  useEffect(() => {
    const dialog = ref && typeof ref !== 'function' ? ref.current : null;
    return dialog ? lightDismissFallback(dialog) : undefined;
  }, [ref]);
  return (
    <dialog ref={ref} aria-label="Chat with Gian's AI" className="chat-dialog" {...({ closedby: 'any' } as object)}>
      <div className="flex h-full flex-col gap-2">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={close}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-card px-4 text-sm font-bold text-ink shadow ring-1 ring-ink/10 hover:ring-accent"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
        <ChatPanel agent={agent} className="min-h-0 flex-1" autoFocus />
      </div>
    </dialog>
  );
});

export default ChatDialog;

/**
 * Click outside to close, for browsers without <dialog closedby> (Safari).
 * Tests the pointer position, not the event target, so clicks on the dialog's
 * own padding don't close it; needs both press and release outside.
 */
export function lightDismissFallback(dialog: HTMLDialogElement) {
  if ('closedBy' in HTMLDialogElement.prototype) return;
  const outside = (e: PointerEvent) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  let pressedOutside = false;
  const down = (e: PointerEvent) => (pressedOutside = outside(e));
  const up = (e: PointerEvent) => {
    if (pressedOutside && outside(e)) dialog.close();
  };
  dialog.addEventListener('pointerdown', down);
  dialog.addEventListener('pointerup', up);
  return () => {
    dialog.removeEventListener('pointerdown', down);
    dialog.removeEventListener('pointerup', up);
  };
}
