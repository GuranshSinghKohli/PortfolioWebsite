"use client";

import { useEffect } from "react";

import { MARK_CENTRE, MARK_SATELLITES } from "@/components/LogoMark";
import { GREETING, initialIntro, requestIntroSkip, setIntroStage, type IntroKind } from "@/lib/intro";

/** Chips start this long before the greeting finishes, and take this long (60 ms stagger, 320 ms each). */
const CHIPS_LEAD = 150;
const CHIPS_DURATION = 600;

/** When the CSS greeting reveal ends, in ms since navigation start. */
function greetingEnd(kind: IntroKind) {
  const words = document.querySelectorAll("#home-greeting .greeting-word").length;
  const paint = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
  const delay = kind === "boot" ? GREETING.bootDelay : 0;
  return paint + delay + Math.max(words - 1, 0) * GREETING.stagger + GREETING.duration;
}

/**
 * Runs the home intro. On a first visit the GSAP boot loads after first
 * paint in its own chunk, so it stays out of the first-load JS (DECISIONS 4).
 * The chips rise in as the greeting settles, then the intro ends.
 */
export function Intro() {
  useEffect(() => {
    const kind = initialIntro;
    if (!kind) return;

    const root = document.documentElement;
    root.dataset.intro = kind;
    setIntroStage("waiting");

    let cancelled = false;
    let stopBoot: (() => void) | undefined;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const finish = () => {
      delete root.dataset.intro;
      setIntroStage("done");
    };
    const chipsThenFinish = () => {
      const wait = Math.max(0, greetingEnd(kind) - CHIPS_LEAD - performance.now());
      timers.push(
        setTimeout(() => {
          setIntroStage("chips");
          timers.push(setTimeout(finish, CHIPS_DURATION));
        }, wait),
      );
    };

    let frame = 0;
    if (kind === "boot") {
      frame = requestAnimationFrame(() => {
        import("./runBoot")
          .then(({ runBoot }) => {
            if (!cancelled) stopBoot = runBoot(chipsThenFinish);
          })
          .catch(finish);
      });
    } else {
      chipsThenFinish();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      stopBoot?.();
    };
  }, []);

  return null;
}

/**
 * Full-screen boot layer for a first visit. CSS shows it only while
 * <html data-intro="boot"> is set; runBoot draws the mark and fades it out.
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
