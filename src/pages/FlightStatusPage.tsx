import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { bookingService } from '@/data/bookingService';
import { AirportAutocomplete } from '@/components/AirportAutocomplete';
import type { FlightStatusInfo } from '@/data/types';
import { Plane } from 'lucide-react';
import { FcSearch, FcSynchronize, FcOrganization, FcExport, FcHighPriority } from 'react-icons/fc';

export default function FlightStatusPage() {
  const { t, formatTime } = useI18n();
  const [mode, setMode] = useState<'number' | 'route'>('number');
  const [flightNumber, setFlightNumber] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FlightStatusInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const res = await bookingService.getFlightStatus({
        flightNumber: mode === 'number' ? flightNumber : undefined,
        origin: mode === 'route' ? origin : undefined,
        destination: mode === 'route' ? destination : undefined,
        date,
      });
      if (res) setResult(res);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  function statusColor(status: string): string {
    switch (status) {
      case 'ON_TIME': return 'text-citadelle-success bg-citadelle-success/10';
      case 'DELAYED': return 'text-citadelle-gold-dark bg-citadelle-gold/15';
      case 'CANCELLED': return 'text-citadelle-error bg-citadelle-error/10';
      case 'BOARDING': return 'text-citadelle-success bg-citadelle-success/10';
      case 'DEPARTED': return 'text-blue-600 bg-blue-50';
      case 'ARRIVED': return 'text-black/60 bg-citadelle-cream';
      default: return 'text-black/60 bg-citadelle-cream';
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-citadelle-cream">
              <Plane className="h-6 w-6 text-citadelle-gold-dark" />
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('status.title')}</h1>
          <p className="text-sm text-black/50 mt-1">{t('status.subtitle')}</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg bg-citadelle-cream p-1 mb-4">
          <button
            onClick={() => setMode('number')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'number' ? 'bg-white text-citadelle-black shadow-sm' : 'text-black/50'}`}
          >
            {t('status.byNumber')}
          </button>
          <button
            onClick={() => setMode('route')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'route' ? 'bg-white text-citadelle-black shadow-sm' : 'text-black/50'}`}
          >
            {t('status.byRoute')}
          </button>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="card p-5 mb-6">
          {mode === 'number' ? (
            <div>
              <label htmlFor="flightNumber" className="label">{t('status.flightNumber')}</label>
              <input
                id="flightNumber"
                type="text"
                className="input"
                placeholder={t('status.flightNumberPlaceholder')}
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <AirportAutocomplete id="status-origin" label={t('search.origin')} value={origin} onChange={setOrigin} />
              <AirportAutocomplete id="status-dest" label={t('search.destination')} value={destination} onChange={setDestination} />
            </div>
          )}
          <div className="mt-3">
            <label htmlFor="statusDate" className="label">{t('status.date')}</label>
            <input
              id="statusDate"
              type="date"
              className="input"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
            {loading ? <FcSynchronize className="h-4 w-4 animate-spin" /> : <FcSearch className="h-4 w-4" />}
            {t('status.search')}
          </button>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="card p-5 border-citadelle-error/20">
            <div className="flex items-center gap-2 text-citadelle-error">
              <FcHighPriority className="h-5 w-5" />
              <p className="text-sm font-medium">{t('status.notFound')}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="card p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-citadelle-black text-xs font-bold text-citadelle-gold">CA</div>
                <span className="font-semibold text-citadelle-black">{result.flightNumber}</span>
              </div>
              <span className={`chip ${statusColor(result.status)}`}>
                {t(`status.state.${result.status}`)}
              </span>
            </div>

            {result.delayMinutes && (
              <div className="mb-4 rounded-lg bg-citadelle-gold/10 p-3 text-sm text-citadelle-gold-dark font-medium">
                {t('status.delayInfo', { min: result.delayMinutes })}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-2 border-citadelle-gold pl-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-1">{t('common.departure')}</p>
                <p className="font-display text-xl font-bold text-citadelle-black">{formatTime(result.departure.scheduled)}</p>
                <p className="text-sm text-black/50">{result.departure.iataCode}</p>
                {result.departure.terminal && (
                  <p className="text-xs text-black/40 flex items-center gap-1 mt-1">
                    <FcOrganization className="h-3 w-3" /> {t('status.terminal')} {result.departure.terminal}
                  </p>
                )}
                {result.departure.gate && (
                  <p className="text-xs text-black/40 flex items-center gap-1">
                    <FcExport className="h-3 w-3" /> {t('status.gate')} {result.departure.gate}
                  </p>
                )}
                {result.departure.estimated && (
                  <p className="text-xs text-citadelle-gold-dark mt-1">
                    {t('status.estimated')}: {formatTime(result.departure.estimated)}
                  </p>
                )}
              </div>
              <div className="border-l-2 border-citadelle-gold/50 pl-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-1">{t('common.arrival')}</p>
                <p className="font-display text-xl font-bold text-citadelle-black">{formatTime(result.arrival.scheduled)}</p>
                <p className="text-sm text-black/50">{result.arrival.iataCode}</p>
                {result.arrival.terminal && (
                  <p className="text-xs text-black/40 flex items-center gap-1 mt-1">
                    <FcOrganization className="h-3 w-3" /> {t('status.terminal')} {result.arrival.terminal}
                  </p>
                )}
                {result.arrival.gate && (
                  <p className="text-xs text-black/40 flex items-center gap-1">
                    <FcExport className="h-3 w-3" /> {t('status.gate')} {result.arrival.gate}
                  </p>
                )}
                {result.arrival.estimated && (
                  <p className="text-xs text-citadelle-gold-dark mt-1">
                    {t('status.estimated')}: {formatTime(result.arrival.estimated)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
