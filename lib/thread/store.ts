"use client";

import { useSyncExternalStore } from "react";

import type { Mode } from "@/components/shell/mode";

/**
 * App state (PRD figure 3): boot → home → thread. Boot is the intro in
 * lib/intro.ts; this store holds home vs thread and the turns. It is in the
 * first load, so it imports no thread code: the router, answer texts and
 * thread UI arrive in one chunk through `prefetchThread()`.
 */
export type Ask =
  | { kind: "answer"; id: string; from: "chip" | "sidebar" | "follow-up" }
  | { kind: "typed"; text: string };

export type Turn = {
  id: number;
  question: string;
  from: "chip" | "sidebar" | "follow-up" | "typed";
  reply: {
    text: string;
    /** The curated answer shown, if any. */
    answerId?: string;
    /** Follow-up chips, shown after the last turn only. */
    chips: string[];
  };
};

type ThreadRuntime = typeof import("@/components/thread/runtime");

type State = {
  view: "home" | "thread";
  turns: Turn[];
  topic: string | null;
  runtime: ThreadRuntime | null;
};

const initial: State = { view: "home", turns: [], topic: null, runtime: null };
let state = initial;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useThread() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

let loading: Promise<ThreadRuntime> | undefined;

/** Loads the thread chunk once. Called on hover, focus or press of anything that asks. */
export function prefetchThread() {
  loading ??= import("@/components/thread/runtime").then(
    (runtime) => {
      set({ runtime });
      return runtime;
    },
    (error: unknown) => {
      loading = undefined;
      throw error;
    },
  );
  return loading;
}

/** Spread onto anything that asks, so the chunk is on its way before the click. */
export const prefetchOnIntent = {
  onPointerEnter: () => void prefetchThread().catch(() => {}),
  onPointerDown: () => void prefetchThread().catch(() => {}),
  onFocus: () => void prefetchThread().catch(() => {}),
};

let nextId = 1;

export async function ask(input: Ask, mode: Mode) {
  const runtime = await prefetchThread();
  const asked = state.turns.flatMap((turn) => (turn.reply.answerId ? [turn.reply.answerId] : []));
  const { turn, topic } = runtime.resolveTurn(input, { id: nextId++, topic: state.topic, asked, mode });
  set({ view: "thread", turns: [...state.turns, turn], topic });
}

/** Back to the home screen with a fresh thread. */
export function goHome() {
  set({ view: "home", turns: [], topic: null });
}
