import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { LanguageCurrencySelector } from './LanguageCurrencySelector';
import { useI18n } from '@/i18n/I18nContext';
import { Menu, X, Plane, Search, BookOpen, BarChart3, MapPin, HelpCircle } from 'lucide-react';

export function Header() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/search', label: t('nav.book'), icon: Search },
    { to: '/manage-booking', label: t('nav.manageBooking'), icon: BookOpen },
    { to: '/flight-status', label: t('nav.flightStatus'), icon: BarChart3 },
    { to: '/destinations', label: t('nav.destinations'), icon: MapPin },
    { to: '/about', label: t('nav.about'), icon: Plane },
    { to: '/help', label: t('nav.help'), icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/[0.06]">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center" aria-label="Citadelle Airlines">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-citadelle-gold-dark bg-citadelle-gold/10'
                      : 'text-citadelle-black/70 hover:text-citadelle-black hover:bg-citadelle-cream'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageCurrencySelector />
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-citadelle-black hover:bg-citadelle-cream"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-black/[0.06] bg-white animate-slide-down">
          <div className="container-page py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-citadelle-gold-dark bg-citadelle-gold/10'
                        : 'text-citadelle-black/70 hover:bg-citadelle-cream'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
