import {
  edges,
  nodeById,
  nodes,
  rings,
  type GraphNode,
  type RingName,
} from "@/content/graph";

export const CANVAS_ASPECT = 1.12;
export const MIN_CANVAS_WIDTH = 620;
export const MIN_CLEARANCE_PX = 8;

/** Average advance of Bricolage Grotesque at the pill weight, as a fraction of font size. */
export const CHAR_WIDTH_EM = 0.56;
export const PILL_PAD_X = 24;
export const PILL_PAD_Y = 16;

const RING_ORDER = ["centre", "experience", "skills", "projects", "life"] as const;
const LABEL_GAP_PX = 12;
const LABEL_THICKNESS_PX = 14;

export function nodePosition(node: GraphNode) {
  if (node.ring === "centre" || node.angle == null) return { x: 50, y: 50 };
  const ring = rings[node.ring];
  const theta = (node.angle * Math.PI) / 180;
  return {
    x: 50 + ring.rx * Math.cos(theta),
    y: 50 + ring.ry * Math.sin(theta),
  };
}

export function displayLabel(node: GraphNode) {
  if (node.displayLabel) return node.displayLabel;
  if (node.label.length > 16) return `${node.label.slice(0, 15)}…`;
  return node.label;
}

export function estimatePillSize(node: GraphNode) {
  const fontSize = node.ring === "centre" ? 15 : 13;
  const label = displayLabel(node);
  return {
    width: label.length * fontSize * CHAR_WIDTH_EM + PILL_PAD_X,
    height: fontSize * 1.25 + PILL_PAD_Y,
  };
}

export type Box = {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export function canvasHeight(canvasWidth: number) {
  return canvasWidth / CANVAS_ASPECT;
}

export function pillBox(node: GraphNode, canvasWidth: number): Box {
  const height = canvasHeight(canvasWidth);
  const pos = nodePosition(node);
  const size = estimatePillSize(node);
  const cx = (pos.x / 100) * canvasWidth;
  const cy = (pos.y / 100) * height;
  return {
    id: node.id,
    left: cx - size.width / 2,
    right: cx + size.width / 2,
    top: cy - size.height / 2,
    bottom: cy + size.height / 2,
  };
}

/** Vertical ring label sitting just outside the left edge of its ellipse. */
export function ringLabelBox(ringName: RingName, canvasWidth: number): Box {
  const ring = rings[ringName];
  const height = canvasHeight(canvasWidth);
  const text = ring.label.toUpperCase();
  const fontSize = 10;
  const charAdvance = fontSize * 0.6 + fontSize * 0.14;
  const length = text.length * charAdvance;
  const ringLeft = ((50 - ring.rx) / 100) * canvasWidth;
  const right = ringLeft - LABEL_GAP_PX;
  const cy = height / 2;
  return {
    id: `label:${ringName}`,
    left: right - LABEL_THICKNESS_PX,
    right,
    top: cy - length / 2,
    bottom: cy + length / 2,
  };
}

function overlaps(a: Box, b: Box, clearance: number) {
  return (
    a.left < b.right + clearance &&
    a.right + clearance > b.left &&
    a.top < b.bottom + clearance &&
    a.bottom + clearance > b.top
  );
}

export function findOverlaps(canvasWidth: number) {
  const pills = nodes.map((node) => pillBox(node, canvasWidth));
  const labels = (Object.keys(rings) as RingName[]).map((ringName) =>
    ringLabelBox(ringName, canvasWidth),
  );
  const violations: string[] = [];

  for (let i = 0; i < pills.length; i++) {
    for (let j = i + 1; j < pills.length; j++) {
      if (overlaps(pills[i], pills[j], MIN_CLEARANCE_PX)) {
        violations.push(`${pills[i].id} overlaps ${pills[j].id}`);
      }
    }
  }

  for (const pill of pills) {
    for (const label of labels) {
      if (overlaps(pill, label, MIN_CLEARANCE_PX)) {
        violations.push(`${pill.id} overlaps ${label.id}`);
      }
    }
  }

  return violations;
}

export function nodesInTabOrder() {
  return [...nodes].sort((a, b) => {
    const ringDelta = RING_ORDER.indexOf(a.ring) - RING_ORDER.indexOf(b.ring);
    if (ringDelta !== 0) return ringDelta;
    return (a.angle ?? 0) - (b.angle ?? 0);
  });
}

export function edgeRuleViolations() {
  const violations: string[] = [];
  const seen = new Set<string>();

  for (const [fromId, toId] of edges) {
    const key = [fromId, toId].sort().join("--");
    if (seen.has(key)) violations.push(`duplicate edge ${fromId}–${toId}`);
    seen.add(key);

    const from = nodeById(fromId);
    const to = nodeById(toId);
    if (from.ring === to.ring) {
      violations.push(`${fromId}–${toId} stays on ${from.ring}`);
      continue;
    }

    const fromIndex = RING_ORDER.indexOf(from.ring);
    const toIndex = RING_ORDER.indexOf(to.ring);
    const adjacent = Math.abs(fromIndex - toIndex) === 1;
    const ownerToLife =
      (from.ring === "centre" && to.ring === "life") ||
      (to.ring === "centre" && from.ring === "life");

    if (!adjacent && !ownerToLife) {
      violations.push(`${fromId}–${toId} skips a ring`);
    }
  }

  return violations;
}
