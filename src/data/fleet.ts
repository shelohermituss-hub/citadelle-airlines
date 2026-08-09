/**
 * Citadelle Airlines fleet reference data.
 *
 * Illustrative demo data (cabin configuration, seat counts) consistent
 * with the fare families already defined in fareFamilies.ts — not
 * sourced from a real operator. Aircraft codes match the ones already
 * used by mockOffers.ts (AIRCRAFT_TYPES) so a flight's `aircraft.code`
 * can be looked up directly in this table.
 */

export type AircraftCode = '320' | '321' | '738' | '789' | '330' | '350';

export type BodyType = 'narrow' | 'wide';

export interface AircraftSeats {
  eco: number;
  ecoFlex: number;
  business: number;
}

export interface AircraftSpec {
  code: AircraftCode;
  manufacturer: 'Airbus' | 'Boeing';
  family: string;
  bodyType: BodyType;
  seats: AircraftSeats;
  rangeKm: number;
  cruiseSpeedKmh: number;
  lengthM: number;
  wingspanM: number;
  cabinWidthM: number;
  enginesCount: 2;
  /** i18n keys under fleet.<code>.* */
  nameKey: string;
  taglineKey: string;
}

export const FLEET: AircraftSpec[] = [
  {
    code: '320',
    manufacturer: 'Airbus',
    family: 'A320neo',
    bodyType: 'narrow',
    seats: { eco: 114, ecoFlex: 24, business: 12 },
    rangeKm: 6300,
    cruiseSpeedKmh: 840,
    lengthM: 37.6,
    wingspanM: 35.8,
    cabinWidthM: 3.7,
    enginesCount: 2,
    nameKey: 'fleet.320.name',
    taglineKey: 'fleet.320.tagline',
  },
  {
    code: '321',
    manufacturer: 'Airbus',
    family: 'A321neo',
    bodyType: 'narrow',
    seats: { eco: 152, ecoFlex: 32, business: 16 },
    rangeKm: 7400,
    cruiseSpeedKmh: 840,
    lengthM: 44.5,
    wingspanM: 35.8,
    cabinWidthM: 3.7,
    enginesCount: 2,
    nameKey: 'fleet.321.name',
    taglineKey: 'fleet.321.tagline',
  },
  {
    code: '738',
    manufacturer: 'Boeing',
    family: '737-800',
    bodyType: 'narrow',
    seats: { eco: 120, ecoFlex: 28, business: 12 },
    rangeKm: 5400,
    cruiseSpeedKmh: 840,
    lengthM: 39.5,
    wingspanM: 35.8,
    cabinWidthM: 3.5,
    enginesCount: 2,
    nameKey: 'fleet.738.name',
    taglineKey: 'fleet.738.tagline',
  },
  {
    code: '789',
    manufacturer: 'Boeing',
    family: '787-9 Dreamliner',
    bodyType: 'wide',
    seats: { eco: 218, ecoFlex: 48, business: 24 },
    rangeKm: 13500,
    cruiseSpeedKmh: 903,
    lengthM: 62.8,
    wingspanM: 60.1,
    cabinWidthM: 5.5,
    enginesCount: 2,
    nameKey: 'fleet.789.name',
    taglineKey: 'fleet.789.tagline',
  },
  {
    code: '330',
    manufacturer: 'Airbus',
    family: 'A330-900neo',
    bodyType: 'wide',
    seats: { eco: 220, ecoFlex: 52, business: 28 },
    rangeKm: 13300,
    cruiseSpeedKmh: 870,
    lengthM: 63.7,
    wingspanM: 64.0,
    cabinWidthM: 5.6,
    enginesCount: 2,
    nameKey: 'fleet.330.name',
    taglineKey: 'fleet.330.tagline',
  },
  {
    code: '350',
    manufacturer: 'Airbus',
    family: 'A350-900',
    bodyType: 'wide',
    seats: { eco: 239, ecoFlex: 56, business: 30 },
    rangeKm: 15000,
    cruiseSpeedKmh: 903,
    lengthM: 66.8,
    wingspanM: 64.75,
    cabinWidthM: 5.6,
    enginesCount: 2,
    nameKey: 'fleet.350.name',
    taglineKey: 'fleet.350.tagline',
  },
];

export function getAircraft(code: AircraftCode): AircraftSpec {
  const found = FLEET.find((a) => a.code === code);
  if (!found) throw new Error(`Unknown aircraft code: ${code}`);
  return found;
}

export function totalSeats(seats: AircraftSeats): number {
  return seats.eco + seats.ecoFlex + seats.business;
}
