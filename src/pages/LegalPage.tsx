import { useParams, Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { FcDocument, FcHighPriority } from 'react-icons/fc';

const LEGAL_CONTENT: Record<string, { titleKey: string; body: string }> = {
  tcs: {
    titleKey: 'legal.tcs',
    body: 'These Terms and Conditions govern the use of the Citadelle Airlines website and the booking of flights. By using this website, you agree to these terms. All bookings are subject to our fare rules and conditions of carriage. [Provisional content — to be validated by legal counsel.]',
  },
  privacy: {
    titleKey: 'legal.privacy',
    body: 'This Privacy Policy describes how Citadelle Airlines collects, uses, and protects your personal data. In phase 1, no real payment data is collected or stored. Passenger data entered during the booking process is kept only for the duration of your browser session. [Provisional content — to be validated by legal counsel.]',
  },
  transport: {
    titleKey: 'legal.transport',
    body: 'These Conditions of Carriage define the rights and obligations of Citadelle Airlines and its passengers. They cover ticketing, check-in, boarding, baggage, and conduct on board. [Provisional content — to be validated by legal counsel.]',
  },
  baggage: {
    titleKey: 'legal.baggage',
    body: 'This Baggage Policy defines the allowances for cabin and checked baggage on Citadelle Airlines flights. Eco: 1 cabin bag (10 kg), 0 checked bags. Eco Flex: 1 cabin bag (10 kg), 1 checked bag (23 kg). Business: 2 cabin bags (10 kg each), 2 checked bags (23 kg each). [Provisional content — to be validated by legal counsel.]',
  },
};

export default function LegalPage() {
  const { type } = useParams<{ type: string }>();
  const { t } = useI18n();

  const content = type ? LEGAL_CONTENT[type] : undefined;

  if (!content) {
    return (
      <div className="container-page py-8 text-center">
        <p className="text-black/50">{t('common.error')}</p>
        <Link to="/" className="btn-primary mt-4">{t('nav.home')}</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-citadelle-cream">
            <FcDocument className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t(content.titleKey)}</h1>
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-2 rounded-lg bg-citadelle-gold/5 p-3 mb-4">
            <FcHighPriority className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-xs text-black/50">{t('legal.provisional')}</p>
          </div>
          <p className="text-sm text-black/60 leading-relaxed">{content.body}</p>
        </div>
      </div>
    </div>
  );
}
