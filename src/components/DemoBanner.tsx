import { useI18n } from '@/i18n/I18nContext';
import { FcInfo } from 'react-icons/fc';

export function DemoBanner() {
  const { t } = useI18n();
  return (
    <div className="bg-citadelle-black text-white/80 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
      <FcInfo className="h-3.5 w-3.5 shrink-0" />
      <span>{t('demo.banner')}</span>
    </div>
  );
}
