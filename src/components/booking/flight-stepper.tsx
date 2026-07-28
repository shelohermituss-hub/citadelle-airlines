"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["flights", "passengers", "payment", "ticket"] as const;

export type BookingStep = (typeof STEPS)[number];

/**
 * Stepper « trajectoire de vol » — pointillés + avion sur l'étape
 * active. Affiché sur les étapes 2 à 5 du tunnel (CLAUDE.md règle 6).
 * Monté une seule fois par (tunnel)/layout.tsx : l'avion glisse d'une
 * étape à l'autre (layoutId) au lieu de resauter, et le trait se
 * dessine derrière lui à chaque changement de `current`.
 */
export function FlightStepper({ current }: { current: BookingStep }) {
  const t = useTranslations("Stepper");
  const currentIndex = STEPS.indexOf(current);
  const transition = { duration: 0.45, ease: "easeOut" as const };

  return (
    <ol className="mx-auto flex w-full max-w-xl items-start">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <Fragment key={step}>
            <li
              className="flex flex-col items-center gap-1.5"
              aria-current={isActive ? "step" : undefined}
            >
              <span className="flex size-7 shrink-0 items-center justify-center">
                {isActive ? (
                  <motion.span
                    layoutId="flight-stepper-active"
                    transition={transition}
                    className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Plane className="size-3.5" aria-hidden />
                  </motion.span>
                ) : (
                  <span
                    className={cn(
                      "size-3 rounded-full transition-colors duration-300",
                      isDone ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] sm:text-xs",
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {t(step)}
              </span>
            </li>
            {index < STEPS.length - 1 && (
              <div className="relative mx-1.5 mt-3.5 h-0 flex-1 sm:mx-2">
                <div className="absolute inset-0 border-t-2 border-dashed border-border" />
                <motion.div
                  className="absolute inset-0 origin-left border-t-2 border-primary"
                  initial={false}
                  animate={{ scaleX: isDone ? 1 : 0 }}
                  transition={transition}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
