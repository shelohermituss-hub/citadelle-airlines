import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { bookingService } from '@/data/bookingService';
import { getAirport } from '@/data/airports';
import type { PNRRecord } from '@/data/types';
import { generatePdfSummary } from '@/utils/pdf';
import { Search, Loader2, BookOpen, Download, Info, Plane, Users } from 'lucide-react';
import { Flag } from '@/components/Flag';

export default function ManageBookingPage() {
  const { t, locale, formatPrice, formatTime, formatDate } = useI18n();
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [booking, setBooking] = useState<PNRRecord | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!pnr.trim() || !lastName.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const result = await bookingService.retrieveBooking(pnr, lastName);
      if (result) {
        setBooking(result);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

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

  function handleDownload() {
    if (booking) {
      generatePdfSummary(booking, t, locale, formatPrice, formatTime, formatDate);
    }
  }

  const fareLabel = booking?.fareFamily === 'ECO' ? t('fare.eco')
    : booking?.fareFamily === 'ECO_FLEX' ? t('fare.ecoFlex')
    : t('fare.business');

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-citadelle-cream">
              <BookOpen className="h-6 w-6 text-citadelle-gold-dark" />
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('manage.title')}</h1>
          <p className="text-sm text-black/50 mt-1">{t('manage.subtitle')}</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="card p-5 mb-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="pnr" className="label">{t('manage.pnr')}</label>
              <input
                id="pnr"
                type="text"
                className="input uppercase"
                placeholder={t('manage.pnrPlaceholder')}
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="label">{t('manage.lastName')}</label>
              <input
                id="lastName"
                type="text"
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {t('manage.find')}
          </button>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="card p-5 mb-6 border-citadelle-error/20">
            <div className="flex items-center gap-2 text-citadelle-error">
              <Info className="h-5 w-5" />
              <p className="text-sm font-medium">{t('manage.notFound')}</p>
            </div>
          </div>
        )}

        {/* Booking detail */}
        {booking && (
          <div className="space-y-4">
            {/* PNR + status */}
            <div className="card p-5 bg-gradient-to-br from-citadelle-black to-citadelle-black-soft text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{t('manage.pnr')}</p>
                  <p className="font-display text-3xl font-bold tracking-wider text-citadelle-gold">{booking.pnr}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{t('manage.status')}</p>
                  <p className="font-semibold text-citadelle-success">{t('manage.confirmed')}</p>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            {booking.offers.map((offer, oi) =>
              offer.itineraries.map((itin, ii) => {
                const first = itin.segments[0];
                const last = itin.segments[itin.segments.length - 1];
                const isOutbound = oi === 0 && ii === 0;
                return (
                  <div key={`${oi}-${ii}`} className="card p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-3">
                      {isOutbound ? t('results.outbound') : t('results.return')}
                    </p>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-citadelle-black">{formatTime(first.departure.at)}</p>
                        <p className="text-xs text-black/50 flex items-center gap-1">
                          <Flag countryCode={getCountryCode(first.departure.iataCode) ?? ''} className="h-2 w-3 shrink-0" />
                          {getCityName(first.departure.iataCode)} ({first.departure.iataCode})
                        </p>
                      </div>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="h-px flex-1 bg-black/10" />
                        <Plane className="h-3.5 w-3.5 text-citadelle-gold-dark" />
                        <div className="h-px flex-1 bg-black/10" />
                      </div>
                      <div>
                        <p className="font-semibold text-citadelle-black">{formatTime(last.arrival.at)}</p>
                        <p className="text-xs text-black/50 flex items-center gap-1">
                          <Flag countryCode={getCountryCode(last.arrival.iataCode) ?? ''} className="h-2 w-3 shrink-0" />
                          {getCityName(last.arrival.iataCode)} ({last.arrival.iataCode})
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-black/40 mt-2">{formatDate(first.departure.at)} · CA{first.number}</p>
                  </div>
                );
              })
            )}

            {/* Passengers */}
            <div className="card p-5">
              <h3 className="font-semibold text-citadelle-black mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-citadelle-gold-dark" />
                {t('confirm.passengers')}
              </h3>
              <ul className="space-y-1.5 text-sm">
                {booking.travelers.map((pax, i) => (
                  <li key={i} className="text-black/70">{pax.title} {pax.firstName} {pax.lastName}</li>
                ))}
              </ul>
            </div>

            {/* Fare + total */}
            <div className="card p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-black/50">{t('confirm.fare')}</span>
                <span className="font-medium">{fareLabel}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-black/[0.06]">
                <span className="text-sm text-black/50">{t('confirm.totalPaid')}</span>
                <span className="font-display text-xl font-bold text-citadelle-black">{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>

            {/* Modify notice */}
            <div className="card p-4 bg-citadelle-cream">
              <div className="flex items-start gap-2 text-sm text-black/60">
                <Info className="h-4 w-4 text-citadelle-gold-dark shrink-0 mt-0.5" />
                <p>{t('manage.modifyNotice')}</p>
              </div>
            </div>

            {/* Download */}
            <button onClick={handleDownload} className="btn-outline w-full">
              <Download className="h-4 w-4" />
              {t('manage.download')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
