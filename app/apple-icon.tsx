import { ImageResponse } from "next/og";

import { MARK_CENTRE, MARK_SATELLITES } from "@/components/LogoMark";

/** Home-screen icon for iOS: the mark on the site's dark background. Rendered once at build time. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const [cx, cy] = MARK_CENTRE;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0e0f12" }}>
        <svg width="120" height="120" viewBox="0 0 22 22">
          {MARK_SATELLITES.map(([x, y]) => (
            <line key={`l${x}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#9a9da6" strokeWidth="1" />
          ))}
          {MARK_SATELLITES.map(([x, y]) => (
            <circle key={`c${x}`} cx={x} cy={y} r="1.5" stroke="#9a9da6" strokeWidth="1" fill="#0e0f12" />
          ))}
          <circle cx={cx} cy={cy} r="2.3" fill="#c8f05a" />
        </svg>
      </div>
    ),
    size,
  );
}
