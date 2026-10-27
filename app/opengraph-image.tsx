import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { chipLabels, homeChips } from "@/content/chips";
import { profile } from "@/content/profile";
import { MARK_CENTRE, MARK_SATELLITES } from "@/components/LogoMark";

/**
 * The share card, in the site's own look: the observatory dark, the lime
 * mark, the greeting line and the composer with its chips. Rendered once at
 * build time.
 */
export const alt = `${profile.name}: ask me about anything I've built.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0e0f12";
const RAISED = "#16181d";
const LINE = "#2a2d34";
const TEXT = "#eceae4";
const BODY = "#d4d2cc";
const MUTED = "#9a9da6";
const ACCENT = "#c8f05a";

/** Cached, so the card is prerendered at build time instead of drawn per request. */
async function loadFonts() {
  "use cache";
  // Base64 strings: Node Buffers share a pooled store and don't survive the cache intact.
  const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file), "base64");
  return Promise.all([font("bricolage-400.ttf"), font("bricolage-500.ttf"), font("jetbrains-mono-400.ttf")]);
}

/** A loose constellation behind the card, echoing the hero. */
const STARS: [number, number, number][] = [
  [880, 120, 3],
  [1010, 210, 2],
  [940, 330, 4],
  [1090, 380, 2.5],
  [820, 260, 2],
  [1120, 110, 2],
  [1000, 480, 3],
];
const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 2],
  [3, 6],
  [1, 5],
];

export default async function Image() {
  const [regular, medium, mono] = (await loadFonts()).map((data) => Uint8Array.from(Buffer.from(data, "base64")).buffer);
  const [cx, cy] = MARK_CENTRE;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: BG,
          fontFamily: "Bricolage",
          color: TEXT,
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          {LINKS.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={STARS[a][0]}
              y1={STARS[a][1]}
              x2={STARS[b][0]}
              y2={STARS[b][1]}
              stroke={LINE}
              strokeWidth="1.5"
            />
          ))}
          {STARS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={i === 2 ? ACCENT : MUTED} opacity={i === 2 ? 1 : 0.6} />
          ))}
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 22 22">
            {MARK_SATELLITES.map(([x, y]) => (
              <line key={`l${x}`} x1={cx} y1={cy} x2={x} y2={y} stroke={MUTED} strokeWidth="1" />
            ))}
            {MARK_SATELLITES.map(([x, y]) => (
              <circle key={`c${x}`} cx={x} cy={y} r="1.5" stroke={MUTED} strokeWidth="1" fill="none" />
            ))}
            <circle cx={cx} cy={cy} r="2.1" fill={ACCENT} />
          </svg>
          <span style={{ fontSize: 30, fontWeight: 500 }}>{profile.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 78, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.02, maxWidth: 820 }}>
            Ask me about anything I&apos;ve built.
          </span>
          <span style={{ fontSize: 30, color: BODY }}>{profile.subLines[0]}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: 760,
              height: 76,
              padding: "0 14px 0 28px",
              borderRadius: 18,
              border: `1.5px solid ${LINE}`,
              backgroundColor: RAISED,
            }}
          >
            <span style={{ fontSize: 26, color: MUTED }}>Ask me about anything I&apos;ve built…</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: ACCENT,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BG} strokeWidth="2.25">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {homeChips.about.map((id) => (
              <span
                key={id}
                style={{
                  display: "flex",
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: `1.5px solid ${LINE}`,
                  fontFamily: "JetBrains Mono",
                  fontSize: 20,
                  color: BODY,
                }}
              >
                {chipLabels[id]}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: regular, weight: 400, style: "normal" },
        { name: "Bricolage", data: medium, weight: 500, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
