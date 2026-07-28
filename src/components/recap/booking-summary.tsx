"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { FlightOffer } from "@/services/amadeus";
import {
  formatClock,
  formatDuration,
  formatPrice,
  getOfferFare,
  getStopCount,
} from "@/components/results/flight-offer-utils";

type AirportCode = "PAP" | "CAP" | "JFK" | "MIA" | "SDQ";

export function BookingSummary({
  offer,
  passengerCount,
}: {
  offer: FlightOffer;
  passengerCount: number;
}) {
  const locale = useLocale();
  const t = useTranslations("BookingSummary");
  const tFare = useTranslations("Fares");
  const tResults = useTranslations("Results");
  const tAirports = useTranslations("Airports");

  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments;
  const first = segments[0];
  const last = segments[segments.length - 1];
  const fare = getOfferFare(offer);
  const stops = getStopCount(offer);
  const unitPrice = Number(offer.price.total);
  const total = unitPrice * passengerCount;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-foreground">
        {t("heading")}
      </h2>

      <div className="flex flex-col gap-2 border-b border-border pb-4">
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("passengersLabel", { count: passengerCount })}</span>
          <span>
            {formatPrice(unitPrice, offer.price.currency, locale)}{" "}
            {t("priceEach")}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold text-foreground">{t("total")}</span>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatPrice(total, offer.price.currency, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
