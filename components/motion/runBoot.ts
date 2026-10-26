import { gsap } from "gsap";

import { handleIntroSkip } from "@/lib/intro";
import { BOOT_STORAGE_KEY } from "@/lib/prepaint";

/**
 * Boot intro (PRD figure B, effect 6), first visit only. Loaded after first
 * paint. The mark draws, then the shell fades in, in 1.6 s. Any key or click
 * skips it. Calls `onDone` when the shell is showing. Returns a cleanup that
 * stops it and restores the DOM.
 */
export function runBoot(onDone: () => void) {
  const ctx = gsap.context(() => {});
  let boot: gsap.core.Timeline | undefined;

  try {
    localStorage.setItem(BOOT_STORAGE_KEY, "1");
  } catch {}

  function skip() {
    boot?.progress(1);
  }

  function stopListening() {
    window.removeEventListener("keydown", skip);
    window.removeEventListener("pointerdown", skip);
    handleIntroSkip(undefined);
  }

  ctx.add(() => {
    const overlay = document.querySelector<HTMLElement>("[data-boot-overlay]");
    const shell = document.querySelector<HTMLElement>("[data-shell]");
    boot = gsap.timeline({
      onComplete: () => {
        stopListening();
        onDone();
      },
    });
    if (overlay) {
      boot
        .to(overlay.querySelectorAll("[data-draw]"), {
          strokeDashoffset: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        })
        .fromTo(
          overlay.querySelector("[data-boot-core]"),
          { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
          0.1,
        )
        .to(overlay, { opacity: 0, duration: 0.4, ease: "power1.in" }, 1)
        // <html data-intro="boot"> stays set until the chips finish, so hide the overlay here.
        .set(overlay, { display: "none" });
    }
    if (shell) boot.fromTo(shell, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 1.1);
  });

  window.addEventListener("keydown", skip);
  window.addEventListener("pointerdown", skip);
  if (handleIntroSkip(skip)) skip();

  return () => {
    stopListening();
    ctx.revert();
  };
}
