import type { IAmadeusClient } from "./client.interface";
import { DICTIONARIES, MOCK_FLIGHT_OFFERS, REFERENCE_DATE } from "./mock-offers.data";
import type {
  CreateOrderParams,
  FlightOffer,
  FlightOffersPricingResponse,
  FlightOffersResponse,
  FlightOrderResponse,
  FlightSearchParams,
  FlightSegment,
} from "./types";

/** Latence simulée sur chaque appel, pour exercer les états de chargement de l'UI. */
export const SIMULATED_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRoute(offer: FlightOffer): { origin: string; destination: string } {
  const segments = offer.itineraries[0].segments;
  return {
    origin: segments[0].departure.iataCode,
    destination: segments[segments.length - 1].arrival.iataCode,
  };
}

function incrementFlightNumber(number: string): string {
  const parsed = parseInt(number, 10);
  return Number.isNaN(parsed) ? number : String(parsed + 1);
}

/**
 * Construit l'offre retour à partir d'une offre aller : segments
 * inversés, départ/arrivée permutés. Approximation raisonnable pour
 * un mock — un vrai client Amadeus renverrait les offres retour
 * telles quelles.
 */
function reverseOffer(offer: FlightOffer): FlightOffer {
  const original = offer.itineraries[0].segments;
  const reversedSegments: FlightSegment[] = [...original]
    .reverse()
    .map((segment, index) => ({
      ...segment,
      id: String(index + 1),
      departure: segment.arrival,
      arrival: segment.departure,
      number: incrementFlightNumber(segment.number),
    }));

  return {
    ...offer,
    itineraries: [{ ...offer.itineraries[0], segments: reversedSegments }],
  };
}

function daysBetween(dateA: string, dateB: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (Date.parse(`${dateA}T00:00:00Z`) - Date.parse(`${dateB}T00:00:00Z`)) /
      msPerDay
  );
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function stampDateTime(isoDateTime: string, targetDate: string): string {
  const originalDate = isoDateTime.slice(0, 10);
  const time = isoDateTime.slice(11);
  const offset = daysBetween(originalDate, REFERENCE_DATE);
  return `${addDays(targetDate, offset)}T${time}`;
}

/** Réapplique la date recherchée sur un gabarit d'offre (voir REFERENCE_DATE). */
function stampOfferDate(offer: FlightOffer, departureDate: string): FlightOffer {
  return {
    ...offer,
    lastTicketingDate: departureDate,
    itineraries: offer.itineraries.map((itinerary) => ({
      ...itinerary,
      segments: itinerary.segments.map((segment) => ({
        ...segment,
        departure: {
          ...segment.departure,
          at: stampDateTime(segment.departure.at, departureDate),
        },
        arrival: {
          ...segment.arrival,
          at: stampDateTime(segment.arrival.at, departureDate),
        },
      })),
    })),
  };
}

const PNR_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans caractères ambigus

function generatePnr(): string {
  let pnr = "";
  for (let i = 0; i < 6; i++) {
    pnr += PNR_ALPHABET[Math.floor(Math.random() * PNR_ALPHABET.length)];
  }
  return pnr;
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CD-${timestamp}-${suffix}`;
}

export class MockAmadeusClient implements IAmadeusClient {
  async searchFlights(
    params: FlightSearchParams
  ): Promise<FlightOffersResponse> {
    await delay(SIMULATED_DELAY_MS);

    const matches: FlightOffer[] = [];

    for (const offer of MOCK_FLIGHT_OFFERS) {
      const route = getRoute(offer);

      let candidate: FlightOffer | undefined;
      if (
        route.origin === params.originLocationCode &&
        route.destination === params.destinationLocationCode
      ) {
        candidate = offer;
      } else if (
        route.origin === params.destinationLocationCode &&
        route.destination === params.originLocationCode
      ) {
        candidate = reverseOffer(offer);
      }

      if (!candidate) continue;

      const cabin =
        candidate.travelerPricings[0].fareDetailsBySegment[0].cabin;
      if (params.travelClass && cabin !== params.travelClass) continue;

      const isDirect = candidate.itineraries[0].segments.length === 1;
      if (params.nonStop && !isDirect) continue;

      if (
        params.maxPrice !== undefined &&
        parseFloat(candidate.price.total) > params.maxPrice
      ) {
        continue;
      }

      matches.push(stampOfferDate(candidate, params.departureDate));
    }

    const limited =
      params.max !== undefined ? matches.slice(0, params.max) : matches;

    return {
      meta: { count: limited.length },
      data: limited,
      dictionaries: DICTIONARIES,
    };
  }

  async priceOffer(offer: FlightOffer): Promise<FlightOffersPricingResponse> {
    await delay(SIMULATED_DELAY_MS);

    return {
      data: {
        type: "flight-offers-pricing",
        flightOffers: [offer],
      },
      dictionaries: DICTIONARIES,
    };
  }

  async createOrder(
    params: CreateOrderParams
  ): Promise<FlightOrderResponse> {
    await delay(SIMULATED_DELAY_MS);

    const reference = generatePnr();
    const creationDate = new Date().toISOString();

    return {
      data: {
        type: "flight-order",
        id: generateOrderId(),
        associatedRecords: params.flightOffers.map((offer) => ({
          reference,
          creationDate,
          originSystemCode: "GDS",
          flightOfferId: offer.id,
        })),
        flightOffers: params.flightOffers,
        travelers: params.travelers,
      },
      dictionaries: DICTIONARIES,
    };
  }
}

/** Instance prête à l'emploi — c'est elle que consomme le reste de l'app. */
export const amadeusClient = new MockAmadeusClient();
