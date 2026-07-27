/**
 * Types du format Amadeus "Flight Offers" (Flight Offers Search /
 * Flight Offers Price / Flight Create Orders APIs).
 *
 * Reproduit la forme des réponses Amadeus GDS afin que la couche UI
 * ne dépende jamais d'un fournisseur particulier : le jour où
 * IAmadeusClient sera implémenté par un vrai appel réseau, aucun
 * composant ne devrait avoir à changer.
 */

export type TravelClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type CabinClass = TravelClass;

/** Code de fare brandé Citadelle : Éco / Éco Flex / Business. */
export type BrandedFare = "ECO" | "ECOFLEX" | "BUSINESS";

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  /** Date-heure locale ISO 8601, ex. "2026-09-14T08:30:00" */
  at: string;
}

export interface AircraftEquipment {
  code: string;
}

export interface OperatingFlight {
  carrierCode: string;
}

export interface FlightSegment {
  id: string;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft: AircraftEquipment;
  operating: OperatingFlight;
  /** Durée ISO 8601, ex. "PT3H45M" */
  duration: string;
  numberOfStops: number;
}

export interface Itinerary {
  /** Durée totale ISO 8601 de l'itinéraire (tous segments compris) */
  duration: string;
  segments: FlightSegment[];
}

export interface Fee {
  amount: string;
  type: "SUPPLIER" | "TICKETING" | "FORM_OF_PAYMENT";
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees?: Fee[];
  grandTotal: string;
}

export interface PricingOptions {
  fareType: Array<"PUBLISHED" | "NEGOTIATED" | "CORPORATE">;
  includedCheckedBagsOnly: boolean;
}

export interface IncludedCheckedBags {
  quantity?: number;
  weight?: number;
  weightUnit?: "KG" | "LB";
}

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: CabinClass;
  fareBasis: string;
  brandedFare: BrandedFare;
  brandedFareLabel: string;
  class: string;
  includedCheckedBags: IncludedCheckedBags;
  amenities?: FareAmenity[];
}

export interface FareAmenity {
  description: string;
  isChargeable: boolean;
  amenityType:
    | "BAGGAGE"
    | "MEAL"
    | "REFUND"
    | "CHANGE"
    | "SEAT"
    | "ENTERTAINMENT";
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: "STANDARD";
  travelerType: "ADULT" | "CHILD" | "HELD_INFANT" | "SEATED_INFANT";
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}

export interface FlightOffer {
  type: "flight-offer";
  id: string;
  source: "GDS";
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface LocationDictionaryEntry {
  cityCode: string;
  countryCode: string;
}

export interface Dictionaries {
  locations: Record<string, LocationDictionaryEntry>;
  aircraft: Record<string, string>;
  currencies: Record<string, string>;
  carriers: Record<string, string>;
}

export interface FlightOffersMeta {
  count: number;
}

export interface FlightOffersResponse {
  meta: FlightOffersMeta;
  data: FlightOffer[];
  dictionaries: Dictionaries;
}

/** Paramètres de recherche — miroir des query params Flight Offers Search. */
export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  /** Date ISO "YYYY-MM-DD" */
  departureDate: string;
  /** Date ISO "YYYY-MM-DD", vol retour optionnel */
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: TravelClass;
  nonStop?: boolean;
  currencyCode?: string;
  maxPrice?: number;
  max?: number;
}

/** Réponse de l'API Flight Offers Price (repricing avant réservation). */
export interface FlightOffersPricingResponse {
  data: {
    type: "flight-offers-pricing";
    flightOffers: FlightOffer[];
  };
  dictionaries: Dictionaries;
}

export interface PassengerName {
  firstName: string;
  lastName: string;
}

export type Gender = "MALE" | "FEMALE" | "UNSPECIFIED";

export interface PhoneNumber {
  deviceType: "MOBILE" | "LANDLINE" | "FAX";
  countryCallingCode: string;
  number: string;
}

export interface TravelerContact {
  emailAddress: string;
  phones: PhoneNumber[];
}

export type DocumentType = "PASSPORT" | "IDENTITY_CARD";

export interface TravelerDocument {
  documentType: DocumentType;
  number: string;
  /** Date ISO "YYYY-MM-DD" */
  expiryDate: string;
  issuanceCountry: string;
  nationality: string;
  holder: boolean;
}

export interface Traveler {
  id: string;
  /** Date ISO "YYYY-MM-DD" */
  dateOfBirth: string;
  name: PassengerName;
  gender: Gender;
  contact: TravelerContact;
  documents: TravelerDocument[];
}

export interface CreateOrderParams {
  flightOffers: FlightOffer[];
  travelers: Traveler[];
}

export interface AssociatedRecord {
  /** Code de réservation (PNR) */
  reference: string;
  creationDate: string;
  originSystemCode: string;
  flightOfferId: string;
}

export interface FlightOrder {
  type: "flight-order";
  id: string;
  associatedRecords: AssociatedRecord[];
  flightOffers: FlightOffer[];
  travelers: Traveler[];
}

export interface FlightOrderResponse {
  data: FlightOrder;
  dictionaries: Dictionaries;
}
