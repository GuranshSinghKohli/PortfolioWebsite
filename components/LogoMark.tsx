/** The mark on a 22-unit grid (PRD §4): a lime centre with three linked satellites. */
export const MARK_CENTRE = [11, 11] as const;
export const MARK_SATELLITES = [
  [11, 3.5],
  [17.5, 14.75],
  [4.5, 14.75],
] as const;

export function LogoMark({ size = 22, className }: { size?: number; className?: string }) {
  const [cx, cy] = MARK_CENTRE;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1" fill="none">
        {MARK_SATELLITES.map(([x, y]) => (
          <line key={`l${x}`} x1={cx} y1={cy} x2={x} y2={y} />
        ))}
        {MARK_SATELLITES.map(([x, y]) => (
          <circle key={`c${x}`} cx={x} cy={y} r="1.5" />
        ))}
      </g>
      <circle cx={cx} cy={cy} r="2.1" fill="var(--accent)" />
    </svg>
  );
}
