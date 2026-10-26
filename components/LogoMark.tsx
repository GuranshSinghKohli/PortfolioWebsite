export function LogoMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="11" y1="11" x2="11" y2="3.5" />
        <line x1="11" y1="11" x2="17.5" y2="14.75" />
        <line x1="11" y1="11" x2="4.5" y2="14.75" />
        <circle cx="11" cy="3.5" r="1.5" />
        <circle cx="17.5" cy="14.75" r="1.5" />
        <circle cx="4.5" cy="14.75" r="1.5" />
      </g>
      <circle cx="11" cy="11" r="2.1" fill="var(--accent)" />
    </svg>
  );
}
