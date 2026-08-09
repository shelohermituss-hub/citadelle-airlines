import { useI18n } from '@/i18n/I18nContext';
import { Plane, Shield, Heart, Globe } from 'lucide-react';

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="container-page py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-citadelle-cream">
              <Plane className="h-7 w-7 text-citadelle-gold-dark" />
            </div>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-citadelle-black">{t('about.title')}</h1>
          <p className="text-lg text-black/50 mt-2">{t('about.subtitle')}</p>
        </div>

        {/* Story */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-citadelle-black mb-4">{t('about.story')}</h2>
          <div className="card p-6">
            <p className="text-sm text-black/60 leading-relaxed">{t('about.storyBody')}</p>
          </div>
        </section>

        {/* Fleet */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-citadelle-black mb-4">{t('about.fleet')}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { type: 'Airbus A320', count: '4', range: 'Short-haul' },
              { type: 'Airbus A330', count: '3', range: 'Long-haul' },
              { type: 'Boeing 787', count: '3', range: 'Long-haul' },
            ].map((f) => (
              <div key={f.type} className="card p-5">
                <Plane className="h-6 w-6 text-citadelle-gold-dark mb-3" />
                <h3 className="font-semibold text-citadelle-black">{f.type}</h3>
                <p className="text-sm text-black/40">{f.range}</p>
                <p className="text-2xl font-bold text-citadelle-black mt-2">{f.count}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-black/30 mt-3 italic">{t('about.fleetBody')}</p>
        </section>

        {/* Values */}
        <section>
          <h2 className="font-display text-2xl font-bold text-citadelle-black mb-4">{t('about.values')}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <Shield className="h-6 w-6 text-citadelle-gold-dark mb-3" />
              <h3 className="font-semibold text-citadelle-black mb-1">Safety</h3>
              <p className="text-sm text-black/50">Sécurité / Sekirite</p>
            </div>
            <div className="card p-5">
              <Heart className="h-6 w-6 text-citadelle-gold-dark mb-3" />
              <h3 className="font-semibold text-citadelle-black mb-1">Hospitality</h3>
              <p className="text-sm text-black/50">Hospitalité / Ospitalite</p>
            </div>
            <div className="card p-5">
              <Globe className="h-6 w-6 text-citadelle-gold-dark mb-3" />
              <h3 className="font-semibold text-citadelle-black mb-1">Connection</h3>
              <p className="text-sm text-black/50">Connexion / Koneksyon</p>
            </div>
          </div>
          <p className="text-xs text-black/30 mt-3 italic">{t('about.valuesBody')}</p>
        </section>
      </div>
    </div>
  );
}
