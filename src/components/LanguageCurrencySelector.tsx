import { useI18n, LOCALES, CURRENCIES } from '@/i18n/I18nContext';
import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import type { Locale, Currency } from '@/i18n/translations';

export function LanguageCurrencySelector() {
  const { locale, setLocale, currency, setCurrency, t } = useI18n();
  const [open, setOpen] = useState<'lang' | 'currency' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="flex items-center gap-1">
      {/* Language selector */}
      <div className="relative">
        <button
          onClick={() => setOpen(open === 'lang' ? null : 'lang')}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-citadelle-black/70 transition-colors hover:bg-citadelle-cream hover:text-citadelle-black"
          aria-label={t('common.language')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline uppercase">{locale}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {open === 'lang' && (
          <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-black/5 bg-white py-1 shadow-elevated animate-slide-down">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLocale(l.code as Locale);
                  setOpen(null);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-citadelle-black transition-colors hover:bg-citadelle-cream"
              >
                {l.label}
                {locale === l.code && <Check className="h-4 w-4 text-citadelle-gold-dark" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Currency selector */}
      <div className="relative">
        <button
          onClick={() => setOpen(open === 'currency' ? null : 'currency')}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-citadelle-black/70 transition-colors hover:bg-citadelle-cream hover:text-citadelle-black"
          aria-label={t('common.currency')}
        >
          <span className="font-semibold">{currency}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {open === 'currency' && (
          <div className="absolute right-0 z-50 mt-2 w-32 rounded-xl border border-black/5 bg-white py-1 shadow-elevated animate-slide-down">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code as Currency);
                  setOpen(null);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-citadelle-black transition-colors hover:bg-citadelle-cream"
              >
                <span>{c.code}</span>
                {currency === c.code && <Check className="h-4 w-4 text-citadelle-gold-dark" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
