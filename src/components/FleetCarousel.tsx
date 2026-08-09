import { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, Gauge, Ruler, MoveHorizontal } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { Airplane3D } from './Airplane3D';
import { FLEET, totalSeats } from '@/data/fleet';

export function FleetCarousel() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const aircraft = FLEET[index];

  function prev() {
    setIndex((i) => (i - 1 + FLEET.length) % FLEET.length);
  }
  function next() {
    setIndex((i) => (i + 1) % FLEET.length);
  }

  return (
    <div className="w-full">
      <div className="relative h-[220px] sm:h-[260px] lg:h-[300px]">
        <Airplane3D bodyType={aircraft.bodyType} />

        <button
          type="button"
          onClick={prev}
          aria-label={t('fleet.prev')}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-citadelle-black shadow-elevated hover:bg-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label={t('fleet.next')}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-citadelle-black shadow-elevated hover:bg-white transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {FLEET.map((a, i) => (
          <button
            key={a.code}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={t(a.nameKey)}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-citadelle-gold' : 'w-1.5 bg-black/15 hover:bg-black/25'
            }`}
          />
        ))}
      </div>

      {/* Spec panel */}
      <div key={aircraft.code} className="mt-3 text-center animate-fade-in">
        <p className="font-display text-base font-bold text-citadelle-black">{t(aircraft.nameKey)}</p>
        <p className="text-sm text-black/50 mt-0.5">{t(aircraft.taglineKey)}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <Spec delay={0} icon={Users} label={t('fleet.seats')} value={String(totalSeats(aircraft.seats))} />
          <Spec delay={60} icon={Ruler} label={t('fleet.range')} value={`${aircraft.rangeKm.toLocaleString()} km`} />
          <Spec delay={120} icon={Gauge} label={t('fleet.speed')} value={`${aircraft.cruiseSpeedKmh} km/h`} />
          <Spec delay={180} icon={MoveHorizontal} label={t('fleet.wingspan')} value={`${aircraft.wingspanM} m`} />
        </div>
      </div>
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <div
      className="group flex flex-col items-center gap-1 rounded-xl bg-citadelle-cream py-2.5 px-2 animate-slide-up transition-all duration-300 hover:bg-citadelle-gold/10 hover:-translate-y-0.5 hover:shadow-card"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <Icon className="h-4 w-4 text-citadelle-gold-dark transition-transform duration-300 group-hover:scale-110" />
      <p className="text-sm font-semibold text-citadelle-black leading-none">{value}</p>
      <p className="text-[0.65rem] text-black/40 uppercase tracking-wide leading-none">{label}</p>
    </div>
  );
}
