import type {
  FlightOffer,
  Itinerary,
  Segment,
  FareFamily,
  FlightResult,
  CabinClass,
} from './types';
import { AIRPORT_MAP, HUB_IATA, getAirport } from './airports';
import { FARE_FAMILIES, FARE_FAMILY_ORDER } from './fareFamilies';

const CARRIER = 'CA'; // Citadelle Airlines IATA-style code
const AIRCRAFT_TYPES = ['320', '321', '738', '789', '330', '350'];

const USD_TO_EUR = 0.92;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function minutesToDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `PT${h}H${m.toString().padStart(2, '0')}M`;
}

function minutesToIsoDuration(min: number): string {
  return minutesToDuration(min);
}

function dateAt(dateStr: string, hour: number, minute: number, tzOffset: string): string {
  return `${dateStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00${tzOffset}`;
}

/** Local timezone offsets (simplified — fixed per airport). */
const TZ_OFFSETS: Record<string, string> = {
  PAP: '-04:00',
  YUL: '-04:00',
  YYZ: '-04:00',
  MIA: '-04:00',
  JFK: '-04:00',
  SDQ: '-04:00',
  HAV: '-04:00',
  GRU: '-03:00',
  SCL: '-04:00',
  IST: '+03:00',
  NAS: '-04:00',
  KIN: '-05:00',
  PTP: '-04:00',
  CUR: '-04:00',
};

function getTz(iata: string): string {
  return TZ_OFFSETS[iata] ?? '-04:00';
}

/** Base price in USD for a hub-originated route, by distance proxy. */
function basePriceForRoute(origin: string, dest: string): number {
  const o = AIRPORT_MAP[origin];
  const d = AIRPORT_MAP[dest];
  if (!o || !d) return 250;
  const dur = Math.abs(o.durationFromHubMin - d.durationFromHubMin) || Math.max(o.durationFromHubMin, d.durationFromHubMin);
  // Rough: $0.8 per minute of flight, floor $89
  return Math.max(89, Math.round(dur * 0.8));
}

function buildSegment(
  from: string,
  to: string,
  dateStr: string,
  startHour: number,
  startMin: number,
  flightNum: number,
  rng: () => number,
): Segment {
  const fromAp = getAirport(from)!;
  const toAp = getAirport(to)!;
  const durMin = Math.abs(fromAp.durationFromHubMin - toAp.durationFromHubMin) || 90;
  const depAt = dateAt(dateStr, startHour, startMin, getTz(from));
  const arrMinOfDay = startMin + durMin;
  const arrHour = (startHour + Math.floor(arrMinOfDay / 60)) % 24;
  const arrMin = arrMinOfDay % 60;
  const arrAt = dateAt(dateStr, arrHour, arrMin, getTz(to));
  const aircraft = AIRCRAFT_TYPES[Math.floor(rng() * AIRCRAFT_TYPES.length)];
  return {
    departure: { iataCode: from, at: depAt },
    arrival: { iataCode: to, at: arrAt },
    carrierCode: CARRIER,
    number: flightNum.toString().padStart(4, '0'),
    aircraft: { code: aircraft },
    duration: minutesToIsoDuration(durMin),
    numberOfStops: 0,
    class: 'Y',
    cabin: 'ECONOMY',
  };
}

function buildItinerary(
  origin: string,
  destination: string,
  dateStr: string,
  rng: () => number,
  flightNumBase: number,
): Itinerary {
  const segments: Segment[] = [];
  let currentNum = flightNumBase;

  const needsConnection = origin !== HUB_IATA && destination !== HUB_IATA;

  if (!needsConnection) {
    // Direct from hub or to hub
    const from = origin === HUB_IATA ? origin : origin;
    const to = destination === HUB_IATA ? destination : destination;
    const hour = 6 + Math.floor(rng() * 16);
    const min = Math.floor(rng() * 12) * 5;
    segments.push(buildSegment(from, to, dateStr, hour, min, currentNum, rng));
  } else {
    // Via hub: origin → PAP → destination
    const hour1 = 6 + Math.floor(rng() * 14);
    const min1 = Math.floor(rng() * 12) * 5;
    const seg1 = buildSegment(origin, HUB_IATA, dateStr, hour1, min1, currentNum, rng);
    segments.push(seg1);
    currentNum += 7;

    // Layover 1.5–3.5h
    const layoverMin = 90 + Math.floor(rng() * 150);
    const arrTime = new Date(seg1.arrival.at);
    const dep2 = new Date(arrTime.getTime() + layoverMin * 60000);
    const dep2Hour = dep2.getUTCHours();
    const dep2Min = dep2.getUTCMinutes();
    // Use date of dep2 local
    const dep2Date = dep2.toISOString().slice(0, 10);
    const seg2 = buildSegment(HUB_IATA, destination, dep2Date, dep2Hour, dep2Min, currentNum, rng);
    // Fix seg2 departure to use proper tz
    seg2.departure.at = `${dep2Date}T${dep2Hour.toString().padStart(2, '0')}:${dep2Min.toString().padStart(2, '0')}:00${getTz(HUB_IATA)}`;
    segments.push(seg2);
  }

  const totalMin = segments.reduce((acc, s) => {
    const dep = new Date(s.departure.at).getTime();
    const arr = new Date(s.arrival.at).getTime();
    return acc + (arr - dep) / 60000;
  }, 0);

  // Add layover time
  let layoverTotal = 0;
  for (let i = 1; i < segments.length; i++) {
    const prevArr = new Date(segments[i - 1].arrival.at).getTime();
    const nextDep = new Date(segments[i].departure.at).getTime();
    layoverTotal += (nextDep - prevArr) / 60000;
  }

  return {
    duration: minutesToIsoDuration(Math.round(totalMin + layoverTotal)),
    segments,
  };
}

function buildOffer(
  origin: string,
  destination: string,
  depDate: string,
  retDate: string | undefined,
  oneWay: boolean,
  fare: FareFamily,
  adults: number,
  children: number,
  infants: number,
  rng: () => number,
  offerIdx: number,
): FlightOffer {
  const basePrice = basePriceForRoute(origin, destination);
  const fareDef = FARE_FAMILIES[fare];
  const variation = 0.85 + rng() * 0.4; // ±15%
  const perAdultUsd = Math.round((basePrice * fareDef.priceMultiplier * variation) / 5) * 5;
  const perChildUsd = Math.round(perAdultUsd * 0.75);
  const perInfantUsd = Math.round(perAdultUsd * 0.1);
  const baseTotal = perAdultUsd * adults + perChildUsd * children + perInfantUsd * infants;
  const taxes = Math.round(baseTotal * 0.22);
  const totalUsd = baseTotal + taxes;

  const flight = 1400 + offerIdx * 13 + Math.floor(rng() * 99);

  const outbound = buildItinerary(origin, destination, depDate, rng, flight);
  const itineraries: Itinerary[] = [outbound];
  let returnIt: Itinerary | undefined;
  if (!oneWay && retDate) {
    returnIt = buildItinerary(destination, origin, retDate, rng, flight + 500);
    itineraries.push(returnIt);
  }

  // Set cabin based on fare
  const cabin: CabinClass = fare === 'BUSINESS' ? 'BUSINESS' : 'ECONOMY';
  const bookingClass = fare === 'BUSINESS' ? 'J' : fare === 'ECO_FLEX' ? 'Y' : 'B';

  itineraries.forEach((it) => {
    it.segments.forEach((seg) => {
      seg.cabin = cabin;
      seg.class = bookingClass;
    });
  });

  const travelerPricings = [];
  for (let i = 0; i < adults; i++) {
    travelerPricings.push(buildTravelerPricing('ADULT', fare, perAdultUsd, taxes, adults + children + infants, outbound.segments.length, itineraries.length));
  }
  for (let i = 0; i < children; i++) {
    travelerPricings.push(buildTravelerPricing('CHILD', fare, perChildUsd, Math.round(taxes * 0.75), adults + children + infants, outbound.segments.length, itineraries.length));
  }
  for (let i = 0; i < infants; i++) {
    travelerPricings.push(buildTravelerPricing('HELD_INFANT', fare, perInfantUsd, 0, adults + children + infants, outbound.segments.length, itineraries.length));
  }

  return {
    type: 'flight-offer',
    id: `offer-${offerIdx}-${fare}-${origin}-${destination}-${depDate}`,
    source: 'GDS',
    instantTicketingRequired: false,
    nonHomogeneous: false,
    oneWay,
    lastTicketingDate: depDate,
    numberOfBookableSeats: 9,
    itineraries,
    price: {
      currency: 'USD',
      total: totalUsd.toFixed(2),
      base: baseTotal.toFixed(2),
      taxes: [{ type: 'TAX' as const, code: 'YQ', amount: taxes.toFixed(2) }, { type: 'TAX' as const, code: 'HT', amount: Math.round(taxes * 0.3).toFixed(2) }],
      grandTotal: totalUsd.toFixed(2),
    },
    pricingPreferences: {
      fareType: fare === 'BUSINESS' ? 'BUSINESS' : fare === 'ECO_FLEX' ? 'FLEXIBLE' : 'STANDARD',
    },
    travelerPricings,
  };
}

function buildTravelerPricing(
  type: 'ADULT' | 'CHILD' | 'HELD_INFANT',
  fare: FareFamily,
  baseUsd: number,
  taxUsd: number,
  totalTravelers: number,
  segmentsPerItin: number,
  itinCount: number,
) {
  const fareDef = FARE_FAMILIES[fare];
  const fareDetailsBySegment = [];
  for (let itin = 0; itin < itinCount; itin++) {
    for (let s = 0; s < segmentsPerItin; s++) {
      fareDetailsBySegment.push({
        segmentId: itin * 10 + s,
        cabin: (fare === 'BUSINESS' ? 'BUSINESS' : 'ECONOMY') as CabinClass,
        brandedFare: fare,
        includedCabinBags: fareDef.includedCabinBags,
        includedCheckedBags: fareDef.includedCheckedBags,
        isModificationIncluded: fareDef.isModificationIncluded,
        isRefundable: fareDef.isRefundable,
        isSeatSelectionIncluded: fareDef.isSeatSelectionIncluded,
        isPriorityBoardingIncluded: fareDef.isPriorityBoardingIncluded,
        isMealIncluded: fareDef.isMealIncluded,
      });
    }
  }
  return {
    travelerType: type,
    fareFamily: fare,
    price: [
      { type: 'BASE_FARE' as const, amount: baseUsd.toFixed(2) },
      { type: 'TAX' as const, code: 'TOTAL_TAX', amount: taxUsd.toFixed(2) },
      { type: 'TOTAL' as const, amount: (baseUsd + taxUsd).toFixed(2) },
    ],
    fareDetailsBySegment,
  };
}

function offerToResult(offer: FlightOffer, currency: 'USD' | 'EUR'): FlightResult {
  const totalUsd = parseFloat(offer.price.grandTotal ?? offer.price.total);
  const total = currency === 'EUR' ? totalUsd * USD_TO_EUR : totalUsd;
  const adultPricing = offer.travelerPricings.find((t) => t.travelerType === 'ADULT');
  const adultBase = adultPricing ? parseFloat(adultPricing.price[0].amount) : totalUsd / Math.max(1, offer.travelerPricings.length);
  const pricePerAdult = currency === 'EUR' ? adultBase * USD_TO_EUR : adultBase;

  const outbound = offer.itineraries[0];
  const ret = offer.itineraries[1];
  const stops = outbound.segments.length - 1;
  const durationMin = parseDurationMin(outbound.duration);
  const firstSeg = outbound.segments[0];
  const lastSeg = outbound.segments[outbound.segments.length - 1];

  return {
    offer,
    totalPrice: Math.round(total),
    pricePerAdult: Math.round(pricePerAdult),
    outbound,
    return: ret,
    stops,
    durationMin,
    departureTime: firstSeg.departure.at,
    arrivalTime: lastSeg.arrival.at,
    fareFamily: (adultPricing?.fareFamily ?? 'ECO') as FareFamily,
  };
}

function parseDurationMin(dur: string): number {
  const hMatch = dur.match(/(\d+)H/);
  const mMatch = dur.match(/(\d+)M/);
  return (hMatch ? parseInt(hMatch[1]) : 0) * 60 + (mMatch ? parseInt(mMatch[1]) : 0);
}

/**
 * Generate offers for a given route and date.
 * Produces direct + connecting options across all fare families.
 */
export function generateOffers(
  origin: string,
  destination: string,
  depDate: string,
  retDate: string | undefined,
  adults: number,
  children: number,
  infants: number,
): FlightOffer[] {
  if (origin === destination) return [];
  const offers: FlightOffer[] = [];
  const seed = hashString(`${origin}${destination}${depDate}${retDate ?? ''}`);
  const rng = seededRandom(seed);
  const oneWay = !retDate;

  // Generate ~14 outbound offers: mix of direct (hub routes) and connecting
  const isHubOrigin = origin === HUB_IATA;
  const isHubDest = destination === HUB_IATA;

  let idx = 0;
  // Direct flights (3-5 per fare family if hub route, fewer if connecting)
  const directCount = isHubOrigin || isHubDest ? 5 : 0;
  for (let i = 0; i < directCount; i++) {
    for (const fare of FARE_FAMILY_ORDER) {
      offers.push(buildOffer(origin, destination, depDate, retDate, oneWay, fare, adults, children, infants, rng, idx++));
    }
  }

  // Connecting flights via hub (if neither endpoint is hub)
  if (!isHubOrigin && !isHubDest) {
    for (let i = 0; i < 3; i++) {
      for (const fare of FARE_FAMILY_ORDER) {
        offers.push(buildOffer(origin, destination, depDate, retDate, oneWay, fare, adults, children, infants, rng, idx++));
      }
    }
  }

  return offers;
}

/** Convert offer prices to the requested currency. */
export function offersToResults(offers: FlightOffer[], currency: 'USD' | 'EUR'): FlightResult[] {
  return offers.map((o) => offerToResult(o, currency));
}

/** Get the lowest "from" price for a destination from the hub. */
export function getFromPrice(destination: string, currency: 'USD' | 'EUR' = 'USD'): number {
  const base = basePriceForRoute(HUB_IATA, destination);
  return currency === 'EUR' ? Math.round(base * USD_TO_EUR) : base;
}

/** Convert USD amount to target currency. */
export function convertUsd(amountUsd: number, currency: 'USD' | 'EUR'): number {
  return currency === 'EUR' ? Math.round(amountUsd * USD_TO_EUR) : Math.round(amountUsd);
}

export { USD_TO_EUR };
