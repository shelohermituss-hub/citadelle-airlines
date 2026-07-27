import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["flights", "passengers", "payment", "ticket"] as const;

export type BookingStep = (typeof STEPS)[number];

/**
 * Stepper « trajectoire de vol » — pointillés + avion sur l'étape
 * active. Affiché sur les étapes 2 à 5 du tunnel (CLAUDE.md règle 6).
 */
export async function FlightStepper({ current }: { current: BookingStep }) {
  const t = await getTranslations("Stepper");
  const currentIndex = STEPS.indexOf(current);

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
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Plane className="size-3.5" aria-hidden />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "size-3 rounded-full",
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
              <div
                className={cn(
                  "mx-1.5 mt-3.5 h-0 flex-1 border-t-2 border-dashed sm:mx-2",
                  isDone ? "border-primary" : "border-border"
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
