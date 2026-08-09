import { useParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { getAirport, HUB_IATA } from '@/data/airports';
import { getFromPrice } from '@/data/mockOffers';
import { Plane } from 'lucide-react';
import { FcClock, FcOrganization, FcRight, FcLeft } from 'react-icons/fc';
import { Flag } from '@/components/Flag';
import { StatTile } from '@/components/StatTile';
import { getDestinationImage } from '@/data/destinationImages';

export default function DestinationDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { t, locale, currency, formatPrice, formatDuration } = useI18n();
  const navigate = useNavigate();

  const airport = code ? getAirport(code.toUpperCase()) : undefined;

  if (!airport) {
    return (
      <div className="container-page py-8 text-center">
        <p className="text-black/50">{t('results.empty.title')}</p>
        <Link to="/destinations" className="btn-primary mt-4">{t('nav.destinations')}</Link>
      </div>
    );
  }

  function getCityName(a: NonNullable<ReturnType<typeof getAirport>>): string {
    if (locale === 'fr') return a.cityFr;
    if (locale === 'ht') return a.cityHt;
    return a.cityEn;
  }

  function getCountryName(a: NonNullable<ReturnType<typeof getAirport>>): string {
    if (locale === 'fr') return a.countryFr;
    if (locale === 'ht') return a.countryHt;
    return a.countryEn;
  }

  const price = getFromPrice(airport.iata, currency);
  const heroImage = getDestinationImage(airport.iata);

  function handleBook() {
    const params = new URLSearchParams({
      origin: HUB_IATA,
      destination: airport!.iata,
      depart: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      adults: '1',
      children: '0',
      infants: '0',
      currency,
    });
    navigate(`/search?${params.toString()}`);
  }

  return (
    <div className="container-page py-8">
      <Link to="/destinations" className="btn-ghost mb-4">
        <FcLeft className="h-4 w-4" />
        {t('nav.destinations')}
      </Link>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          {/* Hero */}
          <div className="card overflow-hidden mb-6">
            <div className="h-48 sm:h-64 bg-gradient-to-br from-citadelle-black to-citadelle-black-soft relative flex items-center justify-center">
              {heroImage ? (
                <>
                  <img
                    src={heroImage}
                    alt={getCityName(airport)}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-citadelle-black/85 via-citadelle-black/25 to-citadelle-black/50" />
                </>
              ) : (
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle at 30% 50%, #F2A81D 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />
              )}
              <div className="text-center relative z-10">
                <p className="font-display text-5xl sm:text-6xl font-extrabold text-citadelle-gold tracking-tight">{airport.iata}</p>
                <p className="text-white/60 text-sm mt-1 flex items-center justify-center gap-1.5">
                  <Flag countryCode={airport.countryCode} className="h-2.5 w-4" />
                  {getCountryName(airport)}
                </p>
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-citadelle-black mb-2">{getCityName(airport)}</h1>
          <p className="text-sm text-black/50 flex items-center gap-1.5 mb-6">
            <Flag countryCode={airport.countryCode} className="h-3 w-4" />
            {getCountryName(airport)}
          </p>

          <div className="card p-5 mb-6">
            <p className="text-sm text-black/60 leading-relaxed">
              {getCityName(airport)} is served by Citadelle Airlines from our {HUB_IATA} hub in Port-au-Prince. 
              {locale === 'fr' ? " Réservez votre vol dès aujourd'hui." : locale === 'ht' ? ' Rezève vol ou jodi a.' : ' Book your flight today.'}
            </p>
          </div>

          {/* Practical info */}
          <h2 className="font-display text-xl font-bold text-citadelle-black mb-3">{t('destinations.airport')}</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatTile
              icon={FcOrganization}
              label={t('destinations.airport')}
              value={`${airport.iata} — ${getCityName(airport)}`}
            />
            <StatTile
              delay={60}
              icon={FcClock}
              label={`${t('destinations.flightTime')} (${t('destinations.fromHub')})`}
              value={formatDuration(airport.durationFromHubMin)}
            />
          </div>
        </div>

        {/* Booking sidebar */}
        <aside>
          <div className="card p-5 sticky top-24">
            <div className="text-center mb-4">
              <p className="text-xs text-black/40">{t('home.destinations.fromPrice')}</p>
              <p className="font-display text-3xl font-bold text-citadelle-gold-dark">{formatPrice(price)}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black/50 mb-4">
              <Plane className="h-4 w-4 text-citadelle-gold-dark" />
              <span>{HUB_IATA} → {airport.iata}</span>
              <FcRight className="h-3 w-3" />
              <span>{formatDuration(airport.durationFromHubMin)}</span>
            </div>
            <button onClick={handleBook} className="btn-primary w-full">
              {t('destinations.bookNow')}
              <FcRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
