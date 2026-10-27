import type { Variants } from "motion/react";
import type { ComponentProps } from "react";

import type { DateRange } from "@/content/types";
import { cn } from "@/lib/utils";

/** PRD figure C, effect 3: cards stagger in 70 ms apart, rising 12px over 320 ms. */
export const cardRise: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.07, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const card = "relative overflow-hidden rounded-[14px] border border-line bg-raised";
export const monoLabel = "font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase";

/** A 44px link or button in the card style: outline by default, lime fill for the main action. */
export function actionClass(primary = false) {
  return cn(
    "inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-raised [&_svg]:size-4 [&_svg]:shrink-0",
    primary
      ? "bg-accent text-accent-foreground hover:brightness-110"
      : "border border-line text-body hover:border-line-muted hover:text-text",
  );
}

/** Opens in a new tab when it leaves the site. */
export function ExternalLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  return <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} {...props} />;
}

/** "Show all 3 projects", under a list that the matcher narrowed. */
export function ShowAll({ count, noun, onClick }: { count: number; noun: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 self-start rounded-full px-3 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
    >
      Show all {count} {noun}
    </button>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function month(value: string) {
  const [year, m] = value.split("-");
  return { year, name: MONTHS[Number(m) - 1] };
}

/** PRD §7 entry format: "May to Dec 2026", "Nov 2025 to May 2026", "Sep 2026 to Present". */
export function formatRange({ start, end }: DateRange) {
  const from = month(start);
  if (!end) return `${from.name} ${from.year} to Present`;
  const to = month(end);
  return from.year === to.year ? `${from.name} to ${to.name} ${to.year}` : `${from.name} ${from.year} to ${to.name} ${to.year}`;
}

/** First letter of each word, at most two, skipping "of" and the like: "Savi Finance" → "SF", "University of Waterloo" → "UW". */
export function monogram(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => !/^(of|and|the|for|at)$/i.test(word))
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
