"use client";

import { useSyncExternalStore } from "react";

/** A CSS media query as React state. The server, and hydration, see `false`. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (listener) => {
      const list = matchMedia(query);
      list.addEventListener("change", listener);
      return () => list.removeEventListener("change", listener);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
