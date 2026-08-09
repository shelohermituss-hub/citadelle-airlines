import { useI18n } from '@/i18n/I18nContext';
import { getAirport } from '@/data/airports';
import type { FlightResult } from '@/data/types';
import { Plane, ArrowRight } from 'lucide-react';
import { FcClock } from 'react-icons/fc';
import { Flag } from '@/components/Flag';

interface FlightCardProps {
  result: FlightResult;
  onSelect: () => void;
  isReturn?: boolean;
}

export function FlightCard({ result, onSelect, isReturn = false }: FlightCardProps) {
  const { t, locale, formatPrice, formatTime, formatDuration } = useI18n();

  const firstSeg = result.outbound.segments[0];
  const lastSeg = result.outbound.segments[result.outbound.segments.length - 1];

  function getCityName(iata: string): string {
    const a = getAirport(iata);
    if (!a) return iata;
    if (locale === 'fr') return a.cityFr;
    if (locale === 'ht') return a.cityHt;
    return a.cityEn;
  }

  function getCountryCode(iata: string): string | undefined {
    return getAirport(iata)?.countryCode;
  }

  const fareLabel = result.fareFamily === 'ECO' ? t('fare.eco')
    : result.fareFamily === 'ECO_FLEX' ? t('fare.ecoFlex')
    : t('fare.business');

  return (
    <div className="card-hover p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Flight info */}
        <div className="flex-1 min-w-0">
          {/* Airline + flight number */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-citadelle-black text-[0.625rem] font-bold text-citadelle-gold">
              CA
            </div>
            <span className="text-xs font-medium text-black/50">
              CA{firstSeg.number} · {firstSeg.aircraft.code}
            </span>
            <span className="chip bg-citadelle-gold/10 text-citadelle-gold-dark text-[0.625rem]">{fareLabel}</span>
          </div>

          {/* Times + route */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Departure */}
            <div className="text-right sm:text-left">
              <p className="font-display text-xl sm:text-2xl font-bold text-citadelle-black">{formatTime(firstSeg.departure.at)}</p>
              <p className="text-xs text-black/50 font-medium">{firstSeg.departure.iataCode}</p>
              <p className="text-xs text-black/40 truncate flex items-center gap-1 sm:justify-start justify-end">
                <Flag countryCode={getCountryCode(firstSeg.departure.iataCode) ?? ''} className="h-2 w-3 shrink-0" />
                {getCityName(firstSeg.departure.iataCode)}
              </p>
            </div>

            {/* Route line */}
            <div className="flex-1 flex flex-col items-center min-w-[60px]">
              <span className="text-xs text-black/40">{formatDuration(result.durationMin)}</span>
              <div className="flex items-center gap-1 w-full py-1">
                <div className="h-px flex-1 bg-black/10" />
                <Plane className="h-3.5 w-3.5 text-citadelle-gold-dark" />
                <div className="h-px flex-1 bg-black/10" />
              </div>
              {result.stops === 0 ? (
                <span className="text-xs font-medium text-citadelle-success">{t('common.nonstop')}</span>
              ) : (
                <span className="text-xs font-medium text-black/50">
                  {t('results.stops.count', { count: result.stops })}
                </span>
              )}
            </div>

            {/* Arrival */}
            <div>
              <p className="font-display text-xl sm:text-2xl font-bold text-citadelle-black">{formatTime(lastSeg.arrival.at)}</p>
              <p className="text-xs text-black/50 font-medium">{lastSeg.arrival.iataCode}</p>
              <p className="text-xs text-black/40 truncate flex items-center gap-1">
                <Flag countryCode={getCountryCode(lastSeg.arrival.iataCode) ?? ''} className="h-2 w-3 shrink-0" />
                {getCityName(lastSeg.arrival.iataCode)}
              </p>
            </div>
          </div>

          {/* Layover info */}
          {result.stops > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {result.outbound.segments.slice(1).map((seg, i) => {
                const prevArr = new Date(result.outbound.segments[i].arrival.at);
                const nextDep = new Date(seg.departure.at);
                const layoverMin = Math.round((nextDep.getTime() - prevArr.getTime()) / 60000);
                return (
                  <span key={i} className="text-xs text-black/40 flex items-center gap-1">
                    <FcClock className="h-3 w-3" />
                    {t('results.layover', { duration: formatDuration(layoverMin) })} {getCityName(seg.departure.iataCode)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Price + select */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 lg:w-40 lg:border-l lg:pl-4 lg:border-black/[0.06]">
          <div className="lg:text-right">
            <p className="text-xs text-black/40">{t('common.perPerson')}</p>
            <p className="font-display text-2xl font-bold text-citadelle-black">{formatPrice(result.pricePerAdult)}</p>
          </div>
          <button
            onClick={onSelect}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {t('results.select')}
            {isReturn && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
