"use client";

import { Line, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { easing } from "maath";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Color, type Group } from "three";

import { MARK_CENTRE, MARK_SATELLITES } from "@/components/LogoMark";

const ORBIT_SECONDS = 12;
const PARALLAX = (4 * Math.PI) / 180;

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
  const colours = { bg: read("--bg"), dim: read("--dim"), accent: read("--accent") };
  probe.remove();
  return colours;
}

type Colours = ReturnType<typeof readColours>;

function Cluster({ colours, pointer }: { colours: Colours; pointer: RefObject<[number, number]> }) {
  const tilt = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  // Above 1.0 so only the lime core passes the bloom threshold.
  const [core] = useState(() => new Color(colours.accent).multiplyScalar(2.2));

  useFrame((_, delta) => {
    if (orbit.current) orbit.current.rotation.z -= (delta * Math.PI * 2) / ORBIT_SECONDS;
    if (tilt.current) {
      const [x, y] = pointer.current;
      easing.dampE(tilt.current.rotation, [-0.35 + y * PARALLAX, x * PARALLAX, 0], 0.25, delta);
    }
  });

  return (
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
  );
}

/**
 * Hero constellation (PRD figure B, effect 1): the mark as a small 3D node
 * cluster on a 12 s orbit, ±4° pointer parallax and bloom on the lime core.
 * Loaded by Hero through next/dynamic, never on the server.
 */
export default function Constellation({ onReady }: { onReady: () => void }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pointer = useRef<[number, number]>([0, 0]);
  const [colours] = useState(readColours);
  const [onScreen, setOnScreen] = useState(true);
  const [bloom, setBloom] = useState(true);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current = [(event.clientX / innerWidth) * 2 - 1, (event.clientY / innerHeight) * 2 - 1];
    };
    window.addEventListener("pointermove", move);

    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    if (wrapper.current) observer.observe(wrapper.current);

    return () => {
      window.removeEventListener("pointermove", move);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        flat
        dpr={[1, 1.75]}
        frameloop={onScreen ? "always" : "demand"}
        camera={{ fov: 30, position: [0, 0, 13] }}
        gl={{ antialias: true, powerPreference: "low-power" }}
        // Two frames, so the first render is on screen before the fallback fades.
        onCreated={() => void requestAnimationFrame(() => requestAnimationFrame(onReady))}
        aria-hidden="true"
      >
        <color attach="background" args={[colours.bg]} />
        <PerformanceMonitor onDecline={() => setBloom(false)} />
        <Cluster colours={colours} pointer={pointer} />
        {bloom && (
          <EffectComposer>
            <Bloom mipmapBlur luminanceThreshold={1} intensity={1.8} radius={0.75} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
