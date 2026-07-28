"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Fondu + léger glissement vertical entre les écrans du tunnel (400 ms).
 * Pas de mode="wait" : la page suivante reste immédiatement utilisable
 * pendant que l'ancienne s'efface (jamais d'animation qui bloque une
 * action utilisateur — CLAUDE.md, section Animations).
 *
 * La structure est toujours la même côté serveur et client : la
 * désactivation sous prefers-reduced-motion est gérée par le
 * MotionConfig global (reducedMotion="user"), pas par une branche
 * locale — useReducedMotion() lit window.matchMedia dès le premier
 * rendu client, ce qui désynchronise l'arbre DOM de l'hydratation SSR.
 */
export function PageTransition({
  pathKey,
  children,
}: {
  pathKey: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathKey}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
