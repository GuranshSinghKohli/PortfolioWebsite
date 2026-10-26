"use client";

import { useSyncExternalStore } from "react";

/**
 * Home intro sequence: boot (first visit) → greeting reveal → chips → done.
 * The pre-paint script decides on <html data-intro> whether it runs at all.
 * Read once at module load, because Strict Mode's dev remount clears
 * attributes on <html>. The greeting reveal itself is CSS (globals.css).
 */
export type IntroKind = "boot" | "reveal";

/** "idle" is the server snapshot: nothing known, nothing hidden by React. */
export type IntroStage = "idle" | "waiting" | "chips" | "done";

export const initialIntro: IntroKind | undefined =
  typeof document === "undefined"
    ? undefined
    : (document.documentElement.dataset.intro as IntroKind | undefined);

/** Greeting reveal timing, matching .greeting-word in globals.css. */
export const GREETING = { stagger: 40, duration: 500, bootDelay: 1400 } as const;

let stage: IntroStage = initialIntro ? "waiting" : "done";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setIntroStage(next: IntroStage) {
  stage = next;
  listeners.forEach((listener) => listener());
}

export function useIntroStage() {
  return useSyncExternalStore(
    subscribe,
    () => stage,
    () => "idle" as const,
  );
}

let skipRequested = false;
let onSkip: (() => void) | undefined;

/** Skip the boot intro. Works before GSAP has loaded, too. */
export function requestIntroSkip() {
  skipRequested = true;
  onSkip?.();
}

/** Registers the running boot timeline's skip handler; returns whether a skip is already pending. */
export function handleIntroSkip(handler: (() => void) | undefined) {
  onSkip = handler;
  return skipRequested;
}
