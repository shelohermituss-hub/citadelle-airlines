import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { FlightOffer, FlightResult, PassengerInfo, ContactInfo, FareFamily, SearchCriteria, PNRRecord } from '@/data/types';

interface BookingContextValue {
  // Search criteria
  criteria: SearchCriteria | null;
  setCriteria: (c: SearchCriteria | null) => void;

  // Selected outbound offer
  outboundResult: FlightResult | null;
  setOutboundResult: (r: FlightResult | null) => void;

  // Selected return offer
  returnResult: FlightResult | null;
  setReturnResult: (r: FlightResult | null) => void;

  // Selected fare family
  fareFamily: FareFamily;
  setFareFamily: (f: FareFamily) => void;

  // Selected offers (raw FlightOffer objects for booking)
  selectedOffers: FlightOffer[];
  setSelectedOffers: (o: FlightOffer[]) => void;

  // Passengers
  passengers: PassengerInfo[];
  setPassengers: (p: PassengerInfo[]) => void;

  // Contact
  contact: ContactInfo;
  setContact: (c: ContactInfo) => void;

  // Total price (fare only — see ancillariesTotal for seats/pets add-ons)
  totalPrice: number;
  setTotalPrice: (p: number) => void;

  // Seat + pet surcharges, in the traveler's selected currency, added on top of totalPrice at payment time
  ancillariesTotal: number;
  setAncillariesTotal: (p: number) => void;

  // Confirmed booking
  confirmedBooking: PNRRecord | null;
  setConfirmedBooking: (b: PNRRecord | null) => void;

  // Reset everything
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const DEFAULT_CONTACT: ContactInfo = {
  email: '',
  phoneCountryCode: '+1',
  phoneNumber: '',
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [outboundResult, setOutboundResult] = useState<FlightResult | null>(null);
  const [returnResult, setReturnResult] = useState<FlightResult | null>(null);
  const [fareFamily, setFareFamily] = useState<FareFamily>('ECO');
  const [selectedOffers, setSelectedOffers] = useState<FlightOffer[]>([]);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [totalPrice, setTotalPrice] = useState(0);
  const [ancillariesTotal, setAncillariesTotal] = useState(0);
  const [confirmedBooking, setConfirmedBooking] = useState<PNRRecord | null>(null);

  const resetBooking = useCallback(() => {
    setCriteria(null);
    setOutboundResult(null);
    setReturnResult(null);
    setFareFamily('ECO');
    setSelectedOffers([]);
    setPassengers([]);
    setContact(DEFAULT_CONTACT);
    setTotalPrice(0);
    setAncillariesTotal(0);
    setConfirmedBooking(null);
  }, []);

  const value = useMemo(
    () => ({
      criteria,
      setCriteria,
      outboundResult,
      setOutboundResult,
      returnResult,
      setReturnResult,
      fareFamily,
      setFareFamily,
      selectedOffers,
      setSelectedOffers,
      passengers,
      setPassengers,
      contact,
      setContact,
      totalPrice,
      setTotalPrice,
      ancillariesTotal,
      setAncillariesTotal,
      confirmedBooking,
      setConfirmedBooking,
      resetBooking,
    }),
    [criteria, outboundResult, returnResult, fareFamily, selectedOffers, passengers, contact, totalPrice, ancillariesTotal, confirmedBooking, resetBooking],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
