import type {
  CreateOrderParams,
  FlightOffer,
  FlightOffersPricingResponse,
  FlightOffersResponse,
  FlightOrderResponse,
  FlightSearchParams,
} from "./types";

/**
 * Contrat commun à toute implémentation Amadeus (mock aujourd'hui,
 * vrai client GDS demain). Aucune donnée de vol ne doit être écrite
 * en dur ailleurs que derrière cette interface (CLAUDE.md, règle 1).
 */
export interface IAmadeusClient {
  /** Flight Offers Search — recherche de vols selon les critères fournis. */
  searchFlights(params: FlightSearchParams): Promise<FlightOffersResponse>;

  /** Flight Offers Price — confirme le tarif d'une offre avant réservation. */
  priceOffer(offer: FlightOffer): Promise<FlightOffersPricingResponse>;

  /** Flight Create Orders — crée la réservation (PNR) pour une offre tarifée. */
  createOrder(params: CreateOrderParams): Promise<FlightOrderResponse>;
}
