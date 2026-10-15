"use client";

import { displayLabel, nodePosition } from "@/lib/graph-geometry";
import type { GraphNode } from "@/content/graph";
import { cn } from "cn";

type NodeButtonProps = {
  node: GraphNode;
  hovered: boolean;
  onHover: (id: string | null) => void;
};

export function NodeButton({ node, hovered, onHover }: NodeButtonProps) {
  const position = nodePosition(node);
  const owner = node.ring === "centre";
  const label = displayLabel(node);

  return (
    <button
      type="button"
      className="group absolute z-10 grid min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 place-items-center border-0 bg-transparent p-0"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      aria-pressed={false}
      aria-label={node.label}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
    >
      <span
        className={cn(
          "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-2 font-medium leading-[1.25] motion-safe:transition-colors motion-safe:duration-200 group-focus-visible:ring-2 group-focus-visible:ring-accent",
          owner ? "text-[15px]" : "text-[13px]",
          owner
            ? "border-transparent bg-text text-bg"
            : hovered
              ? "border-muted bg-surface text-text"
              : "border-line bg-surface text-text",
        )}
      >
        {label}
      </span>
    </button>
  );
}
