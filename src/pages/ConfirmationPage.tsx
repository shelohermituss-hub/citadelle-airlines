import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useBooking } from '@/contexts/BookingContext';
import { getAirport } from '@/data/airports';
import { generatePdfSummary } from '@/utils/pdf';
import { generateIcsFile } from '@/utils/ics';
import { CheckCircle, Download, Calendar, Mail, BookOpen, Home, Plane, Clock, Users } from 'lucide-react';

export default function ConfirmationPage() {
  const { t, locale, formatPrice, formatTime, formatDate } = useI18n();
  const { confirmedBooking, resetBooking } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (!confirmedBooking) navigate('/');
  }, [confirmedBooking, navigate]);

  if (!confirmedBooking) return null;

  function getCityName(iata: string): string {
    const a = getAirport(iata);
    if (!a) return iata;
    if (locale === 'fr') return a.cityFr;
    if (locale === 'ht') return a.cityHt;
    return a.cityEn;
  }

  function handleDownloadPdf() {
    generatePdfSummary(confirmedBooking!, t, locale, formatPrice, formatTime, formatDate);
  }

  function handleAddToCalendar() {
    generateIcsFile(confirmedBooking!);
  }

  const fareLabel = confirmedBooking.fareFamily === 'ECO' ? t('fare.eco')
    : confirmedBooking.fareFamily === 'ECO_FLEX' ? t('fare.ecoFlex')
    : t('fare.business');

  const outbound = confirmedBooking.offers[0]?.itineraries[0];
  const returnItin = confirmedBooking.offers[0]?.itineraries[1] ?? confirmedBooking.offers[1]?.itineraries[0];

  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-citadelle-success/10 animate-fade-in">
              <CheckCircle className="h-9 w-9 text-citadelle-success" />
            </div>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-citadelle-black">{t('confirm.title')}</h1>
          <p className="text-sm text-black/50 mt-2">{t('confirm.subtitle')}</p>
        </div>

        {/* PNR display */}
        <div className="card p-6 mb-6 bg-gradient-to-br from-citadelle-black to-citadelle-black-soft text-white text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">{t('confirm.pnr')}</p>
          <p className="font-display text-4xl sm:text-5xl font-extrabold tracking-[0.15em] text-citadelle-gold">
            {confirmedBooking.pnr}
          </p>
        </div>

        {/* Itinerary */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-citadelle-black mb-4 flex items-center gap-2">
            <Plane className="h-5 w-5 text-citadelle-gold-dark" />
            {t('confirm.itinerary')}
          </h2>

          {outbound && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-2">{t('results.outbound')}</p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-citadelle-black">{formatTime(outbound.segments[0].departure.at)}</p>
                  <p className="text-xs text-black/50">{getCityName(outbound.segments[0].departure.iataCode)} ({outbound.segments[0].departure.iataCode})</p>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <div className="h-px flex-1 bg-black/10" />
                  <Plane className="h-3.5 w-3.5 text-citadelle-gold-dark" />
                  <div className="h-px flex-1 bg-black/10" />
                </div>
                <div>
                  <p className="font-semibold text-citadelle-black">{formatTime(outbound.segments[outbound.segments.length - 1].arrival.at)}</p>
                  <p className="text-xs text-black/50">{getCityName(outbound.segments[outbound.segments.length - 1].arrival.iataCode)} ({outbound.segments[outbound.segments.length - 1].arrival.iataCode})</p>
                </div>
              </div>
              <p className="text-xs text-black/40 mt-2">{formatDate(outbound.segments[0].departure.at)} · CA{outbound.segments[0].number}</p>
            </div>
          )}

          {returnItin && (
            <div className="pt-4 border-t border-black/[0.06]">
              <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-2">{t('results.return')}</p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-citadelle-black">{formatTime(returnItin.segments[0].departure.at)}</p>
                  <p className="text-xs text-black/50">{getCityName(returnItin.segments[0].departure.iataCode)} ({returnItin.segments[0].departure.iataCode})</p>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <div className="h-px flex-1 bg-black/10" />
                  <Plane className="h-3.5 w-3.5 text-citadelle-gold-dark rotate-180" />
                  <div className="h-px flex-1 bg-black/10" />
                </div>
                <div>
                  <p className="font-semibold text-citadelle-black">{formatTime(returnItin.segments[returnItin.segments.length - 1].arrival.at)}</p>
                  <p className="text-xs text-black/50">{getCityName(returnItin.segments[returnItin.segments.length - 1].arrival.iataCode)} ({returnItin.segments[returnItin.segments.length - 1].arrival.iataCode})</p>
                </div>
              </div>
              <p className="text-xs text-black/40 mt-2">{formatDate(returnItin.segments[0].departure.at)} · CA{returnItin.segments[0].number}</p>
            </div>
          )}
        </div>

        {/* Passengers + fare */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="card p-5">
            <h2 className="font-semibold text-citadelle-black mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-citadelle-gold-dark" />
              {t('confirm.passengers')}
            </h2>
            <ul className="space-y-2 text-sm">
              {confirmedBooking.travelers.map((pax, i) => (
                <li key={i} className="text-black/70">
                  {pax.title} {pax.firstName} {pax.lastName}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-citadelle-black mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-citadelle-gold-dark" />
              {t('confirm.fare')}
            </h2>
            <p className="text-sm text-black/70">{fareLabel}</p>
            <div className="mt-3 pt-3 border-t border-black/[0.06] flex justify-between items-center">
              <span className="text-sm text-black/50">{t('confirm.totalPaid')}</span>
              <span className="font-display text-xl font-bold text-citadelle-black">{formatPrice(confirmedBooking.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Email notice */}
        <div className="card p-4 mb-6 bg-citadelle-cream">
          <div className="flex items-center gap-2 text-sm text-black/60">
            <Mail className="h-4 w-4 text-citadelle-gold-dark" />
            <span>{t('confirm.emailSent', { email: confirmedBooking.contact.email })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <button onClick={handleDownloadPdf} className="btn-outline">
            <Download className="h-4 w-4" />
            {t('confirm.downloadPdf')}
          </button>
          <button onClick={handleAddToCalendar} className="btn-outline">
            <Calendar className="h-4 w-4" />
            {t('confirm.addToCalendar')}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/manage-booking"
            onClick={() => { setTimeout(() => resetBooking(), 100); }}
            className="btn-secondary"
          >
            <BookOpen className="h-4 w-4" />
            {t('confirm.manageBooking')}
          </Link>
          <Link to="/" onClick={() => resetBooking()} className="btn-ghost">
            <Home className="h-4 w-4" />
            {t('confirm.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
