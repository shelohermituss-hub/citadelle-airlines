"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/**
 * Filet de sécurité global : respecte prefers-reduced-motion pour tous
 * les composants motion/react de l'app (CLAUDE.md, section Animations).
 * Les animations sensibles (stagger, rebond PNR, etc.) vérifient en plus
 * explicitement useReducedMotion() pour désactiver totalement leur logique,
 * pas seulement les valeurs de transform.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
