'use client';

import { useSyncExternalStore } from 'react';

/*
 * Tiny shared store between the page (React) and the 3D stage (three.js).
 * React writes things like the call state and the shelf filter; the 3D world
 * reads them every frame. The 3D world writes back things like "a folder was
 * clicked". No re-render of the 3D side ever goes through React.
 */
export type CallInfo = { status: 'idle' | 'connecting' | 'active' | 'error'; seconds: number; volume: number; speaking: boolean };

export type StageState = {
  call: CallInfo;
  shelfIds: string[]; // project ids currently on the shelf (after the filter)
  active: number; // index into shelfIds of the folder that faces you
  pick: { index: number; at: number } | null; // a folder the visitor clicked in 3D
  ready: boolean; // 3D world finished loading
  work: { top: number; height: number }; // the Work shelf's place on the page (measured, not per frame)
  opening: { id: string; at: number } | null; // a folder being opened (book animation)
  skill: string | null; // sticker under the pointer in the Skills chapter
  docked: boolean; // the phone is resting in the bottom-right corner
  callPanel: boolean; // the call panel is open: the phone flies over to its left
};

let state: StageState = {
  call: { status: 'idle', seconds: 0, volume: 0, speaking: false },
  shelfIds: [],
  active: 0,
  pick: null,
  ready: false,
  work: { top: 0, height: 0 },
  opening: null,
  skill: null,
  docked: false,
  callPanel: false,
};
const subs = new Set<() => void>();

export const stage = {
  get: () => state,
  set(patch: Partial<StageState>) {
    state = { ...state, ...patch };
    subs.forEach((cb) => cb());
  },
  subscribe(cb: () => void) {
    subs.add(cb);
    return () => {
      subs.delete(cb);
    };
  },
};

export function useStage<T>(pick: (s: StageState) => T): T {
  return useSyncExternalStore(stage.subscribe, () => pick(state), () => pick(state));
}
