"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlightOffer } from "@/services/amadeus";
import { useCurrency } from "@/components/providers/currency-provider";
import {
  formatClock,
  formatDuration,
  getOfferFare,
  getStopCount,
  isModifiable,
} from "./flight-offer-utils";

export function FlightCard({
  offer,
  recommended = false,
  onSelect,
}: {
  offer: FlightOffer;
  recommended?: boolean;
  onSelect: (offer: FlightOffer) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Results");
  const tFare = useTranslations("Fares");
  const { format } = useCurrency();
  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments;
  const first = segments[0];
  const last = segments[segments.length - 1];
  const fare = getOfferFare(offer);
  const stops = getStopCount(offer);

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between",
        recommended ? "border-primary" : "border-border"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {t("recommended")}
        </span>
      )}

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatClock(first.departure.at, locale)}
          </span>
          <span className="text-muted-foreground" aria-hidden>
            →
          </span>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatClock(last.arrival.at, locale)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {first.departure.iataCode} → {last.arrival.iataCode}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {formatDuration(itinerary.duration)} ·{" "}
          {stops === 0 ? t("direct") : t("oneStop")}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{tFare(fare.brandedFare)}</Badge>
          <Badge variant="outline">
            {t("bagsIncluded", {
              count: fare.includedCheckedBags.quantity ?? 0,
            })}
          </Badge>
          {isModifiable(fare.brandedFare) && (
            <Badge variant="outline" className="text-success">
              {t("modifiable")}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-border pt-4 sm:flex-col sm:items-end sm:gap-3 sm:border-t-0 sm:pt-0 sm:text-right">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {format(offer.price.total, locale)}
        </span>
        <Button onClick={() => onSelect(offer)}>{t("select")}</Button>
      </div>
    </div>
  );
}
