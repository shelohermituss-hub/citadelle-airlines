"use client";

import { useLocale, useTranslations } from "next-intl";
import type { FlightOffer } from "@/services/amadeus";
import { formatClock, formatDuration, getStopCount } from "./flight-offer-utils";

/** Anatomie « .vol » (docs/design-system.html) : heure/aéroports + durée/escales. */
export function FlightInfoCell({ offer }: { offer: FlightOffer }) {
  const locale = useLocale();
  const t = useTranslations("Results");
  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments;
  const first = segments[0];
  const last = segments[segments.length - 1];
  const stops = getStopCount(offer);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
          {formatClock(first.departure.at, locale)}
        </span>
        <span className="text-muted-foreground" aria-hidden>
          →
        </span>
        <span className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
          {formatClock(last.arrival.at, locale)}
        </span>
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">
          {first.departure.iataCode} → {last.arrival.iataCode}
        </span>
      </div>
      <p className="text-xs text-muted-foreground sm:text-sm">
        {formatDuration(itinerary.duration)} ·{" "}
        {stops === 0 ? t("direct") : t("oneStop")}
      </p>
    </div>
  );
}
