import { MARK_CENTRE, MARK_SATELLITES } from "@/components/LogoMark";
import { cn } from "@/lib/utils";

/**
 * 2D version of the hero (PRD §10 fallback rules): shown while the 3D scene
 * loads, on phones under 600px, and with reduced motion. Same mark, with a
 * soft glow standing in for bloom.
 */
export function ConstellationFallback({ className }: { className?: string }) {
  const [cx, cy] = MARK_CENTRE;
  return (
    <svg viewBox="-2 -2 26 26" aria-hidden="true" className={cn("text-dim", className)}>
      <defs>
        <radialGradient id="constellation-glow">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r="6" fill="url(#constellation-glow)" />
      <g stroke="currentColor" strokeWidth="0.5" fill="none">
        {MARK_SATELLITES.map(([x, y]) => (
          <line key={`l${x}`} x1={cx} y1={cy} x2={x} y2={y} />
        ))}
      </g>
      {MARK_SATELLITES.map(([x, y]) => (
        <circle key={`c${x}`} cx={x} cy={y} r="1.1" fill="currentColor" />
      ))}
      <circle cx={cx} cy={cy} r="1.6" fill="var(--accent)" />
    </svg>
  );
}
