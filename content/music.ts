import type { Track } from "./types";

/**
 * The fixed playlist. "Now playing" loops through it by the clock, so every
 * visitor hears the same song at the same moment (PRD section 12).
 *
 * [fill in: 10 to 20 tracks. Copy the entry below for each one. Get the exact
 * duration from the streaming app. Art is fetched by the Phase 4 script.]
 */
export const tracks: Track[] = [
  {
    title: "[fill in: track title]",
    artist: "[fill in: artist]",
    durationSeconds: 0,
    art: "[fill in: /art/track-slug.jpg]",
  },
];

/**
 * True once at least one track is filled in. Until then the site hides
 * Listening everywhere: the sidebar topic, the chip, the now playing card
 * and the answer. Nothing to edit here.
 */
export const hasTracks = tracks.some((track) => !track.title.startsWith("[fill in") && track.durationSeconds > 0);
