"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BrandedFare, FlightOffer } from "@/services/amadeus";
import { useCurrency } from "@/components/providers/currency-provider";
import {
  formatClock,
  getOfferFare,
  hasSeatSelection,
  isModifiable,
  isRefundable,
} from "./flight-offer-utils";

const FARE_ORDER: BrandedFare[] = ["ECO", "ECOFLEX", "BUSINESS"];
const RECOMMENDED_FARE: BrandedFare = "ECOFLEX";

/** Origine du transform en % de la boîte du panneau, dérivée du point de
 * clic sur la carte — donne l'impression que le panneau « sort » de la
 * carte cliquée plutôt que de toujours zoomer depuis le centre. */
function getTransformOrigin(origin: { x: number; y: number } | null): string {
  if (!origin || typeof window === "undefined") return "50% 50%";
  const clamp = (value: number) => Math.min(80, Math.max(20, value));
  const originX = clamp((origin.x / window.innerWidth) * 100);
  const originY = clamp((origin.y / window.innerHeight) * 100);
  return `${originX}% ${originY}%`;
}

export function FareComparisonDialog({
  open,
  onOpenChange,
  siblings,
  onSelect,
  origin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Offres partageant le même itinéraire, une par palier tarifaire disponible. */
  siblings: FlightOffer[];
  onSelect: (offer: FlightOffer) => void;
  /** Position de clic (viewport) à l'origine de l'ouverture — voir getTransformOrigin. */
  origin?: { x: number; y: number } | null;
}) {
  const locale = useLocale();
  const t = useTranslations("FareComparison");
  const tFare = useTranslations("Fares");
  const tResults = useTranslations("Results");
  const { format } = useCurrency();

  const reference = siblings[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto data-open:zoom-in-100 data-closed:zoom-out-100 sm:max-w-3xl">
        {reference && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ transformOrigin: getTransformOrigin(origin ?? null) }}
          >
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {t("title")}
              </DialogTitle>
              <DialogDescription>
                {t("description", {
                  origin: reference.itineraries[0].segments[0].departure.iataCode,
                  destination:
                    reference.itineraries[0].segments.at(-1)!.arrival.iataCode,
                  departure: formatClock(
                    reference.itineraries[0].segments[0].departure.at,
                    locale
                  ),
                  arrival: formatClock(
                    reference.itineraries[0].segments.at(-1)!.arrival.at,
                    locale
                  ),
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-3">
              {FARE_ORDER.map((fareCode) => {
                const offer = siblings.find(
                  (sibling) => getOfferFare(sibling).brandedFare === fareCode
                );
                const isRecommended = fareCode === RECOMMENDED_FARE && Boolean(offer);
                const bagsQuantity = offer
                  ? (getOfferFare(offer).includedCheckedBags.quantity ?? 0)
                  : 0;

                return (
                  <div
                    key={fareCode}
                    className={cn(
                      "relative flex flex-col gap-4 rounded-2xl border bg-card p-5",
                      isRecommended ? "border-primary" : "border-border",
                      !offer && "opacity-60"
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {t("recommended")}
                      </span>
                    )}

                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        {tFare(fareCode)}
                      </h3>
                      {offer ? (
                        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                          {format(offer.price.total, locale)}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("notAvailable")}
                        </p>
                      )}
                    </div>

                    <ul className="flex flex-col gap-2 text-sm">
                      <FareRow
                        included={Boolean(offer) && bagsQuantity > 0}
                        label={
                          offer
                            ? `${t("baggage")} — ${tResults("bagsIncluded", {
                                count: bagsQuantity,
                              })}`
                            : t("baggage")
                        }
                      />
                      <FareRow
                        included={Boolean(offer) && isModifiable(fareCode)}
                        label={t("modification")}
                      />
                      <FareRow
                        included={Boolean(offer) && isRefundable(fareCode)}
                        label={t("refund")}
                      />
                      <FareRow
                        included={Boolean(offer) && hasSeatSelection(fareCode)}
                        label={t("seat")}
                      />
                    </ul>

                    <Button
                      className="mt-auto"
                      disabled={!offer}
                      onClick={() => offer && onSelect(offer)}
                    >
                      {t("select")}
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FareRow({ included, label }: { included: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      {included ? (
        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
      ) : (
        <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <span className={included ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </li>
  );
}
