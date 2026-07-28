"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FlightOffer } from "@/services/amadeus";
import { MatrixRow, MATRIX_GRID_COLUMNS } from "./matrix-row";
import { FARE_ORDER, RECOMMENDED_FARE, getFareSiblings, getItineraryKey } from "./flight-offer-utils";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export function FareMatrix({
  itineraries,
  allOffers,
  recommendedItineraryKey,
  onSelect,
}: {
  /** Une offre représentative par itinéraire unique (voir getUniqueItineraries). */
  itineraries: FlightOffer[];
  /** Ensemble complet des offres (non filtré par palier) pour retrouver tous les tarifs d'un itinéraire. */
  allOffers: FlightOffer[];
  recommendedItineraryKey: string | undefined;
  onSelect: (offer: FlightOffer) => void;
}) {
  const t = useTranslations("Results");
  const tFare = useTranslations("Fares");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className={cn("grid gap-px bg-border text-center", MATRIX_GRID_COLUMNS)}>
        <div className="bg-card px-4 py-3" aria-hidden />
        {FARE_ORDER.map((fareCode) => (
          <div
            key={fareCode}
            className={cn(
              "flex flex-col items-center gap-1 bg-card px-3 py-3",
              fareCode === RECOMMENDED_FARE && "bg-accent/25"
            )}
          >
            {fareCode === RECOMMENDED_FARE && (
              <Badge variant="gold">{t("recommendedFare")}</Badge>
            )}
            <span className="font-serif text-sm font-semibold text-foreground sm:text-base">
              {tFare(fareCode)}
            </span>
          </div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={listVariants}>
        {itineraries.map((offer) => {
          const key = getItineraryKey(offer);
          return (
            <motion.div key={key} variants={rowVariants}>
              <MatrixRow
                siblings={getFareSiblings(allOffers, offer)}
                recommendedItinerary={key === recommendedItineraryKey}
                onSelect={onSelect}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
