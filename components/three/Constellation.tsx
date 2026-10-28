"use client";

import { Line, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
  type Mesh,
  type MeshBasicMaterial,
  type Texture,
} from "three";

import { MARK_CENTRE, MARK_SATELLITES } from "@/components/LogoMark";
import { useThreadValue } from "@/lib/thread/store";
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

/**
 * 0 on the home screen, 1 in the thread, eased over about 600 ms. Read
 * every frame by the layers that move when a conversation starts.
 */
type Focus = { value: number; target: number; pulse: number; streaming: boolean };

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
function Galaxy({
  colours,
  sprite,
  anchor,
  focus,
}: {
  colours: Colours;
  sprite: Texture;
  anchor: RefObject<Anchor | null>;
  focus: RefObject<Focus>;
}) {
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
    if (place.current && anchor.current) {
      // In the thread the galaxy sinks back and rises a little, out from behind the text.
      const [x, y, z] = onAnchor(anchor.current, -5);
      const away = focus.current.value;
      place.current.position.set(x, y + away * 1.5, z - away * 4);
    }
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
  focus,
}: {
  colours: Colours;
  pointer: RefObject<[number, number]>;
  anchor: RefObject<Anchor | null>;
  focus: RefObject<Focus>;
}) {
  const place = useRef<Group>(null);
  const coreMesh = useRef<Mesh>(null);
  const tilt = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  // Above 1.0 so the lime core passes the bloom threshold.
  const [core] = useState(() => new Color(colours.accent).multiplyScalar(2.2));
  const [lime] = useState(() => new Color(colours.accent));

  useFrame(({ camera, clock }, delta) => {
    const state = focus.current;
    // Signature touch: while an answer streams, the core breathes; it settles when the answer is done.
    easing.damp(state, "pulse", state.streaming ? 1 : 0, 0.35, delta);
    const wave = 0.5 + 0.5 * Math.sin((clock.elapsedTime * Math.PI * 2) / 1.2);
    if (coreMesh.current) {
      coreMesh.current.scale.setScalar(1 + state.pulse * 0.32 * wave);
      (coreMesh.current.material as MeshBasicMaterial).color.copy(lime).multiplyScalar(2.2 + state.pulse * 1.6 * wave);
    }
    if (orbit.current) orbit.current.rotation.z -= (delta * Math.PI * 2) / ORBIT_SECONDS;
    if (tilt.current) {
      const [x, y] = pointer.current;
      easing.dampE(tilt.current.rotation, [-0.35 + y * PARALLAX, x * PARALLAX, 0], 0.25, delta);
    }
    if (place.current && anchor.current) {
      // Follow the camera's parallax, so the mark never drifts off the greeting.
      // In the thread the mark drifts up and back, behind the conversation.
      const [x, y, z] = onAnchor(anchor.current, 0);
      const away = state.value;
      place.current.position.set(x + camera.position.x, y + camera.position.y + away * 3.4, z - away * 5);
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
        <mesh ref={coreMesh}>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshBasicMaterial color={core} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Eases the camera with the pointer: near things move more than far ones, which is what sells the depth. */
function Rig({ pointer, focus }: { pointer: RefObject<[number, number]>; focus: RefObject<Focus> }) {
  useFrame(({ camera }, delta) => {
    const state = focus.current;
    // smoothTime 0.2 settles in about 600 ms.
    easing.damp(state, "value", state.target, 0.2, delta);
    const [x, y] = pointer.current;
    const calm = 1 - state.value * 0.6;
    easing.damp3(camera.position, [x * 0.7 * calm, -y * 0.45 * calm, CAMERA_Z], 0.6, delta);
  });
  return null;
}

/** In the thread the scene sits dim and blurred behind text, so 24 frames a second is plenty. Skips frames while the tab is hidden. */
function Ticker({ fps }: { fps: number }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) invalidate();
    }, 1000 / fps);
    return () => clearInterval(timer);
  }, [fps, invalidate]);
  return null;
}

/**
 * The home screen's 3D layer (PRD figure B, effect 1, extended): the mark's
 * cluster in front of a turning galaxy, a field of distant stars and a
 * drifting constellation network, in one canvas behind the home column.
 * It renders into `#scene-backdrop` (AppShell), behind home and thread
 * alike, and lines the cluster up with the hero box it's given. When a
 * conversation starts it stays mounted: over about 600 ms the mark drifts up
 * and back, the galaxy recedes and the layer dims to 30% with a slight blur;
 * frames then drop to 24 a second. While an answer streams the lime core
 * pulses. Going home reverses it all. Loaded by Hero through next/dynamic
 * only on wide screens with WebGL 2 and motion allowed. Hero stays mounted
 * (hidden) while the thread shows, so the scene is never rebuilt.
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
  const [target] = useState(() => document.getElementById("scene-backdrop"));
  const view = useThreadValue((thread) => thread.view);
  const streaming = useThreadValue((thread) =>
    thread.turns.some((turn) => turn.ai?.status === "waiting" || turn.ai?.status === "streaming"),
  );
  const focus = useRef<Focus>({ value: 0, target: 0, pulse: 0, streaming: false });
  // The view the scene has finished moving to: frames drop to 24 a second only once the 600 ms move is done.
  const [settled, setSettled] = useState(view);
  const thread = view === "thread";
  const throttled = thread && settled === "thread";
  const [colours] = useState(readColours);
  const [sprite] = useState(starTexture);
  const [onScreen, setOnScreen] = useState(true);
  const [bloom, setBloom] = useState(true);
  const [dpr, setDpr] = useState(1.5);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    focus.current.target = thread ? 1 : 0;
    const timer = setTimeout(() => setSettled(view), 700);
    return () => clearTimeout(timer);
  }, [thread, view]);

  useEffect(() => {
    focus.current.streaming = streaming;
  }, [streaming]);

  // Tells the CSS fallback that the 3D scene has the layer.
  useEffect(() => {
    const layer = document.getElementById("scene-backdrop");
    if (!layer) return;
    layer.dataset.scene = "3d";
    return () => void delete layer.dataset.scene;
  }, []);

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
      // Home: full scene. Thread: about 30% and slightly blurred, a quiet layer behind the conversation.
      className={cn(
        "absolute inset-0 transition-[opacity,filter] duration-[600ms] ease-out",
        !shown ? "opacity-0" : thread ? "opacity-30 blur-[2px]" : "opacity-100",
      )}
    >
      <Canvas
        flat
        dpr={[1, dpr]}
        frameloop={!onScreen ? "never" : throttled ? "demand" : "always"}
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
        {throttled && <Ticker fps={24} />}
        <Rig pointer={pointer} focus={focus} />
        <Starfield colours={colours} sprite={sprite} />
        <Galaxy colours={colours} sprite={sprite} anchor={anchor} focus={focus} />
        <Network colours={colours} sprite={sprite} />
        <Cluster colours={colours} pointer={pointer} anchor={anchor} focus={focus} />
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
