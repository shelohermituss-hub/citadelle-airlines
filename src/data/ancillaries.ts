/**
 * Paid add-ons outside the fare itself (pets, seat upgrades).
 * All amounts in USD — convert with `convertUsd()` from mockOffers.ts
 * before adding to a total in the traveler's selected currency.
 */

export const PET_FEE_USD: Record<'CABIN' | 'CARGO', number> = {
  CABIN: 75,
  CARGO: 150,
};

export const SEAT_SURCHARGE_USD: Record<'standard' | 'preferred' | 'extraLegroom' | 'included', number> = {
  standard: 0,
  preferred: 12,
  extraLegroom: 35,
  included: 0,
};
