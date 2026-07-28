"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { AirportCode, FlightOffer } from "@/services/amadeus";
import {
  formatClock,
  formatDuration,
  getOfferFare,
  getStopCount,
} from "@/components/results/flight-offer-utils";

/** Bloc « vol choisi » réutilisé par les cartes récap (passagers, paiement). */
export function FlightSummaryHeader({ offer }: { offer: FlightOffer }) {
  const locale = useLocale();
  const tFare = useTranslations("Fares");
  const tResults = useTranslations("Results");
  const tAirports = useTranslations("Airports");

  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments;
  const first = segments[0];
  const last = segments[segments.length - 1];
  const fare = getOfferFare(offer);
  const stops = getStopCount(offer);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold tabular-nums text-foreground">
          {formatClock(first.departure.at, locale)}
        </span>
        <span className="text-muted-foreground" aria-hidden>
          →
        </span>
        <span className="text-xl font-bold tabular-nums text-foreground">
          {formatClock(last.arrival.at, locale)}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {tAirports(first.departure.iataCode as AirportCode)} →{" "}
        {tAirports(last.arrival.iataCode as AirportCode)}
      </p>
      <p className="text-sm text-muted-foreground">
        {formatDuration(itinerary.duration)} ·{" "}
        {stops === 0 ? tResults("direct") : tResults("oneStop")}
      </p>
      <Badge variant="outline" className="w-fit">
        {tFare(fare.brandedFare)}
      </Badge>
    </div>
  );
}
