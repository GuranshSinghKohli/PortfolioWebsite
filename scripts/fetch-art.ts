/**
 * Fetches album art once for every track in content/music.ts into
 * public/art/ (PRD §12). The site only ever serves these local copies; it
 * never hotlinks the catalogue. Run by hand after editing the playlist:
 *
 *   npm run fetch-art            # skips art already downloaded
 *   npm run fetch-art -- --force # downloads everything again
 *
 * Source: the iTunes Search API (public, no key). Not part of the build.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { tracks } from "../content/music.ts";

const ART_DIR = path.join(import.meta.dirname, "..", "public", "art");
const SIZE = 600;
const force = process.argv.includes("--force");

type Result = { artistName: string; trackName: string; artworkUrl100?: string };

const fold = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const slugify = (text: string) =>
  fold(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** `/art/x.jpg` from music.ts when it's filled in, otherwise one made from the artist and title. */
function artPath(track: (typeof tracks)[number]) {
  if (!track.art.startsWith("[fill in")) return track.art;
  return `/art/${slugify(`${track.artist} ${track.title}`)}.jpg`;
}

async function findArtwork(artist: string, title: string) {
  const url = new URL("https://itunes.apple.com/search");
  url.search = new URLSearchParams({ term: `${artist} ${title}`, media: "music", entity: "song", limit: "10" }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`search returned ${response.status}`);
  const { results } = (await response.json()) as { results: Result[] };
  // Prefer a result by the same artist, so a cover version doesn't win.
  const best = results.find((result) => fold(result.artistName).includes(fold(artist))) ?? results[0];
  return best?.artworkUrl100?.replace(/\/\d+x\d+bb\./, `/${SIZE}x${SIZE}bb.`);
}

async function main() {
  const filled = tracks.filter((track) => !track.title.startsWith("[fill in"));
  if (!filled.length) {
    console.log("content/music.ts has no tracks yet. Add some, then run this again.");
    return;
  }
  await mkdir(ART_DIR, { recursive: true });

  const toUpdate: string[] = [];
  let failed = 0;
  for (const track of filled) {
    const target = artPath(track);
    const file = path.join(ART_DIR, path.basename(target));
    const name = `${track.artist} - ${track.title}`;
    if (!target.startsWith("/art/")) {
      console.warn(`skip  ${name}: art should be a path under /art/, got ${target}`);
      continue;
    }
    if (target !== track.art) toUpdate.push(`  ${name}: art: "${target}"`);
    if (existsSync(file) && !force) {
      console.log(`have  ${name}`);
      continue;
    }
    try {
      const artwork = await findArtwork(track.artist, track.title);
      if (!artwork) throw new Error("no match in the catalogue");
      const image = await fetch(artwork);
      if (!image.ok) throw new Error(`art returned ${image.status}`);
      await writeFile(file, Buffer.from(await image.arrayBuffer()));
      console.log(`saved ${name} → public${target}`);
    } catch (error) {
      failed++;
      console.warn(`miss  ${name}: ${(error as Error).message}`);
    }
  }

  if (toUpdate.length) console.log(`\nSet these in content/music.ts:\n${toUpdate.join("\n")}`);
  if (failed) process.exitCode = 1;
}

await main();
