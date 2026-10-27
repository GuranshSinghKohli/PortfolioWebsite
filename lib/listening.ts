import { tracks } from "@/content/music";
import type { Track } from "@/content/types";
import { isFilled } from "./content";

/** The tracks that are really filled in. Empty until content/music.ts has songs. */
export const playlist = tracks.filter((track) => isFilled(track.title) && track.durationSeconds > 0);

export type NowPlaying = { track: Track; index: number; elapsed: number };

/**
 * What's playing at `nowMs` (PRD §12): the playlist loops from the Unix
 * epoch, so every visitor sees the same song at the same second.
 */
export function nowPlaying(list: Track[], nowMs: number): NowPlaying | null {
  const total = list.reduce((sum, track) => sum + track.durationSeconds, 0);
  if (!total) return null;
  let elapsed = Math.floor(nowMs / 1000) % total;
  for (const [index, track] of list.entries()) {
    if (elapsed < track.durationSeconds) return { track, index, elapsed };
    elapsed -= track.durationSeconds;
  }
  return null;
}

/** 3:07 */
export function clockTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
