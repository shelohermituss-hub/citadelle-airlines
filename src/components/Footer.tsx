import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { HUB_IATA } from '@/data/airports';
import { Emblem } from './Logo';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-citadelle-black text-white/70 mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Emblem className="h-9 w-9 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-extrabold tracking-tight text-white">CITADELLE</span>
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-citadelle-gold">Airlines</span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {t('footer.tagline')}. {t('home.hero.subtitle')}.
            </p>
          </div>

          {/* About links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.about')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-citadelle-gold transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/about" className="hover:text-citadelle-gold transition-colors">{t('footer.fleet')}</Link></li>
              <li><Link to="/destinations" className="hover:text-citadelle-gold transition-colors">{t('footer.destinations')}</Link></li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/manage-booking" className="hover:text-citadelle-gold transition-colors">{t('footer.manageBooking')}</Link></li>
              <li><Link to="/flight-status" className="hover:text-citadelle-gold transition-colors">{t('footer.flightStatus')}</Link></li>
              <li><Link to="/check-in" className="hover:text-citadelle-gold transition-colors">{t('footer.checkin')}</Link></li>
              <li><Link to="/help" className="hover:text-citadelle-gold transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/contact" className="hover:text-citadelle-gold transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          {/* Legal links + contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/legal/tcs" className="hover:text-citadelle-gold transition-colors">{t('footer.tcs')}</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-citadelle-gold transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/legal/transport" className="hover:text-citadelle-gold transition-colors">{t('footer.transport')}</Link></li>
              <li><Link to="/legal/baggage" className="hover:text-citadelle-gold transition-colors">{t('footer.baggage')}</Link></li>
            </ul>
            <div className="mt-4 space-y-1.5 text-xs text-white/40">
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{HUB_IATA} Hub — Port-au-Prince</p>
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />+1 (509) 000-0000</p>
              <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />contact@citadelleairlines.com</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Citadelle Airlines. {t('footer.rights')}
          </p>
          <p className="text-xs text-white/40">{t('demo.banner')}</p>
        </div>
      </div>
    </footer>
  );
}
