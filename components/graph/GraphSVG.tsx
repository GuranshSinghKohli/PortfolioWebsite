"use client";

import { useState } from "react";

import { edges, nodeById, rings, type RingName } from "@/content/graph";
import { nodePosition, nodesInTabOrder } from "@/lib/graph-geometry";
import { cn } from "cn";
import { NodeButton } from "./NodeButton";
import { RingGuides } from "./RingGuides";

export function GraphSVG() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hovered = hoverId ? nodeById(hoverId) : null;
  const activeRing: RingName | null =
    hovered && hovered.ring !== "centre" ? hovered.ring : null;
  const ordered = nodesInTabOrder();

  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] bg-canvas"
      style={{ aspectRatio: "1.12" }}
      role="group"
      aria-label="Knowledge graph. Four rings, Experience, Skills, Projects, and Life, around the owner at the centre. Nothing is highlighted."
    >
      <RingGuides activeRing={activeRing} />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {edges.map(([fromId, toId]) => {
          const from = nodePosition(nodeById(fromId));
          const to = nodePosition(nodeById(toId));
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--line)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {(Object.keys(rings) as RingName[]).map((ringName) => {
        const ring = rings[ringName];
        const active = ringName === activeRing;
        return (
          <span
            key={ring.id}
            className={cn(
              "ring-label pointer-events-none absolute font-mono text-[10px] tracking-[0.14em] uppercase motion-safe:transition-colors motion-safe:duration-200",
              active ? "text-accent" : "text-muted",
            )}
            style={{
              left: `calc(${50 - ring.rx}% - 12px)`,
              top: "50%",
            }}
          >
            {ring.label}
          </span>
        );
      })}
      {ordered.map((node) => (
        <NodeButton
          key={node.id}
          node={node}
          hovered={hoverId === node.id}
          onHover={setHoverId}
        />
      ))}
    </div>
  );
}
