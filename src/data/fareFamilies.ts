import type { FareFamily } from './types';

export interface FareFamilyDefinition {
  code: FareFamily;
  includedCabinBags: number;
  includedCheckedBags: number;
  isModificationIncluded: boolean;
  modificationFeeUsd?: number;
  isRefundable: boolean;
  refundFeeUsd?: number;
  isSeatSelectionIncluded: boolean;
  isPriorityBoardingIncluded: boolean;
  isMealIncluded: boolean;
  /** Price multiplier relative to the base economy fare. */
  priceMultiplier: number;
}

export const FARE_FAMILIES: Record<FareFamily, FareFamilyDefinition> = {
  ECO: {
    code: 'ECO',
    includedCabinBags: 1,
    includedCheckedBags: 0,
    isModificationIncluded: false,
    modificationFeeUsd: 75,
    isRefundable: false,
    isSeatSelectionIncluded: false,
    isPriorityBoardingIncluded: false,
    isMealIncluded: false,
    priceMultiplier: 1,
  },
  ECO_FLEX: {
    code: 'ECO_FLEX',
    includedCabinBags: 1,
    includedCheckedBags: 1,
    isModificationIncluded: true,
    isRefundable: true,
    refundFeeUsd: 50,
    isSeatSelectionIncluded: true,
    isPriorityBoardingIncluded: false,
    isMealIncluded: true,
    priceMultiplier: 1.45,
  },
  BUSINESS: {
    code: 'BUSINESS',
    includedCabinBags: 2,
    includedCheckedBags: 2,
    isModificationIncluded: true,
    isRefundable: true,
    isSeatSelectionIncluded: true,
    isPriorityBoardingIncluded: true,
    isMealIncluded: true,
    priceMultiplier: 2.8,
  },
};

export const FARE_FAMILY_ORDER: FareFamily[] = ['ECO', 'ECO_FLEX', 'BUSINESS'];
