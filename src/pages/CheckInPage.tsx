import { useI18n } from '@/i18n/I18nContext';
import { Clock, Plane } from 'lucide-react';

export default function CheckInPage() {
  const { t } = useI18n();

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-citadelle-cream">
            <Plane className="h-8 w-8 text-citadelle-gold-dark" />
          </div>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black mb-2">{t('checkin.title')}</h1>
        <span className="chip bg-citadelle-gold/15 text-citadelle-gold-dark text-sm mb-4 inline-flex">
          {t('checkin.comingSoon')}
        </span>
        <div className="card p-6 mt-4">
          <div className="flex justify-center mb-4">
            <Clock className="h-10 w-10 text-black/20" />
          </div>
          <p className="text-sm text-black/60 leading-relaxed max-w-md mx-auto">
            {t('checkin.desc')}
          </p>
        </div>
      </div>
    </div>
  );
}
