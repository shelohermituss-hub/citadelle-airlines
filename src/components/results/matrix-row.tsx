"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCurrency } from "@/components/providers/currency-provider";
import { cn } from "@/lib/utils";
import type { FlightOffer } from "@/services/amadeus";
import { FlightInfoCell } from "./flight-info-cell";
import { FARE_ORDER, RECOMMENDED_FARE, getOfferFare } from "./flight-offer-utils";

export const MATRIX_GRID_COLUMNS = "grid-cols-[1.6fr_repeat(3,1fr)]";

export function MatrixRow({
  siblings,
  recommendedItinerary,
  onSelect,
}: {
  /** Offres partageant le même itinéraire, une par palier tarifaire disponible. */
  siblings: FlightOffer[];
  recommendedItinerary: boolean;
  onSelect: (offer: FlightOffer) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Results");
  const tFare = useTranslations("Fares");
  const { format } = useCurrency();

  const reference = siblings[0];
  if (!reference) return null;

  return (
    <div
      className={cn(
        "grid items-stretch gap-px bg-border",
        MATRIX_GRID_COLUMNS,
        recommendedItinerary && "ring-1 ring-inset ring-primary/40"
      )}
    >
      <div className="flex items-center bg-card px-4 py-4">
        <FlightInfoCell offer={reference} />
      </div>
      {FARE_ORDER.map((fareCode) => {
        const offer = siblings.find(
          (sibling) => getOfferFare(sibling).brandedFare === fareCode
        );
        const isRecommendedColumn = fareCode === RECOMMENDED_FARE;

        return (
          <button
            key={fareCode}
            type="button"
            disabled={!offer}
            onClick={() => offer && onSelect(offer)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 bg-card px-3 py-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              offer && "hover:bg-muted",
              isRecommendedColumn && "bg-accent/25 hover:bg-accent/40"
            )}
          >
            {offer ? (
              <>
                <span className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
                  {format(offer.price.total, locale)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tFare(fareCode)}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t("notAvailable")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
