'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Phone, PhoneOff, X, Loader2 } from 'lucide-react';
import type { GianAgent } from '@/lib/useGianAgent';
import ChatPanel from './ChatPanel';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/*
 * The call, on screen. When a call starts, this panel slides in on the right
 * (a sheet from the bottom on phones) while the 3D phone flies over to its
 * left and shows the live call. It says plainly where the call is (calling,
 * connected with a timer, ended), shows the voice level and the transcript,
 * and has a big hang-up button.
 *
 * It's a non-modal dialog (popover="manual", in the top layer) so the page
 * isn't locked; a dimmed scrim sits under the 3D layer, and clicking it, the
 * Close button, or Esc hides the panel. Hiding it doesn't end the call (the
 * phone in the corner shows it's still on); Hang up does.
 */
export default function CallPanel({ agent, open, onClose }: { agent: GianAgent; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { status, seconds, volume, speaking, toggle, error } = agent.call;
  const live = status === 'active';
  const connecting = status === 'connecting';

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== 'function') return;
    const shown = el.matches(':popover-open');
    if (open && !shown) el.showPopover();
    if (!open && shown) el.hidePopover();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const statusLine = live ? `Connected · ${fmt(seconds)}` : connecting ? 'Calling…' : status === 'error' ? 'Couldn’t connect' : seconds > 0 ? `Call ended · ${fmt(seconds)}` : 'Call ended';
  const bars = 13;

  return (
    <>
      {/* dims the page under the 3D phone (which sits above this, at z-40) */}
      <div aria-hidden onClick={onClose} className={`call-scrim fixed inset-0 z-[35] ${open ? 'is-open' : ''}`} />
      <dialog ref={ref} popover="manual" aria-labelledby="call-title" className="call-panel">
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-accent-ink">Live call</p>
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-card px-4 text-sm font-bold text-ink shadow ring-1 ring-ink/10 hover:ring-accent">
              <X className="h-4 w-4" /> Close
            </button>
          </div>

          <div className="shrink-0 rounded-[22px] bg-card p-4 shadow-[0_30px_80px_-30px_rgba(255,111,166,0.75)] ring-1 ring-line">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Image src="/avatar.jpg" alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-2 ring-accent/60" />
                <span className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ring-2 ring-card ${live ? 'bg-[#34C76F]' : connecting ? 'bg-accent' : 'bg-faint'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="call-title" className="font-head text-lg font-extrabold text-ink">Gian&apos;s AI</h2>
                <p className="flex items-center gap-2 text-sm font-semibold text-mute" aria-live="polite">
                  {live && <span className="call-live-dot" aria-hidden />}
                  {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                  <span className={live ? 'text-[#2E8B57]' : undefined}>{statusLine}</span>
                </p>
              </div>
            </div>

            {/* voice level: moves when either of you talks */}
            <div className="mt-3 flex h-9 items-center justify-center gap-1.5" aria-hidden>
              {Array.from({ length: bars }, (_, i) => {
                const mid = 1 - Math.abs(i - (bars - 1) / 2) / bars;
                const h = live ? 6 + Math.min(30, volume * 260 * mid + (speaking ? 6 : 0) * mid) : 6;
                return <span key={i} className="w-1.5 rounded-full bg-accent transition-[height] duration-100" style={{ height: `${h}px`, opacity: live ? 1 : 0.35 }} />;
              })}
            </div>
            <p className="mt-1 text-center text-[13px] text-mute" aria-live="polite">
              {live ? (speaking ? 'My AI is talking.' : 'Go ahead, it’s listening.') : connecting ? 'Allow the microphone if your browser asks.' : status === 'error' ? error : 'Thanks for calling.'}
            </p>

            <button
              type="button"
              onClick={toggle}
              autoFocus
              className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-base font-bold transition-colors ${
                live || connecting ? 'bg-[#e5484d] text-white hover:bg-[#d13d42]' : 'bg-accent text-on-accent hover:bg-accent-deep'
              }`}
            >
              {live || connecting ? <PhoneOff className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              {live || connecting ? 'Hang up' : 'Call again'}
            </button>
          </div>

          <p className="px-1 text-[12px] font-bold uppercase tracking-[0.2em] text-mute">Transcript</p>
          <ChatPanel agent={agent} className="min-h-[220px] flex-1" hideHeader hideChips />
        </div>
      </dialog>
    </>
  );
}
