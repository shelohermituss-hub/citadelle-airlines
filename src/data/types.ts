/**
 * Amadeus-style type definitions.
 *
 * These mirror the structure of the Amadeus Flight Offers API so the mock
 * service can be swapped for the real API without touching the UI.
 * @see https://developers.amadeus.com/self-service/category/air/api-doc/flight-offers-search
 */

export type IATACode = string;

export interface Airport {
  iata: IATACode;
  city: string;
  cityEn: string;
  cityFr: string;
  cityHt: string;
  country: string;
  countryCode: string;
  countryEn: string;
  countryFr: string;
  countryHt: string;
  /** Indicative flight duration from the PAP hub, in minutes. */
  durationFromHubMin: number;
}

export type TravelClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export type CabinClass = 'ECONOMY' | 'BUSINESS';

/** A branded fare family offered by Citadelle Airlines. */
export type FareFamily = 'ECO' | 'ECO_FLEX' | 'BUSINESS';

export interface Segment {
  /** ISO 8601 departure timestamp with offset, e.g. 2026-08-15T10:30:00-04:00 */
  departure: {
    iataCode: IATACode;
    at: string;
    terminal?: string;
  };
  arrival: {
    iataCode: IATACode;
    at: string;
    terminal?: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  duration: string; // ISO 8601 duration PT4H15M
  numberOfStops: number;
  /** IATA booking class code for this segment. */
  class: string;
  cabin: CabinClass;
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface PriceItem {
  type: 'BASE_FARE' | 'TAX' | 'TOTAL';
  code?: string;
  amount: string;
}

export interface FareDetailsBySegment {
  segmentId: number;
  cabin: CabinClass;
  brandedFare: string;
  includedCabinBags: number;
  includedCheckedBags: number;
  isModificationIncluded: boolean;
  isRefundable: boolean;
  isSeatSelectionIncluded: boolean;
  isPriorityBoardingIncluded: boolean;
  isMealIncluded: boolean;
}

export interface TravelerPricing {
  travelerType: 'ADULT' | 'CHILD' | 'HELD_INFANT';
  fareFamily: FareFamily;
  price: PriceItem[];
  fareDetailsBySegment: FareDetailsBySegment[];
}

/** A single flight offer, matching the Amadeus Flight Offers shape. */
export interface FlightOffer {
  type: 'flight-offer';
  id: string;
  source: 'GDS';
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: {
    currency: string;
    total: string;
    base: string;
    fees?: PriceItem[];
    grandTotal?: string;
    taxes?: PriceItem[];
  };
  pricingPreferences: {
    fareType: string;
  };
  travelerPricings: TravelerPricing[];
}

/** Normalized search criteria used by the UI. */
export interface SearchCriteria {
  originLocationCode: IATACode;
  destinationLocationCode: IATACode;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  travelClass?: TravelClass;
  nonStop?: boolean;
  currencyCode: 'USD' | 'EUR';
}

/** Normalized flight result for display. */
export interface FlightResult {
  offer: FlightOffer;
  /** Total price in the requested currency for all travelers. */
  totalPrice: number;
  /** Price per adult in the requested currency. */
  pricePerAdult: number;
  /** First itinerary = outbound, second = return (if round-trip). */
  outbound: Itinerary;
  return?: Itinerary;
  stops: number;
  durationMin: number;
  departureTime: string;
  arrivalTime: string;
  fareFamily: FareFamily;
}

export interface PNRRecord {
  pnr: string;
  /** Family name used at booking time. */
  lastName: string;
  offers: FlightOffer[];
  travelers: PassengerInfo[];
  contact: ContactInfo;
  totalPrice: number;
  currency: 'USD' | 'EUR';
  fareFamily: FareFamily;
  createdAt: string;
  status: 'CONFIRMED';
}

export interface PassengerInfo {
  id: string;
  travelerType: 'ADULT' | 'CHILD' | 'HELD_INFANT';
  title: 'MR' | 'MS' | 'MRS' | 'MX' | 'MISS' | 'MSTR';
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string;
  passportNumber: string;
  passportExpiry: string; // YYYY-MM-DD
  /** Seat assigned during the seat-selection step, e.g. "14C". Unset until chosen. */
  seatNumber?: string;
  /** Whether this passenger is traveling with a pet (special service request). */
  travelingWithPet?: boolean;
  petType?: 'CABIN' | 'CARGO';
}

export interface ContactInfo {
  email: string;
  emailConfirm?: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

export type FlightStatus =
  | 'SCHEDULED'
  | 'ON_TIME'
  | 'DELAYED'
  | 'CANCELLED'
  | 'BOARDING'
  | 'DEPARTED'
  | 'ARRIVED';

export interface FlightStatusInfo {
  flightNumber: string;
  departure: { iataCode: IATACode; scheduled: string; estimated?: string; terminal?: string; gate?: string };
  arrival: { iataCode: IATACode; scheduled: string; estimated?: string; terminal?: string; gate?: string };
  status: FlightStatus;
  delayMinutes?: number;
}
