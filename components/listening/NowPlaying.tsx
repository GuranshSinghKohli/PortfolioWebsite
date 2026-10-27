"use client";

import { Music, Volume2, VolumeX } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

import { isFilled } from "@/lib/content";
import { clockTime, nowPlaying, playlist } from "@/lib/listening";
import { cn } from "@/lib/utils";
import { nowPlayingLabel as label, NowPlayingPlaceholder } from "./NowPlayingPlaceholder";

/** The clock in whole seconds. `null` on the server and the first frame, which show the placeholder. */
function useSeconds() {
  return useSyncExternalStore(
    (listener) => {
      const timer = setInterval(listener, 1000);
      return () => clearInterval(timer);
    },
    () => Math.floor(Date.now() / 1000),
    () => null,
  );
}

const MUTE_KEY = "now-playing-muted";

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

/** PRD figure B, effect 5: three bars at random heights, 400 ms eases. Still when muted or reduced. */
function Equaliser({ active }: { active: boolean }) {
  const [heights] = useState(() =>
    [0, 1, 2].map(() => Array.from({ length: 6 }, () => 0.25 + Math.random() * 0.75)),
  );

  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
      {heights.map((frames, i) => (
        <m.span
          key={i}
          className="h-full w-[3px] origin-bottom rounded-full bg-accent"
          initial={{ scaleY: 0.35 }}
          animate={active ? { scaleY: frames } : { scaleY: 0.35 }}
          transition={
            active
              ? { duration: frames.length * 0.4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}

/**
 * The rail's now playing card (PRD §7, §12): the track the clock says is on,
 * its art, a progress bar that really moves, equaliser bars and a mute
 * toggle. There is no audio; mute stills the bars, and it's remembered.
 */
export function NowPlaying() {
  const seconds = useSeconds();
  const [muted, setMuted] = useState(readMuted);
  const current = seconds === null ? null : nowPlaying(playlist, seconds * 1000);

  const toggle = () => {
    setMuted(!muted);
    try {
      localStorage.setItem(MUTE_KEY, muted ? "0" : "1");
    } catch {
      // Private mode: the choice lasts until reload.
    }
  };

  if (!current) return <NowPlayingPlaceholder />;
  const { track, index, elapsed } = current;
  const progress = elapsed / track.durationSeconds;

  return (
    <section aria-label="Now playing" className="shrink-0 rounded-[14px] border border-line bg-surface p-2.5 pr-1">
      <div className="flex items-center gap-2.5">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-[8px] bg-raised">
          {isFilled(track.art) ? (
            <Image src={track.art} alt="" fill sizes="40px" className="object-cover" />
          ) : (
            <Music className="absolute inset-0 m-auto size-4 text-dim" strokeWidth={1.5} aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn(label, "flex items-center gap-2")}>
            <Equaliser active={!muted} />
            Now playing
          </p>
          <p className="mt-0.5 truncate text-[13px] text-text">{track.title}</p>
          <p className="truncate text-[12px] text-muted-foreground">{track.artist}</p>
        </div>
        <button
          type="button"
          aria-pressed={muted}
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={toggle}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
        >
          {muted ? (
            <VolumeX className="size-4" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Volume2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="mt-2 mr-1.5 flex items-center gap-2">
        <span className="font-mono text-[10px] text-dim tabular-nums">{clockTime(elapsed)}</span>
        <div
          role="progressbar"
          aria-label="Track progress"
          aria-valuemin={0}
          aria-valuemax={track.durationSeconds}
          aria-valuenow={elapsed}
          aria-valuetext={`${clockTime(elapsed)} of ${clockTime(track.durationSeconds)}`}
          className="h-0.5 flex-1 overflow-hidden rounded-full bg-line"
        >
          {/* Keyed by track, so a new song starts from zero instead of sliding back. */}
          <div
            key={index}
            className="h-full origin-left rounded-full bg-accent transition-transform duration-1000 ease-linear"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <span className="font-mono text-[10px] text-dim tabular-nums">{clockTime(track.durationSeconds)}</span>
      </div>
    </section>
  );
}
