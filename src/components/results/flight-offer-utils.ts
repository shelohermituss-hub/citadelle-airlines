import type { BrandedFare, FlightOffer } from "@/services/amadeus";

const LOCALE_TAGS = { fr: "fr-FR", ht: "fr-FR", en: "en-US" } as const;

export function toIntlLocale(locale: string): string {
  return LOCALE_TAGS[locale as keyof typeof LOCALE_TAGS] ?? "en-US";
}

/** Parse une durée ISO 8601 (ex. "PT3H45M") en heures/minutes. */
export function parseIsoDuration(iso: string): {
  hours: number;
  minutes: number;
} {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?$/.exec(iso);
  return {
    hours: Number(match?.[1] ?? 0),
    minutes: Number(match?.[2] ?? 0),
  };
}

/** Formate une durée ISO 8601 en libellé compact ("3h45", "45min"). */
export function formatDuration(iso: string): string {
  const { hours, minutes } = parseIsoDuration(iso);
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

export function formatDurationMinutes(iso: string): number {
  const { hours, minutes } = parseIsoDuration(iso);
  return hours * 60 + minutes;
}

export function formatPrice(
  amount: string | number,
  currency: string,
  locale: string
): string {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatClock(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function getOfferFare(offer: FlightOffer) {
  return offer.travelerPricings[0].fareDetailsBySegment[0];
}

export function getStopCount(offer: FlightOffer): number {
  return offer.itineraries[0].segments.length - 1;
}

export function isDirect(offer: FlightOffer): boolean {
  return getStopCount(offer) === 0;
}

/** Un tarif Éco Flex ou Business est modifiable (voir docs/design-system.html). */
export function isModifiable(fare: BrandedFare): boolean {
  return fare !== "ECO";
}

/** Seul le tarif Business est remboursable (voir docs/design-system.html). */
export function isRefundable(fare: BrandedFare): boolean {
  return fare === "BUSINESS";
}

/** Seul le tarif Business inclut la sélection de siège (« Siège premium »). */
export function hasSeatSelection(fare: BrandedFare): boolean {
  return fare === "BUSINESS";
}

/**
 * Signature d'itinéraire (numéros de vol + horaires) permettant de
 * regrouper les offres qui représentent le même vol à des tarifs
 * différents — c'est ce regroupement qui alimente le panneau de
 * comparaison des classes (docs/anatomie-tunnel.md section 3).
 */
export function getItineraryKey(offer: FlightOffer): string {
  return offer.itineraries[0].segments
    .map((segment) => `${segment.carrierCode}${segment.number}-${segment.departure.at}`)
    .join("|");
}

const FARE_ORDER: BrandedFare[] = ["ECO", "ECOFLEX", "BUSINESS"];

/** Les offres partageant le même itinéraire que `target`, triées Éco → Business. */
export function getFareSiblings(
  offers: FlightOffer[],
  target: FlightOffer
): FlightOffer[] {
  const key = getItineraryKey(target);
  return offers
    .filter((offer) => getItineraryKey(offer) === key)
    .sort(
      (a, b) =>
        FARE_ORDER.indexOf(getOfferFare(a).brandedFare) -
        FARE_ORDER.indexOf(getOfferFare(b).brandedFare)
    );
}

export function getDepartureHour(offer: FlightOffer): number {
  return new Date(offer.itineraries[0].segments[0].departure.at).getHours();
}

export type TimeOfDay = "morning" | "afternoon" | "evening";

export function getTimeOfDay(offer: FlightOffer): TimeOfDay {
  const hour = getDepartureHour(offer);
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
