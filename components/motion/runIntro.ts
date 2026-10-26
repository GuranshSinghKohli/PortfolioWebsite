import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

import { handleIntroSkip, setIntroStage, type IntroKind } from "@/lib/intro";
import { BOOT_STORAGE_KEY } from "@/lib/prepaint";

gsap.registerPlugin(SplitText);

/**
 * The home intro (PRD figure B, effects 2 and 6). Loaded after first paint.
 * Boot: the mark draws, then the shell fades in, in 1.6 s. Any key or click
 * skips it. Then the greeting reveals word by word and the chips rise in.
 * Returns a cleanup that stops everything and restores the DOM.
 */
export function runIntro(kind: IntroKind) {
  const root = document.documentElement;
  const ctx = gsap.context(() => {});
  let boot: gsap.core.Timeline | undefined;
  let split: SplitText | undefined;

  root.dataset.intro = kind;
  setIntroStage("waiting");

  function finish() {
    split?.revert();
    delete root.dataset.intro;
    setIntroStage("done");
  }

  function skip() {
    boot?.progress(1);
  }

  function stopListening() {
    window.removeEventListener("keydown", skip);
    window.removeEventListener("pointerdown", skip);
    handleIntroSkip(undefined);
  }

  function reveal() {
    stopListening();
    root.dataset.intro = "reveal";
    ctx.add(() => {
      const greeting = document.getElementById("home-greeting");
      const subLine = document.getElementById("home-subline");
      const tl = gsap.timeline({ onComplete: finish });

      if (greeting) {
        split = SplitText.create(greeting, { type: "words" });
        tl.set(greeting, { opacity: 1 }).from(split.words, {
          y: 8,
          opacity: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: "power3.out",
        });
      }
      if (subLine) {
        tl.fromTo(subLine, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.2);
      }
      // Chips start as the greeting settles: 60 ms stagger, 320 ms each.
      tl.call(() => setIntroStage("chips"), undefined, "-=0.15").set({}, {}, "+=0.6");
    });
  }

  if (kind === "boot") {
    try {
      localStorage.setItem(BOOT_STORAGE_KEY, "1");
    } catch {}

    ctx.add(() => {
      const overlay = document.querySelector<HTMLElement>("[data-boot-overlay]");
      const shell = document.querySelector<HTMLElement>("[data-shell]");
      boot = gsap.timeline({ onComplete: reveal });
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
          .to(overlay, { opacity: 0, duration: 0.4, ease: "power1.in" }, 1);
      }
      if (shell) boot.fromTo(shell, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 1.1);
    });

    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    if (handleIntroSkip(skip)) skip();
  } else {
    reveal();
  }

  return () => {
    stopListening();
    ctx.revert();
  };
}
