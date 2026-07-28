"use client";

import { useEffect, useState } from "react";

export type GlobeCapability = "checking" | "supported" | "fallback";

const LOW_END_CORE_THRESHOLD = 4;

function supportsWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Détermine si le globe 3D doit s'afficher — jamais connu côté serveur,
 * donc l'état initial est toujours "checking" (skeleton) pour éviter tout
 * mismatch d'hydratation ; la vraie valeur n'arrive qu'après le montage.
 */
export function useGlobeCapability(): GlobeCapability {
  const [capability, setCapability] = useState<GlobeCapability>("checking");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isLowEndDevice =
      (navigator.hardwareConcurrency ?? 8) <= LOW_END_CORE_THRESHOLD;

    setCapability(
      prefersReducedMotion || isLowEndDevice || !supportsWebgl()
        ? "fallback"
        : "supported"
    );
  }, []);

  return capability;
}
