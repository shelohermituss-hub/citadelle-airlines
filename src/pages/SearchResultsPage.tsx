import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useBooking } from '@/contexts/BookingContext';
import { bookingService } from '@/data/bookingService';
import { getAirport } from '@/data/airports';
import { FARE_FAMILY_ORDER } from '@/data/fareFamilies';
import type { FlightResult, SearchCriteria } from '@/data/types';
import { SearchForm } from '@/components/SearchForm';
import { FlightCard } from '@/components/FlightCard';
import { ArrowUpDown, Filter, X, Plane, Clock, ArrowRight, RefreshCw, Calendar } from 'lucide-react';
import { Flag } from '@/components/Flag';

type SortKey = 'price' | 'duration' | 'departure' | 'arrival';

export default function SearchResultsPage() {
  const { t, locale, currency, formatDate } = useI18n();
  const { setCriteria, setOutboundResult, setReturnResult } = useBooking();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModify, setShowModify] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterDirectOnly, setFilterDirectOnly] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterDepRange, setFilterDepRange] = useState<[number, number]>([0, 24]);
  const [filterArrRange, setFilterArrRange] = useState<[number, number]>([0, 24]);

  const criteria: SearchCriteria = useMemo(() => {
    const origin = searchParams.get('origin') ?? '';
    const destination = searchParams.get('destination') ?? '';
    const departureDate = searchParams.get('depart') ?? '';
    const returnDate = searchParams.get('return') ?? undefined;
    const adults = parseInt(searchParams.get('adults') ?? '1', 10);
    const children = parseInt(searchParams.get('children') ?? '0', 10);
    const infants = parseInt(searchParams.get('infants') ?? '0', 10);
    const travelClass = searchParams.get('class') as SearchCriteria['travelClass'] | null;
    const curr = (searchParams.get('currency') as 'USD' | 'EUR') || currency;
    return {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass: travelClass ?? undefined,
      currencyCode: curr,
    };
  }, [searchParams, currency]);

  const isRoundTrip = !!criteria.returnDate;

  // We need to separate outbound and return results
  // For round-trip, the mock generates combined offers. We'll treat the first itinerary as outbound selection
  // and the second as return selection.
  // For simplicity in phase 1, we show outbound results first, then return selection.

  const [phase, setPhase] = useState<'outbound' | 'return'>('outbound');

  const doSearch = useCallback(async () => {
    if (!criteria.originLocationCode || !criteria.destinationLocationCode || !criteria.departureDate) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await bookingService.searchOffers(criteria);
      setResults(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [criteria]);

  useEffect(() => {
    setCriteria(criteria);
    doSearch();
  }, [criteria, setCriteria, doSearch]);

  // Filtered + sorted results
  const filteredResults = useMemo(() => {
    let r = [...results];
    if (filterDirectOnly) r = r.filter((x) => x.stops === 0);
    if (filterClass) r = r.filter((x) => x.fareFamily === filterClass);
    r = r.filter((x) => {
      const depHour = new Date(x.departureTime).getHours() + new Date(x.departureTime).getMinutes() / 60;
      const arrHour = new Date(x.arrivalTime).getHours() + new Date(x.arrivalTime).getMinutes() / 60;
      return depHour >= filterDepRange[0] && depHour <= filterDepRange[1] &&
             arrHour >= filterArrRange[0] && arrHour <= filterArrRange[1];
    });
    r.sort((a, b) => {
      switch (sortBy) {
        case 'duration': return a.durationMin - b.durationMin;
        case 'departure': return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case 'arrival': return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
        default: return a.totalPrice - b.totalPrice;
      }
    });
    return r;
  }, [results, filterDirectOnly, filterClass, filterDepRange, filterArrRange, sortBy]);

  function handleSelect(result: FlightResult) {
    if (isRoundTrip && phase === 'outbound') {
      setOutboundResult(result);
      setPhase('return');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isRoundTrip && phase === 'return') {
      setReturnResult(result);
      navigate('/booking/fare');
    } else {
      setOutboundResult(result);
      navigate('/booking/fare');
    }
  }

  function getCityName(iata: string): string {
    const a = getAirport(iata);
    if (!a) return iata;
    if (locale === 'fr') return a.cityFr;
    if (locale === 'ht') return a.cityHt;
    return a.cityEn;
  }

  const totalPax = criteria.adults + criteria.children + criteria.infants;

  // Nearby date suggestions
  const nearbyDates = useMemo(() => {
    const base = new Date(criteria.departureDate);
    if (isNaN(base.getTime())) return [];
    return [-3, -2, -1, 1, 2, 3].map((d) => {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + d);
      return dt.toISOString().slice(0, 10);
    }).filter((d) => d >= new Date().toISOString().slice(0, 10));
  }, [criteria.departureDate]);

  return (
    <div className="container-page py-6">
      {/* Search summary banner */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Flag countryCode={getAirport(criteria.originLocationCode)?.countryCode ?? ''} className="h-3 w-4" />
              <span className="font-bold text-citadelle-black text-lg">{getCityName(criteria.originLocationCode)}</span>
              <span className="text-citadelle-black/30 text-sm">({criteria.originLocationCode})</span>
            </div>
            <ArrowRight className="h-4 w-4 text-citadelle-gold-dark" />
            <div className="flex items-center gap-2">
              <Flag countryCode={getAirport(criteria.destinationLocationCode)?.countryCode ?? ''} className="h-3 w-4" />
              <span className="font-bold text-citadelle-black text-lg">{getCityName(criteria.destinationLocationCode)}</span>
              <span className="text-citadelle-black/30 text-sm">({criteria.destinationLocationCode})</span>
            </div>
            <span className="text-sm text-black/40">·</span>
            <span className="text-sm text-black/60">{formatDate(criteria.departureDate)}</span>
            {criteria.returnDate && (
              <>
                <span className="text-sm text-black/40">—</span>
                <span className="text-sm text-black/60">{formatDate(criteria.returnDate)}</span>
              </>
            )}
            <span className="text-sm text-black/40">·</span>
            <span className="text-sm text-black/60">{totalPax} {t('common.passengers').toLowerCase()}</span>
            {isRoundTrip && (
              <>
                <span className="text-sm text-black/40">·</span>
                <span className="chip bg-citadelle-gold/15 text-citadelle-gold-dark">
                  {phase === 'outbound' ? t('results.outbound') : t('results.return')}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowModify(!showModify)}
            className="btn-ghost text-sm"
          >
            {t('results.modifySearch')}
          </button>
        </div>
        {showModify && (
          <div className="mt-4 animate-slide-down">
            <SearchForm compact initialCriteria={criteria} />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        {/* Filters sidebar */}
        <aside className="hidden lg:block">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-citadelle-gold-dark" />
              <h3 className="font-semibold text-citadelle-black">{t('results.filters')}</h3>
            </div>
            <FilterControls
              filterDirectOnly={filterDirectOnly}
              setFilterDirectOnly={setFilterDirectOnly}
              filterClass={filterClass}
              setFilterClass={setFilterClass}
              filterDepRange={filterDepRange}
              setFilterDepRange={setFilterDepRange}
              filterArrRange={filterArrRange}
              setFilterArrRange={setFilterArrRange}
            />
          </div>
        </aside>

        {/* Results */}
        <div>
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-sm text-black/40 whitespace-nowrap">{t('results.sortBy')}:</span>
              {([
                { key: 'price', label: t('results.sort.price'), icon: ArrowUpDown },
                { key: 'duration', label: t('results.sort.duration'), icon: Clock },
                { key: 'departure', label: t('results.sort.departure'), icon: Plane },
                { key: 'arrival', label: t('results.sort.arrival'), icon: Plane },
              ] as const).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    sortBy === s.key
                      ? 'bg-citadelle-black text-white'
                      : 'bg-white text-black/60 border border-black/10 hover:border-citadelle-gold'
                  }`}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium"
            >
              <Filter className="h-4 w-4" />
              {t('results.filters')}
            </button>
          </div>

          {/* States */}
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card p-5">
                  <div className="flex gap-4">
                    <div className="skeleton h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-1/3" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                    <div className="skeleton h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
              <p className="text-center text-sm text-black/40 py-4">{t('results.loading')}</p>
            </div>
          )}

          {error && !loading && (
            <div className="card p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-citadelle-error/10">
                  <X className="h-7 w-7 text-citadelle-error" />
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-citadelle-black mb-2">{t('results.error.title')}</h3>
              <p className="text-sm text-black/50 mb-4">{t('results.error.desc')}</p>
              <button onClick={doSearch} className="btn-primary">
                <RefreshCw className="h-4 w-4" />
                {t('common.retry')}
              </button>
            </div>
          )}

          {!loading && !error && filteredResults.length === 0 && (
            <div className="card p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-citadelle-cream">
                  <Plane className="h-7 w-7 text-black/30" />
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-citadelle-black mb-2">{t('results.empty.title')}</h3>
              <p className="text-sm text-black/50 mb-4">{t('results.empty.desc')}</p>
              {nearbyDates.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-2">{t('results.empty.suggestions')}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {nearbyDates.map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('depart', d);
                          navigate(`/search?${params.toString()}`);
                        }}
                        className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:border-citadelle-gold transition-colors flex items-center gap-1.5"
                      >
                        <Calendar className="h-3.5 w-3.5 text-black/30" />
                        {formatDate(d)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !error && filteredResults.length > 0 && (
            <div className="space-y-3">
              {filteredResults.map((r, i) => (
                <FlightCard
                  key={`${r.offer.id}-${i}`}
                  result={r}
                  onSelect={() => handleSelect(r)}
                  isReturn={phase === 'return'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white p-5 overflow-y-auto animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-citadelle-black">{t('results.filters')}</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-citadelle-cream rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterControls
              filterDirectOnly={filterDirectOnly}
              setFilterDirectOnly={setFilterDirectOnly}
              filterClass={filterClass}
              setFilterClass={setFilterClass}
              filterDepRange={filterDepRange}
              setFilterDepRange={setFilterDepRange}
              filterArrRange={filterArrRange}
              setFilterArrRange={setFilterArrRange}
            />
            <button onClick={() => setShowFilters(false)} className="mt-4 btn-primary w-full">
              {t('common.confirm')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterControls({
  filterDirectOnly,
  setFilterDirectOnly,
  filterClass,
  setFilterClass,
  filterDepRange,
  setFilterDepRange,
  filterArrRange,
  setFilterArrRange,
}: {
  filterDirectOnly: boolean;
  setFilterDirectOnly: (v: boolean) => void;
  filterClass: string;
  setFilterClass: (v: string) => void;
  filterDepRange: [number, number];
  setFilterDepRange: (v: [number, number]) => void;
  filterArrRange: [number, number];
  setFilterArrRange: (v: [number, number]) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      {/* Stops */}
      <div>
        <p className="text-sm font-semibold text-citadelle-black mb-2">{t('results.filter.stops')}</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterDirectOnly}
            onChange={(e) => setFilterDirectOnly(e.target.checked)}
            className="h-4 w-4 rounded border-black/20 text-citadelle-gold focus:ring-citadelle-gold"
          />
          <span className="text-sm text-black/60">{t('results.filter.directOnly')}</span>
        </label>
      </div>

      {/* Class */}
      <div>
        <p className="text-sm font-semibold text-citadelle-black mb-2">{t('results.filter.class')}</p>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="class"
              checked={filterClass === ''}
              onChange={() => setFilterClass('')}
              className="h-4 w-4 text-citadelle-gold focus:ring-citadelle-gold"
            />
            <span className="text-sm text-black/60">{t('search.anyClass')}</span>
          </label>
          {FARE_FAMILY_ORDER.map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="class"
                checked={filterClass === f}
                onChange={() => setFilterClass(f)}
                className="h-4 w-4 text-citadelle-gold focus:ring-citadelle-gold"
              />
              <span className="text-sm text-black/60">
                {f === 'ECO' ? t('fare.eco') : f === 'ECO_FLEX' ? t('fare.ecoFlex') : t('fare.business')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure time range */}
      <div>
        <p className="text-sm font-semibold text-citadelle-black mb-2">{t('results.filter.departureWindow')}</p>
        <div className="flex items-center gap-2 text-xs text-black/50">
          <span>{filterDepRange[0]}:00</span>
          <span className="flex-1">—</span>
          <span>{filterDepRange[1]}:00</span>
        </div>
        <input
          type="range"
          min={0}
          max={24}
          value={filterDepRange[1]}
          onChange={(e) => setFilterDepRange([filterDepRange[0], parseInt(e.target.value)])}
          className="w-full mt-2 accent-citadelle-gold"
        />
      </div>

      {/* Arrival time range */}
      <div>
        <p className="text-sm font-semibold text-citadelle-black mb-2">{t('results.filter.arrivalWindow')}</p>
        <div className="flex items-center gap-2 text-xs text-black/50">
          <span>{filterArrRange[0]}:00</span>
          <span className="flex-1">—</span>
          <span>{filterArrRange[1]}:00</span>
        </div>
        <input
          type="range"
          min={0}
          max={24}
          value={filterArrRange[1]}
          onChange={(e) => setFilterArrRange([filterArrRange[0], parseInt(e.target.value)])}
          className="w-full mt-2 accent-citadelle-gold"
        />
      </div>
    </div>
  );
}
