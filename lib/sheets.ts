"use client";

import { useSyncExternalStore } from "react";

/**
 * Which sheet is open (PRD figure 3: sheets open over any state). The last
 * request stays after closing, so the sheet keeps its content while it
 * slides out. The sheet UI is its own chunk, fetched on intent or on first
 * open. Thread chunk only.
 */
export type SheetRequest = { kind: "project"; slug: string } | { kind: "contact" };

type State = { open: boolean; request: SheetRequest | null; opener: HTMLElement | null };

let state: State = { open: false, request: null, opener: null };
const initial = state;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function useSheet() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => initial,
  );
}

let chunk: Promise<unknown> | undefined;

/** Starts fetching the sheet UI. Safe to call often. */
export function prefetchSheets() {
  chunk ??= import("@/components/sheets/Sheets");
}

export const prefetchSheetsOnIntent = { onPointerEnter: prefetchSheets, onFocus: prefetchSheets };

/**
 * Opens a sheet. `opener` gets focus back on close: Safari doesn't focus a
 * clicked button, so Radix alone would hand focus to the page.
 */
export function openSheet(request: SheetRequest, opener?: HTMLElement | null) {
  prefetchSheets();
  set({ open: true, request, opener: opener ?? (document.activeElement as HTMLElement | null) });
}

export function closeSheet() {
  set({ open: false });
}
