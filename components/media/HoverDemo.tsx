"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";

import { cn } from "@/lib/utils";

/**
 * Hover demos (PRD §8, §12): muted, looping, `preload="none"`, playing while
 * a mouse is over the card and rewinding when it leaves. Touch never plays:
 * the cue stays, and a tap opens the sheet instead. Reduced motion skips
 * playback. Projects without a demo don't use any of this.
 */
export function useHoverDemo(enabled: boolean) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const stop = () => {
    const node = video.current;
    if (!node) return;
    node.pause();
    node.currentTime = 0;
    setPlaying(false);
  };

  // Turning on reduced motion mid-hover stops the demo too.
  useEffect(() => {
    if (enabled) return;
    const node = video.current;
    if (!node) return;
    node.pause();
    node.currentTime = 0;
  }, [enabled]);

  return {
    video,
    playing: enabled && playing,
    handlers: {
      onPointerEnter(event: PointerEvent<HTMLElement>) {
        if (!enabled || event.pointerType !== "mouse") return;
        // play() rejects if the pointer leaves before it starts; that's fine.
        video.current
          ?.play()
          .then(() => setPlaying(true))
          .catch(() => {});
      },
      onPointerLeave: stop,
    },
  };
}

/** The card's demo layer: invisible until it plays, so the poster shows meanwhile. */
export function DemoVideo({
  src,
  poster,
  video,
  playing,
}: {
  src: string;
  poster?: string;
  video: RefObject<HTMLVideoElement | null>;
  playing: boolean;
}) {
  return (
    <>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-200",
          playing ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-line bg-bg/70 px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase backdrop-blur-sm transition-opacity duration-200",
          playing && "opacity-0",
        )}
      >
        <Play className="size-3 fill-current" strokeWidth={1.5} />
        Demo
      </span>
    </>
  );
}
