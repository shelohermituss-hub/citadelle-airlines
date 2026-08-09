import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { Plane } from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="container-page py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-citadelle-cream">
          <Plane className="h-8 w-8 text-citadelle-gold-dark" />
        </div>
      </div>
      <h1 className="font-display text-5xl font-bold text-citadelle-black mb-2">404</h1>
      <p className="text-sm text-black/50 mb-6">{t('common.error')}</p>
      <Link to="/" className="btn-primary">{t('nav.home')}</Link>
    </div>
  );
}
