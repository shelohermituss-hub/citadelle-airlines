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
