"use client";

import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import type { FlightOffer } from "@/services/amadeus";
import {
  formatClock,
  formatDuration,
  formatPrice,
  getOfferFare,
  getStopCount,
} from "@/components/results/flight-offer-utils";

const DATE_LOCALES = { fr, ht: fr, en: enUS } as const;

type AirportCode = "PAP" | "CAP" | "JFK" | "MIA" | "SDQ";

export function TripSummary({
  offer,
  passengerCount,
}: {
  offer: FlightOffer;
  passengerCount: number;
}) {
  const locale = useLocale();
  const t = useTranslations("Confirmation");
  const tFare = useTranslations("Fares");
  const tAirports = useTranslations("Airports");
  const tResults = useTranslations("Results");

  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments;
  const fare = getOfferFare(offer);
  const stops = getStopCount(offer);
  const total = Number(offer.price.total) * passengerCount;

  const dateLabel = format(
    new Date(segments[0].departure.at),
    "d MMMM yyyy",
    { locale: DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enUS }
  );

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          {t("summaryHeading")}
        </h2>
        <p className="text-sm text-muted-foreground capitalize">{dateLabel}</p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">
            {tAirports(segments[0].departure.iataCode as AirportCode)}
          </span>
          <span className="text-muted-foreground" aria-hidden>
            →
          </span>
          <span className="text-xl font-bold text-foreground">
            {tAirports(
              segments[segments.length - 1].arrival.iataCode as AirportCode
            )}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDuration(itinerary.duration)} ·{" "}
          {stops === 0 ? tResults("direct") : tResults("oneStop")}
        </p>
        <Badge variant="outline" className="mt-1 w-fit">
          {tFare(fare.brandedFare)}
        </Badge>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-5">
        {segments.map((segment, index) => (
          <div key={segment.id} className="flex flex-col gap-1.5">
            {index > 0 && (
              <p className="text-xs font-medium text-muted-foreground">
                {t("layoverAt", {
                  airport: tAirports(segment.departure.iataCode as AirportCode),
                })}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold tabular-nums text-foreground">
                  {formatClock(segment.departure.at, locale)}
                </span>
                <span className="text-muted-foreground">
                  {segment.departure.iataCode}
                </span>
                <span className="text-muted-foreground" aria-hidden>
                  →
                </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {formatClock(segment.arrival.at, locale)}
                </span>
                <span className="text-muted-foreground">
                  {segment.arrival.iataCode}
                </span>
              </div>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {segment.carrierCode}
                {segment.number}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-5 text-sm">
        <p className="text-muted-foreground">
          {t("passengersLabel", { count: passengerCount })}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">
            {t("totalPaid")}
          </span>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {formatPrice(total, offer.price.currency, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
