import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { type Locale, type Currency, translate, LOCALES, CURRENCIES } from './translations';

interface I18nContextValue {
  locale: Locale;
  currency: Currency;
  setLocale: (l: Locale) => void;
  setCurrency: (c: Currency) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatPrice: (amount: number, currency?: Currency) => string;
  formatDate: (dateStr: string, opts?: Intl.DateTimeFormatOptions) => string;
  formatTime: (dateStr: string) => string;
  formatDateTime: (dateStr: string) => string;
  formatNumber: (n: number) => string;
  formatDuration: (minutes: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_LOCALE = 'citadelle_locale';
const STORAGE_CURRENCY = 'citadelle_currency';

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_LOCALE) as Locale | null;
  if (stored && ['en', 'fr', 'ht'].includes(stored)) return stored;
  const browser = navigator.language.slice(0, 2);
  if (['en', 'fr', 'ht'].includes(browser)) return browser as Locale;
  return 'en';
}

function getInitialCurrency(): Currency {
  const stored = localStorage.getItem(STORAGE_CURRENCY) as Currency | null;
  if (stored && ['USD', 'EUR'].includes(stored)) return stored;
  return 'USD';
}

const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: '$', EUR: '€' };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_LOCALE, l);
    document.documentElement.lang = l;
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_CURRENCY, c);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  const formatPrice = useCallback(
    (amount: number, cur?: Currency) => {
      const c = cur ?? currency;
      const rounded = Math.round(amount);
      const formatted = new Intl.NumberFormat(locale === 'fr' || locale === 'ht' ? 'fr-FR' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(rounded);
      return c === 'EUR' ? `${formatted} ${CURRENCY_SYMBOLS.EUR}` : `${CURRENCY_SYMBOLS.USD}${formatted}`;
    },
    [locale, currency],
  );

  const formatDate = useCallback(
    (dateStr: string, opts?: Intl.DateTimeFormatOptions) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(locale === 'fr' || locale === 'ht' ? 'fr-FR' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        ...opts,
      }).format(date);
    },
    [locale],
  );

  const formatTime = useCallback(
    (dateStr: string) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(locale === 'fr' || locale === 'ht' ? 'fr-FR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: locale === 'en',
      }).format(date);
    },
    [locale],
  );

  const formatDateTime = useCallback(
    (dateStr: string) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(locale === 'fr' || locale === 'ht' ? 'fr-FR' : 'en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: locale === 'en',
      }).format(date);
    },
    [locale],
  );

  const formatNumber = useCallback(
    (n: number) => new Intl.NumberFormat(locale === 'fr' || locale === 'ht' ? 'fr-FR' : 'en-US').format(n),
    [locale],
  );

  const formatDuration = useCallback(
    (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      if (locale === 'en') return `${h}h ${m.toString().padStart(2, '0')}m`;
      return `${h}h ${m.toString().padStart(2, '0')}min`;
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      currency,
      setLocale,
      setCurrency,
      t,
      formatPrice,
      formatDate,
      formatTime,
      formatDateTime,
      formatNumber,
      formatDuration,
    }),
    [locale, currency, setLocale, setCurrency, t, formatPrice, formatDate, formatTime, formatDateTime, formatNumber, formatDuration],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export { LOCALES, CURRENCIES };
