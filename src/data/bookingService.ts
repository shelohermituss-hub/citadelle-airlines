import type {
  FlightOffer,
  FlightResult,
  SearchCriteria,
  PNRRecord,
  FlightStatusInfo,
  FlightStatus,
} from './types';
import { generateOffers, offersToResults } from './mockOffers';
import { HUB_IATA, AIRPORTS } from './airports';

const SIMULATED_DELAY_MS = 800;
const STORAGE_KEY = 'citadelle_bookings';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The booking service interface.
 *
 * Phase 1 implements this with mock data. To switch to the real Amadeus API,
 * replace the method bodies below with real API calls — the signatures stay
 * the same, so no page or component needs to change.
 */
export const bookingService = {
  /**
   * Search flight offers. Returns results sorted by price ascending.
   * Mirrors Amadeus Flight Offers Search.
   */
  async searchOffers(criteria: SearchCriteria): Promise<FlightResult[]> {
    await delay(SIMULATED_DELAY_MS);

    const offers = generateOffers(
      criteria.originLocationCode,
      criteria.destinationLocationCode,
      criteria.departureDate,
      criteria.returnDate,
      criteria.adults,
      criteria.children,
      criteria.infants,
    );

    let results = offersToResults(offers, criteria.currencyCode);

    if (criteria.nonStop) {
      results = results.filter((r) => r.stops === 0);
    }

    results.sort((a, b) => a.totalPrice - b.totalPrice);
    return results;
  },

  /**
   * Price a specific offer (re-validate). In Amadeus this is Flight Price.
   * Here we just return the offer as-is after a short delay.
   */
  async priceOffer(offer: FlightOffer, currency: 'USD' | 'EUR'): Promise<FlightResult> {
    await delay(300);
    const results = offersToResults([offer], currency);
    return results[0];
  },

  /**
   * Create a booking (Amadeus Flight Create Orders).
   * Generates a 6-char PNR, stores it in localStorage for session retrieval.
   */
  async createBooking(
    offers: FlightOffer[],
    travelers: PNRRecord['travelers'],
    contact: PNRRecord['contact'],
    totalPrice: number,
    currency: 'USD' | 'EUR',
    fareFamily: PNRRecord['fareFamily'],
  ): Promise<PNRRecord> {
    await delay(1200);

    const lastName = travelers[0]?.lastName ?? '';
    const pnr = generatePNR();

    const record: PNRRecord = {
      pnr,
      lastName,
      offers,
      travelers,
      contact,
      totalPrice,
      currency,
      fareFamily,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
    };

    saveBooking(record);
    return record;
  },

  /**
   * Retrieve a booking by PNR + last name (Amadeus Flight Order Management).
   */
  async retrieveBooking(pnr: string, lastName: string): Promise<PNRRecord | null> {
    await delay(600);
    const all = getAllBookings();
    const found = all.find(
      (b) => b.pnr.toUpperCase() === pnr.toUpperCase().trim() && b.lastName.toUpperCase() === lastName.toUpperCase().trim(),
    );
    return found ?? null;
  },

  /**
   * Get flight status by flight number or route + date (Amadeus Flight Status).
   */
  async getFlightStatus(params: { flightNumber?: string; origin?: string; destination?: string; date: string }): Promise<FlightStatusInfo | null> {
    await delay(500);

    if (params.flightNumber) {
      // Generate deterministic status from flight number + date
      return generateStatusFromFlight(params.flightNumber, params.date);
    }

    if (params.origin && params.destination) {
      return generateStatusFromRoute(params.origin, params.destination, params.date);
    }

    return null;
  },
};

function generatePNR(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars[Math.floor(Math.random() * chars.length)];
  }
  return pnr;
}

function getAllBookings(): PNRRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBooking(record: PNRRecord): void {
  const all = getAllBookings();
  all.push(record);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage may be full or unavailable; booking still returned to caller
  }
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function generateStatusFromFlight(flightNumber: string, date: string): FlightStatusInfo {
  const seed = hashStr(flightNumber + date);
  const statuses: FlightStatus[] = ['ON_TIME', 'ON_TIME', 'ON_TIME', 'DELAYED', 'BOARDING', 'DEPARTED', 'ARRIVED'];
  const status = statuses[seed % statuses.length];
  const delayMinutes = status === 'DELAYED' ? 15 + (seed % 90) : undefined;
  const hour = 6 + (seed % 16);
  const min = (seed % 12) * 5;

  // Try to infer route from flight number prefix
  const num = parseInt(flightNumber.replace(/\D/g, '')) || 100;
  const destIdx = num % 13;
  const dest = AIRPORTS[(destIdx + 1) % AIRPORTS.length].iata;
  const orig = HUB_IATA;

  return {
    flightNumber: `CA${num}`,
    departure: {
      iataCode: orig,
      scheduled: `${date}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00-04:00`,
      terminal: '1',
    },
    arrival: {
      iataCode: dest,
      scheduled: `${date}T${(hour + 4).toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00-04:00`,
      terminal: '2',
    },
    status,
    delayMinutes,
  };
}

function generateStatusFromRoute(origin: string, destination: string, date: string): FlightStatusInfo {
  const seed = hashStr(origin + destination + date);
  const statuses: FlightStatus[] = ['ON_TIME', 'ON_TIME', 'DELAYED', 'BOARDING', 'DEPARTED'];
  const status = statuses[seed % statuses.length];
  const delayMinutes = status === 'DELAYED' ? 20 + (seed % 60) : undefined;
  const hour = 7 + (seed % 14);
  const min = (seed % 12) * 5;
  const num = 100 + (seed % 900);

  return {
    flightNumber: `CA${num}`,
    departure: {
      iataCode: origin,
      scheduled: `${date}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00-04:00`,
      terminal: '1',
    },
    arrival: {
      iataCode: destination,
      scheduled: `${date}T${(hour + 3).toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00-04:00`,
      terminal: '2',
    },
    status,
    delayMinutes,
  };
}
