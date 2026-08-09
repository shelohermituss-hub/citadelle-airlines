import { getAircraft, type AircraftCode, type BodyType } from './fleet';
import { SEAT_SURCHARGE_USD } from './ancillaries';
import type { FareFamily } from './types';

export type SeatPosition = 'window' | 'middle' | 'aisle';
export type SeatTier = 'included' | 'standard' | 'preferred' | 'extraLegroom';

export interface Seat {
  id: string;
  row: number;
  column: string;
  cabinClass: FareFamily;
  position: SeatPosition;
  tier: SeatTier;
  priceUsd: number;
}

export interface SeatMap {
  aircraftCode: AircraftCode;
  bodyType: BodyType;
  seats: Seat[];
  /** Ordered row numbers per cabin class, front to back. */
  rowsByClass: Record<FareFamily, number[]>;
  /** Column groups (for rendering the aisle gaps), per body type. */
  layout: string[][];
}

const LAYOUTS: Record<BodyType, string[][]> = {
  narrow: [['A', 'B', 'C'], ['D', 'E', 'F']],
  wide: [['A', 'B'], ['C', 'D', 'E', 'F'], ['G', 'H']],
};

const BUSINESS_LAYOUTS: Record<BodyType, string[][]> = {
  narrow: [['A', 'B'], ['C', 'D']],
  wide: [['A', 'B'], ['C', 'D'], ['E', 'F']],
};

function positionFor(groups: string[][], groupIdx: number, seatIdx: number): SeatPosition {
  const group = groups[groupIdx];
  const isFirstGroup = groupIdx === 0;
  const isLastGroup = groupIdx === groups.length - 1;
  if (seatIdx === 0 && isFirstGroup) return 'window';
  if (seatIdx === group.length - 1 && isLastGroup) return 'window';
  if (seatIdx === 0 || seatIdx === group.length - 1) return 'aisle';
  return 'middle';
}

function buildRows(
  cabinClass: FareFamily,
  startRow: number,
  seatCount: number,
  groups: string[][],
  tierForRow: (rowIndexInClass: number, totalRows: number) => SeatTier,
): { seats: Seat[]; rows: number[] } {
  const perRow = groups.reduce((n, g) => n + g.length, 0);
  const rowCount = Math.ceil(seatCount / perRow);
  const seats: Seat[] = [];
  const rows: number[] = [];

  for (let r = 0; r < rowCount; r++) {
    const row = startRow + r;
    rows.push(row);
    const tier = tierForRow(r, rowCount);
    groups.forEach((group, gi) => {
      group.forEach((col, si) => {
        seats.push({
          id: `${row}${col}`,
          row,
          column: col,
          cabinClass,
          position: positionFor(groups, gi, si),
          tier,
          priceUsd: SEAT_SURCHARGE_USD[tier],
        });
      });
    });
  }

  return { seats, rows };
}

/** Builds a full seat map for an aircraft, sequential row numbering front to back (Business → Eco Flex → Eco). */
export function generateSeatMap(aircraftCode: AircraftCode): SeatMap {
  const aircraft = getAircraft(aircraftCode);
  const economyLayout = LAYOUTS[aircraft.bodyType];
  const businessLayout = BUSINESS_LAYOUTS[aircraft.bodyType];

  const business = buildRows('BUSINESS', 1, aircraft.seats.business, businessLayout, () => 'included');

  const ecoFlexStart = business.rows[business.rows.length - 1] + 1;
  const ecoFlex = buildRows('ECO_FLEX', ecoFlexStart, aircraft.seats.ecoFlex, economyLayout, () => 'included');

  const ecoStart = ecoFlex.rows[ecoFlex.rows.length - 1] + 1;
  const eco = buildRows('ECO', ecoStart, aircraft.seats.eco, economyLayout, (rowIndex, total) => {
    if (rowIndex < 2) return 'preferred';
    if (rowIndex === Math.floor(total / 3)) return 'extraLegroom';
    return 'standard';
  });

  return {
    aircraftCode,
    bodyType: aircraft.bodyType,
    seats: [...business.seats, ...ecoFlex.seats, ...eco.seats],
    rowsByClass: {
      BUSINESS: business.rows,
      ECO_FLEX: ecoFlex.rows,
      ECO: eco.rows,
    },
    layout: aircraft.bodyType === 'narrow' ? LAYOUTS.narrow : LAYOUTS.wide,
  };
}

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

/** Deterministic "already taken" seats for a given flight — stable across re-renders of the same flight. */
export function getUnavailableSeats(flightKey: string, map: SeatMap, cabinClass: FareFamily): Set<string> {
  const rng = seededRandom(hashString(flightKey));
  const classSeats = map.seats.filter((s) => s.cabinClass === cabinClass);
  const taken = new Set<string>();
  for (const seat of classSeats) {
    if (rng() < 0.3) taken.add(seat.id);
  }
  return taken;
}
