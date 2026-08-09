import { useState, useRef, useEffect, useMemo } from 'react';
import { searchAirports, getAirport } from '@/data/airports';
import type { Airport } from '@/data/types';
import { useI18n } from '@/i18n/I18nContext';
import { MapPin, X } from 'lucide-react';
import { Flag } from '@/components/Flag';

interface AirportAutocompleteProps {
  value: string;
  onChange: (iata: string) => void;
  placeholder?: string;
  label: string;
  id: string;
  error?: string;
}

export function AirportAutocomplete({ value, onChange, placeholder, label, id, error }: AirportAutocompleteProps) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedAirport = useMemo(() => getAirport(value), [value]);

  const results = useMemo(() => searchAirports(query, 8), [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getCityName(a: Airport): string {
    if (locale === 'fr') return a.cityFr;
    if (locale === 'ht') return a.cityHt;
    return a.cityEn;
  }

  function getCountryName(a: Airport): string {
    if (locale === 'fr') return a.countryFr;
    if (locale === 'ht') return a.countryHt;
    return a.countryEn;
  }

  function selectAirport(a: Airport) {
    onChange(a.iata);
    setQuery('');
    setOpen(false);
    setHighlighted(0);
  }

  return (
    <div ref={ref} className="relative">
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-citadelle-black/30 pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={`input pl-10 ${selectedAirport && !open ? 'pr-16' : ''} ${error ? 'input-error' : ''}`}
          placeholder={placeholder ?? t('search.airportPlaceholder')}
          value={open ? query : (selectedAirport ? `${getCityName(selectedAirport)} (${selectedAirport.iata})` : '')}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && results.length > 0) {
              e.preventDefault();
              setHighlighted((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === 'ArrowUp' && results.length > 0) {
              e.preventDefault();
              setHighlighted((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter' && results[highlighted]) {
              e.preventDefault();
              selectAirport(results[highlighted]);
            } else if (e.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          role="combobox"
        />
        {selectedAirport && !open && (
          <>
            <Flag
              countryCode={selectedAirport.countryCode}
              className="absolute right-9 top-1/2 -translate-y-1/2 h-3.5 w-5 pointer-events-none"
            />
            <button
              onClick={() => { onChange(''); setQuery(''); setOpen(true); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-citadelle-black/30 hover:text-citadelle-black"
              aria-label="Clear"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
      {open && results.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-black/5 bg-white py-1 shadow-elevated max-h-72 overflow-y-auto animate-slide-down"
        >
          {results.map((a, idx) => (
            <li key={a.iata} role="option" aria-selected={idx === highlighted}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => selectAirport(a)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  idx === highlighted ? 'bg-citadelle-cream' : ''
                }`}
              >
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-citadelle-black text-xs font-bold text-citadelle-gold">
                  {a.iata}
                  <Flag
                    countryCode={a.countryCode}
                    className="absolute -bottom-1 -right-1 h-3 w-[1.1rem] ring-2 ring-white"
                  />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-citadelle-black">{getCityName(a)}</span>
                  <span className="text-xs text-black/50 flex items-center gap-1">
                    <Flag countryCode={a.countryCode} className="h-2 w-3" />
                    {getCountryName(a)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-black/5 bg-white py-3 px-4 text-sm text-black/50 shadow-elevated">
          {t('results.empty.title')}
        </div>
      )}
    </div>
  );
}
