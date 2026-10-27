"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@/lib/media";
import { cn } from "@/lib/utils";
import { ConstellationFallback } from "./ConstellationFallback";

const Constellation = dynamic(() => import("./Constellation"), { ssr: false });

function supportsWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Home hero (PRD §10): the 2D mark renders first, then the 3D scene loads in
 * its own chunk once the browser is idle and crossfades in: the mark as a 3D
 * cluster pinned to this box, in front of a galaxy that fills the home
 * screen's background (#home-backdrop). Phones under 600px, reduced motion
 * and browsers without WebGL 2 keep the 2D mark and a plain background.
 */
export function Hero() {
  const wide = useMediaQuery("(min-width: 600px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [canLoad, setCanLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = () => setCanLoad(supportsWebGL2());
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(start, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(start, 200);
    return () => clearTimeout(id);
  }, []);

  const show3d = canLoad && wide && !reduced;

  return (
    <div ref={box} className="relative size-20 min-[600px]:size-32">
      <ConstellationFallback
        className={cn("absolute inset-0 size-full transition-opacity duration-500", show3d && ready && "opacity-0")}
      />
      {show3d && <Constellation hero={box} onReady={() => setReady(true)} />}
    </div>
  );
}
