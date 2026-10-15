import { rings, type RingName } from "@/content/graph";

type RingGuidesProps = {
  activeRing: RingName | null;
};

export function RingGuides({ activeRing }: RingGuidesProps) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {(Object.keys(rings) as RingName[]).map((ringName) => {
        const ring = rings[ringName];
        const active = ringName === activeRing;
        return (
          <ellipse
            key={ring.id}
            cx={50}
            cy={50}
            rx={ring.rx}
            ry={ring.ry}
            fill="none"
            stroke={active ? "var(--accent)" : "var(--line)"}
            strokeWidth={1}
            strokeDasharray="3 7"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
