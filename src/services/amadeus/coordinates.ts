import type { AirportCode } from "./airports";

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Coordonnées géographiques réelles des aéroports du réseau — servent
 * uniquement à la visualisation 3D du globe (src/components/home/globe/),
 * jamais à des calculs de vol (durées/tarifs viennent du mock Amadeus,
 * voir mock-offers.data.ts).
 */
export const AIRPORT_COORDINATES: Record<AirportCode, Coordinates> = {
  PAP: { lat: 18.58, lon: -72.2925 },
  YUL: { lat: 45.4706, lon: -73.7408 },
  YYZ: { lat: 43.6777, lon: -79.6248 },
  MIA: { lat: 25.7959, lon: -80.287 },
  JFK: { lat: 40.6413, lon: -73.7781 },
  SDQ: { lat: 18.4297, lon: -69.6689 },
  HAV: { lat: 22.9892, lon: -82.4091 },
  GRU: { lat: -23.4356, lon: -46.4731 },
  SCL: { lat: -33.393, lon: -70.7858 },
  IST: { lat: 41.2753, lon: 28.7519 },
  NAS: { lat: 25.0389, lon: -77.4661 },
  KIN: { lat: 17.9357, lon: -76.7875 },
  PTP: { lat: 16.2653, lon: -61.5317 },
  CUR: { lat: 12.1889, lon: -68.9598 },
};

/** Aéroport hub du réseau en étoile (voir mock-offers.data.ts). */
export const HUB_AIRPORT: AirportCode = "PAP";
