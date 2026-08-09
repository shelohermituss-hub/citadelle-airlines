import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { ChevronDown } from 'lucide-react';
import { FcFaq, FcInvite } from 'react-icons/fc';

const FAQ_ITEMS: Record<string, { q: string; a: string }[]> = {
  booking: [
    { q: 'How can I book a flight?', a: 'You can book online through our search engine. Enter your origin, destination, dates, and number of passengers, then follow the booking steps.' },
    { q: 'Can I modify my booking?', a: 'In phase 1, modifications are not available online. Please contact our customer service to modify or cancel your booking.' },
    { q: 'How do I find my booking?', a: 'Go to "Manage Booking" and enter your 6-character booking reference (PNR) and the last name of the primary passenger.' },
  ],
  baggage: [
    { q: 'What is the cabin baggage allowance?', a: 'Eco and Eco Flex include 1 cabin bag. Business includes 2 cabin bags. Maximum weight: 10 kg per bag.' },
    { q: 'How many checked bags are included?', a: 'Eco: 0 checked bags. Eco Flex: 1 checked bag (23 kg). Business: 2 checked bags (23 kg each). Additional bags can be purchased.' },
  ],
  checkin: [
    { q: 'When does online check-in open?', a: 'Online check-in will be available soon. For now, check-in at the airport counter opens 3 hours before departure.' },
  ],
  children: [
    { q: 'What is the child fare?', a: 'Children aged 2–11 receive a discounted fare (approximately 75% of the adult fare). Infants under 2 travel on an adult\'s lap for a reduced fare.' },
    { q: 'Can infants have their own seat?', a: 'Infants under 2 typically travel on an adult\'s lap. You can purchase a child fare seat if preferred.' },
  ],
  documents: [
    { q: 'What travel documents do I need?', a: 'A valid passport is required for all international flights. Your passport must be valid on your travel date. Check visa requirements for your destination.' },
  ],
};

export default function HelpPage() {
  const { t } = useI18n();
  const [openSection, setOpenSection] = useState<string>('booking');
  const [openItem, setOpenItem] = useState<number | null>(0);

  const sections = [
    { key: 'booking', label: t('faq.booking') },
    { key: 'baggage', label: t('faq.baggage') },
    { key: 'checkin', label: t('faq.checkin') },
    { key: 'children', label: t('faq.children') },
    { key: 'documents', label: t('faq.documents') },
  ];

  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-citadelle-cream">
              <FcFaq className="h-6 w-6" />
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('faq.title')}</h1>
          <p className="text-sm text-black/50 mt-1">{t('faq.subtitle')}</p>
        </div>

        {/* Section tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => { setOpenSection(s.key); setOpenItem(0); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                openSection === s.key
                  ? 'bg-citadelle-black text-white'
                  : 'bg-white border border-black/10 text-black/60 hover:border-citadelle-gold'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* FAQ items */}
        <div className="space-y-2">
          {FAQ_ITEMS[openSection]?.map((item, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpenItem(openItem === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <span className="font-medium text-citadelle-black text-sm">{item.q}</span>
                <ChevronDown className={`h-4 w-4 text-black/30 shrink-0 transition-transform ${openItem === i ? 'rotate-180' : ''}`} />
              </button>
              {openItem === i && (
                <div className="px-4 pb-4 animate-slide-down">
                  <p className="text-sm text-black/60 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-black/50 mb-3">{t('faq.contact')}</p>
          <Link to="/contact" className="btn-outline">
            <FcInvite className="h-4 w-4" />
            {t('nav.contact')}
          </Link>
        </div>
      </div>
    </div>
  );
}
