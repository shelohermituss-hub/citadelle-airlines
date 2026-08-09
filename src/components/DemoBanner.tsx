import { useI18n } from '@/i18n/I18nContext';
import { Info } from 'lucide-react';

export function DemoBanner() {
  const { t } = useI18n();
  return (
    <div className="bg-citadelle-black text-white/80 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
      <Info className="h-3.5 w-3.5 text-citadelle-gold shrink-0" />
      <span>{t('demo.banner')}</span>
    </div>
  );
}
