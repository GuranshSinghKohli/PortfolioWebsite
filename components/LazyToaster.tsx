"use client";

import dynamic from "next/dynamic";

/** Sonner loads after hydration: nothing toasts at first paint, and it keeps ~10 kB out of the first load. */
export const LazyToaster = dynamic(() => import("@/components/ui/sonner").then((mod) => mod.Toaster), {
  ssr: false,
});
