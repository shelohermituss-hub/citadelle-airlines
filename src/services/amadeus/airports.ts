import { MOCK_FLIGHT_OFFERS } from "./mock-offers.data";

/**
 * Aéroports et paires de routes desservies, dérivés des offres mock
 * — jamais listés en dur dans un composant (CLAUDE.md, règle 1).
 * Les noms de ville affichés vivent dans les messages next-intl
 * (namespace "Airports"), pas ici : ce module ne connaît que les
 * codes IATA et la topologie des routes.
 */

export type RoutePair = readonly [origin: string, destination: string];

function collectRoutePairs(): RoutePair[] {
  const seen = new Set<string>();
  const pairs: RoutePair[] = [];

  for (const offer of MOCK_FLIGHT_OFFERS) {
    const segments = offer.itineraries[0].segments;
    const origin = segments[0].departure.iataCode;
    const destination = segments[segments.length - 1].arrival.iataCode;
    const key = [origin, destination].sort().join("-");

    if (!seen.has(key)) {
      seen.add(key);
      pairs.push([origin, destination]);
    }
  }

  return pairs;
}

/** Paires de routes uniques desservies par Citadelle (ex. ["PAP", "JFK"]). */
export const ROUTE_PAIRS: RoutePair[] = collectRoutePairs();

/** Aéroport de départ par défaut du tunnel de réservation. */
export const DEFAULT_ORIGIN = "PAP";

/** Tous les aéroports desservis, triés alphabétiquement. */
export function getServedAirports(): string[] {
  const codes = new Set<string>();
  for (const [origin, destination] of ROUTE_PAIRS) {
    codes.add(origin);
    codes.add(destination);
  }
  return Array.from(codes).sort();
}

/** Destinations valides depuis un aéroport donné. */
export function getDestinationsFrom(origin: string): string[] {
  const codes = new Set<string>();
  for (const [a, b] of ROUTE_PAIRS) {
    if (a === origin) codes.add(b);
    if (b === origin) codes.add(a);
  }
  return Array.from(codes).sort();
}
