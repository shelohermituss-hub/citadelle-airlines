import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { AIRPORTS, HUB_IATA } from '@/data/airports';
import { getFromPrice } from '@/data/mockOffers';
import { Clock, ArrowRight, MapPin } from 'lucide-react';

export default function DestinationsPage() {
  const { t, locale, currency, formatPrice, formatDuration } = useI18n();

  function getCityName(a: typeof AIRPORTS[number]): string {
    if (locale === 'fr') return a.cityFr;
    if (locale === 'ht') return a.cityHt;
    return a.cityEn;
  }

  function getCountryName(a: typeof AIRPORTS[number]): string {
    if (locale === 'fr') return a.countryFr;
    if (locale === 'ht') return a.countryHt;
    return a.countryEn;
  }

  // Skip hub in the list
  const destinations = AIRPORTS.filter((a) => a.iata !== HUB_IATA);

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-citadelle-black">{t('destinations.title')}</h1>
        <p className="text-sm text-black/50 mt-2">{t('destinations.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinations.map((a) => {
          const price = getFromPrice(a.iata, currency);
          return (
            <Link
              key={a.iata}
              to={`/destinations/${a.iata}`}
              className="card-hover group p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-citadelle-black text-sm font-bold text-citadelle-gold">
                  {a.iata}
                </div>
                <ArrowRight className="h-4 w-4 text-black/20 group-hover:text-citadelle-gold group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-display text-lg font-bold text-citadelle-black">{getCityName(a)}</h3>
              <p className="text-sm text-black/40 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {getCountryName(a)}
              </p>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-black/40">{t('home.destinations.fromPrice')}</p>
                  <p className="font-display text-xl font-bold text-citadelle-gold-dark">{formatPrice(price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-black/40 flex items-center gap-1 justify-end">
                    <Clock className="h-3 w-3" />
                    {t('destinations.flightTime')}
                  </p>
                  <p className="text-sm font-medium text-citadelle-black">{formatDuration(a.durationFromHubMin)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
