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
 * Réseau réel de Citadelle Airlines : réseau en étoile depuis le hub
 * PAP (Port-au-Prince) vers 13 destinations — Amérique du Nord
 * (YUL, YYZ, MIA, JFK), Caraïbes (SDQ, HAV, NAS, KIN, PTP, CUR),
 * Amérique du Sud (GRU, SCL) et Europe (IST). La plupart des offres
 * sont des vols directs PAP↔X ; quelques offres illustrent les
 * correspondances entre deux destinations via le hub PAP (ex.
 * YUL↔SDQ, MIA↔IST).
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
    YUL: { cityCode: "YUL", countryCode: "CA" },
    YYZ: { cityCode: "YTO", countryCode: "CA" },
    MIA: { cityCode: "MIA", countryCode: "US" },
    JFK: { cityCode: "NYC", countryCode: "US" },
    SDQ: { cityCode: "SDQ", countryCode: "DO" },
    HAV: { cityCode: "HAV", countryCode: "CU" },
    GRU: { cityCode: "SAO", countryCode: "BR" },
    SCL: { cityCode: "SCL", countryCode: "CL" },
    IST: { cityCode: "IST", countryCode: "TR" },
    NAS: { cityCode: "NAS", countryCode: "BS" },
    KIN: { cityCode: "KIN", countryCode: "JM" },
    PTP: { cityCode: "PTP", countryCode: "GP" },
    CUR: { cityCode: "CUR", countryCode: "CW" },
  },
  aircraft: {
    "738": "737-800",
    "7M8": "737 MAX 8",
    E90: "EMBRAER 190",
    "788": "787-8 DREAMLINER",
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

/**
 * Décalages horaires locaux appliqués (par rapport à PAP, UTC-5 en
 * janvier) pour que les heures d'arrivée affichées restent
 * crédibles : SDQ/PTP/CUR sont en UTC-4 (+1h), GRU/SCL en UTC-3
 * (+2h, été austral), IST en UTC+3 (+8h). MIA/JFK/YUL/YYZ/HAV/NAS/KIN
 * partagent le fuseau UTC-5 de PAP en janvier (pas de décalage).
 */
const OFFER_SPECS: OfferSpec[] = [
  // ---- PAP ↔ SDQ (0h50, +1h) -------------------------------------------
  {
    id: "1",
    fare: "ECO",
    totalPrice: 99,
    numberOfBookableSeats: 14,
    totalDuration: "PT0H50M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "09:00",
        arrivalTime: "10:50",
        flightNumber: "CD100",
        aircraft: "E90",
        duration: "PT0H50M",
      },
    ],
  },
  {
    id: "2",
    fare: "ECOFLEX",
    totalPrice: 139,
    numberOfBookableSeats: 10,
    totalDuration: "PT0H50M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "09:00",
        arrivalTime: "10:50",
        flightNumber: "CD100",
        aircraft: "E90",
        duration: "PT0H50M",
      },
    ],
  },
  {
    id: "3",
    fare: "BUSINESS",
    totalPrice: 289,
    numberOfBookableSeats: 3,
    totalDuration: "PT0H50M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "09:00",
        arrivalTime: "10:50",
        flightNumber: "CD100",
        aircraft: "E90",
        duration: "PT0H50M",
      },
    ],
  },

  // ---- PAP ↔ KIN (1h20) --------------------------------------------------
  {
    id: "4",
    fare: "ECO",
    totalPrice: 179,
    numberOfBookableSeats: 14,
    totalDuration: "PT1H20M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "KIN",
        departureTime: "08:00",
        arrivalTime: "09:20",
        flightNumber: "CD110",
        aircraft: "E90",
        duration: "PT1H20M",
      },
    ],
  },
  {
    id: "5",
    fare: "ECOFLEX",
    totalPrice: 229,
    numberOfBookableSeats: 10,
    totalDuration: "PT1H20M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "KIN",
        departureTime: "08:00",
        arrivalTime: "09:20",
        flightNumber: "CD110",
        aircraft: "E90",
        duration: "PT1H20M",
      },
    ],
  },
  {
    id: "6",
    fare: "BUSINESS",
    totalPrice: 449,
    numberOfBookableSeats: 3,
    totalDuration: "PT1H20M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "KIN",
        departureTime: "08:00",
        arrivalTime: "09:20",
        flightNumber: "CD110",
        aircraft: "E90",
        duration: "PT1H20M",
      },
    ],
  },

  // ---- PAP ↔ PTP (1h25, +1h) ---------------------------------------------
  {
    id: "7",
    fare: "ECO",
    totalPrice: 189,
    numberOfBookableSeats: 14,
    totalDuration: "PT1H25M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "PTP",
        departureTime: "10:00",
        arrivalTime: "12:25",
        flightNumber: "CD120",
        aircraft: "E90",
        duration: "PT1H25M",
      },
    ],
  },
  {
    id: "8",
    fare: "ECOFLEX",
    totalPrice: 239,
    numberOfBookableSeats: 10,
    totalDuration: "PT1H25M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "PTP",
        departureTime: "10:00",
        arrivalTime: "12:25",
        flightNumber: "CD120",
        aircraft: "E90",
        duration: "PT1H25M",
      },
    ],
  },
  {
    id: "9",
    fare: "BUSINESS",
    totalPrice: 459,
    numberOfBookableSeats: 3,
    totalDuration: "PT1H25M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "PTP",
        departureTime: "10:00",
        arrivalTime: "12:25",
        flightNumber: "CD120",
        aircraft: "E90",
        duration: "PT1H25M",
      },
    ],
  },

  // ---- PAP ↔ HAV (1h30) --------------------------------------------------
  {
    id: "10",
    fare: "ECO",
    totalPrice: 199,
    numberOfBookableSeats: 12,
    totalDuration: "PT1H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "HAV",
        departureTime: "07:00",
        arrivalTime: "08:30",
        flightNumber: "CD130",
        aircraft: "738",
        duration: "PT1H30M",
      },
    ],
  },
  {
    id: "11",
    fare: "ECOFLEX",
    totalPrice: 249,
    numberOfBookableSeats: 8,
    totalDuration: "PT1H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "HAV",
        departureTime: "07:00",
        arrivalTime: "08:30",
        flightNumber: "CD130",
        aircraft: "738",
        duration: "PT1H30M",
      },
    ],
  },
  {
    id: "12",
    fare: "BUSINESS",
    totalPrice: 479,
    numberOfBookableSeats: 4,
    totalDuration: "PT1H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "HAV",
        departureTime: "07:00",
        arrivalTime: "08:30",
        flightNumber: "CD130",
        aircraft: "738",
        duration: "PT1H30M",
      },
    ],
  },

  // ---- PAP ↔ MIA (1h50) --------------------------------------------------
  {
    id: "13",
    fare: "ECO",
    totalPrice: 199,
    numberOfBookableSeats: 12,
    totalDuration: "PT1H50M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "07:15",
        arrivalTime: "09:05",
        flightNumber: "CD200",
        aircraft: "738",
        duration: "PT1H50M",
      },
    ],
  },
  {
    id: "14",
    fare: "ECOFLEX",
    totalPrice: 259,
    numberOfBookableSeats: 8,
    totalDuration: "PT1H50M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "07:15",
        arrivalTime: "09:05",
        flightNumber: "CD200",
        aircraft: "738",
        duration: "PT1H50M",
      },
    ],
  },
  {
    id: "15",
    fare: "BUSINESS",
    totalPrice: 549,
    numberOfBookableSeats: 4,
    totalDuration: "PT1H50M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "MIA",
        departureTime: "07:15",
        arrivalTime: "09:05",
        flightNumber: "CD200",
        aircraft: "738",
        duration: "PT1H50M",
      },
    ],
  },

  // ---- PAP ↔ NAS (2h00) --------------------------------------------------
  {
    id: "16",
    fare: "ECO",
    totalPrice: 229,
    numberOfBookableSeats: 12,
    totalDuration: "PT2H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "NAS",
        departureTime: "11:00",
        arrivalTime: "13:00",
        flightNumber: "CD210",
        aircraft: "738",
        duration: "PT2H00M",
      },
    ],
  },
  {
    id: "17",
    fare: "ECOFLEX",
    totalPrice: 289,
    numberOfBookableSeats: 8,
    totalDuration: "PT2H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "NAS",
        departureTime: "11:00",
        arrivalTime: "13:00",
        flightNumber: "CD210",
        aircraft: "738",
        duration: "PT2H00M",
      },
    ],
  },
  {
    id: "18",
    fare: "BUSINESS",
    totalPrice: 569,
    numberOfBookableSeats: 4,
    totalDuration: "PT2H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "NAS",
        departureTime: "11:00",
        arrivalTime: "13:00",
        flightNumber: "CD210",
        aircraft: "738",
        duration: "PT2H00M",
      },
    ],
  },

  // ---- PAP ↔ CUR (2h00, +1h) ---------------------------------------------
  {
    id: "19",
    fare: "ECO",
    totalPrice: 239,
    numberOfBookableSeats: 12,
    totalDuration: "PT2H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "CUR",
        departureTime: "13:00",
        arrivalTime: "16:00",
        flightNumber: "CD220",
        aircraft: "738",
        duration: "PT2H00M",
      },
    ],
  },
  {
    id: "20",
    fare: "ECOFLEX",
    totalPrice: 299,
    numberOfBookableSeats: 8,
    totalDuration: "PT2H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "CUR",
        departureTime: "13:00",
        arrivalTime: "16:00",
        flightNumber: "CD220",
        aircraft: "738",
        duration: "PT2H00M",
      },
    ],
  },
  {
    id: "21",
    fare: "BUSINESS",
    totalPrice: 579,
    numberOfBookableSeats: 4,
    totalDuration: "PT2H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "CUR",
        departureTime: "13:00",
        arrivalTime: "16:00",
        flightNumber: "CD220",
        aircraft: "738",
        duration: "PT2H00M",
      },
    ],
  },

  // ---- PAP ↔ JFK (3h45) --------------------------------------------------
  {
    id: "22",
    fare: "ECO",
    totalPrice: 349,
    numberOfBookableSeats: 10,
    totalDuration: "PT3H45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "JFK",
        departureTime: "08:30",
        arrivalTime: "12:15",
        flightNumber: "CD300",
        aircraft: "7M8",
        duration: "PT3H45M",
      },
    ],
  },
  {
    id: "23",
    fare: "ECOFLEX",
    totalPrice: 429,
    numberOfBookableSeats: 7,
    totalDuration: "PT3H45M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "JFK",
        departureTime: "08:30",
        arrivalTime: "12:15",
        flightNumber: "CD300",
        aircraft: "7M8",
        duration: "PT3H45M",
      },
    ],
  },
  {
    id: "24",
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
        flightNumber: "CD300",
        aircraft: "7M8",
        duration: "PT3H45M",
      },
    ],
  },

  // ---- PAP ↔ YYZ (4h00) --------------------------------------------------
  {
    id: "25",
    fare: "ECO",
    totalPrice: 389,
    numberOfBookableSeats: 10,
    totalDuration: "PT4H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "YYZ",
        departureTime: "09:30",
        arrivalTime: "13:30",
        flightNumber: "CD310",
        aircraft: "7M8",
        duration: "PT4H00M",
      },
    ],
  },
  {
    id: "26",
    fare: "ECOFLEX",
    totalPrice: 469,
    numberOfBookableSeats: 7,
    totalDuration: "PT4H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "YYZ",
        departureTime: "09:30",
        arrivalTime: "13:30",
        flightNumber: "CD310",
        aircraft: "7M8",
        duration: "PT4H00M",
      },
    ],
  },
  {
    id: "27",
    fare: "BUSINESS",
    totalPrice: 949,
    numberOfBookableSeats: 4,
    totalDuration: "PT4H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "YYZ",
        departureTime: "09:30",
        arrivalTime: "13:30",
        flightNumber: "CD310",
        aircraft: "7M8",
        duration: "PT4H00M",
      },
    ],
  },

  // ---- PAP ↔ YUL (4h15) --------------------------------------------------
  {
    id: "28",
    fare: "ECO",
    totalPrice: 399,
    numberOfBookableSeats: 10,
    totalDuration: "PT4H15M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "YUL",
        departureTime: "10:30",
        arrivalTime: "14:45",
        flightNumber: "CD320",
        aircraft: "7M8",
        duration: "PT4H15M",
      },
    ],
  },
  {
    id: "29",
    fare: "ECOFLEX",
    totalPrice: 479,
    numberOfBookableSeats: 7,
    totalDuration: "PT4H15M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "YUL",
        departureTime: "10:30",
        arrivalTime: "14:45",
        flightNumber: "CD320",
        aircraft: "7M8",
        duration: "PT4H15M",
      },
    ],
  },
  {
    id: "30",
    fare: "BUSINESS",
    totalPrice: 969,
    numberOfBookableSeats: 4,
    totalDuration: "PT4H15M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "YUL",
        departureTime: "10:30",
        arrivalTime: "14:45",
        flightNumber: "CD320",
        aircraft: "7M8",
        duration: "PT4H15M",
      },
    ],
  },

  // ---- PAP ↔ GRU (7h00, +2h) ---------------------------------------------
  {
    id: "31",
    fare: "ECO",
    totalPrice: 649,
    numberOfBookableSeats: 20,
    totalDuration: "PT7H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "GRU",
        departureTime: "08:00",
        arrivalTime: "17:00",
        flightNumber: "CD500",
        aircraft: "788",
        duration: "PT7H00M",
      },
    ],
  },
  {
    id: "32",
    fare: "ECOFLEX",
    totalPrice: 829,
    numberOfBookableSeats: 14,
    totalDuration: "PT7H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "GRU",
        departureTime: "08:00",
        arrivalTime: "17:00",
        flightNumber: "CD500",
        aircraft: "788",
        duration: "PT7H00M",
      },
    ],
  },
  {
    id: "33",
    fare: "BUSINESS",
    totalPrice: 1899,
    numberOfBookableSeats: 6,
    totalDuration: "PT7H00M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "GRU",
        departureTime: "08:00",
        arrivalTime: "17:00",
        flightNumber: "CD500",
        aircraft: "788",
        duration: "PT7H00M",
      },
    ],
  },

  // ---- PAP ↔ SCL (8h30, +2h) ---------------------------------------------
  {
    id: "34",
    fare: "ECO",
    totalPrice: 749,
    numberOfBookableSeats: 20,
    totalDuration: "PT8H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SCL",
        departureTime: "07:00",
        arrivalTime: "17:30",
        flightNumber: "CD510",
        aircraft: "788",
        duration: "PT8H30M",
      },
    ],
  },
  {
    id: "35",
    fare: "ECOFLEX",
    totalPrice: 939,
    numberOfBookableSeats: 14,
    totalDuration: "PT8H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SCL",
        departureTime: "07:00",
        arrivalTime: "17:30",
        flightNumber: "CD510",
        aircraft: "788",
        duration: "PT8H30M",
      },
    ],
  },
  {
    id: "36",
    fare: "BUSINESS",
    totalPrice: 2199,
    numberOfBookableSeats: 6,
    totalDuration: "PT8H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "SCL",
        departureTime: "07:00",
        arrivalTime: "17:30",
        flightNumber: "CD510",
        aircraft: "788",
        duration: "PT8H30M",
      },
    ],
  },

  // ---- PAP ↔ IST (11h30, +8h — départ matinal pour éviter le
  //      passage à minuit en heure locale d'Istanbul) --------------------
  {
    id: "37",
    fare: "ECO",
    totalPrice: 899,
    numberOfBookableSeats: 20,
    totalDuration: "PT11H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "IST",
        departureTime: "04:00",
        arrivalTime: "23:30",
        flightNumber: "CD520",
        aircraft: "788",
        duration: "PT11H30M",
      },
    ],
  },
  {
    id: "38",
    fare: "ECOFLEX",
    totalPrice: 1099,
    numberOfBookableSeats: 14,
    totalDuration: "PT11H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "IST",
        departureTime: "04:00",
        arrivalTime: "23:30",
        flightNumber: "CD520",
        aircraft: "788",
        duration: "PT11H30M",
      },
    ],
  },
  {
    id: "39",
    fare: "BUSINESS",
    totalPrice: 2599,
    numberOfBookableSeats: 6,
    totalDuration: "PT11H30M",
    segments: [
      {
        departureAirport: "PAP",
        arrivalAirport: "IST",
        departureTime: "04:00",
        arrivalTime: "23:30",
        flightNumber: "CD520",
        aircraft: "788",
        duration: "PT11H30M",
      },
    ],
  },

  // ---- YUL ↔ SDQ via PAP (correspondance) --------------------------------
  {
    id: "40",
    fare: "ECO",
    totalPrice: 459,
    numberOfBookableSeats: 8,
    totalDuration: "PT6H05M",
    segments: [
      {
        departureAirport: "YUL",
        arrivalAirport: "PAP",
        departureTime: "06:00",
        arrivalTime: "10:15",
        flightNumber: "CD321",
        aircraft: "7M8",
        duration: "PT4H15M",
      },
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "11:15",
        arrivalTime: "13:05",
        flightNumber: "CD101",
        aircraft: "E90",
        duration: "PT0H50M",
      },
    ],
  },
  {
    id: "41",
    fare: "ECOFLEX",
    totalPrice: 569,
    numberOfBookableSeats: 6,
    totalDuration: "PT6H05M",
    segments: [
      {
        departureAirport: "YUL",
        arrivalAirport: "PAP",
        departureTime: "06:00",
        arrivalTime: "10:15",
        flightNumber: "CD321",
        aircraft: "7M8",
        duration: "PT4H15M",
      },
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "11:15",
        arrivalTime: "13:05",
        flightNumber: "CD101",
        aircraft: "E90",
        duration: "PT0H50M",
      },
    ],
  },
  {
    id: "42",
    fare: "BUSINESS",
    totalPrice: 1099,
    numberOfBookableSeats: 3,
    totalDuration: "PT6H05M",
    segments: [
      {
        departureAirport: "YUL",
        arrivalAirport: "PAP",
        departureTime: "06:00",
        arrivalTime: "10:15",
        flightNumber: "CD321",
        aircraft: "7M8",
        duration: "PT4H15M",
      },
      {
        departureAirport: "PAP",
        arrivalAirport: "SDQ",
        departureTime: "11:15",
        arrivalTime: "13:05",
        flightNumber: "CD101",
        aircraft: "E90",
        duration: "PT0H50M",
      },
    ],
  },

  // ---- MIA ↔ IST via PAP (correspondance) --------------------------------
  {
    id: "43",
    fare: "ECO",
    totalPrice: 999,
    numberOfBookableSeats: 8,
    totalDuration: "PT15H30M",
    segments: [
      {
        departureAirport: "MIA",
        arrivalAirport: "PAP",
        departureTime: "06:00",
        arrivalTime: "07:50",
        flightNumber: "CD201",
        aircraft: "738",
        duration: "PT1H50M",
      },
      {
        departureAirport: "PAP",
        arrivalAirport: "IST",
        departureTime: "10:00",
        arrivalTime: "21:30",
        flightNumber: "CD521",
        aircraft: "788",
        duration: "PT11H30M",
      },
    ],
  },
  {
    id: "44",
    fare: "ECOFLEX",
    totalPrice: 1249,
    numberOfBookableSeats: 6,
    totalDuration: "PT15H30M",
    segments: [
      {
        departureAirport: "MIA",
        arrivalAirport: "PAP",
        departureTime: "06:00",
        arrivalTime: "07:50",
        flightNumber: "CD201",
        aircraft: "738",
        duration: "PT1H50M",
      },
      {
        departureAirport: "PAP",
        arrivalAirport: "IST",
        departureTime: "10:00",
        arrivalTime: "21:30",
        flightNumber: "CD521",
        aircraft: "788",
        duration: "PT11H30M",
      },
    ],
  },
  {
    id: "45",
    fare: "BUSINESS",
    totalPrice: 2899,
    numberOfBookableSeats: 3,
    totalDuration: "PT15H30M",
    segments: [
      {
        departureAirport: "MIA",
        arrivalAirport: "PAP",
        departureTime: "06:00",
        arrivalTime: "07:50",
        flightNumber: "CD201",
        aircraft: "738",
        duration: "PT1H50M",
      },
      {
        departureAirport: "PAP",
        arrivalAirport: "IST",
        departureTime: "10:00",
        arrivalTime: "21:30",
        flightNumber: "CD521",
        aircraft: "788",
        duration: "PT11H30M",
      },
    ],
  },
];

export const MOCK_FLIGHT_OFFERS: FlightOffer[] = OFFER_SPECS.map(buildOffer);
