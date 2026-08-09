import type { Airport } from './types';

/**
 * Single source of truth for the Citadelle Airlines network.
 * Hub: PAP — Port-au-Prince.
 * All inter-destination connections route through the hub.
 */
export const HUB_IATA = 'PAP';

export const AIRPORTS: Airport[] = [
  {
    iata: 'PAP',
    city: 'Port-au-Prince',
    cityEn: 'Port-au-Prince',
    cityFr: 'Port-au-Prince',
    cityHt: 'Pòtoprens',
    country: 'Haiti',
    countryCode: 'HT',
    countryEn: 'Haiti',
    countryFr: 'Haïti',
    countryHt: 'Ayiti',
    durationFromHubMin: 0,
  },
  {
    iata: 'YUL',
    city: 'Montréal',
    cityEn: 'Montréal',
    cityFr: 'Montréal',
    cityHt: 'Montréal',
    country: 'Canada',
    countryCode: 'CA',
    countryEn: 'Canada',
    countryFr: 'Canada',
    countryHt: 'Kanada',
    durationFromHubMin: 255,
  },
  {
    iata: 'YYZ',
    city: 'Toronto',
    cityEn: 'Toronto',
    cityFr: 'Toronto',
    cityHt: 'Toronto',
    country: 'Canada',
    countryCode: 'CA',
    countryEn: 'Canada',
    countryFr: 'Canada',
    countryHt: 'Kanada',
    durationFromHubMin: 270,
  },
  {
    iata: 'MIA',
    city: 'Miami',
    cityEn: 'Miami',
    cityFr: 'Miami',
    cityHt: 'Miami',
    country: 'United States',
    countryCode: 'US',
    countryEn: 'United States',
    countryFr: 'États-Unis',
    countryHt: 'Etazini',
    durationFromHubMin: 110,
  },
  {
    iata: 'JFK',
    city: 'New York',
    cityEn: 'New York',
    cityFr: 'New York',
    cityHt: 'New York',
    country: 'United States',
    countryCode: 'US',
    countryEn: 'United States',
    countryFr: 'États-Unis',
    countryHt: 'Etazini',
    durationFromHubMin: 225,
  },
  {
    iata: 'SDQ',
    city: 'Santo Domingo',
    cityEn: 'Santo Domingo',
    cityFr: 'Saint-Domingue',
    cityHt: 'Santo Domingo',
    country: 'Dominican Republic',
    countryCode: 'DO',
    countryEn: 'Dominican Republic',
    countryFr: 'République dominicaine',
    countryHt: 'Repiblik Dominikèn',
    durationFromHubMin: 50,
  },
  {
    iata: 'HAV',
    city: 'Havana',
    cityEn: 'Havana',
    cityFr: 'La Havane',
    cityHt: 'La Avàn',
    country: 'Cuba',
    countryCode: 'CU',
    countryEn: 'Cuba',
    countryFr: 'Cuba',
    countryHt: 'Kiba',
    durationFromHubMin: 90,
  },
  {
    iata: 'GRU',
    city: 'São Paulo',
    cityEn: 'São Paulo',
    cityFr: 'São Paulo',
    cityHt: 'São Paulo',
    country: 'Brazil',
    countryCode: 'BR',
    countryEn: 'Brazil',
    countryFr: 'Brésil',
    countryHt: 'Brezil',
    durationFromHubMin: 420,
  },
  {
    iata: 'SCL',
    city: 'Santiago',
    cityEn: 'Santiago',
    cityFr: 'Santiago',
    cityHt: 'Santiago',
    country: 'Chile',
    countryCode: 'CL',
    countryEn: 'Chile',
    countryFr: 'Chili',
    countryHt: 'Chili',
    durationFromHubMin: 510,
  },
  {
    iata: 'IST',
    city: 'Istanbul',
    cityEn: 'Istanbul',
    cityFr: 'Istanbul',
    cityHt: 'Istanbul',
    country: 'Turkey',
    countryCode: 'TR',
    countryEn: 'Turkey',
    countryFr: 'Turquie',
    countryHt: 'Tiiki',
    durationFromHubMin: 690,
  },
  {
    iata: 'NAS',
    city: 'Nassau',
    cityEn: 'Nassau',
    cityFr: 'Nassau',
    cityHt: 'Nassau',
    country: 'Bahamas',
    countryCode: 'BS',
    countryEn: 'Bahamas',
    countryFr: 'Bahamas',
    countryHt: 'Bahamas',
    durationFromHubMin: 100,
  },
  {
    iata: 'KIN',
    city: 'Kingston',
    cityEn: 'Kingston',
    cityFr: 'Kingston',
    cityHt: 'Kingston',
    country: 'Jamaica',
    countryCode: 'JM',
    countryEn: 'Jamaica',
    countryFr: 'Jamaïque',
    countryHt: 'Jamayik',
    durationFromHubMin: 70,
  },
  {
    iata: 'PTP',
    city: 'Pointe-à-Pitre',
    cityEn: 'Pointe-à-Pitre',
    cityFr: 'Pointe-à-Pitre',
    cityHt: 'Pwentapit',
    country: 'Guadeloupe',
    countryCode: 'GP',
    countryEn: 'Guadeloupe',
    countryFr: 'Guadeloupe',
    countryHt: 'Gwadloup',
    durationFromHubMin: 120,
  },
  {
    iata: 'CUR',
    city: 'Curaçao',
    cityEn: 'Curaçao',
    cityFr: 'Curaçao',
    cityHt: 'Kurasao',
    country: 'Curaçao',
    countryCode: 'CW',
    countryEn: 'Curaçao',
    countryFr: 'Curaçao',
    countryHt: 'Kurasao',
    durationFromHubMin: 135,
  },
];

export const AIRPORT_MAP: Record<string, Airport> = Object.fromEntries(
  AIRPORTS.map((a) => [a.iata, a]),
);

export function getAirport(iata: string): Airport | undefined {
  return AIRPORT_MAP[iata.toUpperCase()];
}

/** Search airports by city, IATA code, or country — accent-insensitive. */
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = normalize(query.trim());
  if (!q) return [];
  return AIRPORTS.filter((a) => {
    return (
      a.iata.includes(q.toUpperCase()) ||
      normalize(a.cityEn).includes(q) ||
      normalize(a.cityFr).includes(q) ||
      normalize(a.cityHt).includes(q) ||
      normalize(a.countryEn).includes(q) ||
      normalize(a.countryFr).includes(q) ||
      normalize(a.countryHt).includes(q)
    );
  }).slice(0, limit);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, "'");
}
