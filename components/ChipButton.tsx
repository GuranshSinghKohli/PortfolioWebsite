"use client";

import * as m from "motion/react-m";
import type { ComponentProps } from "react";

import { prefetchOnIntent } from "@/lib/thread/store";
import { cn } from "@/lib/utils";

/**
 * A suggestion chip: a full-radius 44px button that lifts 2px on hover over
 * 150 ms (PRD figure B, effect 4). It asks a question, so it prefetches the
 * thread chunk on hover, focus or press.
 */
export function ChipButton({ className, ...props }: ComponentProps<typeof m.button>) {
  return (
    <m.button
      type="button"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      {...prefetchOnIntent}
      className={cn(
        "h-11 rounded-full border border-line px-4 text-[13px] text-body outline-none transition-colors hover:border-line-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
