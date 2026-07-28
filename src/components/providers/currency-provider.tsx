"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { formatPrice } from "@/components/results/flight-offer-utils";

export type CurrencyCode = "USD" | "EUR";

const CURRENCIES: CurrencyCode[] = ["USD", "EUR"];

/**
 * Taux fixes illustratifs — pas d'appel réel à un service de change,
 * cohérent avec CLAUDE.md (AUCUN appel réel côté données vol/prix).
 * Les offres mock sont toujours exprimées en USD ; la conversion ne
 * s'applique qu'à l'affichage.
 */
const RATE_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
};

const STORAGE_KEY = "citadelle-currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  /** Convertit un montant en USD (devise des offres mock) vers la devise affichée. */
  convert: (amountInUsd: string | number) => number;
  /** Convertit puis formate un montant en USD selon la devise affichée et la locale. */
  format: (amountInUsd: string | number, locale: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && CURRENCIES.includes(stored as CurrencyCode)) {
      setCurrencyState(stored as CurrencyCode);
    }
  }, []);

  function setCurrency(next: CurrencyCode) {
    setCurrencyState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  function convert(amountInUsd: string | number) {
    return Number(amountInUsd) * RATE_FROM_USD[currency];
  }

  function format(amountInUsd: string | number, locale: string) {
    return formatPrice(convert(amountInUsd), currency, locale);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency doit être utilisé dans un CurrencyProvider.");
  }
  return context;
}
