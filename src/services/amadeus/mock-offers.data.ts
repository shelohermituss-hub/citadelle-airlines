import type {
  BrandedFare,
  CabinClass,
  Dictionaries,
  FareDetailsBySegment,
  FlightOffer,
  FlightSegment,
  IncludedCheckedBags,
  Price,
} from "./types";

/**
 * 20 offres de référence sur les 4 routes Citadelle : PAP↔JFK,
 * PAP↔MIA, PAP↔SDQ et CAP↔MIA.
 *
 * Les horaires sont figés sur une date de gabarit (REFERENCE_DATE) ;
 * mock.client.ts réapplique la date réellement recherchée au moment
 * de la requête (voir stampOfferDate), pour que la recherche reste
 * cohérente quelle que soit la date choisie dans le tunnel.
 */
export const REFERENCE_DATE = "2026-01-15";

const VALIDATING_CARRIER = "CD";

export const DICTIONARIES: Dictionaries = {
  locations: {
    PAP: { cityCode: "PAP", countryCode: "HT" },
    CAP: { cityCode: "CAP", countryCode: "HT" },
    JFK: { cityCode: "NYC", countryCode: "US" },
    MIA: { cityCode: "MIA", countryCode: "US" },
    SDQ: { cityCode: "SDQ", countryCode: "DO" },
  },
  aircraft: {
    "738": "737-800",
    "7M8": "737 MAX 8",
    E90: "EMBRAER 190",
  },
  currencies: {
    USD: "US DOLLAR",
  },
  carriers: {
    CD: "CITADELLE AIRLINES",
  },
};

interface FareConfig {
  cabin: CabinClass;
  brandedFare: BrandedFare;
  brandedFareLabel: string;
  fareBasisPrefix: string;
  classCode: string;
  includedCheckedBags: IncludedCheckedBags;
}

const FARE_CONFIG: Record<BrandedFare, FareConfig> = {
  ECO: {
    cabin: "ECONOMY",
    brandedFare: "ECO",
    brandedFareLabel: "Éco",
    fareBasisPrefix: "YOW",
    classCode: "Y",
    includedCheckedBags: { quantity: 0 },
  },
  ECOFLEX: {
    cabin: "ECONOMY",
    brandedFare: "ECOFLEX",
    brandedFareLabel: "Éco Flex",
    fareBasisPrefix: "SFLX",
    classCode: "S",
    includedCheckedBags: { quantity: 1, weight: 23, weightUnit: "KG" },
  },
  BUSINESS: {
    cabin: "BUSINESS",
    brandedFare: "BUSINESS",
    brandedFareLabel: "Business",
    fareBasisPrefix: "CBUS",
    classCode: "C",
    includedCheckedBags: { quantity: 2, weight: 32, weightUnit: "KG" },
  },
};

interface SegmentSpec {
  departureAirport: string;
  arrivalAirport: string;
  /** Heure locale "HH:mm" sur REFERENCE_DATE */
  departureTime: string;
  /** Heure locale "HH:mm" sur REFERENCE_DATE (le mock ne gère pas les vols de nuit à cheval sur minuit) */
  arrivalTime: string;
  flightNumber: string;
  aircraft: string;
  /** Durée de vol réelle, ISO 8601 */
  duration: string;
}

interface OfferSpec {
  id: string;
  segments: SegmentSpec[];
  /** Durée totale de l'itinéraire (vol + correspondance), ISO 8601 */
  totalDuration: string;
  fare: BrandedFare;
  totalPrice: number;
  numberOfBookableSeats: number;
}

function toIsoDateTime(time: string): string {
  return `${REFERENCE_DATE}T${time}:00`;
}

function buildSegment(spec: SegmentSpec, id: string): FlightSegment {
  return {
    id,
    departure: {
      iataCode: spec.departureAirport,
      at: toIsoDateTime(spec.departureTime),
    },
    arrival: {
      iataCode: spec.arrivalAirport,
      at: toIsoDateTime(spec.arrivalTime),
    },
    carrierCode: VALIDATING_CARRIER,
    number: spec.flightNumber.replace(VALIDATING_CARRIER, ""),
    aircraft: { code: spec.aircraft },
    operating: { carrierCode: VALIDATING_CARRIER },
    duration: spec.duration,
    numberOfStops: 0,
  };
}

function buildPrice(total: number): Price {
  const base = Math.round(total * 0.85 * 100) / 100;
  const totalStr = total.toFixed(2);
  return {
    currency: "USD",
    total: totalStr,
    base: base.toFixed(2),
    fees: [
      { amount: "0.00", type: "SUPPLIER" },
      { amount: "0.00", type: "TICKETING" },
    ],
    grandTotal: totalStr,
  };
}

function buildFareDetailsBySegment(
  segmentIds: string[],
  fare: BrandedFare
): FareDetailsBySegment[] {
  const config = FARE_CONFIG[fare];
  return segmentIds.map((segmentId) => ({
    segmentId,
    cabin: config.cabin,
    fareBasis: `${config.fareBasisPrefix}${VALIDATING_CARRIER}`,
    brandedFare: config.brandedFare,
    brandedFareLabel: config.brandedFareLabel,
    class: config.classCode,
    includedCheckedBags: config.includedCheckedBags,
  }));
}

function buildOffer(spec: OfferSpec): FlightOffer {
  const segments = spec.segments.map((s, index) =>
    buildSegment(s, String(index + 1))
  );
  const segmentIds = segments.map((s) => s.id);
  const price = buildPrice(spec.totalPrice);

  return {
    type: "flight-offer",
    id: spec.id,
    source: "GDS",
    instantTicketingRequired: false,
    nonHomogeneous: false,
    oneWay: true,
    lastTicketingDate: REFERENCE_DATE,
    numberOfBookableSeats: spec.numberOfBookableSeats,
    itineraries: [{ duration: spec.totalDuration, segments }],
    price,
    pricingOptions: {
      fareType: ["PUBLISHED"],
      includedCheckedBagsOnly: spec.fare !== "ECO",
    },
    validatingAirlineCodes: [VALIDATING_CARRIER],
    travelerPricings: [
      {
        travelerId: "1",
        fareOption: "STANDARD",
        travelerType: "ADULT",
        price,
        fareDetailsBySegment: buildFareDetailsBySegment(segmentIds, spec.fare),
      },
    ],
  };
}

const OFFER_SPECS: OfferSpec[] = [
  // ---- PAP ↔ JFK -----------------------------------------------------
  {
    id: "1",
    fare: "ECO",
    totalPrice: 349,
    numberOfBookableSeats: 9,
    totalDuration: "PT3H45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "JFK",
        departureTime: "08:30",
        arrivalTime: "12:15",
        flightNumber: "CD100",
        aircraft: "738",
        duration: "PT3H45M",
      },
    ],
  },
  {
    id: "2",
    fare: "ECOFLEX",
    totalPrice: 429,
    numberOfBookableSeats: 9,
    totalDuration: "PT3H45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "JFK",
        departureTime: "08:30",
        arrivalTime: "12:15",
        flightNumber: "CD100",
        aircraft: "738",
        duration: "PT3H45M",
      },
    ],
  },
  {
    id: "3",
    fare: "BUSINESS",
    totalPrice: 899,
    numberOfBookableSeats: 4,
    totalDuration: "PT3H45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "JFK",
        departureTime: "08:30",
        arrivalTime: "12:15",
        flightNumber: "CD100",
        aircraft: "738",
        duration: "PT3H45M",
      },
    ],
  },
  {
    id: "4",
    fare: "ECO",
    totalPrice: 369,
    numberOfBookableSeats: 6,
    totalDuration: "PT3H45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "JFK",
        departureTime: "15:40",
        arrivalTime: "19:25",
        flightNumber: "CD104",
        aircraft: "7M8",
        duration: "PT3H45M",
      },
    ],
  },
  {
    id: "5",
    fare: "ECOFLEX",
    totalPrice: 459,
    numberOfBookableSeats: 5,
    totalDuration: "PT5H55M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "06:00",
        arrivalTime: "07:55",
        flightNumber: "CD202",
        aircraft: "738",
        duration: "PT1H55M",
      },
      {
        departureAirport: "MIA",
        arrivalAirport: "JFK",
        departureTime: "09:10",
        arrivalTime: "11:55",
        flightNumber: "CD150",
        aircraft: "738",
        duration: "PT2H45M",
      },
    ],
  },

  // ---- PAP ↔ MIA ------------------------------------------------------
  {
    id: "6",
    fare: "ECO",
    totalPrice: 189,
    numberOfBookableSeats: 12,
    totalDuration: "PT1H55M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "07:15",
        arrivalTime: "09:10",
        flightNumber: "CD200",
        aircraft: "738",
        duration: "PT1H55M",
      },
    ],
  },
  {
    id: "7",
    fare: "ECOFLEX",
    totalPrice: 249,
    numberOfBookableSeats: 12,
    totalDuration: "PT1H55M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "07:15",
        arrivalTime: "09:10",
        flightNumber: "CD200",
        aircraft: "738",
        duration: "PT1H55M",
      },
    ],
  },
  {
    id: "8",
    fare: "BUSINESS",
    totalPrice: 549,
    numberOfBookableSeats: 4,
    totalDuration: "PT1H55M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "07:15",
        arrivalTime: "09:10",
        flightNumber: "CD200",
        aircraft: "738",
        duration: "PT1H55M",
      },
    ],
  },
  {
    id: "9",
    fare: "ECO",
    totalPrice: 199,
    numberOfBookableSeats: 8,
    totalDuration: "PT1H55M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "13:20",
        arrivalTime: "15:15",
        flightNumber: "CD206",
        aircraft: "7M8",
        duration: "PT1H55M",
      },
    ],
  },
  {
    id: "10",
    fare: "ECOFLEX",
    totalPrice: 259,
    numberOfBookableSeats: 6,
    totalDuration: "PT1H55M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "18:45",
        arrivalTime: "20:40",
        flightNumber: "CD208",
        aircraft: "738",
        duration: "PT1H55M",
      },
    ],
  },

  // ---- PAP ↔ SDQ (SDQ est en UTC-4, PAP en UTC-5 : +1h en horaire local) --
  {
    id: "11",
    fare: "ECO",
    totalPrice: 99,
    numberOfBookableSeats: 14,
    totalDuration: "PT45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "09:00",
        arrivalTime: "10:45",
        flightNumber: "CD300",
        aircraft: "E90",
        duration: "PT45M",
      },
    ],
  },
  {
    id: "12",
    fare: "ECOFLEX",
    totalPrice: 139,
    numberOfBookableSeats: 14,
    totalDuration: "PT45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "09:00",
        arrivalTime: "10:45",
        flightNumber: "CD300",
        aircraft: "E90",
        duration: "PT45M",
      },
    ],
  },
  {
    id: "13",
    fare: "BUSINESS",
    totalPrice: 289,
    numberOfBookableSeats: 3,
    totalDuration: "PT45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "09:00",
        arrivalTime: "10:45",
        flightNumber: "CD300",
        aircraft: "E90",
        duration: "PT45M",
      },
    ],
  },
  {
    id: "14",
    fare: "ECO",
    totalPrice: 109,
    numberOfBookableSeats: 10,
    totalDuration: "PT45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "16:30",
        arrivalTime: "18:15",
        flightNumber: "CD304",
        aircraft: "E90",
        duration: "PT45M",
      },
    ],
  },
  {
    id: "15",
    fare: "ECOFLEX",
    totalPrice: 149,
    numberOfBookableSeats: 9,
    totalDuration: "PT45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "20:00",
        arrivalTime: "21:45",
        flightNumber: "CD308",
        aircraft: "E90",
        duration: "PT45M",
      },
    ],
  },

  // ---- CAP ↔ MIA -------------------------------------------------------
  {
    id: "16",
    fare: "ECO",
    totalPrice: 199,
    numberOfBookableSeats: 10,
    totalDuration: "PT1H45M",
    segments: [
      {
        departureAirport: "CAP",
        arrivalAirport: "MIA",
        departureTime: "07:30",
        arrivalTime: "09:15",
        flightNumber: "CD400",
        aircraft: "738",
        duration: "PT1H45M",
      },
    ],
  },
  {
    id: "17",
    fare: "ECOFLEX",
    totalPrice: 259,
    numberOfBookableSeats: 10,
    totalDuration: "PT1H45M",
    segments: [
      {
        departureAirport: "CAP",
        arrivalAirport: "MIA",
        departureTime: "07:30",
        arrivalTime: "09:15",
        flightNumber: "CD400",
        aircraft: "738",
        duration: "PT1H45M",
      },
    ],
  },
  {
    id: "18",
    fare: "BUSINESS",
    totalPrice: 559,
    numberOfBookableSeats: 4,
    totalDuration: "PT1H45M",
    segments: [
      {
        departureAirport: "CAP",
        arrivalAirport: "MIA",
        departureTime: "07:30",
        arrivalTime: "09:15",
        flightNumber: "CD400",
        aircraft: "738",
        duration: "PT1H45M",
      },
    ],
  },
  {
    id: "19",
    fare: "ECO",
    totalPrice: 209,
    numberOfBookableSeats: 7,
    totalDuration: "PT1H45M",
    segments: [
      {
        departureAirport: "CAP",
        arrivalAirport: "MIA",
        departureTime: "14:50",
        arrivalTime: "16:35",
        flightNumber: "CD404",
        aircraft: "7M8",
        duration: "PT1H45M",
      },
    ],
  },
  {
    id: "20",
    fare: "ECOFLEX",
    totalPrice: 279,
    numberOfBookableSeats: 6,
    totalDuration: "PT3H25M",
    segments: [
      {
        departureAirport: "CAP",
        arrivalAirport: "PAP",
        departureTime: "06:00",
        arrivalTime: "06:35",
        flightNumber: "CD410",
        aircraft: "E90",
        duration: "PT35M",
      },
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "07:30",
        arrivalTime: "09:25",
        flightNumber: "CD204",
        aircraft: "738",
        duration: "PT1H55M",
      },
    ],
  },
];

export const MOCK_FLIGHT_OFFERS: FlightOffer[] = OFFER_SPECS.map(buildOffer);
