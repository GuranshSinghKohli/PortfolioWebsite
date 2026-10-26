"use client";

import { useEffect } from "react";

import { MARK_CENTRE, MARK_SATELLITES } from "@/components/LogoMark";
import { initialIntro, requestIntroSkip, setIntroStage } from "@/lib/intro";

/**
 * Starts the home intro after first paint. GSAP and SplitText load in their
 * own chunk here, so they stay out of the first-load JS (DECISIONS 4).
 */
export function Intro() {
  useEffect(() => {
    const kind = initialIntro;
    if (!kind) return;

    let cancelled = false;
    let stop: (() => void) | undefined;
    const frame = requestAnimationFrame(() => {
      import("./runIntro")
        .then(({ runIntro }) => {
          if (!cancelled) stop = runIntro(kind);
        })
        .catch(() => {
          delete document.documentElement.dataset.intro;
          setIntroStage("done");
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stop?.();
    };
  }, []);

  return null;
}

/**
 * Full-screen boot layer for a first visit. CSS shows it only while
 * <html data-intro="boot"> is set; runIntro draws the mark and fades it out.
 */
export function BootOverlay() {
  const [cx, cy] = MARK_CENTRE;
  return (
    <div data-boot-overlay className="fixed inset-0 z-50 hidden flex-col items-center justify-center bg-bg">
      <svg width={72} height={72} viewBox="0 0 22 22" aria-hidden="true" className="text-text">
        <g stroke="currentColor" strokeWidth="0.6" fill="none">
          {MARK_SATELLITES.map(([x, y]) => (
            <line key={`l${x}`} data-draw pathLength={1} x1={cx} y1={cy} x2={x} y2={y} />
          ))}
          {MARK_SATELLITES.map(([x, y]) => (
            <circle key={`c${x}`} data-draw pathLength={1} cx={x} cy={y} r="1.5" />
          ))}
        </g>
        <circle data-boot-core cx={cx} cy={cy} r="2.1" fill="var(--accent)" />
      </svg>
      <button
        type="button"
        onClick={requestIntroSkip}
        className="absolute bottom-6 h-11 rounded-full px-4 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip intro
      </button>
    </div>
  );
}
