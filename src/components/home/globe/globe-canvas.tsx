"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GlobeScene } from "./globe-scene";

/**
 * Chargé uniquement via next/dynamic({ ssr: false }) — voir globe-loader.tsx.
 * dpr plafonné à 1.5 et pas de post-processing pour tenir 60 fps mobile.
 */
export default function GlobeCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5.0], fov: 42 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
    >
      <Suspense fallback={null}>
        <GlobeScene />
      </Suspense>
    </Canvas>
  );
}
