import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { SearchForm } from '@/components/SearchForm';
import { Airplane3D } from '@/components/Airplane3D';
import { AIRPORTS, HUB_IATA } from '@/data/airports';
import { getFromPrice } from '@/data/mockOffers';
import { BookOpen, BarChart3, Plane, ArrowRight, Sparkles } from 'lucide-react';

const FEATURED_DESTINATIONS = ['YUL', 'MIA', 'IST', 'SDQ', 'NAS', 'PTP'];

export default function HomePage() {
  const { t, locale, currency, formatPrice, formatDuration } = useI18n();

  const featured = FEATURED_DESTINATIONS
    .map((code) => AIRPORTS.find((a) => a.iata === code))
    .filter((a): a is NonNullable<typeof a> => !!a);

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

  return (
    <div>
      {/* Hero section with 3D airplane + search */}
      <section className="relative overflow-hidden bg-gradient-to-b from-citadelle-cream to-white">
        <div className="container-page pt-6 pb-8 lg:pt-10 lg:pb-12">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Left: text + search */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-citadelle-gold/10 px-3 py-1 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-citadelle-gold-dark" />
                <span className="text-xs font-semibold text-citadelle-gold-dark">{t('home.hero.subtitle')}</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-citadelle-black text-balance leading-[1.1]">
                {t('home.hero.title')}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-black/60 max-w-lg leading-relaxed">
                {t('home.hero.subtitle')}. {HUB_IATA} — Port-au-Prince.
              </p>
            </div>

            {/* Right: 3D airplane */}
            <div className="order-1 lg:order-2 h-[240px] sm:h-[300px] lg:h-[380px] relative">
              <Airplane3D />
            </div>
          </div>

          {/* Search form — always accessible */}
          <div className="mt-6 lg:mt-8">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Quick access */}
      <section className="container-page py-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 mb-4">{t('home.quickAccess')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickAccessCard to="/manage-booking" icon={BookOpen} title={t('nav.manageBooking')} />
          <QuickAccessCard to="/flight-status" icon={BarChart3} title={t('nav.flightStatus')} />
          <QuickAccessCard to="/check-in" icon={Plane} title={t('nav.checkin')} />
        </div>
      </section>

      {/* Featured destinations */}
      <section className="container-page py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('home.destinations.title')}</h2>
            <p className="text-sm text-black/50 mt-1">{t('home.destinations.subtitle')}</p>
          </div>
          <Link to="/destinations" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-citadelle-gold-dark hover:gap-2 transition-all">
            {t('destinations.viewDetail')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured.map((a) => {
            const price = getFromPrice(a.iata, currency);
            return (
              <Link
                key={a.iata}
                to={`/destinations/${a.iata}`}
                className="card-hover group p-4 flex flex-col gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-citadelle-black text-xs font-bold text-citadelle-gold">
                  {a.iata}
                </div>
                <div>
                  <p className="font-semibold text-citadelle-black text-sm leading-tight">{getCityName(a)}</p>
                  <p className="text-xs text-black/40">{getCountryName(a)}</p>
                </div>
                <div className="mt-auto pt-2">
                  <p className="text-xs text-black/40">{t('home.destinations.fromPrice')}</p>
                  <p className="text-lg font-bold text-citadelle-gold-dark">{formatPrice(price)}</p>
                  <p className="text-xs text-black/40">{formatDuration(a.durationFromHubMin)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Promotions */}
      <section className="container-page py-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black mb-6">{t('home.promotions.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PromoCard
            title={t('fare.ecoFlex')}
            desc={t('fare.modificationFree')}
            tag={t('fare.included')}
          />
          <PromoCard
            title={t('destinations.fromHub')}
            desc={t('home.destinations.subtitle')}
            tag="13+"
          />
          <PromoCard
            title={t('fare.business')}
            desc={t('fare.priority')}
            tag={t('fare.included')}
          />
        </div>
      </section>
    </div>
  );
}

function QuickAccessCard({ to, icon: Icon, title }: { to: string; icon: React.ElementType; title: string }) {
  return (
    <Link
      to={to}
      className="card-hover group flex items-center gap-4 p-4"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-citadelle-cream text-citadelle-gold-dark group-hover:bg-citadelle-gold/10 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-citadelle-black">{title}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-black/20 group-hover:text-citadelle-gold group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function PromoCard({ title, desc, tag }: { title: string; desc: string; tag: string }) {
  return (
    <div className="card-hover p-5 flex flex-col gap-3 bg-gradient-to-br from-white to-citadelle-cream">
      <div className="flex items-center justify-between">
        <span className="chip bg-citadelle-gold/15 text-citadelle-gold-dark">{tag}</span>
      </div>
      <h3 className="font-display text-lg font-bold text-citadelle-black">{title}</h3>
      <p className="text-sm text-black/50">{desc}</p>
    </div>
  );
}
