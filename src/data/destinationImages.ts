/**
 * Optional hero photography for the destination detail page, keyed by IATA code.
 * Destinations without an entry fall back to the plain gradient hero —
 * this list grows over time, it is not required for a destination to be bookable.
 */
export const DESTINATION_IMAGES: Partial<Record<string, string>> = {
  YUL: '/images/destinations/YUL.jpg',
  YYZ: '/images/destinations/YYZ.jpg',
  MIA: '/images/destinations/MIA.jpg',
  GRU: '/images/destinations/GRU.jpg',
  SCL: '/images/destinations/SCL.jpg',
  IST: '/images/destinations/IST.jpg',
  NAS: '/images/destinations/NAS.jpg',
  KIN: '/images/destinations/KIN.jpg',
};

export function getDestinationImage(iata: string): string | undefined {
  return DESTINATION_IMAGES[iata.toUpperCase()];
}
