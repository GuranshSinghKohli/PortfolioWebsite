"use client";

import { Line, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { easing } from "maath";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  type Group,
  type Texture,
} from "three";

import { MARK_CENTRE, MARK_SATELLITES } from "@/components/LogoMark";
import { cn } from "@/lib/utils";

const FOV = 40;
const CAMERA_Z = 16;
const HALF_FOV_TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
const ORBIT_SECONDS = 12;
const GALAXY_SECONDS = 150;
const PARALLAX = (4 * Math.PI) / 180;
/** World units per pixel the mark was drawn at in its old 256px canvas, so it keeps its size. */
const MARK_UNITS_PER_PX = (2 * 13 * Math.tan((15 * Math.PI) / 180)) / 256;

/** The mark's satellites in world units, each at its own depth so the orbit reads as 3D. */
const DEPTHS = [0.25, -0.3, 0.05];
const SATELLITES = MARK_SATELLITES.map(
  ([x, y], i) => [(x - MARK_CENTRE[0]) / 7.5, (MARK_CENTRE[1] - y) / 7.5, DEPTHS[i]] as const,
);

/** Theme colours from the page, resolved by the browser (tokens are light-dark() pairs). */
function readColours() {
  const probe = document.createElement("span");
  document.body.append(probe);
  const read = (token: string) => {
    probe.style.color = `var(${token})`;
    return getComputedStyle(probe).color;
  };
  const colours = { bg: read("--bg"), dim: read("--dim"), text: read("--text"), accent: read("--accent") };
  probe.remove();
  return colours;
}

type Colours = ReturnType<typeof readColours>;

/** Where the DOM hero sits, in screen terms the scene can turn into world positions each frame. */
type Anchor = { ndc: [number, number]; aspect: number; unitsPerPx: number };

/** A world position at depth `z` that lands on the anchor's spot on screen (camera at rest). */
function onAnchor({ ndc, aspect }: Anchor, z: number): [number, number, number] {
  const halfHeight = (CAMERA_Z - z) * HALF_FOV_TAN;
  return [ndc[0] * halfHeight * aspect, ndc[1] * halfHeight, z];
}

/** A soft round sprite, so points read as stars rather than squares. */
function starTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.65)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

function geometry(positions: Float32Array, colors: Float32Array) {
  const result = new BufferGeometry();
  result.setAttribute("position", new BufferAttribute(positions, 3));
  result.setAttribute("color", new BufferAttribute(colors, 3));
  return result;
}

/**
 * A three-armed spiral galaxy, lime at the core fading to the page's dim
 * grey, seen at a tilt and turning once every 2.5 minutes. Its core sits
 * behind the mark.
 */
function Galaxy({ colours, sprite, anchor }: { colours: Colours; sprite: Texture; anchor: RefObject<Anchor | null> }) {
  const place = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const [shape] = useState(() => {
    const count = 6500;
    const radius = 12;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const core = new Color(colours.accent);
    const edge = new Color(colours.dim);
    const sparkle = new Color(colours.text);
    const mixed = new Color();
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 1.7) * radius;
      const arm = ((i % 3) / 3) * Math.PI * 2;
      const angle = arm + r * 0.48;
      // Scatter shrinks toward the rim, so the arms stay legible.
      const scatter = () => Math.pow(Math.random(), 2.6) * (Math.random() < 0.5 ? -1 : 1) * (0.35 + r * 0.16);
      positions.set([Math.cos(angle) * r + scatter(), scatter() * 0.35, Math.sin(angle) * r + scatter()], i * 3);
      mixed.copy(core).lerp(edge, Math.min(1, r / (radius * 0.55)));
      if (Math.random() < 0.08) mixed.lerp(sparkle, 0.6);
      mixed.multiplyScalar(0.55 + Math.random() * 0.45);
      colors.set([mixed.r, mixed.g, mixed.b], i * 3);
    }
    return geometry(positions, colors);
  });

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += (delta * Math.PI * 2) / GALAXY_SECONDS;
    if (place.current && anchor.current) place.current.position.set(...onAnchor(anchor.current, -5));
  });

  return (
    <group ref={place}>
      <group rotation={[1.12, 0, 0.32]}>
        <group ref={spin}>
          <points geometry={shape}>
            <pointsMaterial
              size={0.075}
              map={sprite}
              vertexColors
              transparent
              opacity={0.9}
              depthWrite={false}
              blending={AdditiveBlending}
              sizeAttenuation
            />
          </points>
        </group>
      </group>
    </group>
  );
}

/** Faint, distant stars all round, drifting very slowly. */
function Starfield({ colours, sprite }: { colours: Colours; sprite: Texture }) {
  const field = useRef<Group>(null);
  const [shape] = useState(() => {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const tint = new Color(colours.dim);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 22 + Math.random() * 20;
      positions.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), -Math.abs(r * Math.cos(phi)) - 4], i * 3);
      const glow = 0.25 + Math.random() * 0.55;
      colors.set([tint.r * glow, tint.g * glow, tint.b * glow], i * 3);
    }
    return geometry(positions, colors);
  });

  useFrame((_, delta) => {
    if (field.current) field.current.rotation.z += delta * 0.004;
  });

  return (
    <group ref={field}>
      <points geometry={shape}>
        <pointsMaterial size={0.12} map={sprite} vertexColors transparent depthWrite={false} blending={AdditiveBlending} />
      </points>
    </group>
  );
}

const NODES = 46;
const LINK_DISTANCE = 3.4;

type NetworkState = {
  nodes: BufferGeometry;
  lines: BufferGeometry;
  positions: Float32Array;
  velocities: Float32Array;
  line: Color;
};

/** One frame of drift, then relink every pair within reach. Mutates the buffers in place. */
function advance(state: NetworkState, delta: number) {
  const { positions, velocities, nodes, lines, line } = state;
  const step = Math.min(delta, 0.05);
  for (let i = 0; i < NODES * 3; i += 3) {
    for (let axis = 0; axis < 3; axis++) {
      positions[i + axis] += velocities[i + axis] * step;
      const limit = [17, 9, 0][axis];
      const value = positions[i + axis];
      if (axis < 2 ? Math.abs(value) > limit : value > -1 || value < -9) velocities[i + axis] *= -1;
    }
  }
  nodes.getAttribute("position").needsUpdate = true;

  const linePositions = lines.getAttribute("position") as BufferAttribute;
  const lineColors = lines.getAttribute("color") as BufferAttribute;
  let segment = 0;
  for (let a = 0; a < NODES; a++) {
    for (let b = a + 1; b < NODES; b++) {
      const dx = positions[a * 3] - positions[b * 3];
      const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
      const dz = positions[a * 3 + 2] - positions[b * 3 + 2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance > LINK_DISTANCE) continue;
      const strength = (1 - distance / LINK_DISTANCE) * 0.55;
      linePositions.array.set(positions.subarray(a * 3, a * 3 + 3), segment * 6);
      linePositions.array.set(positions.subarray(b * 3, b * 3 + 3), segment * 6 + 3);
      const colour = [line.r * strength, line.g * strength, line.b * strength];
      lineColors.array.set([...colour, ...colour], segment * 6);
      segment++;
    }
  }
  lines.setDrawRange(0, segment * 2);
  linePositions.needsUpdate = true;
  lineColors.needsUpdate = true;
}

/**
 * Drifting nodes that link up when they pass close, like constellations
 * forming and breaking. A few are lime. Lines fade with distance (additive
 * blending, so darker means fainter).
 */
function Network({ colours, sprite }: { colours: Colours; sprite: Texture }) {
  const [state] = useState((): NetworkState => {
    const positions = new Float32Array(NODES * 3);
    const velocities = new Float32Array(NODES * 3);
    const colors = new Float32Array(NODES * 3);
    const dim = new Color(colours.dim);
    const accent = new Color(colours.accent);
    for (let i = 0; i < NODES; i++) {
      positions.set([(Math.random() * 2 - 1) * 17, (Math.random() * 2 - 1) * 9, -9 + Math.random() * 8], i * 3);
      velocities.set([(Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.08], i * 3);
      const colour = i % 9 === 0 ? accent : dim;
      colors.set([colour.r, colour.g, colour.b], i * 3);
    }
    const nodes = geometry(positions, colors);
    const pairs = (NODES * (NODES - 1)) / 2;
    const lines = geometry(new Float32Array(pairs * 6), new Float32Array(pairs * 6));
    (lines.getAttribute("position") as BufferAttribute).setUsage(DynamicDrawUsage);
    (lines.getAttribute("color") as BufferAttribute).setUsage(DynamicDrawUsage);
    return { nodes, lines, positions, velocities, line: dim };
  });

  useFrame((_, delta) => advance(state, delta));

  return (
    <>
      <lineSegments geometry={state.lines}>
        <lineBasicMaterial vertexColors transparent depthWrite={false} blending={AdditiveBlending} />
      </lineSegments>
      <points geometry={state.nodes}>
        <pointsMaterial size={0.32} map={sprite} vertexColors transparent depthWrite={false} blending={AdditiveBlending} />
      </points>
    </>
  );
}

/**
 * The mark as a small 3D node cluster (PRD figure B, effect 1): a 12 s orbit,
 * ±4° pointer parallax and bloom on the lime core. It stays pinned over the
 * hero's spot in the page, at the size it always had.
 */
function Cluster({
  colours,
  pointer,
  anchor,
}: {
  colours: Colours;
  pointer: RefObject<[number, number]>;
  anchor: RefObject<Anchor | null>;
}) {
  const place = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  // Above 1.0 so the lime core passes the bloom threshold.
  const [core] = useState(() => new Color(colours.accent).multiplyScalar(2.2));

  useFrame(({ camera }, delta) => {
    if (orbit.current) orbit.current.rotation.z -= (delta * Math.PI * 2) / ORBIT_SECONDS;
    if (tilt.current) {
      const [x, y] = pointer.current;
      easing.dampE(tilt.current.rotation, [-0.35 + y * PARALLAX, x * PARALLAX, 0], 0.25, delta);
    }
    if (place.current && anchor.current) {
      // Follow the camera's parallax, so the mark never drifts off the greeting.
      const [x, y, z] = onAnchor(anchor.current, 0);
      place.current.position.set(x + camera.position.x, y + camera.position.y, z);
      place.current.scale.setScalar(anchor.current.unitsPerPx / MARK_UNITS_PER_PX);
    }
  });

  return (
    <group ref={place}>
      <group ref={tilt} rotation={[-0.35, 0, 0]}>
        <group ref={orbit}>
          {SATELLITES.map((position) => (
            <group key={position.join()}>
              <Line points={[[0, 0, 0], position]} color={colours.dim} lineWidth={1} transparent opacity={0.7} />
              <mesh position={position}>
                <sphereGeometry args={[0.075, 24, 24]} />
                <meshBasicMaterial color={colours.dim} />
              </mesh>
            </group>
          ))}
        </group>
        <mesh>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshBasicMaterial color={core} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Eases the camera with the pointer: near things move more than far ones, which is what sells the depth. */
function Rig({ pointer }: { pointer: RefObject<[number, number]> }) {
  useFrame(({ camera }, delta) => {
    const [x, y] = pointer.current;
    easing.damp3(camera.position, [x * 0.7, -y * 0.45, CAMERA_Z], 0.6, delta);
  });
  return null;
}

/**
 * The home screen's 3D layer (PRD figure B, effect 1, extended): the mark's
 * cluster in front of a turning galaxy, a field of distant stars and a
 * drifting constellation network, in one canvas behind the home column.
 * It renders into `#home-backdrop` (app/page.tsx) and lines the cluster up
 * with the hero box it's given. Loaded by Hero through next/dynamic only on
 * wide screens with WebGL 2 and motion allowed; it stops drawing whenever
 * the home screen is off screen (the thread hides it).
 */
export default function Constellation({
  onReady,
  hero,
}: {
  onReady: () => void;
  hero: RefObject<HTMLElement | null>;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pointer = useRef<[number, number]>([0, 0]);
  const anchor = useRef<Anchor | null>(null);
  const [target] = useState(() => document.getElementById("home-backdrop"));
  const [colours] = useState(readColours);
  const [sprite] = useState(starTexture);
  const [onScreen, setOnScreen] = useState(true);
  const [bloom, setBloom] = useState(true);
  const [dpr, setDpr] = useState(1.5);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current = [(event.clientX / innerWidth) * 2 - 1, (event.clientY / innerHeight) * 2 - 1];
    };
    window.addEventListener("pointermove", move);

    // The hero's centre in the canvas, refreshed when either moves or resizes.
    const measure = () => {
      const box = wrapper.current?.getBoundingClientRect();
      const mark = hero.current?.getBoundingClientRect();
      if (!box?.height || !mark?.height) return;
      const x = mark.left + mark.width / 2 - box.left;
      const y = mark.top + mark.height / 2 - box.top;
      anchor.current = {
        ndc: [(x / box.width) * 2 - 1, -((y / box.height) * 2 - 1)],
        aspect: box.width / box.height,
        unitsPerPx: (2 * CAMERA_Z * HALF_FOV_TAN) / box.height,
      };
    };
    measure();
    const resize = new ResizeObserver(measure);
    if (wrapper.current) resize.observe(wrapper.current);
    if (hero.current) resize.observe(hero.current);
    window.addEventListener("scroll", measure, { capture: true, passive: true });

    const visible = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    if (wrapper.current) visible.observe(wrapper.current);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", measure, { capture: true });
      resize.disconnect();
      visible.disconnect();
    };
  }, [hero]);

  if (!target) return null;

  return createPortal(
    <div
      ref={wrapper}
      className={cn("absolute inset-0 transition-opacity duration-1000", shown ? "opacity-100" : "opacity-0")}
    >
      <Canvas
        flat
        dpr={[1, dpr]}
        frameloop={onScreen ? "always" : "never"}
        camera={{ fov: FOV, position: [0, 0, CAMERA_Z] }}
        gl={{ antialias: true, powerPreference: "low-power" }}
        // Two frames, so the first render is on screen before the 2D mark fades.
        onCreated={() =>
          void requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              setShown(true);
              onReady();
            }),
          )
        }
        aria-hidden="true"
      >
        <color attach="background" args={[colours.bg]} />
        <PerformanceMonitor
          onDecline={() => {
            setBloom(false);
            setDpr(1);
          }}
        />
        <Rig pointer={pointer} />
        <Starfield colours={colours} sprite={sprite} />
        <Galaxy colours={colours} sprite={sprite} anchor={anchor} />
        <Network colours={colours} sprite={sprite} />
        <Cluster colours={colours} pointer={pointer} anchor={anchor} />
        {bloom && (
          <EffectComposer>
            <Bloom mipmapBlur luminanceThreshold={1} intensity={1.6} radius={0.75} />
          </EffectComposer>
        )}
      </Canvas>
    </div>,
    target,
  );
}
