import type { ReactNode } from "react";

import { LogoMark } from "@/components/LogoMark";

/** The 404 and error screens: the mark, a mono label, a line in the site's voice and a way back. */
export function StatusPage({
  label,
  title,
  children,
  actions,
}: {
  label: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 py-16">
      <div className="flex w-full max-w-[560px] flex-col items-start gap-5">
        <LogoMark size={36} className="text-muted-foreground" />
        <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
        <h1 className="text-[clamp(2rem,6vw,2.75rem)] leading-[1.05] font-medium tracking-[-0.02em] text-balance text-text">
          {title}
        </h1>
        <div className="max-w-[48ch] text-[16px] leading-[1.6] text-pretty text-body">{children}</div>
        <div className="flex flex-wrap gap-2 pt-2">{actions}</div>
      </div>
    </main>
  );
}

/** A 44px pill, lime for the main action. */
export const statusAction = (primary = false) =>
  [
    "inline-flex h-11 cursor-pointer items-center rounded-full px-5 text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    primary
      ? "bg-accent text-accent-foreground hover:brightness-110"
      : "border border-line text-body hover:border-line-muted hover:text-text",
  ].join(" ");
