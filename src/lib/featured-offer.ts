import { MOCK_FLIGHT_OFFERS } from "@/services/amadeus/mock-offers.data";
import { HUB_AIRPORT } from "@/services/amadeus/coordinates";
import type { AirportCode, FlightOffer } from "@/services/amadeus";
import { getOfferFare, isDirect } from "@/components/results/flight-offer-utils";

/** Destinations phares mises en avant sur la carte "preuve produit" du hero. */
const SHOWCASE_DESTINATIONS: AirportCode[] = ["JFK", "IST", "GRU", "YUL"];

export interface FeaturedOffer {
  origin: string;
  destination: string;
  priceTotal: string;
  currency: string;
  departureAt: string;
}

/**
 * Choisit une offre directe attractive depuis le hub pour la carte
 * flottante du hero — jamais de prix/route en dur (CLAUDE.md règle 1),
 * toujours dérivé de src/services/amadeus/mock-offers.data.ts.
 */
export function getFeaturedOffer(): FeaturedOffer {
  const directFromHub = MOCK_FLIGHT_OFFERS.filter((offer) => {
    const first = offer.itineraries[0].segments[0];
    return isDirect(offer) && first.departure.iataCode === HUB_AIRPORT;
  });

  const showcase = directFromHub.filter(
    (offer) =>
      SHOWCASE_DESTINATIONS.includes(
        offer.itineraries[0].segments.at(-1)!.arrival.iataCode as AirportCode
      ) && getOfferFare(offer).brandedFare === "BUSINESS"
  );

  const pool =
    showcase.length > 0
      ? showcase
      : directFromHub.length > 0
        ? directFromHub
        : MOCK_FLIGHT_OFFERS;

  const featured = pool.reduce((best: FlightOffer, offer) =>
    Number(offer.price.total) < Number(best.price.total) ? offer : best
  );

  const itinerary = featured.itineraries[0];
  return {
    origin: itinerary.segments[0].departure.iataCode,
    destination: itinerary.segments.at(-1)!.arrival.iataCode,
    priceTotal: featured.price.total,
    currency: featured.price.currency,
    departureAt: itinerary.segments[0].departure.at,
  };
}
