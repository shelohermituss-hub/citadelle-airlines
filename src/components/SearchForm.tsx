import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useBooking } from '@/contexts/BookingContext';
import { AirportAutocomplete } from './AirportAutocomplete';
import { ArrowLeftRight, Users, Calendar, ChevronDown } from 'lucide-react';
import type { SearchCriteria } from '@/data/types';

interface SearchFormProps {
  compact?: boolean;
  initialCriteria?: SearchCriteria;
}

export function SearchForm({ compact = false, initialCriteria }: SearchFormProps) {
  const { t, currency } = useI18n();
  const { setCriteria } = useBooking();
  const navigate = useNavigate();

  const [tripType, setTripType] = useState<'roundTrip' | 'oneWay'>(
    initialCriteria?.returnDate ? 'roundTrip' : 'oneWay',
  );
  const [origin, setOrigin] = useState(initialCriteria?.originLocationCode ?? '');
  const [destination, setDestination] = useState(initialCriteria?.destinationLocationCode ?? '');
  const [departDate, setDepartDate] = useState(initialCriteria?.departureDate ?? '');
  const [returnDate, setReturnDate] = useState(initialCriteria?.returnDate ?? '');
  const [adults, setAdults] = useState(initialCriteria?.adults ?? 1);
  const [children, setChildren] = useState(initialCriteria?.children ?? 0);
  const [infants, setInfants] = useState(initialCriteria?.infants ?? 0);
  const [travelClass, setTravelClass] = useState(initialCriteria?.travelClass ?? '');
  const [paxOpen, setPaxOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const totalPax = adults + children + infants;

  const paxLabel = useMemo(() => {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} ${t('common.adults')}`);
    if (children > 0) parts.push(`${children} ${t('common.children')}`);
    if (infants > 0) parts.push(`${infants} ${t('common.infants')}`);
    return parts.join(', ') || `${1} ${t('common.adults')}`;
  }, [adults, children, infants, t]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!origin || !destination) {
      errs.origin = t('search.validation.sameAirport');
    }
    if (origin && destination && origin === destination) {
      errs.destination = t('search.validation.sameAirport');
    }
    if (!departDate) {
      errs.departDate = t('common.error');
    } else if (departDate < today) {
      errs.departDate = t('search.validation.pastDate');
    }
    if (tripType === 'roundTrip' && returnDate) {
      if (returnDate < departDate) {
        errs.returnDate = t('search.validation.returnBefore');
      }
    }
    if (totalPax > 9) {
      errs.passengers = t('search.validation.maxPassengers');
    }
    if (infants > adults) {
      errs.passengers = t('search.validation.infantsExceed');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const criteria: SearchCriteria = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departDate,
      returnDate: tripType === 'roundTrip' ? returnDate : undefined,
      adults,
      children,
      infants,
      travelClass: travelClass ? (travelClass as SearchCriteria['travelClass']) : undefined,
      currencyCode: currency,
    };
    setCriteria(criteria);

    const params = new URLSearchParams({
      origin: origin,
      destination: destination,
      depart: departDate,
      ...(tripType === 'roundTrip' && returnDate ? { return: returnDate } : {}),
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      ...(travelClass ? { class: travelClass } : {}),
      currency,
    });
    navigate(`/search?${params.toString()}`);
  }

  function swap() {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  }

  return (
    <form onSubmit={handleSearch} className={`card ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      {/* Trip type */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-lg bg-citadelle-cream p-1">
          <button
            type="button"
            onClick={() => setTripType('roundTrip')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tripType === 'roundTrip' ? 'bg-white text-citadelle-black shadow-sm' : 'text-black/50'
            }`}
          >
            {t('search.roundTrip')}
          </button>
          <button
            type="button"
            onClick={() => setTripType('oneWay')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tripType === 'oneWay' ? 'bg-white text-citadelle-black shadow-sm' : 'text-black/50'
            }`}
          >
            {t('search.oneWay')}
          </button>
        </div>
      </div>

      {/* Main fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_1fr_1fr] gap-3 items-end">
        <div className="relative">
          <AirportAutocomplete
            id="origin"
            label={t('search.origin')}
            value={origin}
            onChange={setOrigin}
            error={errors.origin}
          />
        </div>

        <div className="relative">
          <AirportAutocomplete
            id="destination"
            label={t('search.destination')}
            value={destination}
            onChange={setDestination}
            error={errors.destination}
          />
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={swap}
          className="hidden lg:flex items-center justify-center h-11 w-11 rounded-xl bg-citadelle-cream text-citadelle-black/60 hover:bg-citadelle-gold/20 hover:text-citadelle-gold-dark transition-colors mb-[2px]"
          aria-label={t('search.swap')}
          title={t('search.swap')}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        <div>
          <label htmlFor="departDate" className="label">{t('search.departDate')}</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-citadelle-black/30 pointer-events-none" />
            <input
              id="departDate"
              type="date"
              min={today}
              className={`input pl-10 ${errors.departDate ? 'input-error' : ''}`}
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
            />
          </div>
          {errors.departDate && <p className="error-text">{errors.departDate}</p>}
        </div>

        <div>
          <label htmlFor="returnDate" className="label">
            {t('search.returnDate')}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-citadelle-black/30 pointer-events-none" />
            <input
              id="returnDate"
              type="date"
              min={departDate || today}
              className={`input pl-10 ${errors.returnDate ? 'input-error' : ''} ${tripType === 'oneWay' ? 'opacity-40' : ''}`}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={tripType === 'oneWay'}
            />
          </div>
          {errors.returnDate && <p className="error-text">{errors.returnDate}</p>}
        </div>
      </div>

      {/* Passengers + class + submit */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mt-3">
        {/* Passengers dropdown */}
        <div className="relative">
          <label className="label">{t('search.passengers')}</label>
          <button
            type="button"
            onClick={() => setPaxOpen(!paxOpen)}
            className={`input flex items-center justify-between text-left ${errors.passengers ? 'input-error' : ''}`}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-citadelle-black/40" />
              <span className="truncate">{paxLabel}</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-citadelle-black/40 transition-transform ${paxOpen ? 'rotate-180' : ''}`} />
          </button>
          {errors.passengers && <p className="error-text">{errors.passengers}</p>}
          {paxOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-black/5 bg-white p-4 shadow-elevated animate-slide-down">
              <PaxCounter label={t('search.adults')} desc={t('search.adultsDesc')} value={adults} setValue={setAdults} min={1} max={9} />
              <PaxCounter label={t('search.children')} desc={t('search.childrenDesc')} value={children} setValue={setChildren} min={0} max={9} />
              <PaxCounter label={t('search.infants')} desc={t('search.infantsDesc')} value={infants} setValue={setInfants} min={0} max={adults} />
              <button
                type="button"
                onClick={() => setPaxOpen(false)}
                className="mt-3 w-full btn-secondary py-2 text-sm"
              >
                {t('common.confirm')}
              </button>
            </div>
          )}
        </div>

        {/* Class */}
        <div>
          <label htmlFor="travelClass" className="label">{t('search.travelClass')}</label>
          <select
            id="travelClass"
            className="input"
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
          >
            <option value="">{t('search.anyClass')}</option>
            <option value="ECONOMY">{t('search.economy')}</option>
            <option value="BUSINESS">{t('search.business')}</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full sm:w-auto whitespace-nowrap h-[50px]">
            {t('search.searchBtn')}
          </button>
        </div>
      </div>
    </form>
  );
}

function PaxCounter({
  label,
  desc,
  value,
  setValue,
  min,
  max,
}: {
  label: string;
  desc: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-black/[0.06] last:border-0">
      <div>
        <p className="text-sm font-semibold text-citadelle-black">{label}</p>
        <p className="text-xs text-black/40">{desc}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-citadelle-black disabled:opacity-30 hover:border-citadelle-gold transition-colors"
        >
          <span className="text-lg leading-none">−</span>
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => setValue(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-citadelle-black disabled:opacity-30 hover:border-citadelle-gold transition-colors"
        >
          <span className="text-lg leading-none">+</span>
        </button>
      </div>
    </div>
  );
}
